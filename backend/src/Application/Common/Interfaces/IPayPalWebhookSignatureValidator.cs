namespace Cursinet.Application.Common.Interfaces;

/// <summary>
/// Port that wraps PayPal's webhook signature verification. PayPal trusts
/// <c>POST /v1/notifications/verify-webhook-signature</c> as the source of truth — calling it for
/// every inbound webhook is the documented best practice (avoids re-implementing PayPal's
/// certificate-URL + CSP + signature verification client-side).
/// </summary>
public interface IPayPalWebhookSignatureValidator
{
    /// <summary>
    /// Verifies a webhook delivery by forwarding the headers + raw body to PayPal and returning true
    /// only when PayPal responds with <c>verification_status = SUCCESS</c>.
    /// </summary>
    /// <param name="authAlgo">Value of the <c>PAYPAL-AUTH-ALGO</c> header.</param>
    /// <param name="certUrl">Value of the <c>PAYPAL-CERT-URL</c> header. Must be a PayPal-controlled cert URL.</param>
    /// <param name="transmissionId">Value of the <c>PAYPAL-TRANSMISSION-ID</c> header.</param>
    /// <param name="transmissionSig">Value of the <c>PAYPAL-TRANSMISSION-SIG</c> header.</param>
    /// <param name="transmissionTime">Value of the <c>PAYPAL-TRANSMISSION-TIME</c> header.</param>
    /// <param name="webhookEvent">Raw JSON string of the webhook event body.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<bool> VerifyAsync(
        string authAlgo,
        string certUrl,
        string transmissionId,
        string transmissionSig,
        string transmissionTime,
        string webhookEvent,
        CancellationToken cancellationToken = default);
}
