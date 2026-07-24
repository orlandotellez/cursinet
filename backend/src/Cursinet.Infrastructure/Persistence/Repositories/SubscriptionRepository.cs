using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly ApplicationDbContext _context;

    public SubscriptionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<Subscription> CreateAsync(Subscription subscription)
    {
        await _context.Subscriptions.AddAsync(subscription);
        await _context.SaveChangesAsync();
        return subscription;
    }

    public async Task<Subscription> UpdateAsync(Subscription subscription)
    {
        _context.Subscriptions.Update(subscription);
        await _context.SaveChangesAsync();
        return subscription;
    }
}
