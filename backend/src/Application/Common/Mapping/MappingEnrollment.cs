using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Mapping;

public static class MappingEnrollment
{
    public static EnrollmentResponse MapToDto(this Enrollment enrollment)
    {
        return new EnrollmentResponse
        {
            Id = enrollment.Id,
            UserId = enrollment.UserId,
            CourseId = enrollment.CourseId,
            CourseTitle = enrollment.Course?.Title ?? string.Empty,
            CourseSlug = enrollment.Course?.Slug ?? string.Empty,
            CourseThumbnailUrl = enrollment.Course?.ThumbnailUrl,
            InstructorName = enrollment.Course?.Instructor?.Name ?? string.Empty,
            EnrolledAt = enrollment.EnrolledAt,
            LastAccessedAt = enrollment.LastAccessedAt,
            ProgressPercentage = enrollment.ProgressPercentage,
        };
    }

    public static EnrollmentStatusResponse MapToStatusDto(this Enrollment? enrollment)
    {
        if (enrollment == null)
        {
            return new EnrollmentStatusResponse { IsEnrolled = false };
        }

        return new EnrollmentStatusResponse
        {
            IsEnrolled = true,
            EnrollmentId = enrollment.Id,
            EnrolledAt = enrollment.EnrolledAt,
            ProgressPercentage = enrollment.ProgressPercentage,
        };
    }
}
