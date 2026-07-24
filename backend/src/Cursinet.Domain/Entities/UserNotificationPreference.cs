namespace Cursinet.Domain.Entities;

public class UserNotificationPreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public bool CourseUpdates { get; set; } = true;
    public bool NewContent { get; set; } = true;
    public bool Comments { get; set; } = false;
    public bool Marketing { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
