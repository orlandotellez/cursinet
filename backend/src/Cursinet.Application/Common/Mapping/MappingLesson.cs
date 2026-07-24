using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Common.Mapping;

public static class MappingLesson
{
    public static LessonSummary MapToSummary(this Lesson lesson)
    {
        if (lesson == null) throw AppExceptions.UnprocessableEntity(nameof(lesson));

        return new LessonSummary
        {
            Id = lesson.Id,
            ModuleId = lesson.ModuleId,
            Title = lesson.Title,
            Slug = lesson.Slug,
            Type = lesson.Type.ToString(),
            SortOrder = lesson.SortOrder,
            IsPublished = lesson.IsPublished,
            IsPreview = lesson.IsPreview,
            VideoDurationSeconds = lesson.VideoDurationSeconds,
        };
    }

    public static LessonResponse MapToDto(this Lesson lesson)
    {
        if (lesson == null) throw AppExceptions.UnprocessableEntity(nameof(lesson));

        return new LessonResponse
        {
            Id = lesson.Id,
            ModuleId = lesson.ModuleId,
            Title = lesson.Title,
            Slug = lesson.Slug,
            Type = lesson.Type.ToString(),
            SortOrder = lesson.SortOrder,
            IsPublished = lesson.IsPublished,
            IsPreview = lesson.IsPreview,
            VideoDurationSeconds = lesson.VideoDurationSeconds,
            VideoUrl = lesson.VideoUrl,
            ContentMarkdown = lesson.ContentMarkdown,
            AttachmentUrls = lesson.AttachmentUrls,
            CreatedAt = lesson.CreatedAt,
            UpdatedAt = lesson.UpdatedAt,
        };
    }

    public static LessonProgressResponse MapToProgressDto(this LessonProgress progress)
    {
        if (progress == null) throw AppExceptions.UnprocessableEntity(nameof(progress));

        return new LessonProgressResponse
        {
            IsCompleted = progress.IsCompleted,
            WatchedSeconds = progress.WatchedSeconds,
            LastPositionSeconds = progress.LastPositionSeconds,
            UpdatedAt = progress.UpdatedAt,
        };
    }
}
