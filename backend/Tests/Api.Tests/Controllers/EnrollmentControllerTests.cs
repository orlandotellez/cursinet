using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class EnrollmentControllerTests : ControllerTestBase
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly EnrollmentController _controller;
    private readonly Guid _userId;

    public EnrollmentControllerTests()
    {
        _enrollmentService = Substitute.For<IEnrollmentService>();
        _controller = new EnrollmentController(_enrollmentService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task Enroll_WhenAuthorized_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new EnrollmentRequest { CourseId = courseId };
        var enrollment = new EnrollmentResponse
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            CourseId = courseId,
            CourseTitle = "Test Course",
            CourseSlug = "test-course",
        };
        _enrollmentService.EnrollAsync(_userId, courseId).Returns(enrollment);

        // Act
        var result = await _controller.Enroll(request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        var returned = createdResult.Value.ShouldBeOfType<EnrollmentResponse>();
        returned.CourseId.ShouldBe(courseId);
        await _enrollmentService.Received(1).EnrollAsync(_userId, courseId);
    }

    [Fact]
    public async Task Enroll_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Enroll(new EnrollmentRequest { CourseId = Guid.NewGuid() }));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task GetMyEnrollments_WhenAuthorized_ShouldReturnEnrollments()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var enrollments = new List<EnrollmentResponse>
        {
            new() { Id = Guid.NewGuid(), CourseId = Guid.NewGuid(), CourseTitle = "C1" },
            new() { Id = Guid.NewGuid(), CourseId = Guid.NewGuid(), CourseTitle = "C2" },
        };
        _enrollmentService.GetMyEnrollmentsAsync(_userId).Returns(enrollments);

        // Act
        var result = await _controller.GetMyEnrollments();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<EnrollmentResponse>>();
        returned.Count.ShouldBe(2);
        await _enrollmentService.Received(1).GetMyEnrollmentsAsync(_userId);
    }

    [Fact]
    public async Task GetMyEnrollments_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetMyEnrollments());
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task GetStatus_WhenEnrolled_ShouldReturnStatus()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var status = new EnrollmentStatusResponse
        {
            IsEnrolled = true,
            EnrollmentId = Guid.NewGuid(),
            ProgressPercentage = 75m,
        };
        _enrollmentService.GetStatusAsync(_userId, courseId).Returns(status);

        // Act
        var result = await _controller.GetStatus(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<EnrollmentStatusResponse>();
        returned.IsEnrolled.ShouldBeTrue();
        returned.ProgressPercentage.ShouldBe(75m);
    }

    [Fact]
    public async Task GetStatus_WhenNotEnrolled_ShouldReturnNotEnrolledStatus()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var status = new EnrollmentStatusResponse { IsEnrolled = false };
        _enrollmentService.GetStatusAsync(_userId, courseId).Returns(status);

        // Act
        var result = await _controller.GetStatus(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<EnrollmentStatusResponse>();
        returned.IsEnrolled.ShouldBeFalse();
    }

    [Fact]
    public async Task GetStatus_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetStatus(Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }
}
