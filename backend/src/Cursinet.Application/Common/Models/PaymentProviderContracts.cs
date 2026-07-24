using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

/// <summary>Input for one-time order creation. Vendor-agnostic. Money/currency are deliberate
/// primitives (decimal + ISO 4217 string) so the application never sees vendor types.</summary>
public record ProviderOrderRequest(
    Guid UserId,
    Guid? CourseId,
    decimal Amount,
    string Currency,
    string Description,
    string? ReturnUrl = null,
    string? CancelUrl = null);

/// <summary>Output of one-time order creation. The provider order id is what the client SDK
/// needs (e.g. PayPalOrderId is passed to createOrder() on the frontend).</summary>
public record ProviderOrderResult(
    string ProviderOrderId,
    string? ApprovalUrl,
    string Status);

/// <summary>Output of capture. The provider capture id is required to refund later.</summary>
public record ProviderCaptureResult(
    string ProviderCaptureId,
    string Status,
    decimal Amount,
    string Currency);

public record ProviderSubscriptionRequest(
    Guid UserId,
    SubscriptionPlan Plan,
    string Currency);

public record ProviderSubscriptionResult(
    string ProviderSubscriptionId,
    string? ApprovalUrl,
    string Status,
    string PlanId);

public record ProviderRefundResult(
    string ProviderRefundId,
    string Status,
    decimal Amount);
