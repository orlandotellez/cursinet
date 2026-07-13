namespace Cursinet.Domain.Entities;

/// Certificate awarded when a student completes all lessons in a course.
public class Certificate
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    public string CertificateNumber { get; set; } = string.Empty; // unique hash

    // Denormalized display data (safe from renames)
    public string StudentName { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
