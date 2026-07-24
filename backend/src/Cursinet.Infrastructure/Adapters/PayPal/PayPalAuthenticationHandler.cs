using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Cursinet.Infrastructure.Adapters.PayPal;

/// <summary>
/// <see cref="DelegatingHandler"/> que adjunta un token de acceso Bearer a cada request saliente
/// de la API REST de PayPal. Obtiene tokens mediante el grant OAuth2 <c>client_credentials</c> en
/// <c>/v1/oauth2/token</c>, los cachea en <see cref="IMemoryCache"/>, y usa un
/// <see cref="SemaphoreSlim"/> para evitar la estampida de refrescos cuando el cache expira bajo
/// carga. El TTL del cache respeta el <c>expires_in</c> devuelto por PayPal (se refresca unos
/// minutos antes para nunca entregar un token que PayPal esté por rechazar).
///
/// También implementa un reintento único en 401: cuando el upstream rechaza con <c>Unauthorized</c>,
/// el handler invalida el token cacheado, lo refresca una vez, y reenvía el request original. PayPal
/// devuelve 401 en la capa de autorización <em>antes</em> de que cualquier servicio mutante sea
/// invocado, por lo que el request fallado no tiene efectos secundarios y es seguro reintentarlo
/// incluso cuando el endpoint subyacente no es idempotente.
/// </summary>
/// <remarks>
/// Registrado via <c>AddHttpMessageHandler&lt;PayPalAuthenticationHandler&gt;()</c> en el
/// <c>HttpClient</c> tipado. El refresco del token usa Basic auth y se envía directo al transporte
/// interno (bypasseando este handler) para que no haya recursión.
/// </remarks>
public class PayPalAuthenticationHandler : DelegatingHandler
{
    private const string CacheKey = "PayPal:AccessToken";
    private const int TokenLifetimeSeconds = 32_400; // PayPal access tokens are 9h.
    private const int RefreshSkewSeconds = 300;
    private const int MinimumCacheSeconds = 60; // Por debajo de esto no cacheamos — siempre refetch.
    // Mínimo expires_in que honramos de la respuesta de PayPal. Cualquier valor igual o inferior a
    // este cae al default de 9h TTL — no tiene sentido cachear por tan poco tiempo que el refresh
    // skew ya excede la ventana de la respuesta.
    private const int MinimumUsableExpiresIn = RefreshSkewSeconds + MinimumCacheSeconds;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IMemoryCache _cache;
    private readonly PayPalOptions _options;
    private readonly ILogger<PayPalAuthenticationHandler> _logger;
    private readonly SemaphoreSlim _refreshLock = new(1, 1);

    public PayPalAuthenticationHandler(
        IMemoryCache cache,
        IOptions<PayPalOptions> options,
        ILogger<PayPalAuthenticationHandler> logger)
    {
        _cache = cache;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("PayPalAuthenticationHandler invocado: {Method} {Uri}", request.Method, request.RequestUri);

        var token = await GetOrRefreshTokenAsync(cancellationToken);

        _logger.LogDebug("Token obtenido: {TokenPrefix}... (len={Len})",
            token[..Math.Min(token.Length, 10)], token.Length);

        // Clonamos el request antes del primer envío para que el original nunca se consuma.
        // El clon bufferiza el body en un ByteArrayContent (económico para payloads pequeños de
        // PayPal; si algún día mandás payloads > unos pocos MB, cambiá a streaming).
        using var firstAttempt = await CloneRequestAsync(request, cancellationToken);
        firstAttempt.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        _logger.LogDebug("Authorization header asignado al request: Bearer {TokenPrefix}...",
            token[..Math.Min(token.Length, 10)]);

        var response = await base.SendAsync(firstAttempt, cancellationToken);

        _logger.LogDebug("PayPal respuesta status: {Status}", response.StatusCode);

        if (response.StatusCode != HttpStatusCode.Unauthorized)
        {
            _logger.LogDebug("Respuesta no-401, devolviendo tal cual");
            return response;
        }

        // 401 — invalidamos el token cacheado y reintentamos exactamente una vez. El rechazo en la
        // capa de autenticación significa que el handler mutante upstream nunca se ejecutó, por lo
        // que re-enviar es seguro incluso en rutas no idempotentes.
        _logger.LogWarning(
            "PayPal devolvió 401; invalidando token cacheado y reintentando una vez. Method={Method} Uri={Uri}",
            request.Method, request.RequestUri);

        response.Dispose();

        cancellationToken.ThrowIfCancellationRequested();
        _cache.Remove(CacheKey);
        var freshToken = await GetOrRefreshTokenAsync(cancellationToken);

        _logger.LogDebug("Token fresco obtenido para reintento: {TokenPrefix}... (len={Len})",
            freshToken[..Math.Min(freshToken.Length, 10)], freshToken.Length);

        using var retryAttempt = await CloneRequestAsync(request, cancellationToken);
        retryAttempt.Headers.Authorization = new AuthenticationHeaderValue("Bearer", freshToken);
        _logger.LogInformation("Reintentando request a PayPal con token fresco.");

        // Devolvemos lo que sea que dé el segundo intento — incluyendo un segundo 401 — para salir
        // de cualquier bucle patológico de reintentos sin escalar a nivel de error (el llamador
        // decide qué hacer con un 401 persistente).
        var retryResponse = await base.SendAsync(retryAttempt, cancellationToken);
        _logger.LogDebug("Respuesta del reintento status: {Status}", retryResponse.StatusCode);
        return retryResponse;
    }

