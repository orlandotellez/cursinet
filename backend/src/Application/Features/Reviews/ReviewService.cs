using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Reviews;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;

    public ReviewService(
        IReviewRepository reviewRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository)
    {
        _reviewRepository = reviewRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<List<ReviewResponse>> GetCourseReviewsAsync(Guid courseId)
    {
        var reviews = await _reviewRepository.GetByCourseIdAsync(courseId);
        return reviews.Select(r => r.MapToDto()).ToList();
    }

    public async Task<ReviewResponse> CreateReviewAsync(Guid courseId, Guid userId, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw AppExceptions.BadRequest("Rating must be between 1 and 5");

        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null)
            throw AppExceptions.NotFound("Course not found");

        var enrollment = await _enrollmentRepository.GetByCourseAndUserAsync(courseId, userId);
        if (enrollment == null)
            throw AppExceptions.Forbidden("You must be enrolled in this course to leave a review");

        var existing = await _reviewRepository.GetByCourseAndUserAsync(courseId, userId);
        if (existing != null)
            throw AppExceptions.Conflict("You have already reviewed this course. Update your existing review instead.");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            UserId = userId,
            Rating = rating,
            Comment = comment,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        review = await _reviewRepository.CreateAsync(review);
        await RecalculateCourseStats(courseId);

        return review.MapToDto();
    }

    public async Task<ReviewResponse> UpdateReviewAsync(Guid reviewId, Guid userId, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw AppExceptions.BadRequest("Rating must be between 1 and 5");

        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null)
            throw AppExceptions.NotFound("Review not found");

        if (review.UserId != userId)
            throw AppExceptions.Forbidden("You can only edit your own reviews");

        review.Rating = rating;
        review.Comment = comment;
        review.UpdatedAt = DateTime.UtcNow;

        review = await _reviewRepository.UpdateAsync(review);
        await RecalculateCourseStats(review.CourseId);

        return review.MapToDto();
    }

    public async Task DeleteReviewAsync(Guid reviewId, Guid userId)
    {
        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null)
            throw AppExceptions.NotFound("Review not found");

        if (review.UserId != userId)
            throw AppExceptions.Forbidden("You can only delete your own reviews");

        var courseId = review.CourseId;
        await _reviewRepository.DeleteAsync(reviewId);
        await RecalculateCourseStats(courseId);
    }

    private async Task RecalculateCourseStats(Guid courseId)
    {
        var reviews = await _reviewRepository.GetByCourseIdAsync(courseId);
        var course = await _courseRepository.GetByIdAsync(courseId);
        if (course == null) return;

        course.ReviewsCount = reviews.Count;
        course.AverageRating = reviews.Count > 0
            ? (decimal)reviews.Average(r => r.Rating)
            : 0m;
        course.UpdatedAt = DateTime.UtcNow;

        await _courseRepository.UpdateAsync(course);
    }
}
