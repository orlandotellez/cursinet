namespace Cursinet.Application.Common.Models;

public record EnrollmentRequest
{
    public Guid CourseId { get; init; }
}

public record EnrollmentResponse
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public Guid CourseId { get; init; }
    public string CourseTitle { get; init; } = string.Empty;
    public string CourseSlug { get; init; } = string.Empty;
    public string? CourseThumbnailUrl { get; init; }
    public string InstructorName { get; init; } = string.Empty;
    public DateTime EnrolledAt { get; init; }
    public DateTime? LastAccessedAt { get; init; }
    public decimal ProgressPercentage { get; init; }
    public int TotalLessons { get; init; }
    public int CompletedLessons { get; init; }
    public int CourseDurationMinutes { get; init; }
}

public record EnrollmentStatusResponse
{
    public bool IsEnrolled { get; init; }
    public Guid? EnrollmentId { get; init; }
    public DateTime? EnrolledAt { get; init; }
    public decimal? ProgressPercentage { get; init; }
}
