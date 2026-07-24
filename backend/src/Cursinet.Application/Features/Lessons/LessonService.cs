using Cursinet.Application.Common.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Lessons;

public class LessonService : ILessonService
{
    private readonly ILessonRepository _lessonRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly ILessonProgressRepository _lessonProgressRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;

    public LessonService(
        ILessonRepository lessonRepository,
        IModuleRepository moduleRepository,
        ILessonProgressRepository lessonProgressRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository)
    {
        _lessonRepository = lessonRepository;
        _moduleRepository = moduleRepository;
        _lessonProgressRepository = lessonProgressRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<List<LessonSummary>> GetAllAsync(Guid moduleId, Guid? currentUserId, UserRole? role)
    {
        var module = await _moduleRepository.GetByIdAsync(moduleId);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        var isOwner = currentUserId.HasValue && course.InstructorId == currentUserId.Value;
        var isAdmin = role == UserRole.Admin;

        var lessons = await _lessonRepository.GetByModuleAsync(moduleId);

        if (!isOwner && !isAdmin)
        {
            lessons = lessons.Where(l => l.IsPublished).ToList();
        }

        return lessons.Select(l => l.MapToSummary()).ToList();
    }

    public async Task<LessonResponse> GetByIdAsync(Guid id)
    {
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null)
            throw AppExceptions.NotFound("Lesson not found");

        return lesson.MapToDto();
    }

    public async Task<LessonResponse> CreateAsync(Guid moduleId, CreateLessonRequest request, Guid userId, UserRole role)
    {
        var module = await _moduleRepository.GetByIdAsync(moduleId);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        var slug = await SlugHelper.GenerateUniqueSlugAsync(request.Title, s => _lessonRepository.SlugExistsAsync(s));

        var existingLessons = await _lessonRepository.GetByModuleAsync(moduleId);
        var maxSortOrder = existingLessons.Any() ? existingLessons.Max(l => l.SortOrder) : 0;

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            ModuleId = moduleId,
            CourseId = module.CourseId,
            Title = request.Title,
            Slug = slug,
            Type = request.Type,
            VideoUrl = request.Type == LessonType.Video ? request.VideoUrl : null,
            VideoDurationSeconds = request.VideoDurationSeconds,
            ContentMarkdown = request.Type != LessonType.Video ? request.ContentMarkdown : null,
            SortOrder = maxSortOrder + 1,
            IsPublished = true,
            IsPreview = request.IsPreview,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _lessonRepository.CreateAsync(lesson);
        return created.MapToDto();
    }

    public async Task<LessonResponse> UpdateAsync(Guid id, UpdateLessonRequest request, Guid userId, UserRole role)
    {
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null)
            throw AppExceptions.NotFound("Lesson not found");

        var module = await _moduleRepository.GetByIdAsync(lesson.ModuleId);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        if (request.Title != null)
        {
            lesson.Title = request.Title;

            var newSlug = SlugHelper.GenerateSlug(request.Title);
            if (newSlug != lesson.Slug)
            {
                lesson.Slug = await SlugHelper.GenerateUniqueSlugAsync(request.Title, s => _lessonRepository.SlugExistsAsync(s));
            }
        }

        if (request.Type.HasValue)
        {
            lesson.Type = request.Type.Value;

            if (request.Type.Value != LessonType.Video)
            {
                lesson.VideoUrl = null;
                lesson.VideoDurationSeconds = null;
            }
            if (request.Type.Value == LessonType.Video)
            {
                lesson.ContentMarkdown = null;
            }
        }

        if (request.VideoUrl != null) lesson.VideoUrl = request.VideoUrl;
        if (request.VideoDurationSeconds.HasValue) lesson.VideoDurationSeconds = request.VideoDurationSeconds;
        if (request.ContentMarkdown != null) lesson.ContentMarkdown = request.ContentMarkdown;
        if (request.IsPreview.HasValue) lesson.IsPreview = request.IsPreview.Value;
        if (request.IsPublished.HasValue) lesson.IsPublished = request.IsPublished.Value;

        lesson.UpdatedAt = DateTime.UtcNow;

        var updated = await _lessonRepository.UpdateAsync(lesson);
        return updated.MapToDto();
    }

    public async Task DeleteAsync(Guid id, Guid userId, UserRole role)
    {
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null)
            throw AppExceptions.NotFound("Lesson not found");

        var module = await _moduleRepository.GetByIdAsync(lesson.ModuleId);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        await _lessonRepository.SoftDeleteAsync(id);
    }

    public async Task ReorderAsync(Guid moduleId, ReorderRequest request, Guid userId, UserRole role)
    {
        var module = await _moduleRepository.GetByIdAsync(moduleId);
        if (module == null)
            throw AppExceptions.NotFound("Module not found");

        var course = await _courseRepository.GetByIdAsync(module.CourseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        Guard.AgainstNotOwner(course.InstructorId, userId, role, "course");

        await _lessonRepository.UpdateSortOrderAsync(
            request.Items.Select(i => (i.Id, i.SortOrder)).ToList());
    }

    public async Task<LessonProgressResponse> GetProgressAsync(Guid lessonId, Guid userId)
    {
        var progress = await _lessonProgressRepository.GetAsync(userId, lessonId);

        if (progress == null)
        {
            return new LessonProgressResponse
            {
                IsCompleted = false,
                WatchedSeconds = 0,
                LastPositionSeconds = 0,
                UpdatedAt = DateTime.UtcNow,
            };
        }

        return progress.MapToProgressDto();
    }

    public async Task<LessonProgressResponse> UpsertProgressAsync(Guid lessonId, Guid userId, UpsertProgressRequest request)
    {
        var progress = new LessonProgress
        {
            UserId = userId,
            LessonId = lessonId,
            IsCompleted = request.IsCompleted,
            WatchedSeconds = request.WatchedSeconds,
            LastPositionSeconds = request.LastPositionSeconds,
        };

        var result = await _lessonProgressRepository.UpsertAsync(progress);

        // Recalcular progreso del curso en la inscripción
        if (request.IsCompleted)
        {
            await RecalculateCourseProgressAsync(lessonId, userId);
        }

        return result.MapToProgressDto();
    }

    private async Task RecalculateCourseProgressAsync(Guid lessonId, Guid userId)
    {
        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson?.Module == null) return;

        var courseId = lesson.Module.CourseId;

        var enrollment = await _enrollmentRepository.GetByCourseAndUserAsync(courseId, userId);
        if (enrollment == null) return;

        var totalLessons = (await _lessonRepository.GetByCourseAsync(courseId))
            .Count(l => l.IsPublished && l.DeletedAt == null);

        if (totalLessons == 0) return;

        var allProgress = await _lessonProgressRepository.GetByUserAndCourseAsync(userId, courseId);
        var completedCount = allProgress.Count(p => p.IsCompleted);

        enrollment.ProgressPercentage = Math.Round((decimal)completedCount / totalLessons * 100, 2);
        enrollment.LastAccessedAt = DateTime.UtcNow;

        if (enrollment.ProgressPercentage >= 100)
            enrollment.CompletedAt ??= DateTime.UtcNow;

        await _enrollmentRepository.UpdateAsync(enrollment);
    }
}
