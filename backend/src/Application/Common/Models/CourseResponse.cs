using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

public record CourseResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string? Description { get; init; }
    public string? ThumbnailUrl { get; init; }
    public string? PreviewVideoUrl { get; init; }
    public string Level { get; init; } = string.Empty;
    public string Language { get; init; } = "es";
    public int DurationMinutes { get; init; }
    public decimal Price { get; init; }
    public decimal? OriginalPrice { get; init; }
    public bool IsFree { get; init; }
    public bool IsPublished { get; init; }
    public bool IsFeatured { get; init; }
    public string[]? Requirements { get; init; }
    public string[]? LearningObjectives { get; init; }
    public int StudentsCount { get; init; }
    public double AverageRating { get; init; }
    public int ReviewsCount { get; init; }

    public Guid InstructorId { get; init; }
    public string InstructorName { get; init; } = string.Empty;
    public Guid CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string? CategorySlug { get; init; }

    public DateTime? PublishedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public DateTime? DeletedAt { get; init; }
    public Guid? DeletedByUserId { get; init; }
    public string? DeletedByName { get; init; }
}
