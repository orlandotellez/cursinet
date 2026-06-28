using Cursinet.Application.Common.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;
using Cursinet.Domain.Enums;

namespace Cursinet.Application.Features.Comments;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly ILessonRepository _lessonRepository;

    public CommentService(
        ICommentRepository commentRepository,
        ILessonRepository lessonRepository)
    {
        _commentRepository = commentRepository;
        _lessonRepository = lessonRepository;
    }

    public async Task<List<CommentResponse>> GetLessonCommentsAsync(Guid lessonId)
    {
        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson == null)
            throw AppExceptions.NotFound("Lesson not found");

        var comments = await _commentRepository.GetByLessonIdAsync(lessonId);
        return comments.Select(c => c.MapToDto()).ToList();
    }

    public async Task<CommentResponse> CreateCommentAsync(Guid lessonId, Guid userId, string body, Guid? parentId = null)
    {
        if (string.IsNullOrWhiteSpace(body))
            throw AppExceptions.BadRequest("Comment body is required");

        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson == null)
            throw AppExceptions.NotFound("Lesson not found");

        if (parentId.HasValue)
        {
            var parent = await _commentRepository.GetByIdAsync(parentId.Value);
            if (parent == null || parent.LessonId != lessonId)
                throw AppExceptions.BadRequest("Parent comment not found");
        }

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            LessonId = lessonId,
            UserId = userId,
            ParentId = parentId,
            Body = body.Trim(),
            LikesCount = 0,
            IsEdited = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        comment = await _commentRepository.CreateAsync(comment);
        // Re-fetch to load User navigation property
        var created = await _commentRepository.GetByIdAsync(comment.Id);
        return created!.MapToDto();
    }

    public async Task<CommentResponse> UpdateCommentAsync(Guid commentId, Guid userId, string body)
    {
        if (string.IsNullOrWhiteSpace(body))
            throw AppExceptions.BadRequest("Comment body is required");

        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
            throw AppExceptions.NotFound("Comment not found");

        Guard.AgainstNotOwner(comment.UserId, userId, UserRole.Admin, "comment");

        comment.Body = body.Trim();
        comment.IsEdited = true;
        comment.UpdatedAt = DateTime.UtcNow;

        comment = await _commentRepository.UpdateAsync(comment);
        return comment.MapToDto();
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
            throw AppExceptions.NotFound("Comment not found");

        Guard.AgainstNotOwner(comment.UserId, userId, UserRole.Admin, "comment");

        await _commentRepository.DeleteAsync(commentId);
    }
}
