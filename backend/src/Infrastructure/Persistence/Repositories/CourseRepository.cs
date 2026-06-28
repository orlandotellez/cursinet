using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class CourseRepository : ICourseRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CourseRepository> _logger;

    public CourseRepository(ApplicationDbContext context, ILogger<CourseRepository> logger)
    {
        _context = context;
        _logger = logger;
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

    public async Task<List<Course>> GetAllIncludingDeletedAsync()
    {
        return await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.DeletedByUser)
            .OrderByDescending(c => c.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Course>> GetFilteredAsync(CourseFilter filter)
    {
        IQueryable<Course> query = _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .AsNoTracking();

        if (filter.IncludeDeleted == true)
            query = query.Include(c => c.DeletedByUser);

        if (filter.IncludeDeleted != true)
            query = query.Where(c => c.DeletedAt == null);

        if (filter.CategoryId.HasValue)
            query = query.Where(c => c.CategoryId == filter.CategoryId.Value);

        if (filter.Level.HasValue)
            query = query.Where(c => c.Level == filter.Level.Value);

        if (filter.IsPublished.HasValue)
            query = query.Where(c => c.IsPublished == filter.IsPublished.Value);

        if (filter.IsFeatured.HasValue)
            query = query.Where(c => c.IsFeatured == filter.IsFeatured.Value);

        if (filter.InstructorId.HasValue)
            query = query.Where(c => c.InstructorId == filter.InstructorId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search;
            query = query.Where(c =>
                EF.Functions.ILike(c.Title, $"%{search}%") ||
                (c.ShortDescription != null && EF.Functions.ILike(c.ShortDescription, $"%{search}%"))
            );
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
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

    public async Task SoftDeleteAsync(Course course, Guid? deletedByUserId = null)
    {

        _context.Entry(course).State = EntityState.Modified;
        course.DeletedAt = DateTime.UtcNow;
        course.DeletedByUserId = deletedByUserId;
        try
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Course {CourseId} soft-deleted at {DeletedAt} by {UserId}", course.Id, course.DeletedAt, deletedByUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SaveChanges failed for course {CourseId}", course.Id);
            throw;
        }
    }

    public async Task SoftDeleteAsync(Course course)
    {
        await SoftDeleteAsync(course, null);
    }
}
