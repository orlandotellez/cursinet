using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Mapping;

public static class MappingComment
{
    public static CommentResponse MapToDto(this Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            LessonId = comment.LessonId,
            UserId = comment.UserId,
            UserName = comment.User.Name,
            UserAvatar = comment.User.Image,
            ParentId = comment.ParentId,
            Body = comment.Body,
            LikesCount = comment.LikesCount,
            IsEdited = comment.IsEdited,
            CreatedAt = comment.CreatedAt,
            Replies = comment.Replies?
                .Where(r => r.DeletedAt == null)
                .OrderBy(r => r.CreatedAt)
                .Select(r => r.MapToDto())
                .ToList(),
        };
    }
}
