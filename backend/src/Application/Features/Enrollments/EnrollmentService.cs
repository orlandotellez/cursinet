using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Enrollments;

public class EnrollmentService : IEnrollmentService
{
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly ICourseRepository _courseRepository;

    public EnrollmentService(IEnrollmentRepository enrollmentRepository, ICourseRepository courseRepository)
    {
        _enrollmentRepository = enrollmentRepository;
        _courseRepository = courseRepository;
    }

    public async Task<EnrollmentResponse> EnrollAsync(Guid userId, Guid courseId)
    {
        // 1. Validate course exists
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw new AppException("Course not found", 404, "course.not-found");

        // 2. Validate course is published
        if (!course.IsPublished)
            throw new AppException("Course is not published", 400, "enrollment.not-published");

        // 3. Only free courses can be enrolled directly
        if (!course.IsFree)
            throw new AppException("Course is not free — create a payment first", 400, "enrollment.payment-required");

        // 4. Check for duplicate enrollment
        var existing = await _enrollmentRepository.GetByCourseAndUserAsync(courseId, userId);
        if (existing != null)
            throw new AppException("Already enrolled in this course", 409, "enrollment.duplicate");

        // 5. Create enrollment entity
        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = courseId,
            EnrolledAt = DateTime.UtcNow,
            ProgressPercentage = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        // 6. Persist atomically with StudentsCount increment
        var created = await _enrollmentRepository.CreateAsync(enrollment, courseId);
        return created.MapToDto();
    }

    public async Task<List<EnrollmentResponse>> GetMyEnrollmentsAsync(Guid userId)
    {
        var enrollments = await _enrollmentRepository.GetByUserAsync(userId);
        return enrollments.Select(e => e.MapToDto()).ToList();
    }

    public async Task<EnrollmentStatusResponse> GetStatusAsync(Guid userId, Guid courseId)
    {
        var enrollment = await _enrollmentRepository.GetByCourseAndUserAsync(courseId, userId);
        return enrollment.MapToStatusDto();
    }
}
