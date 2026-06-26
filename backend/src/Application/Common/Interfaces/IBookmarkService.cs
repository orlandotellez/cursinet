using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IBookmarkService
{
    Task<List<BookmarkResponse>> GetMyBookmarksAsync(Guid userId);
    Task AddAsync(Guid userId, Guid courseId);
    Task RemoveAsync(Guid userId, Guid courseId);
}
