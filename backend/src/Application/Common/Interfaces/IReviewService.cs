using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IReviewService
{
    Task<List<ReviewResponse>> GetCourseReviewsAsync(Guid courseId);
    Task<ReviewResponse> CreateReviewAsync(Guid courseId, Guid userId, int rating, string? comment);
    Task<ReviewResponse> UpdateReviewAsync(Guid reviewId, Guid userId, int rating, string? comment);
    Task DeleteReviewAsync(Guid reviewId, Guid userId);
}
