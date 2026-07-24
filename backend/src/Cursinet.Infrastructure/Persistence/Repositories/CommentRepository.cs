using Microsoft.EntityFrameworkCore;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly ApplicationDbContext _context;

    public CommentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Comment>> GetByLessonIdAsync(Guid lessonId)
    {
        return await _context.Comments
            .Where(c => c.LessonId == lessonId && c.DeletedAt == null && c.ParentId == null)
            .Include(c => c.User)
            .Include(c => c.Replies!)
                .ThenInclude(r => r.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Comment?> GetByIdAsync(Guid id)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Replies!)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Comment> CreateAsync(Comment comment)
    {
        await _context.Comments.AddAsync(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task<Comment> UpdateAsync(Comment comment)
    {
        _context.Comments.Update(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task DeleteAsync(Guid id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment != null)
        {
            comment.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
