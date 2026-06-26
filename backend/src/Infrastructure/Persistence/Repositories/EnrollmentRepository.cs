using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class EnrollmentRepository : IEnrollmentRepository
{
    private readonly ApplicationDbContext _context;

    public EnrollmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Enrollment>> GetAllAsync()
    {
        return await _context.Enrollments
            .Where(e => e.DeletedAt == null)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Enrollment?> GetByCourseAndUserAsync(Guid courseId, Guid userId)
    {
        return await _context.Enrollments
            .Include(e => e.Course)
            .Where(e => e.CourseId == courseId && e.UserId == userId && e.DeletedAt == null)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }

    public async Task<List<Enrollment>> GetByUserAsync(Guid userId)
    {
        return await _context.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
            .Where(e => e.UserId == userId && e.DeletedAt == null)
            .OrderByDescending(e => e.EnrolledAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Enrollment> CreateAsync(Enrollment enrollment, Guid courseId)
    {

        var course = await _context.Courses.FindAsync(courseId);
        if (course != null)
        {
            course.StudentsCount++;
        }

        await _context.Enrollments.AddAsync(enrollment);
        await _context.SaveChangesAsync();

        return (await _context.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
            .FirstAsync(e => e.Id == enrollment.Id))!;
    }
}
