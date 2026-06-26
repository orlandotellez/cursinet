using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllAsync(bool includeDeleted = false)
    {
        var query = _context.Users.AsQueryable();

        if (!includeDeleted)
            query = query.Where(u => u.DeletedAt == null);

        return await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null);
    }

    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task SoftDeleteAsync(Guid id, Guid deletedByUserId, string deletedByName)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.DeletedAt = DateTime.UtcNow;
            user.DeletedByUserId = deletedByUserId;
            user.DeletedByName = deletedByName;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RestoreAsync(Guid id)
    {
        var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
        if (user != null)
        {
            user.DeletedAt = null;
            user.DeletedByUserId = null;
            user.DeletedByName = null;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}