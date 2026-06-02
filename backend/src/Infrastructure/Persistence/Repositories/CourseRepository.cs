using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class CourseRepository : ICourseRepository
{
    private readonly ApplicationDbContext _context;

    public CourseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> GetAllAsync()
    {
        return await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Where(c => c.DeletedAt == null)
            .OrderByDescending(c => c.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Course?> GetByIdAsync(Guid id)
    {
        return await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == id && c.DeletedAt == null);
    }

    public async Task<Course?> GetBySlugAsync(string slug)
    {
        return await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Slug == slug && c.DeletedAt == null);
    }

    public async Task<bool> SlugExistsAsync(string slug)
    {
        return await _context.Courses.AnyAsync(c => c.Slug == slug && c.DeletedAt == null);
    }

    public async Task<Course> CreateAsync(Course course)
    {
        await _context.Courses.AddAsync(course);
        await _context.SaveChangesAsync();

        // Recargar con includes para la response
        return (await GetByIdAsync(course.Id))!;
    }

    public async Task<Course> UpdateAsync(Course course)
    {
        _context.Courses.Update(course);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(course.Id))!;
    }

    public async Task SoftDeleteAsync(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course != null)
        {
            course.DeletedAt = DateTime.UtcNow;
            _context.Courses.Update(course);
            await _context.SaveChangesAsync();
        }
    }
}
