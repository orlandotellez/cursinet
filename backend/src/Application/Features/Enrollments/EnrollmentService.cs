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
    private readonly ILessonRepository _lessonRepository;
    private readonly ILessonProgressRepository _lessonProgressRepository;

    public EnrollmentService(
        IEnrollmentRepository enrollmentRepository,
        ICourseRepository courseRepository,
        ILessonRepository lessonRepository,
        ILessonProgressRepository lessonProgressRepository)
    {
        _enrollmentRepository = enrollmentRepository;
        _courseRepository = courseRepository;
        _lessonRepository = lessonRepository;
        _lessonProgressRepository = lessonProgressRepository;
    }

    public async Task<EnrollmentResponse> EnrollAsync(Guid userId, Guid courseId)
    {
        // 1. Validate course exists
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        // 2. Validate course is published
        if (!course.IsPublished)
            throw AppExceptions.BadRequest("Course is not published");

        // 3. Only free courses can be enrolled directly
        if (!course.IsFree)
            throw AppExceptions.BadRequest("Course is not free — create a payment first");

        // 4. Check for duplicate enrollment
        var existing = await _enrollmentRepository.GetByCourseAndUserAsync(courseId, userId);
        if (existing != null)
            throw AppExceptions.Conflict("Already enrolled in this course");

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

        var results = new List<EnrollmentResponse>();
        foreach (var enrollment in enrollments)
        {
            var dto = enrollment.MapToDto();

            var totalLessons = (await _lessonRepository.GetByCourseAsync(enrollment.CourseId))
                .Count(l => l.IsPublished && l.DeletedAt == null);

            var completedLessons = (await _lessonProgressRepository.GetByUserAndCourseAsync(userId, enrollment.CourseId))
                .Count(p => p.IsCompleted);

            dto = dto with
            {
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
            };

            results.Add(dto);
        }

        return results;
    }

    public async Task<EnrollmentStatusResponse> GetStatusAsync(Guid userId, Guid courseId)
    {
        var enrollment = await _enrollmentRepository.GetByCourseAndUserAsync(courseId, userId);
        return enrollment.MapToStatusDto();
    }
}
