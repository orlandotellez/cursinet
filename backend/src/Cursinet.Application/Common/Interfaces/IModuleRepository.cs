using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IModuleRepository
{
    Task<List<Module>> GetByCourseAsync(Guid courseId);
    Task<Module?> GetByIdAsync(Guid id);
    Task<Module> CreateAsync(Module module);
    Task<Module> UpdateAsync(Module module);
    Task SoftDeleteAsync(Guid id);
    Task SoftDeleteByCourseAsync(Guid courseId);
    Task UpdateSortOrderAsync(List<(Guid Id, int SortOrder)> items);
}
