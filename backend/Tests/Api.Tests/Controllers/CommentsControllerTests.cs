using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class CommentsControllerTests : ControllerTestBase
{
    private readonly ICommentService _commentService;
    private readonly CommentsController _controller;
    private readonly Guid _userId;

    public CommentsControllerTests()
    {
        _commentService = Substitute.For<ICommentService>();
        _controller = new CommentsController(_commentService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetComments_WhenAuthorized_ShouldReturnComments()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var comments = new List<CommentResponse>
        {
            new() { Id = Guid.NewGuid(), LessonId = lessonId, Body = "First", UserName = "Alice" },
            new() { Id = Guid.NewGuid(), LessonId = lessonId, Body = "Second", UserName = "Bob" },
        };
        _commentService.GetLessonCommentsAsync(lessonId).Returns(comments);

        // Act
        var result = await _controller.GetComments(lessonId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<CommentResponse>>();
        returned.Count.ShouldBe(2);
    }

    [Fact]
    public async Task GetComments_RunsWithoutThrowingAtActionBody()
    {
        // GetComments does not call HttpContext extensions that would throw at the action-body level;
        // authentication is enforced by the [Authorize] filter at the pipeline level (covered by
        // integration tests, not these unit tests). The action body itself just returns comments.
        SetAnonymous(_controller);
        var lessonId = Guid.NewGuid();
        _commentService.GetLessonCommentsAsync(lessonId).Returns(new List<CommentResponse>());

        // Act
        var result = await _controller.GetComments(lessonId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldBeOfType<List<CommentResponse>>();
    }

    [Fact]
    public async Task CreateComment_WhenAuthorized_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var commentId = Guid.NewGuid();
        var request = new CreateCommentRequest("My comment", null);
        var created = new CommentResponse
        {
            Id = commentId,
            LessonId = lessonId,
            UserId = _userId,
            UserName = "John",
            Body = "My comment",
        };
        _commentService.CreateCommentAsync(lessonId, _userId, "My comment", null).Returns(created);

        // Act
        var result = await _controller.CreateComment(lessonId, request);

        // Assert
        result.Result.ShouldBeOfType<CreatedAtActionResult>();
        await _commentService.Received(1).CreateCommentAsync(lessonId, _userId, "My comment", null);
    }

    [Fact]
    public async Task CreateComment_WithParentId_ShouldPassParentToService()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var request = new CreateCommentRequest("Reply", parentId);
        _commentService.CreateCommentAsync(lessonId, _userId, "Reply", parentId)
            .Returns(new CommentResponse { ParentId = parentId });

        // Act
        await _controller.CreateComment(lessonId, request);

        // Assert
        await _commentService.Received(1).CreateCommentAsync(lessonId, _userId, "Reply", parentId);
    }

    [Fact]
    public async Task CreateComment_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.CreateComment(Guid.NewGuid(), new CreateCommentRequest("body", null)));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task UpdateComment_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var commentId = Guid.NewGuid();
        var request = new UpdateCommentRequest("Updated body");
        var updated = new CommentResponse { Id = commentId, Body = "Updated body", IsEdited = true };
        _commentService.UpdateCommentAsync(commentId, _userId, "Updated body").Returns(updated);

        // Act
        var result = await _controller.UpdateComment(Guid.NewGuid(), commentId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CommentResponse>();
        returned.Body.ShouldBe("Updated body");
    }

    [Fact]
    public async Task UpdateComment_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.UpdateComment(Guid.NewGuid(), Guid.NewGuid(), new UpdateCommentRequest("x")));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task DeleteComment_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var commentId = Guid.NewGuid();

        // Act
        var result = await _controller.DeleteComment(Guid.NewGuid(), commentId);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _commentService.Received(1).DeleteCommentAsync(commentId, _userId);
    }

    [Fact]
    public async Task DeleteComment_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.DeleteComment(Guid.NewGuid(), Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }
}
