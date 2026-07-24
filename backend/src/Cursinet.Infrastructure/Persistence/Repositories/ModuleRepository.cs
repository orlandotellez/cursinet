using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class ModuleRepository : IModuleRepository
{
    private readonly ApplicationDbContext _context;

    public ModuleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Module>> GetByCourseAsync(Guid courseId)
    {
        return await _context.Modules
            .Include(m => m.Lessons)
            .Where(m => m.CourseId == courseId && m.DeletedAt == null)
            .OrderBy(m => m.SortOrder)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Module?> GetByIdAsync(Guid id)
    {
        return await _context.Modules
            .Include(m => m.Lessons)
            .FirstOrDefaultAsync(m => m.Id == id && m.DeletedAt == null);
    }

    public async Task<Module> CreateAsync(Module module)
    {
        await _context.Modules.AddAsync(module);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(module.Id))!;
    }

    public async Task<Module> UpdateAsync(Module module)
    {
        _context.Modules.Update(module);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(module.Id))!;
    }

    public async Task SoftDeleteAsync(Guid id)
    {
        var module = await _context.Modules
            .Include(m => m.Lessons)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (module != null)
        {
            module.DeletedAt = DateTime.UtcNow;

            // Cascade soft-delete a las lecciones hijas
            foreach (var lesson in module.Lessons.Where(l => l.DeletedAt == null))
            {
                lesson.DeletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
    }

    public async Task SoftDeleteByCourseAsync(Guid courseId)
    {
        var modules = await _context.Modules
            .Include(m => m.Lessons)
            .Where(m => m.CourseId == courseId && m.DeletedAt == null)
            .ToListAsync();

        foreach (var module in modules)
        {
            module.DeletedAt = DateTime.UtcNow;

            foreach (var lesson in module.Lessons.Where(l => l.DeletedAt == null))
            {
                lesson.DeletedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task UpdateSortOrderAsync(List<(Guid Id, int SortOrder)> items)
    {
        foreach (var (id, sortOrder) in items)
        {
            var module = await _context.Modules.FindAsync(id);
            if (module != null)
            {
                module.SortOrder = sortOrder;
            }
        }

        await _context.SaveChangesAsync();
    }
}
