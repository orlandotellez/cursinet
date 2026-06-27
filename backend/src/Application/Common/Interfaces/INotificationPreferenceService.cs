using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface INotificationPreferenceService
{
    Task<NotificationPreferenceResponse> GetAsync(Guid userId);
    Task<NotificationPreferenceResponse> SaveAsync(Guid userId, UpdateNotificationPreferenceRequest request);
}
