using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Interfaces;

public interface ILessonService
{
    Task<List<LessonSummary>> GetAllAsync(Guid moduleId, Guid? currentUserId, UserRole? role);
    Task<LessonResponse> GetByIdAsync(Guid id);
    Task<LessonResponse> CreateAsync(Guid moduleId, CreateLessonRequest request, Guid userId, UserRole role);
    Task<LessonResponse> UpdateAsync(Guid id, UpdateLessonRequest request, Guid userId, UserRole role);
    Task DeleteAsync(Guid id, Guid userId, UserRole role);
    Task ReorderAsync(Guid moduleId, ReorderRequest request, Guid userId, UserRole role);
    Task<LessonProgressResponse> GetProgressAsync(Guid lessonId, Guid userId);
    Task<LessonProgressResponse> UpsertProgressAsync(Guid lessonId, Guid userId, UpsertProgressRequest request);
}
