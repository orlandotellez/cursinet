using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class NotificationPreferencesControllerTests : ControllerTestBase
{
    private readonly INotificationPreferenceService _service;
    private readonly NotificationPreferencesController _controller;
    private readonly Guid _userId;

    public NotificationPreferencesControllerTests()
    {
        _service = Substitute.For<INotificationPreferenceService>();
        _controller = new NotificationPreferencesController(_service);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task Get_WhenAuthorized_ShouldReturnPreferences()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var prefs = new NotificationPreferenceResponse
        {
            Id = Guid.NewGuid(),
            CourseUpdates = true,
            NewContent = true,
            Comments = false,
            Marketing = false,
        };
        _service.GetAsync(_userId).Returns(prefs);

        // Act
        var result = await _controller.Get();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<NotificationPreferenceResponse>();
        returned.CourseUpdates.ShouldBeTrue();
        returned.Comments.ShouldBeFalse();
        await _service.Received(1).GetAsync(_userId);
    }

    [Fact]
    public async Task Get_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.Get());
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Save_WithValidRequest_ShouldReturnUpdatedPreferences()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var request = new UpdateNotificationPreferenceRequest(
                CourseUpdates: false,
                NewContent: true,
                Comments: true,
                Marketing: false);
        var saved = new NotificationPreferenceResponse
        {
            Id = Guid.NewGuid(),
            CourseUpdates = false,
            NewContent = true,
            Comments = true,
            Marketing = false,
        };
        _service.SaveAsync(_userId, request).Returns(saved);

        // Act
        var result = await _controller.Save(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<NotificationPreferenceResponse>();
        returned.CourseUpdates.ShouldBeFalse();
        returned.Comments.ShouldBeTrue();
        await _service.Received(1).SaveAsync(_userId, request);
    }

    [Fact]
    public async Task Save_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Save(new UpdateNotificationPreferenceRequest(CourseUpdates: true)));
        ex.StatusCode.ShouldBe(401);
    }
}
