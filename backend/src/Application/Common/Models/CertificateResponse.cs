namespace Cursinet.Application.Common.Models;

public record CertificateResponse
{
    public Guid Id { get; init; }
    public Guid CourseId { get; init; }
    public string CourseName { get; init; } = string.Empty;
    public string InstructorName { get; init; } = string.Empty;
    public DateTime IssuedAt { get; init; }
    public string CertificateNumber { get; init; } = string.Empty;
}
