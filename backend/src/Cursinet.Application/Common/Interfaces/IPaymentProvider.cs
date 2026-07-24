using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

/// <summary>
/// Vendor-agnostic payment provider port. Adapters (PayPal, Stripe, etc.) implement this; the
/// application layer depends only on this interface so the core business logic is decoupled
/// from any external payment API. Provider-specific terms (PayPalOrderId, StripePaymentIntentId,
/// etc.) are mapped to <see cref="ProviderOrderResult"/> at the adapter edge.
/// </summary>
public interface IPaymentProvider
{
    /// <summary>Human-readable provider name used for telemetry/logs (e.g. "paypal", "stripe", "mock").</summary>
    string ProviderName { get; }

    /// <summary>Creates an order/PaymentIntent in the upstream provider. Returns the order id used by the
    /// frontend SDK and (optionally) the approval URL for redirect-based flows.</summary>
    Task<ProviderOrderResult> CreateOrderAsync(
        ProviderOrderRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>Captures an approved order. Called server-side after the buyer approves (either via
    /// webhook-driven flow or explicit post-redirect confirmation).</summary>
    Task<ProviderCaptureResult> CaptureOrderAsync(
        string providerOrderId,
        CancellationToken cancellationToken = default);

    /// <summary>Creates a recurring subscription in the upstream provider.</summary>
    Task<ProviderSubscriptionResult> CreateSubscriptionAsync(
        ProviderSubscriptionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>Cancels a subscription. Cancellations are typically scheduled to take effect at the
    /// end of the current billing period; the adapter handles that detail.</summary>
    Task<bool> CancelSubscriptionAsync(
        string providerSubscriptionId,
        CancellationToken cancellationToken = default);

    /// <summary>Refunds a captured payment (full or partial).</summary>
    Task<ProviderRefundResult> RefundAsync(
        string providerCaptureId,
        decimal? amount,
        string reason,
        CancellationToken cancellationToken = default);
}