    private void AttachBasicAuthHeader(HttpRequestMessage request)
    {
        var credentials = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{_options.ClientId}:{_options.ClientSecret}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
    }

    /// <summary>Double-checked-locking token retrieve/refresh.</summary>
    private async Task<string> GetOrRefreshTokenAsync(CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue<string>(CacheKey, out var cached) && !string.IsNullOrEmpty(cached))
        {
            return cached;
        }

        await _refreshLock.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue<string>(CacheKey, out cached) && !string.IsNullOrEmpty(cached))
            {
                return cached;
            }

            var (accessToken, expiresIn) = await FetchNewTokenAsync(cancellationToken);
            // Refresh a few minutes early so we never hand back a token PayPal is about to reject.
            // Honour the response's own expires_in (PayPal occasionally issues non-default TTLs in
            // sandbox); fall back to the documented 9h if the value is missing or absurdly small.
            var usedFallback = expiresIn is null || expiresIn <= MinimumUsableExpiresIn;
            var ttlSeconds = !usedFallback
                ? expiresIn!.Value - RefreshSkewSeconds
                : TokenLifetimeSeconds - RefreshSkewSeconds;
            _cache.Set(CacheKey, accessToken, TimeSpan.FromSeconds(ttlSeconds));
            if (usedFallback)
            {
                _logger.LogWarning(
                    "El endpoint de token de PayPal no devolvió un expires_in utilizable ({ExpiresIn}); usando TTL default de 9h.",
                    expiresIn);
            }
            else
            {
                _logger.LogInformation(
                    "Nuevo token de acceso PayPal adquirido; cache TTL ~{Ttl}s (expires_in={ExpiresIn}s).",
                    ttlSeconds, expiresIn);
            }
            return accessToken;
        }
        finally
        {
            _refreshLock.Release();
        }
    }

    private async Task<(string AccessToken, int? ExpiresIn)> FetchNewTokenAsync(CancellationToken cancellationToken)
    {
        var authEndpoint = new Uri(new Uri(_options.BaseUrl), "/v1/oauth2/token");
        var authRequest = new HttpRequestMessage(HttpMethod.Post, authEndpoint)
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
            }),
        };

        // El Basic auth se adjunta acá (no desde una rama de SendAsync) porque la llamada de abajo
        // resuelve a base.SendAsync, que envía directo al transporte interno y bypassea nuestro
        // SendAsync por completo.
        AttachBasicAuthHeader(authRequest);

        using var response = await base.SendAsync(authRequest, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("El endpoint de token de PayPal devolvió {Status}: {Body}", response.StatusCode, body);
            throw new HttpRequestException(
                $"PayPal token request failed: {(int)response.StatusCode} {response.ReasonPhrase}");
        }

        var parsed = JsonSerializer.Deserialize<PayPalTokenResponse>(body, JsonOptions);
        if (parsed is null || string.IsNullOrEmpty(parsed.AccessToken))
        {
            throw new InvalidOperationException("PayPal token endpoint returned an empty access_token.");
        }

        return (parsed.AccessToken, parsed.ExpiresIn);
    }

    /// <summary>Clona un <see cref="HttpRequestMessage"/> en una instancia nueva y reutilizable,
    /// bufferizando el body en un <see cref="ByteArrayContent"/> para que pueda enviarse múltiples veces.</summary>
    private static async Task<HttpRequestMessage> CloneRequestAsync(
        HttpRequestMessage source,
        CancellationToken cancellationToken)
    {
        var clone = new HttpRequestMessage(source.Method, source.RequestUri)
        {
            Version = source.Version,
            VersionPolicy = source.VersionPolicy,
        };

        foreach (var header in source.Headers)
        {
            clone.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        if (source.Content is not null)
        {
            var bytes = await source.Content.ReadAsByteArrayAsync(cancellationToken);
            clone.Content = new ByteArrayContent(bytes);

            foreach (var header in source.Content.Headers)
            {
                clone.Content.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }
        }

        return clone;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _refreshLock.Dispose();
        }
        base.Dispose(disposing);
    }

    private sealed record PayPalTokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("expires_in")] int? ExpiresIn,
        [property: JsonPropertyName("token_type")] string TokenType);
}
