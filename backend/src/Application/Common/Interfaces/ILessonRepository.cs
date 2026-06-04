using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ILessonRepository
{
    Task<List<Lesson>> GetByModuleAsync(Guid moduleId);
    Task<List<Lesson>> GetByCourseAsync(Guid courseId);
    Task<Lesson?> GetByIdAsync(Guid id);
    Task<Lesson?> GetBySlugAsync(string slug);
    Task<bool> SlugExistsAsync(string slug);
    Task<Lesson> CreateAsync(Lesson lesson);
    Task<Lesson> UpdateAsync(Lesson lesson);
    Task SoftDeleteAsync(Guid id);
    Task SoftDeleteByModuleAsync(Guid moduleId);
    Task UpdateSortOrderAsync(List<(Guid Id, int SortOrder)> items);
}
