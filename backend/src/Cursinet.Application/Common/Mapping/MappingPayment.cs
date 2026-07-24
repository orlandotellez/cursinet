using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Mapping;

public static class MappingPayment
{
    public static PaymentResponse MapToDto(this Payment payment)
    {
        return new PaymentResponse
        {
            Id = payment.Id,
            UserId = payment.UserId,
            CourseId = payment.CourseId,
            CourseTitle = payment.Course?.Title,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Status = payment.Status.ToString(),
            Type = payment.Type,
            PaidAt = payment.PaidAt,
            RefundedAt = payment.RefundedAt,
            CreatedAt = payment.CreatedAt,
            PayPalOrderId = payment.PayPalOrderId,
            PayPalCaptureId = payment.PayPalCaptureId,
        };
    }
}
