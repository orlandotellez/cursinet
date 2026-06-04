using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/courses/{courseId}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly AuthHelper _authHelper;

    public ReviewsController(IReviewService reviewService, AuthHelper authHelper)
    {
        _reviewService = reviewService;
        _authHelper = authHelper;
    }

    /// <summary>Public: get all reviews for a course.</summary>
    [HttpGet]
    public async Task<ActionResult<List<ReviewResponse>>> GetReviews(Guid courseId)
    {
        var reviews = await _reviewService.GetCourseReviewsAsync(courseId);
        return Ok(reviews);
    }

    /// <summary>Authenticated: create a review (must be enrolled).</summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewResponse>> CreateReview(
        Guid courseId,
        [FromBody] CreateReviewRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _reviewService.CreateReviewAsync(courseId, userId, request.Rating, request.Comment);
        return CreatedAtAction(null, result);
    }

    /// <summary>Authenticated: update your own review.</summary>
    [HttpPut("{reviewId}")]
    [Authorize]
    public async Task<ActionResult<ReviewResponse>> UpdateReview(
        Guid courseId,
        Guid reviewId,
        [FromBody] UpdateReviewRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _reviewService.UpdateReviewAsync(reviewId, userId, request.Rating, request.Comment);
        return Ok(result);
    }

    /// <summary>Authenticated: delete your own review.</summary>
    [HttpDelete("{reviewId}")]
    [Authorize]
    public async Task<ActionResult> DeleteReview(Guid courseId, Guid reviewId)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        await _reviewService.DeleteReviewAsync(reviewId, userId);
        return Ok(new { message = "Review deleted successfully." });
    }
}

// ─── Request DTOs ─────────────────────────────────────────

public record CreateReviewRequest(
    int Rating,
    string? Comment
);

public record UpdateReviewRequest(
    int Rating,
    string? Comment
);
