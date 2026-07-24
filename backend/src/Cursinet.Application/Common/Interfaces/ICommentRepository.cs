using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ICommentRepository
{
    Task<List<Comment>> GetByLessonIdAsync(Guid lessonId);
    Task<Comment?> GetByIdAsync(Guid id);
    Task<Comment> CreateAsync(Comment comment);
    Task<Comment> UpdateAsync(Comment comment);
    Task DeleteAsync(Guid id);
}
