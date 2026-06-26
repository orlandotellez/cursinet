using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task<List<Payment>> GetByUserAsync(Guid userId);
    Task<Payment?> GetByStripePaymentIntentAsync(string stripePaymentIntentId);
    Task<List<Payment>> GetAllCompletedAsync();
    Task<Payment> CreateAsync(Payment payment);
    Task<Payment> UpdateAsync(Payment payment);
}
