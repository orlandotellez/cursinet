using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class BookmarkRepository : IBookmarkRepository
{
    private readonly ApplicationDbContext _context;

    public BookmarkRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Bookmark>> GetByUserAsync(Guid userId)
    {
        return await _context.Bookmarks
            .Include(b => b.Course)
                .ThenInclude(c => c.Instructor)
            .Include(b => b.Course)
                .ThenInclude(c => c.Category)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Bookmark?> GetAsync(Guid userId, Guid courseId)
    {
        return await _context.Bookmarks
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.UserId == userId && b.CourseId == courseId);
    }

    public async Task<bool> ExistsAsync(Guid userId, Guid courseId)
    {
        return await _context.Bookmarks
            .AnyAsync(b => b.UserId == userId && b.CourseId == courseId);
    }

    public async Task AddAsync(Bookmark bookmark)
    {
        await _context.Bookmarks.AddAsync(bookmark);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(Bookmark bookmark)
    {
        _context.Bookmarks.Remove(bookmark);
        await _context.SaveChangesAsync();
    }
}
