using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Common.Mapping;

public static class MappingCourse
{
    public static CourseResponse MapToDto(this Course course)
    {
        if (course == null) throw AppExceptions.UnprocessableEntity(nameof(course));

        return new CourseResponse
        {
            Id = course.Id,
            Title = course.Title,
            Slug = course.Slug,
            ShortDescription = course.ShortDescription,
            Description = course.Description,
            ThumbnailUrl = course.ThumbnailUrl,
            PreviewVideoUrl = course.PreviewVideoUrl,
            Level = course.Level.ToString(),
            Language = course.Language,
            DurationMinutes = course.DurationMinutes,
            Price = course.Price,
            OriginalPrice = course.OriginalPrice,
            IsFree = course.IsFree,
            IsPublished = course.IsPublished,
            IsFeatured = course.IsFeatured,
            Requirements = course.Requirements,
            LearningObjectives = course.LearningObjectives,
            StudentsCount = course.StudentsCount,
            AverageRating = (double)course.AverageRating,
            ReviewsCount = course.ReviewsCount,

            InstructorId = course.InstructorId,
            InstructorName = course.Instructor?.Name ?? string.Empty,
            CategoryId = course.CategoryId,
            CategoryName = course.Category?.Name ?? string.Empty,
            CategorySlug = course.Category?.Slug,

            PublishedAt = course.PublishedAt,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,

            DeletedAt = course.DeletedAt,
            DeletedByUserId = course.DeletedByUserId,
            DeletedByName = course.DeletedByUser?.Name ?? (course.DeletedByUserId != null ? "Unknown" : null),
        };
    }
}
