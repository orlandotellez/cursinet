using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ICourseRepository
{
    Task<List<Course>> GetAllAsync();
    Task<List<Course>> GetAllIncludingDeletedAsync();
    Task<Course?> GetByIdAsync(Guid id);
    Task<Course?> GetBySlugAsync(string slug);
    Task<bool> SlugExistsAsync(string slug);
    Task<Course> CreateAsync(Course course);
    Task<Course> UpdateAsync(Course course);
    Task SoftDeleteAsync(Guid id);
    Task SoftDeleteAsync(Course course, Guid? deletedByUserId = null);
}
