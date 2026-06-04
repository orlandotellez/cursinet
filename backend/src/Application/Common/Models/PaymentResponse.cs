namespace Cursinet.Application.Common.Models;

public record CreatePaymentRequest
{
    public Guid CourseId { get; init; }
}

public record CreatePaymentResponse
{
    public Guid PaymentId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Status { get; init; } = "Pending";
    public string? ClientSecret { get; init; }  // Stripe PaymentIntent client_secret (null in dev mode)
}

public record ConfirmPaymentRequest
{
    public Guid PaymentId { get; init; }
    public string? StripePaymentIntentId { get; init; }  // Only needed in production mode
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
    public DateTime CreatedAt { get; init; }
}
