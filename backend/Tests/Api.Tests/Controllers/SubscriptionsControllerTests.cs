using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class SubscriptionsControllerTests : ControllerTestBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly SubscriptionsController _controller;
    private readonly Guid _userId;

    public SubscriptionsControllerTests()
    {
        _subscriptionService = Substitute.For<ISubscriptionService>();
        _controller = new SubscriptionsController(_subscriptionService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetMySubscription_WhenAuthorized_ShouldReturnSubscription()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var sub = new SubscriptionResponse
        {
            Plan = "monthly",
            Status = "active",
        };
        _subscriptionService.GetMySubscriptionAsync(_userId).Returns(sub);

        // Act
        var result = await _controller.GetMySubscription();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<SubscriptionResponse>();
        returned.Plan.ShouldBe("monthly");
        returned.Status.ShouldBe("active");
        await _subscriptionService.Received(1).GetMySubscriptionAsync(_userId);
    }

    [Fact]
    public async Task GetMySubscription_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetMySubscription());
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Cancel_WhenAuthorized_ShouldReturnCancelledSubscription()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var sub = new SubscriptionResponse
        {
            Plan = "monthly",
            Status = "cancelled",
            CancelAtPeriodEnd = true,
        };
        _subscriptionService.CancelMySubscriptionAsync(_userId).Returns(sub);

        // Act
        var result = await _controller.Cancel();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<SubscriptionResponse>();
        returned.Status.ShouldBe("cancelled");
        returned.CancelAtPeriodEnd.ShouldBeTrue();
        await _subscriptionService.Received(1).CancelMySubscriptionAsync(_userId);
    }

    [Fact]
    public async Task Cancel_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.Cancel());
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Reactivate_WhenAuthorized_ShouldReturnActiveSubscription()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var sub = new SubscriptionResponse
        {
            Plan = "monthly",
            Status = "active",
        };
        _subscriptionService.ReactivateMySubscriptionAsync(_userId).Returns(sub);

        // Act
        var result = await _controller.Reactivate();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<SubscriptionResponse>();
        returned.Status.ShouldBe("active");
        await _subscriptionService.Received(1).ReactivateMySubscriptionAsync(_userId);
    }

    [Fact]
    public async Task Reactivate_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.Reactivate());
        ex.StatusCode.ShouldBe(401);
    }
}
