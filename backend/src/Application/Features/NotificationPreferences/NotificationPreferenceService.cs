using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Features.NotificationPreferences;

public class NotificationPreferenceService : INotificationPreferenceService
{
    private readonly IUserNotificationPreferenceRepository _repository;

    public NotificationPreferenceService(IUserNotificationPreferenceRepository repository)
    {
        _repository = repository;
    }

    public async Task<NotificationPreferenceResponse> GetAsync(Guid userId)
    {
        var pref = await _repository.GetByUserIdAsync(userId);
        if (pref == null)
        {
            return new NotificationPreferenceResponse
            {
                Id = Guid.Empty,
                CourseUpdates = true,
                NewContent = true,
                Comments = false,
                Marketing = false,
                UpdatedAt = DateTime.UtcNow,
            };
        }

        return Map(pref);
    }

    public async Task<NotificationPreferenceResponse> SaveAsync(Guid userId, UpdateNotificationPreferenceRequest request)
    {
        var pref = await _repository.GetByUserIdAsync(userId) ?? new UserNotificationPreference
        {
            UserId = userId,
        };

        if (request.CourseUpdates.HasValue) pref.CourseUpdates = request.CourseUpdates.Value;
        if (request.NewContent.HasValue) pref.NewContent = request.NewContent.Value;
        if (request.Comments.HasValue) pref.Comments = request.Comments.Value;
        if (request.Marketing.HasValue) pref.Marketing = request.Marketing.Value;

        var saved = await _repository.UpsertAsync(pref);
        return Map(saved);
    }

    private static NotificationPreferenceResponse Map(UserNotificationPreference pref) => new()
    {
        Id = pref.Id,
        CourseUpdates = pref.CourseUpdates,
        NewContent = pref.NewContent,
        Comments = pref.Comments,
        Marketing = pref.Marketing,
        UpdatedAt = pref.UpdatedAt,
    };
}
