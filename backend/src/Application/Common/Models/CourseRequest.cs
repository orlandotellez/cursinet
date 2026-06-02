using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

public record CreateCourseRequest(
    string Title,
    Guid CategoryId,
    CourseLevel Level,
    string? ShortDescription = null,
    string? Description = null,
    string? ThumbnailUrl = null,
    string? PreviewVideoUrl = null,
    string Language = "es",
    int DurationMinutes = 0,
    decimal Price = 0,
    decimal? OriginalPrice = null,
    bool IsFree = false,
    string[]? Requirements = null,
    string[]? LearningObjectives = null
);

public record UpdateCourseRequest(
    string? Title = null,
    Guid? CategoryId = null,
    CourseLevel? Level = null,
    string? ShortDescription = null,
    string? Description = null,
    string? ThumbnailUrl = null,
    string? PreviewVideoUrl = null,
    string? Language = null,
    int? DurationMinutes = null,
    decimal? Price = null,
    decimal? OriginalPrice = null,
    bool? IsFree = null,
    string[]? Requirements = null,
    string[]? LearningObjectives = null
);

public record CourseFilter(
    Guid? CategoryId = null,
    CourseLevel? Level = null,
    bool? IsPublished = null,
    bool? IsFeatured = null,
    string? Search = null
);
