using System.Text.RegularExpressions;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Courses;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;
    private readonly IUserRepository _userRepository;

    public CourseService(ICourseRepository courseRepository, IUserRepository userRepository)
    {
        _courseRepository = courseRepository;
        _userRepository = userRepository;
    }

    public async Task<List<CourseResponse>> GetAllAsync(CourseFilter? filter = null)
    {
        var includeDeleted = filter?.IncludeDeleted == true;
        var courses = includeDeleted
            ? await _courseRepository.GetAllIncludingDeletedAsync()
            : await _courseRepository.GetAllAsync();

        if (filter != null)
        {
            if (filter.CategoryId.HasValue)
                courses = courses.Where(c => c.CategoryId == filter.CategoryId.Value).ToList();
            if (filter.Level.HasValue)
                courses = courses.Where(c => c.Level == filter.Level.Value).ToList();
            if (filter.IsPublished.HasValue)
                courses = courses.Where(c => c.IsPublished == filter.IsPublished.Value).ToList();
            if (filter.IsFeatured.HasValue)
                courses = courses.Where(c => c.IsFeatured == filter.IsFeatured.Value).ToList();
            if (filter.InstructorId.HasValue)
                courses = courses.Where(c => c.InstructorId == filter.InstructorId.Value).ToList();
            if (!string.IsNullOrWhiteSpace(filter.Search))
                courses = courses.Where(c =>
                    c.Title.Contains(filter.Search, StringComparison.OrdinalIgnoreCase) ||
                    (c.ShortDescription != null && c.ShortDescription.Contains(filter.Search, StringComparison.OrdinalIgnoreCase))
                ).ToList();
        }

        return courses.Select(c => c.MapToDto()).ToList();
    }

    public async Task<CourseResponse> GetByIdAsync(Guid id)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        return course.MapToDto();
    }

    public async Task<CourseResponse> GetBySlugAsync(string slug)
    {
        var course = await _courseRepository.GetBySlugAsync(slug);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        return course.MapToDto();
    }

    public async Task<CourseResponse> CreateAsync(CreateCourseRequest request, Guid userId)
    {

        var slug = GenerateSlug(request.Title);
        var baseSlug = slug;
        var counter = 1;
        while (await _courseRepository.SlugExistsAsync(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Slug = slug,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            ThumbnailUrl = request.ThumbnailUrl,
            PreviewVideoUrl = request.PreviewVideoUrl,
            Level = request.Level,
            Language = request.Language,
            DurationMinutes = request.DurationMinutes,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            IsFree = request.IsFree,
            InstructorId = userId,
            CategoryId = request.CategoryId,
            Requirements = request.Requirements,
            LearningObjectives = request.LearningObjectives,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _courseRepository.CreateAsync(course);
        return created.MapToDto();
    }

    public async Task<CourseResponse> UpdateAsync(Guid id, UpdateCourseRequest request, Guid userId, UserRole currentUserRole)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        if (course.InstructorId != userId && currentUserRole != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

        if (request.Title != null)
        {
            course.Title = request.Title;

            var newSlug = GenerateSlug(request.Title);
            if (newSlug != course.Slug)
            {
                var baseSlug = newSlug;
                var counter = 1;
                while (await _courseRepository.SlugExistsAsync(newSlug))
                {
                    newSlug = $"{baseSlug}-{counter}";
                    counter++;
                }
                course.Slug = newSlug;
            }
        }

        if (request.CategoryId.HasValue) course.CategoryId = request.CategoryId.Value;
        if (request.Level.HasValue) course.Level = request.Level.Value;
        if (request.ShortDescription != null) course.ShortDescription = request.ShortDescription;
        if (request.Description != null) course.Description = request.Description;
        if (request.ThumbnailUrl != null) course.ThumbnailUrl = request.ThumbnailUrl;
        if (request.PreviewVideoUrl != null) course.PreviewVideoUrl = request.PreviewVideoUrl;
        if (request.Language != null) course.Language = request.Language;
        if (request.DurationMinutes.HasValue) course.DurationMinutes = request.DurationMinutes.Value;
        if (request.Price.HasValue) course.Price = request.Price.Value;
        if (request.OriginalPrice != null) course.OriginalPrice = request.OriginalPrice;
        if (request.IsFree.HasValue) course.IsFree = request.IsFree.Value;
        if (request.Requirements != null) course.Requirements = request.Requirements;
        if (request.LearningObjectives != null) course.LearningObjectives = request.LearningObjectives;

        course.UpdatedAt = DateTime.UtcNow;

        var updated = await _courseRepository.UpdateAsync(course);
        return updated.MapToDto();
    }

    public async Task DeleteAsync(Guid id, Guid userId, UserRole currentUserRole)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        if (course.InstructorId != userId && currentUserRole != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

        await _courseRepository.SoftDeleteAsync(course, userId);
    }

    public async Task<CourseResponse> PublishAsync(Guid id, Guid userId, UserRole currentUserRole)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        if (course.InstructorId != userId && currentUserRole != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

        if (course.IsPublished)
            throw AppExceptions.Conflict("Course is already published");

        course.IsPublished = true;
        course.PublishedAt = DateTime.UtcNow;
        course.UpdatedAt = DateTime.UtcNow;

        var updated = await _courseRepository.UpdateAsync(course);
        return updated.MapToDto();
    }

    public async Task<CourseResponse> UnpublishAsync(Guid id, Guid userId, UserRole currentUserRole)
    {
        var course = await _courseRepository.GetByIdAsync(id);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        if (course.InstructorId != userId && currentUserRole != UserRole.Admin)
            throw AppExceptions.Forbidden("You are not the owner of this course");

        if (!course.IsPublished)
            throw AppExceptions.Conflict("Course is not published");

        course.IsPublished = false;
        course.PublishedAt = null;
        course.UpdatedAt = DateTime.UtcNow;

        var updated = await _courseRepository.UpdateAsync(course);
        return updated.MapToDto();
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
