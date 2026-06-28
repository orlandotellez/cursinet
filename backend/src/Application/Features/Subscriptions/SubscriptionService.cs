using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Subscriptions;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IUserRepository _userRepository;

    public SubscriptionService(
        ISubscriptionRepository subscriptionRepository,
        IUserRepository userRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
    }

    public async Task<SubscriptionResponse> GetMySubscriptionAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        var subscription = await _subscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null)
        {
            return new SubscriptionResponse
            {
                Plan = "free",
                Status = "active",
            };
        }

        return Map(subscription);
    }

    public async Task<SubscriptionResponse> CancelMySubscriptionAsync(Guid userId)
    {
        var subscription = await _subscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null)
            throw AppExceptions.NotFound("No active subscription found");

        if (subscription.Status != "active")
            throw AppExceptions.BadRequest("Subscription is not active");

        subscription.Status = "cancelled";
        subscription.CancelAtPeriodEnd = true;
        subscription.UpdatedAt = DateTime.UtcNow;

        var updated = await _subscriptionRepository.UpdateAsync(subscription);
        return Map(updated);
    }

    public async Task<SubscriptionResponse> ReactivateMySubscriptionAsync(Guid userId)
    {
        var subscription = await _subscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null)
            throw AppExceptions.NotFound("No subscription found");

        subscription.Status = "active";
        subscription.CancelAtPeriodEnd = false;
        subscription.UpdatedAt = DateTime.UtcNow;

        var updated = await _subscriptionRepository.UpdateAsync(subscription);
        return Map(updated);
    }

    private static SubscriptionResponse Map(Subscription s) => new()
    {
        Plan = s.Plan == SubscriptionPlan.Monthly ? "pro" : "free",
        Status = s.Status,
        CurrentPeriodStart = s.CurrentPeriodStart,
        CurrentPeriodEnd = s.CurrentPeriodEnd,
        CancelAtPeriodEnd = s.CancelAtPeriodEnd,
    };
}
