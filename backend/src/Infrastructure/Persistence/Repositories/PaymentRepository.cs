using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments
            .Include(p => p.Course)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Payment>> GetByUserAsync(Guid userId)
    {
        return await _context.Payments
            .Include(p => p.Course)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Payment>> GetAllCompletedAsync()
    {
        return await _context.Payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Payment?> GetByStripePaymentIntentAsync(string stripePaymentIntentId)
    {
        return await _context.Payments
            .Include(p => p.Course)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.StripePaymentIntentId == stripePaymentIntentId);
    }

    public async Task<Payment> CreateAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
        await _context.SaveChangesAsync();

        return (await _context.Payments
            .Include(p => p.Course)
            .FirstAsync(p => p.Id == payment.Id))!;
    }

    public async Task<Payment> UpdateAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();

        return (await _context.Payments
            .Include(p => p.Course)
            .FirstAsync(p => p.Id == payment.Id))!;
    }
}
