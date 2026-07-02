namespace Cursinet.Application.Common.Models;

public record CreatePaymentRequest
{
    public Guid CourseId { get; init; }
    /// <summary>URL a la que PayPal redirige después de que el usuario aprueba el pago.</summary>
    public string? ReturnUrl { get; init; }
    /// <summary>URL a la que PayPal redirige si el usuario cancela.</summary>
    public string? CancelUrl { get; init; }
}

public record CreatePaymentResponse
{
    public Guid PaymentId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Status { get; init; } = "Pending";
    /// <summary>PayPal Order ID devuelto por la API Orders v2. Pasar al frontend para PayPalProvider.createOrder.</summary>
    public string PayPalOrderId { get; init; } = string.Empty;
    /// <summary>URL de aprobación para flujos basados en redirect (popup/modal/redirect). Null para inline.</summary>
    public string? ApprovalUrl { get; init; }
}

public record ConfirmPaymentRequest
{
    public Guid PaymentId { get; init; }
    /// <summary>PayPal Order ID opcional (eco). El server ya lo tiene del Payment record; el webhook es la fuente de verdad.</summary>
    public string? PayPalOrderId { get; init; }
}

public record PaymentResponse
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid? CourseId { get; init; }
    public string? CourseTitle { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Status { get; init; } = "Pending";
    public string? Type { get; init; }
    public DateTime? PaidAt { get; init; }
    public DateTime? RefundedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? PayPalOrderId { get; init; }
    public string? PayPalCaptureId { get; init; }
}
