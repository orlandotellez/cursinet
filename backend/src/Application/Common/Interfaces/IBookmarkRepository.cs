using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IBookmarkRepository
{
    Task<List<Bookmark>> GetByUserAsync(Guid userId);
    Task<Bookmark?> GetAsync(Guid userId, Guid courseId);
    Task<bool> ExistsAsync(Guid userId, Guid courseId);
    Task AddAsync(Bookmark bookmark);
    Task RemoveAsync(Bookmark bookmark);
}
