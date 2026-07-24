using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ILessonNoteRepository
{
    Task<LessonNote?> GetByUserAndLessonAsync(Guid userId, Guid lessonId);
    Task<LessonNote> UpsertAsync(LessonNote note);
}
