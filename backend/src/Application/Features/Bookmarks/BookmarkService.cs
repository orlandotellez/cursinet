using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Bookmarks;

public class BookmarkService : IBookmarkService
{
    private readonly IBookmarkRepository _bookmarkRepository;
    private readonly ICourseRepository _courseRepository;

    public BookmarkService(IBookmarkRepository bookmarkRepository, ICourseRepository courseRepository)
    {
        _bookmarkRepository = bookmarkRepository;
        _courseRepository = courseRepository;
    }

    public async Task<List<BookmarkResponse>> GetMyBookmarksAsync(Guid userId)
    {
        var bookmarks = await _bookmarkRepository.GetByUserAsync(userId);
        return bookmarks.Select(b => b.MapToDto()).ToList();
    }

    public async Task AddAsync(Guid userId, Guid courseId)
    {

        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        var exists = await _bookmarkRepository.ExistsAsync(userId, courseId);
        if (exists)
            return;

        var bookmark = new Bookmark
        {
            UserId = userId,
            CourseId = courseId,
            CreatedAt = DateTime.UtcNow,
        };

        await _bookmarkRepository.AddAsync(bookmark);
    }

    public async Task RemoveAsync(Guid userId, Guid courseId)
    {
        var bookmark = await _bookmarkRepository.GetAsync(userId, courseId);
        if (bookmark == null)
            return;

        await _bookmarkRepository.RemoveAsync(bookmark);
    }
}
