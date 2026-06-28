using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class LessonControllerTests : ControllerTestBase
{
    private readonly ILessonService _lessonService;
    private readonly LessonController _controller;
    private readonly Guid _userId;

    public LessonControllerTests()
    {
        _lessonService = Substitute.For<ILessonService>();
        _controller = new LessonController(_lessonService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetAll_WhenCalledWithAuth_ShouldReturnLessons()
    {
        // Arrange — controller calls HttpContext.GetCurrentUserRole(), so we need auth setup.
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var lessons = new List<LessonSummary>
        {
            new() { Id = Guid.NewGuid(), ModuleId = moduleId, Title = "Lesson 1" },
            new() { Id = Guid.NewGuid(), ModuleId = moduleId, Title = "Lesson 2" },
        };
        _lessonService.GetAllAsync(moduleId, Arg.Any<Guid?>(), Arg.Any<UserRole?>()).Returns(lessons);

        // Act
        var result = await _controller.GetAll(moduleId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<LessonSummary>>();
        returned.Count.ShouldBe(2);
        await _lessonService.Received(1).GetAllAsync(moduleId, Arg.Any<Guid?>(), Arg.Any<UserRole?>());
    }

    [Fact]
    public async Task GetAll_WhenAuthenticated_ShouldPassUserIdToService()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        _lessonService.GetAllAsync(Arg.Any<Guid>(), Arg.Any<Guid?>(), Arg.Any<UserRole?>())
            .Returns(new List<LessonSummary>());

        // Act
        await _controller.GetAll(Guid.NewGuid());

        // Assert
        await _lessonService.Received(1).GetAllAsync(
            Arg.Any<Guid>(),
            Arg.Is<Guid?>(id => id == _userId),
            Arg.Any<UserRole?>());
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnLesson()
    {
        // Arrange
        var moduleId = Guid.NewGuid();
        var lessonId = Guid.NewGuid();
        var lesson = new LessonResponse { Id = lessonId, ModuleId = moduleId, Title = "Lesson" };
        _lessonService.GetByIdAsync(lessonId).Returns(lesson);

        // Act
        var result = await _controller.GetById(moduleId, lessonId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<LessonResponse>();
        returned.Id.ShouldBe(lessonId);
        await _lessonService.Received(1).GetByIdAsync(lessonId);
    }

    [Fact]
    public async Task Create_WhenAuthorized_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var lessonId = Guid.NewGuid();
        var request = new CreateLessonRequest("New Lesson", LessonType.Video);
        var lesson = new LessonResponse { Id = lessonId, ModuleId = moduleId, Title = "New Lesson" };
        _lessonService.CreateAsync(moduleId, request, _userId, UserRole.Student).Returns(lesson);

        // Act
        var result = await _controller.Create(moduleId, request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        createdResult.ActionName.ShouldBe(nameof(LessonController.GetById));
        var returned = createdResult.Value.ShouldBeOfType<LessonResponse>();
        returned.Id.ShouldBe(lessonId);
    }

    [Fact]
    public async Task Create_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new CreateLessonRequest("Lesson", LessonType.Video);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Create(Guid.NewGuid(), request));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Update_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var lessonId = Guid.NewGuid();
        var request = new UpdateLessonRequest(Title: "Updated Lesson");
        var lesson = new LessonResponse { Id = lessonId, ModuleId = moduleId, Title = "Updated Lesson" };
        _lessonService.UpdateAsync(lessonId, request, _userId, UserRole.Student).Returns(lesson);

        // Act
        var result = await _controller.Update(moduleId, lessonId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<LessonResponse>();
        returned.Title.ShouldBe("Updated Lesson");
    }

    [Fact]
    public async Task Update_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new UpdateLessonRequest(Title: "Title");

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Update(Guid.NewGuid(), Guid.NewGuid(), request));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Delete_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var lessonId = Guid.NewGuid();

        // Act
        var result = await _controller.Delete(moduleId, lessonId);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _lessonService.Received(1).DeleteAsync(lessonId, _userId, UserRole.Student);
    }

    [Fact]
    public async Task Delete_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Delete(Guid.NewGuid(), Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Reorder_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var request = new ReorderRequest(new List<ReorderItem>
        {
            new(Guid.NewGuid(), 1),
            new(Guid.NewGuid(), 2),
        });

        // Act
        var result = await _controller.Reorder(moduleId, request);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _lessonService.Received(1).ReorderAsync(moduleId, request, _userId, UserRole.Student);
    }

    [Fact]
    public async Task Reorder_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new ReorderRequest(new List<ReorderItem>());

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Reorder(Guid.NewGuid(), request));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task GetProgress_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.GetProgress(Guid.NewGuid(), Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task UpsertProgress_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new UpsertProgressRequest(0, 0, false);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.UpsertProgress(Guid.NewGuid(), Guid.NewGuid(), request));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task GetProgress_WhenAuthorized_ShouldReturnProgress()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var progress = new LessonProgressResponse
        {
            IsCompleted = true,
            WatchedSeconds = 600,
            LastPositionSeconds = 580,
            UpdatedAt = DateTime.UtcNow,
        };
        _lessonService.GetProgressAsync(lessonId, _userId).Returns(progress);

        // Act
        var result = await _controller.GetProgress(Guid.NewGuid(), lessonId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<LessonProgressResponse>();
        returned.WatchedSeconds.ShouldBe(600);
        returned.IsCompleted.ShouldBeTrue();
    }

    [Fact]
    public async Task UpsertProgress_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var request = new UpsertProgressRequest(WatchedSeconds: 300, LastPositionSeconds: 280, IsCompleted: false);
        var progress = new LessonProgressResponse
        {
            IsCompleted = false,
            WatchedSeconds = 300,
            LastPositionSeconds = 280,
        };
        _lessonService.UpsertProgressAsync(lessonId, _userId, request).Returns(progress);

        // Act
        var result = await _controller.UpsertProgress(Guid.NewGuid(), lessonId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<LessonProgressResponse>();
        returned.WatchedSeconds.ShouldBe(300);
    }
}
