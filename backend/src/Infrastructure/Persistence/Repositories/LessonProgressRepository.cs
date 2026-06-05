using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class LessonProgressRepository : ILessonProgressRepository
{
    private readonly ApplicationDbContext _context;

    public LessonProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LessonProgress?> GetAsync(Guid userId, Guid lessonId)
    {
        return await _context.LessonProgress
            .FirstOrDefaultAsync(lp => lp.UserId == userId && lp.LessonId == lessonId);
    }

    public async Task<List<LessonProgress>> GetByUserAndCourseAsync(Guid userId, Guid courseId)
    {
        return await _context.LessonProgress
            .Where(lp => lp.UserId == userId && lp.Lesson != null && lp.Lesson.Module != null && lp.Lesson.Module.CourseId == courseId)
            .Include(lp => lp.Lesson)
                .ThenInclude(l => l.Module)
            .ToListAsync();
    }

    public async Task<LessonProgress> UpsertAsync(LessonProgress progress)
    {
        var existing = await _context.LessonProgress
            .FirstOrDefaultAsync(lp => lp.UserId == progress.UserId && lp.LessonId == progress.LessonId);

        if (existing != null)
        {
            existing.IsCompleted = progress.IsCompleted;
            existing.WatchedSeconds = progress.WatchedSeconds;
            existing.LastPositionSeconds = progress.LastPositionSeconds;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            progress.Id = Guid.NewGuid();
            progress.CreatedAt = DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;
            await _context.LessonProgress.AddAsync(progress);
        }

        await _context.SaveChangesAsync();

        return existing ?? progress;
    }
}
