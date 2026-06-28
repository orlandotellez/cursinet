namespace Cursinet.Application.Common.Models;

public record NoteResponse
{
    public Guid Id { get; init; }
    public Guid LessonId { get; init; }
    public string Content { get; init; } = string.Empty;
    public int? VideoTimestampSeconds { get; init; }
    public DateTime UpdatedAt { get; init; }
}
