using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class BookmarksControllerTests : ControllerTestBase
{
    private readonly IBookmarkService _bookmarkService;
    private readonly BookmarksController _controller;
    private readonly Guid _userId;

    public BookmarksControllerTests()
    {
        _bookmarkService = Substitute.For<IBookmarkService>();
        _controller = new BookmarksController(_bookmarkService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetMyBookmarks_WhenAuthorized_ShouldReturnBookmarks()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var bookmarks = new List<BookmarkResponse>
        {
            new() { CourseId = Guid.NewGuid(), CourseTitle = "Course 1" },
            new() { CourseId = Guid.NewGuid(), CourseTitle = "Course 2" },
        };
        _bookmarkService.GetMyBookmarksAsync(_userId).Returns(bookmarks);

        // Act
        var result = await _controller.GetMyBookmarks();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<BookmarkResponse>>();
        returned.Count.ShouldBe(2);
        await _bookmarkService.Received(1).GetMyBookmarksAsync(_userId);
    }

    [Fact]
    public async Task GetMyBookmarks_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetMyBookmarks());
        ex.StatusCode.ShouldBe(401);
        await _bookmarkService.DidNotReceiveWithAnyArgs().GetMyBookmarksAsync(default);
    }

    [Fact]
    public async Task AddBookmark_WithValidRequest_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new AddBookmarkRequest(courseId);

        // Act
        var result = await _controller.AddBookmark(request);

        // Assert
        result.ShouldBeOfType<CreatedAtActionResult>();
        await _bookmarkService.Received(1).AddAsync(_userId, courseId);
    }

    [Fact]
    public async Task AddBookmark_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new AddBookmarkRequest(Guid.NewGuid());

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.AddBookmark(request));
        ex.StatusCode.ShouldBe(401);
        await _bookmarkService.DidNotReceiveWithAnyArgs().AddAsync(default, default);
    }

    [Fact]
    public async Task RemoveBookmark_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();

        // Act
        var result = await _controller.RemoveBookmark(courseId);

        // Assert
        result.ShouldBeOfType<NoContentResult>();
        await _bookmarkService.Received(1).RemoveAsync(_userId, courseId);
    }

    [Fact]
    public async Task RemoveBookmark_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.RemoveBookmark(Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }
}
