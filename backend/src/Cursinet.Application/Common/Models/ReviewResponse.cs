namespace Cursinet.Application.Common.Models;

public record ReviewResponse
{
    public Guid Id { get; init; }
    public Guid CourseId { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string? UserAvatar { get; init; }
    public int Rating { get; init; }
    public string? Comment { get; init; }
    public DateTime CreatedAt { get; init; }
}
