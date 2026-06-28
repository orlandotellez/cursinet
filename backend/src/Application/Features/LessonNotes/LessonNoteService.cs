using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.LessonNotes;

public class LessonNoteService : ILessonNoteService
{
    private readonly ILessonNoteRepository _noteRepository;
    private readonly ILessonRepository _lessonRepository;

    public LessonNoteService(
        ILessonNoteRepository noteRepository,
        ILessonRepository lessonRepository)
    {
        _noteRepository = noteRepository;
        _lessonRepository = lessonRepository;
    }

    public async Task<NoteResponse?> GetNoteAsync(Guid userId, Guid lessonId)
    {
        var note = await _noteRepository.GetByUserAndLessonAsync(userId, lessonId);
        if (note == null) return null;

        return Map(note);
    }

    public async Task<NoteResponse> SaveNoteAsync(Guid userId, Guid lessonId, string content)
    {
        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson == null)
            throw AppExceptions.NotFound("Lesson not found");

        var note = new LessonNote
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LessonId = lessonId,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var saved = await _noteRepository.UpsertAsync(note);
        return Map(saved);
    }

    private static NoteResponse Map(LessonNote note) => new()
    {
        Id = note.Id,
        LessonId = note.LessonId,
        Content = note.Content,
        VideoTimestampSeconds = note.VideoTimestampSeconds,
        UpdatedAt = note.UpdatedAt,
    };
}
