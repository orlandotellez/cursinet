using Cursinet.Api.Controllers;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class CourseControllerTests : ControllerTestBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<CourseController> _logger;
    private readonly CourseController _controller;
    private readonly Guid _userId;
    private readonly Guid _categoryId;

    public CourseControllerTests()
    {
        _courseService = Substitute.For<ICourseService>();
        _logger = Substitute.For<ILogger<CourseController>>();
        _controller = new CourseController(_courseService, _logger);
        _userId = Guid.NewGuid();
        _categoryId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetAll_WithoutFilters_ShouldReturnAllCourses()
    {
        // Arrange
        var courses = new List<CourseResponse>
        {
            new() { Id = Guid.NewGuid(), Title = "Course 1" },
            new() { Id = Guid.NewGuid(), Title = "Course 2" },
        };
        _courseService.GetAllAsync(Arg.Any<CourseFilter>()).Returns(courses);

        // Act
        var result = await _controller.GetAll(null, null, null, null, null, null, null);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<CourseResponse>>();
        returned.Count.ShouldBe(2);
    }

    [Fact]
    public async Task GetAll_WithFilters_ShouldPassFilterToService()
    {
        // Arrange
        var level = CourseLevel.Intermediate;
        var courses = new List<CourseResponse> { new() { Id = Guid.NewGuid(), Title = "Filtered" } };
        _courseService.GetAllAsync(Arg.Any<CourseFilter>()).Returns(courses);

        // Act
        await _controller.GetAll(
            categoryId: _categoryId,
            level: level,
            isPublished: true,
            isFeatured: null,
            search: "angular",
            includeDeleted: null,
            instructorId: null);

        // Assert
        await _courseService.Received(1).GetAllAsync(Arg.Is<CourseFilter>(f =>
            f.CategoryId == _categoryId &&
            f.Level == level &&
            f.IsPublished == true &&
            f.Search == "angular"));
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnCourse()
    {
        // Arrange
        var courseId = Guid.NewGuid();
        var course = new CourseResponse { Id = courseId, Title = "Test Course" };
        _courseService.GetByIdAsync(courseId).Returns(course);

        // Act
        var result = await _controller.GetById(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CourseResponse>();
        returned.Id.ShouldBe(courseId);
        returned.Title.ShouldBe("Test Course");
    }

    [Fact]
    public async Task GetBySlug_WithValidSlug_ShouldReturnCourse()
    {
        // Arrange
        var course = new CourseResponse { Id = Guid.NewGuid(), Title = "Slug Course", Slug = "slug-course" };
        _courseService.GetBySlugAsync("slug-course").Returns(course);

        // Act
        var result = await _controller.GetBySlug("slug-course");

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CourseResponse>();
        returned.Slug.ShouldBe("slug-course");
    }

    [Fact]
    public async Task Create_WithValidRequest_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new CreateCourseRequest("New Course", _categoryId, CourseLevel.Beginner);
        var created = new CourseResponse { Id = courseId, Title = "New Course" };
        _courseService.CreateAsync(request, _userId).Returns(created);

        // Act
        var result = await _controller.Create(request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        createdResult.ActionName.ShouldBe(nameof(CourseController.GetById));
        var returned = createdResult.Value.ShouldBeOfType<CourseResponse>();
        returned.Id.ShouldBe(courseId);
    }

    [Fact]
    public async Task Create_WithoutAuth_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new CreateCourseRequest("New Course", _categoryId, CourseLevel.Beginner);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.Create(request));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Update_WithValidRequest_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new UpdateCourseRequest(Title: "Updated");
        var updated = new CourseResponse { Id = courseId, Title = "Updated" };
        // Default role from SetUserAuth is "Student"
        _courseService.UpdateAsync(courseId, request, _userId, UserRole.Student).Returns(updated);

        // Act
        var result = await _controller.Update(courseId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CourseResponse>();
        returned.Title.ShouldBe("Updated");
    }

    [Fact]
    public async Task Delete_WithValidRequest_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();

        // Act
        var result = await _controller.Delete(courseId);

        // Assert
        var okResult = result.ShouldBeOfType<OkObjectResult>();
        await _courseService.Received(1).DeleteAsync(courseId, _userId, UserRole.Student);
    }

    [Fact]
    public async Task Publish_WithValidId_ShouldReturnPublishedCourse()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var published = new CourseResponse { Id = courseId, Title = "Published", IsPublished = true };
        _courseService.PublishAsync(courseId, _userId, UserRole.Student).Returns(published);

        // Act
        var result = await _controller.Publish(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CourseResponse>();
        returned.IsPublished.ShouldBeTrue();
    }

    [Fact]
    public async Task Unpublish_WithValidId_ShouldReturnUnpublishedCourse()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var unpublished = new CourseResponse { Id = courseId, Title = "Unpublished", IsPublished = false };
        _courseService.UnpublishAsync(courseId, _userId, UserRole.Student).Returns(unpublished);

        // Act
        var result = await _controller.Unpublish(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CourseResponse>();
        returned.IsPublished.ShouldBeFalse();
    }
}
