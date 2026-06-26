using System.Text.RegularExpressions;
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

    public LessonService(
        ILessonRepository lessonRepository,
        IModuleRepository moduleRepository,
        ILessonProgressRepository lessonProgressRepository,
        ICourseRepository courseRepository)
    {
        _lessonRepository = lessonRepository;
        _moduleRepository = moduleRepository;
        _lessonProgressRepository = lessonProgressRepository;
        _courseRepository = courseRepository;
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

        if (course.InstructorId != userId && role != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

        var slug = GenerateSlug(request.Title);
        var baseSlug = slug;
        var counter = 1;
        while (await _lessonRepository.SlugExistsAsync(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

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

        if (course.InstructorId != userId && role != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

        if (request.Title != null)
        {
            lesson.Title = request.Title;

            var newSlug = GenerateSlug(request.Title);
            if (newSlug != lesson.Slug)
            {
                var baseSlug = newSlug;
                var counter = 1;
                while (await _lessonRepository.SlugExistsAsync(newSlug))
                {
                    newSlug = $"{baseSlug}-{counter}";
                    counter++;
                }
                lesson.Slug = newSlug;
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

        if (course.InstructorId != userId && role != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

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

        if (course.InstructorId != userId && role != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

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
        return result.MapToProgressDto();
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
            .Replace("ñ", "n")
            .Replace("á", "a").Replace("é", "e")
            .Replace("í", "i").Replace("ó", "o")
            .Replace("ú", "u").Replace("ü", "u");

        slug = Regex.Replace(slug, @"[^a-z0-9\-\s]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-{2,}", "-");
        slug = slug.Trim('-');

        return slug;
    }
}
