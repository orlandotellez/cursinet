using Microsoft.EntityFrameworkCore;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly ApplicationDbContext _context;

    public ReviewRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Review>> GetByCourseIdAsync(Guid courseId)
    {
        return await _context.Reviews
            .Where(r => r.CourseId == courseId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review?> GetByIdAsync(Guid id)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Review?> GetByCourseAndUserAsync(Guid courseId, Guid userId)
    {
        return await _context.Reviews
            .Where(r => r.CourseId == courseId && r.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        await _context.Reviews.AddAsync(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<Review> UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task DeleteAsync(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }
}
