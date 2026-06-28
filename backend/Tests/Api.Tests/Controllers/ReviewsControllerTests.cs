using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class ReviewsControllerTests : ControllerTestBase
{
    private readonly IReviewService _reviewService;
    private readonly ReviewsController _controller;
    private readonly Guid _userId;

    public ReviewsControllerTests()
    {
        _reviewService = Substitute.For<IReviewService>();
        _controller = new ReviewsController(_reviewService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetReviews_AllowsAnonymous_ShouldReturnReviews()
    {
        // Arrange
        var courseId = Guid.NewGuid();
        var reviews = new List<ReviewResponse>
        {
            new() { Id = Guid.NewGuid(), CourseId = courseId, Rating = 5, UserName = "Alice" },
            new() { Id = Guid.NewGuid(), CourseId = courseId, Rating = 4, UserName = "Bob" },
        };
        _reviewService.GetCourseReviewsAsync(courseId).Returns(reviews);

        // Act
        var result = await _controller.GetReviews(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<ReviewResponse>>();
        returned.Count.ShouldBe(2);
    }

    [Fact]
    public async Task CreateReview_WhenAuthorized_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();
        var request = new CreateReviewRequest(5, "Great course!");
        var created = new ReviewResponse
        {
            Id = reviewId,
            CourseId = courseId,
            UserId = _userId,
            UserName = "John",
            Rating = 5,
            Comment = "Great course!",
        };
        _reviewService.CreateReviewAsync(courseId, _userId, 5, "Great course!").Returns(created);

        // Act
        var result = await _controller.CreateReview(courseId, request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        var returned = createdResult.Value.ShouldBeOfType<ReviewResponse>();
        returned.Rating.ShouldBe(5);
    }

    [Fact]
    public async Task CreateReview_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.CreateReview(Guid.NewGuid(), new CreateReviewRequest(5, null)));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task CreateReview_WithoutComment_ShouldStillCallService()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new CreateReviewRequest(4, null);
        _reviewService.CreateReviewAsync(courseId, _userId, 4, null)
            .Returns(new ReviewResponse { Rating = 4 });

        // Act
        await _controller.CreateReview(courseId, request);

        // Assert
        await _reviewService.Received(1).CreateReviewAsync(courseId, _userId, 4, null);
    }

    [Fact]
    public async Task UpdateReview_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var reviewId = Guid.NewGuid();
        var request = new UpdateReviewRequest(3, "Updated comment");
        var updated = new ReviewResponse { Id = reviewId, Rating = 3, Comment = "Updated comment" };
        _reviewService.UpdateReviewAsync(reviewId, _userId, 3, "Updated comment").Returns(updated);

        // Act
        var result = await _controller.UpdateReview(Guid.NewGuid(), reviewId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<ReviewResponse>();
        returned.Rating.ShouldBe(3);
    }

    [Fact]
    public async Task UpdateReview_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.UpdateReview(Guid.NewGuid(), Guid.NewGuid(), new UpdateReviewRequest(5, null)));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task DeleteReview_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var reviewId = Guid.NewGuid();

        // Act
        var result = await _controller.DeleteReview(Guid.NewGuid(), reviewId);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _reviewService.Received(1).DeleteReviewAsync(reviewId, _userId);
    }

    [Fact]
    public async Task DeleteReview_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.DeleteReview(Guid.NewGuid(), Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }
}
