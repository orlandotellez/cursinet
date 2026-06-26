namespace Cursinet.Application.Common.Models;

public class LessonSummary
{
    public Guid Id { get; init; }
    public Guid ModuleId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int SortOrder { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPreview { get; init; }
    public bool IsCompleted { get; set; }
    public int? VideoDurationSeconds { get; init; }
}

public class LessonResponse : LessonSummary
{
    public string? VideoUrl { get; init; }
    public string? ContentMarkdown { get; init; }
    public string[]? AttachmentUrls { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class LessonProgressResponse
{
    public bool IsCompleted { get; init; }
    public int WatchedSeconds { get; init; }
    public int LastPositionSeconds { get; init; }
    public DateTime UpdatedAt { get; init; }
}
