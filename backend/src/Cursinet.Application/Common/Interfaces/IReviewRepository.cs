using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IReviewRepository
{
    Task<List<Review>> GetByCourseIdAsync(Guid courseId);
    Task<Review?> GetByIdAsync(Guid id);
    Task<Review?> GetByCourseAndUserAsync(Guid courseId, Guid userId);
    Task<Review> CreateAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task DeleteAsync(Guid id);
}
