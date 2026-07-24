using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Cursinet.Infrastructure.Adapters.PayPal;

/// <summary>
/// Adaptador en vivo de <see cref="IPaymentProvider"/> respaldado por la API REST de PayPal
/// (Orders v2 para pagos únicos, Billing Subscriptions para recurrentes y Refunds para
/// reembolsos). Se comunica con PayPal a través del <see cref="HttpClient"/> tipado registrado
/// en DI; el <see cref="PayPalAuthenticationHandler"/> adjunto a ese cliente maneja los tokens
/// de acceso OAuth2.
/// </summary>
public class PayPalPaymentProvider : IPaymentProvider
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly HttpClient _http;
    private readonly PayPalOptions _options;
    private readonly ILogger<PayPalPaymentProvider> _logger;

    public PayPalPaymentProvider(
        HttpClient http,
        IOptions<PayPalOptions> options,
        ILogger<PayPalPaymentProvider> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public string ProviderName => "paypal";

    // ============================================================
    // Pagos únicos — PayPal Orders v2
    // ============================================================

    public async Task<ProviderOrderResult> CreateOrderAsync(
        ProviderOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var body = new
        {
            intent = "CAPTURE",
            purchase_units = new[]
            {
                new
                {
                    reference_id = request.CourseId?.ToString() ?? request.UserId.ToString(),
                    custom_id = BuildCustomId(request.UserId, request.CourseId),
                    amount = new
                    {
                        currency_code = request.Currency,
                        value = request.Amount.ToString("0.00", CultureInfo.InvariantCulture),
                    },
                    description = request.Description,
                },
            },
            application_context = new
            {
                shipping_preference = "NO_SHIPPING",
                user_action = "PAY_NOW",
                return_url = request.ReturnUrl,
                cancel_url = request.CancelUrl,
            },
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, BuildUri("/v2/checkout/orders"))
        {
            Content = JsonContent.Create(body),
        };

        var response = await _http.SendAsync(httpRequest, cancellationToken);
        var json = await ReadJsonAsync(response, cancellationToken);
        EnsureSuccess(response, json, "create order");

        var parsed = JsonSerializer.Deserialize<PayPalCreateOrderResponse>(json, JsonOptions)
            ?? throw new InvalidOperationException("PayPal returned an empty create-order response.");

        var approvalLink = parsed.Links?
            .FirstOrDefault(l => string.Equals(l.Rel, "approve", StringComparison.OrdinalIgnoreCase))?.Href;

        return new ProviderOrderResult(
            ProviderOrderId: parsed.Id,
            ApprovalUrl: approvalLink,
            Status: parsed.Status ?? "CREATED");
    }

    public async Task<ProviderCaptureResult> CaptureOrderAsync(
        string providerOrderId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(providerOrderId))
        {
            throw AppExceptions.BadRequest("Provider order id is required.");
        }

        // El endpoint de captura de PayPal Orders v2 requiere el header Content-Type: application/json,
        // incluso con el body vacío. Un HttpRequestMessage sin contenido omite el Content-Type por
        // completo, lo que hace que PayPal rechace con 415 Unsupported Media Type.
        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post, BuildUri($"/v2/checkout/orders/{Uri.EscapeDataString(providerOrderId)}/capture"))
        {
            Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json"),
        };

        var response = await _http.SendAsync(httpRequest, cancellationToken);
        var json = await ReadJsonAsync(response, cancellationToken);
        EnsureSuccess(response, json, "capture order");

        var parsed = JsonSerializer.Deserialize<PayPalCaptureOrderResponse>(json, JsonOptions)
            ?? throw new InvalidOperationException("PayPal returned an empty capture response.");

        var firstCapture = parsed.PurchaseUnits?
            .SelectMany(pu => pu.Payments?.Captures ?? Enumerable.Empty<PayPalCapture>())
            .FirstOrDefault();

        if (string.IsNullOrEmpty(firstCapture?.Id))
        {
            throw AppExceptions.InternalError("PayPal capture response did not include a capture id.");
        }

        // Protección contra PayPal devolviendo un capture object con status de rechazo. PayPal a
        // veces devuelve un capture id incluso cuando el funding instrument fue declinado; tratar
        // eso como éxito crea una divergencia silenciosa entre nuestra DB y la de PayPal.
        var captureStatus = firstCapture.Status?.ToUpperInvariant();
        if (captureStatus is null or "DECLINED" or "DENIED" or "FAILED" or "EXPIRED" or "CANCELLED")
        {
            throw AppExceptions.PaymentProviderRejected(
                $"PayPal captured payment status is '{captureStatus ?? "(missing)"}' for order {providerOrderId}.",
                402);
        }

        return new ProviderCaptureResult(
            ProviderCaptureId: firstCapture.Id,
            Status: captureStatus,
            Amount: ParseAmount(firstCapture.Amount?.Value),
            Currency: firstCapture.Amount?.CurrencyCode ?? "USD");
    }

    // ============================================================
    // Suscripciones — PayPal Billing API
    // ============================================================

    public async Task<ProviderSubscriptionResult> CreateSubscriptionAsync(
        ProviderSubscriptionRequest request,
        CancellationToken cancellationToken = default)
    {
        // Resolvemos el plan_id de facturación de PayPal desde la configuración. La aplicación no
        // sintetiza ids — los planes de PayPal se crean en el merchant dashboard y el mapping se
        // ajusta manualmente.
        var planKey = request.Plan.ToString();
        if (!_options.PlanIds.TryGetValue(planKey, out var planId) || string.IsNullOrWhiteSpace(planId))
        {
            throw AppExceptions.PaymentProviderRejected(
                $"No PayPal plan_id configured for SubscriptionPlan.{planKey}. " +
                "Add PayPal:PlanIds:" + planKey + " to appsettings.",
                422);
        }

        var body = new
        {
            plan_id = planId,
            application_context = new
            {
                shipping_preference = "NO_SHIPPING",
                user_action = "SUBSCRIBE_NOW",
            },
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, BuildUri("/v1/billing/subscriptions"))
        {
            Content = JsonContent.Create(body),
        };

        var response = await _http.SendAsync(httpRequest, cancellationToken);
        var json = await ReadJsonAsync(response, cancellationToken);
        EnsureSuccess(response, json, "create subscription");

        var parsed = JsonSerializer.Deserialize<PayPalCreateSubscriptionResponse>(json, JsonOptions)
            ?? throw new InvalidOperationException("PayPal returned an empty subscription response.");

        var approvalLink = parsed.Links?
            .FirstOrDefault(l => string.Equals(l.Rel, "approve", StringComparison.OrdinalIgnoreCase))?.Href;

        return new ProviderSubscriptionResult(
            ProviderSubscriptionId: parsed.Id,
            ApprovalUrl: approvalLink,
            Status: parsed.Status ?? "APPROVAL_PENDING",
            PlanId: parsed.PlanId ?? planId);
    }

    public async Task<bool> CancelSubscriptionAsync(
        string providerSubscriptionId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(providerSubscriptionId))
        {
            throw AppExceptions.BadRequest("Provider subscription id is required.");
        }

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            BuildUri($"/v1/billing/subscriptions/{Uri.EscapeDataString(providerSubscriptionId)}/cancel"))
        {
            Content = new StringContent("{\"reason\":\"User requested cancellation via Cursinet.\"}",
                System.Text.Encoding.UTF8, "application/json"),
        };

        var response = await _http.SendAsync(httpRequest, cancellationToken);
        // PayPal devuelve 204 No Content en éxito documentado; toleramos cualquier 2xx por si el
        // contrato cambia (ej. 200 OK con body vacío en un schema futuro).
        if (response.IsSuccessStatusCode)
        {
            return true;
        }

        // PayPal devuelve un body JSON en error; mostramos el detalle upstream textual.
        var json = await ReadJsonAsync(response, cancellationToken);
        EnsureSuccess(response, json, "cancel subscription");
        return true;
    }

    // ============================================================
    // Reembolsos
    // ============================================================

    public async Task<ProviderRefundResult> RefundAsync(
        string providerCaptureId,
        decimal? amount,
        string reason,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(providerCaptureId))
        {
            throw AppExceptions.BadRequest("Provider capture id is required.");
        }

        var body = amount.HasValue
            ? (object)new
            {
                amount = new
                {
                    value = amount.Value.ToString("0.00", CultureInfo.InvariantCulture),
                },
                note_to_payer = reason,
            }
            : new { note_to_payer = reason };

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post, BuildUri($"/v2/payments/captures/{Uri.EscapeDataString(providerCaptureId)}/refund"))
        {
            Content = JsonContent.Create(body),
        };

        var response = await _http.SendAsync(httpRequest, cancellationToken);
        var json = await ReadJsonAsync(response, cancellationToken);
        EnsureSuccess(response, json, "refund capture");

        var parsed = JsonSerializer.Deserialize<PayPalRefundResponse>(json, JsonOptions)
            ?? throw new InvalidOperationException("PayPal returned an empty refund response.");

        return new ProviderRefundResult(
            ProviderRefundId: parsed.Id,
            Status: parsed.Status ?? "PENDING",
            Amount: ParseAmount(parsed.Amount?.Value));
    }

    // ============================================================
    // Ayudantes
    // ============================================================

    /// <summary>Construye una URI absoluta de la API REST de PayPal desde un path relativo.</summary>
    private Uri BuildUri(string relativePath)
        => new Uri(new Uri(_options.BaseUrl.TrimEnd('/') + "/"), relativePath.TrimStart('/'));

    private static string BuildCustomId(Guid userId, Guid? courseId)
        => courseId.HasValue ? $"{userId:N}:{courseId.Value:N}" : userId.ToString("N");

    private async Task<string> ReadJsonAsync(HttpResponseMessage response, CancellationToken ct)
        => await response.Content.ReadAsStringAsync(ct);

    private static decimal ParseAmount(string? value)
        => decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var v) ? v : 0m;

    private void EnsureSuccess(HttpResponseMessage response, string body, string operation)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var detail = TryExtractPayPalMessage(body);
        var status = (int)response.StatusCode;

            _logger.LogWarning(
            "PayPal {Operation} falló: status={Status} detail={Detail}",
            operation, status, detail);

        // 4xx -> error de app visible al usuario vía factory; 5xx -> interno.
        if (status >= 400 && status < 500)
        {
            throw AppExceptions.PaymentProviderRejected(
                $"PayPal rechazó {operation}: {detail}",
                status);
        }

        throw AppExceptions.InternalError($"Fallo upstream de PayPal durante {operation}.");
    }

    private string TryExtractPayPalMessage(string body)
    {
        if (string.IsNullOrWhiteSpace(body))
        {
            return "(empty body)";
        }

        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("message", out var msg))
            {
                var message = msg.GetString();
                if (!string.IsNullOrEmpty(message)) return message!;
            }
            if (doc.RootElement.TryGetProperty("name", out var name))
            {
                var n = name.GetString();
                if (!string.IsNullOrEmpty(n)) return n!;
            }
            return body.Length > 256 ? body[..256] : body;
        }
        catch (JsonException ex)
        {
            // El body no tenía un formato de error PayPal reconocido; conservamos el snippet crudo
            // para diagnóstico — el fallback silencioso pierde horas debuggeando un schema drift no
            // documentado.
            _logger.LogDebug(ex, "El body de error de PayPal no era JSON parseable: {Body}",
                body.Length > 256 ? body[..256] : body);
            return body.Length > 256 ? body[..256] : body;
        }
    }

    // ============================================================
    // POCOs de respuesta de PayPal (mappings snake_case). Privados para no filtrar tipos del vendor.
    // ============================================================

    private sealed class PayPalCreateOrderResponse
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("links")] public List<PayPalLink>? Links { get; set; }
    }

    private sealed class PayPalLink
    {
        [JsonPropertyName("href")] public string? Href { get; set; }
        [JsonPropertyName("rel")] public string? Rel { get; set; }
        [JsonPropertyName("method")] public string? Method { get; set; }
    }

    private sealed class PayPalCaptureOrderResponse
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("purchase_units")] public List<PayPalPurchaseUnit>? PurchaseUnits { get; set; }
    }

    private sealed class PayPalPurchaseUnit
    {
        [JsonPropertyName("payments")] public PayPalPayments? Payments { get; set; }
    }

    private sealed class PayPalPayments
    {
        [JsonPropertyName("captures")] public List<PayPalCapture>? Captures { get; set; }
    }

    private sealed class PayPalCapture
    {
        [JsonPropertyName("id")] public string? Id { get; set; }
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("amount")] public PayPalMoney? Amount { get; set; }
    }

    private sealed class PayPalMoney
    {
        [JsonPropertyName("currency_code")] public string? CurrencyCode { get; set; }
        [JsonPropertyName("value")] public string? Value { get; set; }
    }

    private sealed class PayPalCreateSubscriptionResponse
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("plan_id")] public string? PlanId { get; set; }
        [JsonPropertyName("links")] public List<PayPalLink>? Links { get; set; }
    }

    private sealed class PayPalRefundResponse
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("status")] public string? Status { get; set; }
        [JsonPropertyName("amount")] public PayPalMoney? Amount { get; set; }
    }
}
