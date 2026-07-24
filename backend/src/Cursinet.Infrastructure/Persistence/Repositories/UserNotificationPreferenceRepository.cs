using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class UserNotificationPreferenceRepository : IUserNotificationPreferenceRepository
{
    private readonly ApplicationDbContext _context;

    public UserNotificationPreferenceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserNotificationPreference?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Set<UserNotificationPreference>()
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<UserNotificationPreference> UpsertAsync(UserNotificationPreference preference)
    {
        var existing = await _context.Set<UserNotificationPreference>()
            .FirstOrDefaultAsync(p => p.UserId == preference.UserId);

        if (existing != null)
        {
            existing.CourseUpdates = preference.CourseUpdates;
            existing.NewContent = preference.NewContent;
            existing.Comments = preference.Comments;
            existing.Marketing = preference.Marketing;
            existing.UpdatedAt = DateTime.UtcNow;
            _context.Set<UserNotificationPreference>().Update(existing);
        }
        else
        {
            preference.Id = Guid.NewGuid();
            preference.CreatedAt = DateTime.UtcNow;
            preference.UpdatedAt = DateTime.UtcNow;
            await _context.Set<UserNotificationPreference>().AddAsync(preference);
        }

        await _context.SaveChangesAsync();
        return existing ?? preference;
    }
}
