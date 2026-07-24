using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface ICommentService
{
    Task<List<CommentResponse>> GetLessonCommentsAsync(Guid lessonId);
    Task<CommentResponse> CreateCommentAsync(Guid lessonId, Guid userId, string body, Guid? parentId = null);
    Task<CommentResponse> UpdateCommentAsync(Guid commentId, Guid userId, string body);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
}
