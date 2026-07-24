using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IPaymentService
{
    /// Creates a payment intent (or payment record) for a course purchase.
    /// In dev mode, returns a ready-to-confirm payment.
    /// In production, creates a Stripe PaymentIntent and returns client_secret.
    Task<CreatePaymentResponse> CreatePaymentAsync(Guid userId, CreatePaymentRequest request, CancellationToken cancellationToken = default);

    /// Confirms a payment. In dev mode, marks as Completed immediately.
    /// In production, verifies the Stripe PaymentIntent status.
    /// On success, creates the enrollment atomically with the payment.
    Task<PaymentResponse> ConfirmPaymentAsync(Guid userId, ConfirmPaymentRequest request, CancellationToken cancellationToken = default);

    /// Returns all payments for the current user.
    Task<List<PaymentResponse>> GetMyPaymentsAsync(Guid userId);

    /// Returns a single payment by id (scoped to user).
    Task<PaymentResponse?> GetPaymentAsync(Guid userId, Guid paymentId);
}
