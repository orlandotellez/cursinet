using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

public record CreateLessonRequest(
    string Title,
    LessonType Type,
    string? VideoUrl = null,
    int? VideoDurationSeconds = null,
    string? ContentMarkdown = null,
    bool IsPreview = false
);

public record UpdateLessonRequest(
    string? Title = null,
    LessonType? Type = null,
    string? VideoUrl = null,
    int? VideoDurationSeconds = null,
    string? ContentMarkdown = null,
    bool? IsPreview = null
);

public record UpsertProgressRequest(
    int WatchedSeconds,
    int LastPositionSeconds,
    bool IsCompleted
);
