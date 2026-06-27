namespace Cursinet.Application.Common.Models;

public record NotificationPreferenceResponse
{
    public Guid Id { get; init; }
    public bool CourseUpdates { get; init; }
    public bool NewContent { get; init; }
    public bool Comments { get; init; }
    public bool Marketing { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record UpdateNotificationPreferenceRequest(
    bool? CourseUpdates = null,
    bool? NewContent = null,
    bool? Comments = null,
    bool? Marketing = null
);
