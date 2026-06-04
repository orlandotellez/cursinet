using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ILessonProgressRepository
{
    Task<LessonProgress?> GetAsync(Guid userId, Guid lessonId);
    Task<LessonProgress> UpsertAsync(LessonProgress progress);
    Task<List<LessonProgress>> GetByUserAndCourseAsync(Guid userId, Guid courseId);
}
