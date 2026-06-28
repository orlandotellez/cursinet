using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class LessonNotesControllerTests : ControllerTestBase
{
    private readonly ILessonNoteService _noteService;
    private readonly LessonNotesController _controller;
    private readonly Guid _userId;

    public LessonNotesControllerTests()
    {
        _noteService = Substitute.For<ILessonNoteService>();
        _controller = new LessonNotesController(_noteService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetNote_WhenAuthorized_ShouldReturnNote()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var note = new NoteResponse
        {
            Id = Guid.NewGuid(),
            LessonId = lessonId,
            Content = "My note content",
            UpdatedAt = DateTime.UtcNow,
        };
        _noteService.GetNoteAsync(_userId, lessonId).Returns(note);

        // Act
        var result = await _controller.GetNote(lessonId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<NoteResponse>();
        returned.Content.ShouldBe("My note content");
        await _noteService.Received(1).GetNoteAsync(_userId, lessonId);
    }

    [Fact]
    public async Task GetNote_WhenNoNoteExists_ShouldReturnOkWithNull()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        _noteService.GetNoteAsync(_userId, lessonId).Returns((NoteResponse?)null);

        // Act
        var result = await _controller.GetNote(lessonId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldBeNull();
    }

    [Fact]
    public async Task GetNote_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetNote(Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task SaveNote_WithValidContent_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var lessonId = Guid.NewGuid();
        var request = new SaveNoteRequest("My notes here");
        var saved = new NoteResponse
        {
            Id = Guid.NewGuid(),
            LessonId = lessonId,
            Content = "My notes here",
            UpdatedAt = DateTime.UtcNow,
        };
        _noteService.SaveNoteAsync(_userId, lessonId, "My notes here").Returns(saved);

        // Act
        var result = await _controller.SaveNote(lessonId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<NoteResponse>();
        returned.Content.ShouldBe("My notes here");
        await _noteService.Received(1).SaveNoteAsync(_userId, lessonId, "My notes here");
    }

    [Fact]
    public async Task SaveNote_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.SaveNote(Guid.NewGuid(), new SaveNoteRequest("content")));
        ex.StatusCode.ShouldBe(401);
    }
}
