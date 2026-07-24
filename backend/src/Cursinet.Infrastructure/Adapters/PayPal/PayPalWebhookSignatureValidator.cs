using System.Net.Http.Json;
using System.Text.Json;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Infrastructure.Adapters.PayPal;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Cursinet.Infrastructure.Adapters.PayPal;

/// <summary>
/// Adapter implementing <see cref="IPayPalWebhookSignatureValidator"/> by calling PayPal's
/// <c>/v1/notifications/verify-webhook-signature</c> endpoint. PayPal is the source of truth for
/// signature verification — locally re-implementing the certificate / signature verification would
/// duplicate fragile crypto paths.
/// </summary>
public class PayPalWebhookSignatureValidator : IPayPalWebhookSignatureValidator
{
    private const string VerifyEndpoint = "/v1/notifications/verify-webhook-signature";

    /// <summary>PayPal-controlled origin hosts we accept in <c>PAYPAL-CERT-URL</c>. Anything else
    /// is treated as untrusted (SSRF guard).</summary>
    private static readonly string[] TrustedCertHosts =
    {
        "api.paypal.com",
        "api-m.paypal.com",
        "api.sandbox.paypal.com",
        "api-m.sandbox.paypal.com",
    };

    private readonly HttpClient _http;
    private readonly PayPalOptions _options;
    private readonly ILogger<PayPalWebhookSignatureValidator> _logger;

    public PayPalWebhookSignatureValidator(
        HttpClient http,
        IOptions<PayPalOptions> options,
        ILogger<PayPalWebhookSignatureValidator> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<bool> VerifyAsync(
        string authAlgo,
        string certUrl,
        string transmissionId,
        string transmissionSig,
        string transmissionTime,
        string webhookEvent,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.WebhookId))
        {
            _logger.LogWarning(
                "PayPal webhook signature cannot be verified: WebhookId is not configured. " +
                "Set PayPal:WebhookId to enable verification.");
            return false;
        }

        if (!IsTrustedCertUrl(certUrl))
        {
            _logger.LogWarning("Rejecting PayPal webhook: cert_url did not match a PayPal-controlled host: {CertUrl}", certUrl);
            return false;
        }

        // Forward verbatim — PayPal must see the same bytes we received.
        var body = new
        {
            auth_algo = authAlgo,
            cert_url = certUrl,
            transmission_id = transmissionId,
            transmission_sig = transmissionSig,
            transmission_time = transmissionTime,
            webhook_id = _options.WebhookId,
            webhook_event = JsonElementFromString(webhookEvent),
        };

        var verifyUri = new Uri(new Uri(_options.BaseUrl.TrimEnd('/') + "/"), VerifyEndpoint.TrimStart('/'));
        using var request = new HttpRequestMessage(HttpMethod.Post, verifyUri)
        {
            Content = JsonContent.Create(body),
        };

        using var response = await _http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning(
                "PayPal verify-webhook-signature returned {Status}: {Body}",
                response.StatusCode, detail);
            return false;
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var status = doc.RootElement.TryGetProperty("verification_status", out var v)
            ? v.GetString()
            : null;
        return string.Equals(status, "SUCCESS", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsTrustedCertUrl(string certUrl)
    {
        if (string.IsNullOrWhiteSpace(certUrl) || !Uri.TryCreate(certUrl, UriKind.Absolute, out var uri))
        {
            return false;
        }
        if (uri.Scheme != Uri.UriSchemeHttps)
        {
            return false;
        }
        return TrustedCertHosts.Any(host =>
            string.Equals(uri.Host, host, StringComparison.OrdinalIgnoreCase));
    }

    private static JsonElement JsonElementFromString(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return JsonDocument.Parse("{}").RootElement.Clone();
        }
        using var doc = JsonDocument.Parse(raw);
        return doc.RootElement.Clone();
    }
}
