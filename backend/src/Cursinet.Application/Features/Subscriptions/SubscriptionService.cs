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
    private readonly IPaymentProvider _paymentProvider;

    public SubscriptionService(
        ISubscriptionRepository subscriptionRepository,
        IUserRepository userRepository,
        IPaymentProvider paymentProvider)
    {
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
        _paymentProvider = paymentProvider;
    }

    public async Task<SubscriptionResponse> GetMySubscriptionAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
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

    public async Task<SubscriptionResponse> CancelMySubscriptionAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null)
            throw AppExceptions.NotFound("No active subscription found");

        if (subscription.Status != "active")
            throw AppExceptions.BadRequest("Subscription is not active");

        // Cancel at the upstream provider first — if PayPal rejects the cancellation we want the
        // surface error here, not a half-applied DB mutation. Skip when there's no provider-side
        // subscription (mock / pre-integration rows).
        if (!string.IsNullOrEmpty(subscription.PayPalSubscriptionId))
        {
            await _paymentProvider.CancelSubscriptionAsync(subscription.PayPalSubscriptionId, cancellationToken);
        }

        subscription.Status = "cancelled";
        subscription.CancelAtPeriodEnd = true;
        subscription.UpdatedAt = DateTime.UtcNow;

        var updated = await _subscriptionRepository.UpdateAsync(subscription);
        return Map(updated);
    }

    public async Task<SubscriptionResponse> ReactivateMySubscriptionAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null)
            throw AppExceptions.NotFound("No subscription found");

        // PayPal does not support re-activating a cancelled subscription; the user must resubscribe
        // through the create flow. Local DB row flips back to "active" so we don't have a stranded
        // record, but the provider-side state stays cancelled after this method returns.
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
