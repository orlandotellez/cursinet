using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Mapping;

public static class MappingBookmark
{
    public static BookmarkResponse MapToDto(this Bookmark bookmark)
    {
        return new BookmarkResponse
        {
            CourseId = bookmark.CourseId,
            CourseTitle = bookmark.Course.Title,
            CourseSlug = bookmark.Course.Slug,
            CourseThumbnailUrl = bookmark.Course.ThumbnailUrl,
            CourseShortDescription = bookmark.Course.ShortDescription,
            InstructorName = bookmark.Course.Instructor?.Name ?? string.Empty,
            InstructorAvatar = bookmark.Course.Instructor?.Image,
            CategoryName = bookmark.Course.Category?.Name ?? string.Empty,
            CourseLevel = bookmark.Course.Level.ToString(),
            DurationMinutes = bookmark.Course.DurationMinutes,
            Price = bookmark.Course.Price,
            AverageRating = (double)bookmark.Course.AverageRating,
            ReviewsCount = bookmark.Course.ReviewsCount,
            StudentsCount = bookmark.Course.StudentsCount,
            CreatedAt = bookmark.CreatedAt,
        };
    }
}
