using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task<List<Payment>> GetByUserAsync(Guid userId);
    Task<Payment?> GetByPayPalOrderIdAsync(string paypalOrderId);
    Task<Payment?> GetByPayPalCaptureIdAsync(string payPalCaptureId);
    Task<List<Payment>> GetAllCompletedAsync();
    Task<List<Payment>> GetCompletedSinceAsync(DateTime since);
    Task<Payment> CreateAsync(Payment payment);
    Task<Payment> UpdateAsync(Payment payment);
}
