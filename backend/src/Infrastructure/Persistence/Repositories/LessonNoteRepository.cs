using Microsoft.EntityFrameworkCore;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;

namespace Cursinet.Infrastructure.Persistence.Repositories;

public class LessonNoteRepository : ILessonNoteRepository
{
    private readonly ApplicationDbContext _context;

    public LessonNoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LessonNote?> GetByUserAndLessonAsync(Guid userId, Guid lessonId)
    {
        return await _context.LessonNotes
            .Where(n => n.UserId == userId && n.LessonId == lessonId)
            .FirstOrDefaultAsync();
    }

    public async Task<LessonNote> UpsertAsync(LessonNote note)
    {
        var existing = await _context.LessonNotes
            .Where(n => n.UserId == note.UserId && n.LessonId == note.LessonId)
            .FirstOrDefaultAsync();

        if (existing != null)
        {
            existing.Content = note.Content;
            existing.VideoTimestampSeconds = note.VideoTimestampSeconds;
            existing.UpdatedAt = DateTime.UtcNow;
            _context.LessonNotes.Update(existing);
        }
        else
        {
            await _context.LessonNotes.AddAsync(note);
        }

        await _context.SaveChangesAsync();
        return existing ?? note;
    }
}
