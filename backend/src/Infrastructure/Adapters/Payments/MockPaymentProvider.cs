using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;

namespace Cursinet.Infrastructure.Adapters.Payments;

/// <summary>
/// In-process mock adapter for <see cref="IPaymentProvider"/>. Returns synthesised order/capture ids
/// without contacting any external service. Used in development and tests when
/// <c>Payments:Provider:Enabled</c> is false, and as the fallback in unit tests so business logic can
/// be exercised end-to-end without network or sandbox credentials.
/// </summary>
public sealed class MockPaymentProvider : IPaymentProvider
{
    public string ProviderName => "mock";

    public Task<ProviderOrderResult> CreateOrderAsync(
        ProviderOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        // Deterministic id composed from (user, course, amount, currency) so test replays — and
        // idempotency assertions — can converge on the same value across multiple calls in the
        // same scenario. The trailing random suffix distinguishes two genuinely different requests
        // for the same tuple (e.g. user retries after a soft failure).
        var userPart = request.UserId.ToString("N")[..8];
        var coursePart = request.CourseId?.ToString("N")[..8] ?? "NOCRS";
        var amountPart = request.Amount.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture);
        var id = $"MOCK-{userPart}-{coursePart}-{request.Currency}-{amountPart}-{Guid.NewGuid().ToString("N")[..6]}";
        return Task.FromResult(new ProviderOrderResult(
            ProviderOrderId: id,
            ApprovalUrl: null,
            Status: "CREATED"));
    }

    public Task<ProviderCaptureResult> CaptureOrderAsync(
        string providerOrderId,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new ProviderCaptureResult(
            ProviderCaptureId: providerOrderId,
            Status: "COMPLETED",
            Amount: 0m,
            Currency: "USD"));
    }

    public Task<ProviderSubscriptionResult> CreateSubscriptionAsync(
        ProviderSubscriptionRequest request,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new ProviderSubscriptionResult(
            ProviderSubscriptionId: $"MOCK-SUB-{Guid.NewGuid():N}",
            ApprovalUrl: null,
            Status: "ACTIVE",
            PlanId: request.Plan.ToString()));
    }

    public Task<bool> CancelSubscriptionAsync(
        string providerSubscriptionId,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(true);
    }

    public Task<ProviderRefundResult> RefundAsync(
        string providerCaptureId,
        decimal? amount,
        string reason,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new ProviderRefundResult(
            ProviderRefundId: $"MOCK-REFUND-{Guid.NewGuid():N}",
            Status: "COMPLETED",
            Amount: amount ?? 0m));
    }
}
