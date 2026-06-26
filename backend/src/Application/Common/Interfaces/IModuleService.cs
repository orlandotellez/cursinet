using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Interfaces;

public interface IModuleService
{
    Task<List<ModuleResponse>> GetAllAsync(Guid courseId, Guid? currentUserId, UserRole? role);
    Task<ModuleResponse> GetByIdAsync(Guid id, Guid? currentUserId, UserRole? role);
    Task<CurriculumResponse> GetCurriculumAsync(Guid courseId, Guid? currentUserId, UserRole? role);
    Task<ModuleResponse> CreateAsync(Guid courseId, CreateModuleRequest request, Guid userId, UserRole role);
    Task<ModuleResponse> UpdateAsync(Guid id, UpdateModuleRequest request, Guid userId, UserRole role);
    Task DeleteAsync(Guid id, Guid userId, UserRole role);
    Task ReorderAsync(Guid courseId, ReorderRequest request, Guid userId, UserRole role);
}
