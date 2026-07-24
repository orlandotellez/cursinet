namespace Cursinet.Application.Common.Models;

public class BookmarkResponse
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseSlug { get; set; } = string.Empty;
    public string? CourseThumbnailUrl { get; set; }
    public string? CourseShortDescription { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string? InstructorAvatar { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CourseLevel { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
    public int StudentsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
