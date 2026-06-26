using System.Text.RegularExpressions;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class LessonRepository : ILessonRepository
{
    private readonly ApplicationDbContext _context;

    public LessonRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lesson>> GetByModuleAsync(Guid moduleId)
    {
        return await _context.Lessons
            .Where(l => l.ModuleId == moduleId && l.DeletedAt == null)
            .OrderBy(l => l.SortOrder)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Lesson>> GetByCourseAsync(Guid courseId)
    {
        return await _context.Lessons
            .Where(l => l.CourseId == courseId && l.DeletedAt == null)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Lesson?> GetByIdAsync(Guid id)
    {
        return await _context.Lessons
            .Include(l => l.Module)
            .FirstOrDefaultAsync(l => l.Id == id && l.DeletedAt == null);
    }

    public async Task<Lesson?> GetBySlugAsync(string slug)
    {
        return await _context.Lessons
            .FirstOrDefaultAsync(l => l.Slug == slug && l.DeletedAt == null);
    }

    public async Task<bool> SlugExistsAsync(string slug)
    {
        return await _context.Lessons.AnyAsync(l => l.Slug == slug && l.DeletedAt == null);
    }

    public async Task<Lesson> CreateAsync(Lesson lesson)
    {
        await _context.Lessons.AddAsync(lesson);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(lesson.Id))!;
    }

    public async Task<Lesson> UpdateAsync(Lesson lesson)
    {
        _context.Lessons.Update(lesson);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(lesson.Id))!;
    }

    public async Task SoftDeleteAsync(Guid id)
    {
        var lesson = await _context.Lessons.FindAsync(id);
        if (lesson != null)
        {
            lesson.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task SoftDeleteByModuleAsync(Guid moduleId)
    {
        var lessons = await _context.Lessons
            .Where(l => l.ModuleId == moduleId && l.DeletedAt == null)
            .ToListAsync();

        foreach (var lesson in lessons)
        {
            lesson.DeletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task UpdateSortOrderAsync(List<(Guid Id, int SortOrder)> items)
    {
        foreach (var (id, sortOrder) in items)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson != null)
            {
                lesson.SortOrder = sortOrder;
            }
        }

        await _context.SaveChangesAsync();
    }
}
