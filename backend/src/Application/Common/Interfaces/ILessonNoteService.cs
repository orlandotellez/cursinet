using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface ILessonNoteService
{
    Task<NoteResponse?> GetNoteAsync(Guid userId, Guid lessonId);
    Task<NoteResponse> SaveNoteAsync(Guid userId, Guid lessonId, string content);
}
