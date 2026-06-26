using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IUserCrudService
{
    Task<List<UserDto>> GetAllAsync(UserFilter? filter = null);
    Task<UserDto> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserRequest request, Guid createdByUserId);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, Guid userId);
    Task DeleteAsync(Guid id, Guid deletedByUserId, string deletedByName);
    Task<UserDto> RestoreAsync(Guid id);
}
