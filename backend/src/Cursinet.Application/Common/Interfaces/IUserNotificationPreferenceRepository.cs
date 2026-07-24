using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IUserNotificationPreferenceRepository
{
    Task<UserNotificationPreference?> GetByUserIdAsync(Guid userId);
    Task<UserNotificationPreference> UpsertAsync(UserNotificationPreference preference);
}
