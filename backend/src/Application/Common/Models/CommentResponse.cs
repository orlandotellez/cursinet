namespace Cursinet.Application.Common.Models;

public record CommentResponse
{
    public Guid Id { get; init; }
    public Guid LessonId { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string? UserAvatar { get; init; }
    public Guid? ParentId { get; init; }
    public string Body { get; init; } = string.Empty;
    public int LikesCount { get; init; }
    public bool IsEdited { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<CommentResponse>? Replies { get; init; }
}
