using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface ISubscriptionService
{
    Task<SubscriptionResponse> GetMySubscriptionAsync(Guid userId);
    Task<SubscriptionResponse> CancelMySubscriptionAsync(Guid userId);
    Task<SubscriptionResponse> ReactivateMySubscriptionAsync(Guid userId);
}
