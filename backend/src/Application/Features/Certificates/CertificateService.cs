using System.Security.Cryptography;
using System.Text;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Certificates;

public class CertificateService : ICertificateService
{
    private readonly ICertificateRepository _certificateRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly ILessonProgressRepository _lessonProgressRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IUserRepository _userRepository;

    public CertificateService(
        ICertificateRepository certificateRepository,
        ILessonRepository lessonRepository,
        ILessonProgressRepository lessonProgressRepository,
        ICourseRepository courseRepository,
        IUserRepository userRepository)
    {
        _certificateRepository = certificateRepository;
        _lessonRepository = lessonRepository;
        _lessonProgressRepository = lessonProgressRepository;
        _courseRepository = courseRepository;
        _userRepository = userRepository;
    }

    public async Task<List<CertificateResponse>> GetMyCertificatesAsync(Guid userId)
    {
        var certificates = await _certificateRepository.GetByUserAsync(userId);
        return certificates.Select(c => c.MapToDto()).ToList();
    }

    public async Task<CertificateResponse> IssueCertificateAsync(Guid courseId, Guid userId)
    {
        // Check course exists
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        // Check user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        // Check not already issued
        var existing = await _certificateRepository.GetByUserAndCourseAsync(userId, courseId);
        if (existing != null)
            return existing.MapToDto();

        // Get all published lessons for the course
        var lessons = await _lessonRepository.GetByCourseAsync(courseId);
        var publishedLessons = lessons.Where(l => l.IsPublished).ToList();

        if (publishedLessons.Count == 0)
            throw AppExceptions.BadRequest("This course has no published lessons");

        // Get user's progress for this course
        var progress = await _lessonProgressRepository.GetByUserAndCourseAsync(userId, courseId);
        var completedLessonIds = progress
            .Where(p => p.IsCompleted)
            .Select(p => p.LessonId)
            .ToHashSet();

        // Check all published lessons are completed
        var allCompleted = publishedLessons.All(l => completedLessonIds.Contains(l.Id));
        if (!allCompleted)
            throw AppExceptions.BadRequest("You must complete all lessons before earning a certificate");

        // Generate a unique certificate number
        var certificateNumber = GenerateCertificateNumber(courseId, userId);

        var certificate = new Certificate
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            UserId = userId,
            IssuedAt = DateTime.UtcNow,
            CertificateNumber = certificateNumber,
            StudentName = user.Name,
            CourseName = course.Title,
            InstructorName = course.Instructor?.Name ?? "Instructor",
            CreatedAt = DateTime.UtcNow,
        };

        certificate = await _certificateRepository.CreateAsync(certificate);
        return certificate.MapToDto();
    }

    private static string GenerateCertificateNumber(Guid courseId, Guid userId)
    {
        // Create a unique, verifiable hash: SHA256 of courseId + userId + timestamp
        var input = $"{courseId:N}-{userId:N}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        // Take first 12 hex chars for a readable code
        var hash = Convert.ToHexString(bytes).ToLowerInvariant()[..12];
        return $"CERT-{hash}";
    }
}
