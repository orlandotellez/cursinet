using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface ISubscriptionService
{
    Task<SubscriptionResponse> GetMySubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<SubscriptionResponse> CancelMySubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<SubscriptionResponse> ReactivateMySubscriptionAsync(Guid userId, CancellationToken cancellationToken = default);
}
