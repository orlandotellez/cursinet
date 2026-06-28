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

public class ModuleControllerTests : ControllerTestBase
{
    private readonly IModuleService _moduleService;
    private readonly ModuleController _controller;
    private readonly Guid _userId;

    public ModuleControllerTests()
    {
        _moduleService = Substitute.For<IModuleService>();
        _controller = new ModuleController(_moduleService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetAll_WhenCalledWithAuth_ShouldReturnModules()
    {
        // Arrange — controller calls HttpContext.GetCurrentUserRole() which requires
        // a Role claim, so we must simulate an authenticated user.
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var modules = new List<ModuleResponse>
        {
            new() { Id = Guid.NewGuid(), CourseId = courseId, Title = "Module 1" },
        };
        _moduleService.GetAllAsync(courseId, Arg.Any<Guid?>(), Arg.Any<UserRole?>()).Returns(modules);

        // Act
        var result = await _controller.GetAll(courseId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<ModuleResponse>>();
        returned.Count.ShouldBe(1);
        await _moduleService.Received(1).GetAllAsync(
            courseId,
            Arg.Is<Guid?>(id => id == _userId),
            Arg.Any<UserRole?>());
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnModule()
    {
        // Arrange — same reason as GetAll: controller calls HttpContext.GetCurrentUserRole().
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var module = new ModuleResponse { Id = moduleId, CourseId = courseId, Title = "Module" };
        _moduleService.GetByIdAsync(moduleId, Arg.Any<Guid?>(), Arg.Any<UserRole?>()).Returns(module);

        // Act
        var result = await _controller.GetById(courseId, moduleId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldBeOfType<ModuleResponse>();
        await _moduleService.Received(1).GetByIdAsync(
            moduleId,
            Arg.Is<Guid?>(id => id == _userId),
            Arg.Any<UserRole?>());
    }

    [Fact]
    public async Task GetCurriculum_WithAuthenticatedUser_ShouldReturnCurriculum()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var curriculum = new CurriculumResponse
        {
            CourseId = courseId,
            Modules = new List<CurriculumModule>
            {
                new() { Id = Guid.NewGuid(), Title = "M1", Lessons = [] },
            },
        };
        _moduleService.GetCurriculumAsync(courseId, Arg.Any<Guid?>(), Arg.Any<UserRole?>()).Returns(curriculum);

        // Act
        var result = await _controller.GetCurriculum(courseId);

        // Assert — user id flows through; role fits UserRole.Student (default)
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CurriculumResponse>();
        returned.Modules.Count.ShouldBe(1);
        await _moduleService.Received(1).GetCurriculumAsync(
            courseId,
            Arg.Is<Guid?>(id => id == _userId),
            Arg.Any<UserRole?>());
    }

    [Fact]
    public async Task GetCurriculum_WithAuthenticatedUser_ShouldPassUserContext()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        _moduleService.GetCurriculumAsync(Arg.Any<Guid>(), Arg.Any<Guid?>(), Arg.Any<UserRole?>())
            .Returns(new CurriculumResponse());

        // Act
        await _controller.GetCurriculum(Guid.NewGuid());

        // Assert
        await _moduleService.Received(1).GetCurriculumAsync(
            Arg.Any<Guid>(),
            Arg.Is<Guid?>(id => id == _userId),
            Arg.Any<UserRole?>());
    }

    [Fact]
    public async Task GetCurriculum_WhenAnonymous_ShouldReturnCurriculumWithoutAuth()
    {
        // Curriculum is [AllowAnonymous]; the controller must use
        // GetCurrentUserRoleOrDefault so anonymous callers get role=null
        // (no 401 thrown at the action body) and the service decides what
        // preview lessons / progress to expose.
        SetAnonymous(_controller);
        var courseId = Guid.NewGuid();
        var curriculum = new CurriculumResponse
        {
            CourseId = courseId,
            Modules = new List<CurriculumModule>(),
        };
        _moduleService.GetCurriculumAsync(courseId, null, null).Returns(curriculum);

        // Act
        var result = await _controller.GetCurriculum(courseId);

        // Assert — OkObjectResult with the CurriculumResponse, and service
        // called with (courseId, userId=null, role=null).
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CurriculumResponse>();
        returned.CourseId.ShouldBe(courseId);
        await _moduleService.Received(1).GetCurriculumAsync(courseId, null, null);
    }

    [Fact]
    public async Task Create_WhenAuthorized_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var moduleId = Guid.NewGuid();
        var request = new CreateModuleRequest("New Module");
        var module = new ModuleResponse { Id = moduleId, CourseId = courseId, Title = "New Module" };
        _moduleService.CreateAsync(courseId, request, _userId, UserRole.Student).Returns(module);

        // Act
        var result = await _controller.Create(courseId, request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        createdResult.ActionName.ShouldBe(nameof(ModuleController.GetById));
    }

    [Fact]
    public async Task Create_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Create(Guid.NewGuid(), new CreateModuleRequest("Title")));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Update_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();
        var request = new UpdateModuleRequest(Title: "Updated");
        var module = new ModuleResponse { Id = moduleId, Title = "Updated" };
        _moduleService.UpdateAsync(moduleId, request, _userId, UserRole.Student).Returns(module);

        // Act
        var result = await _controller.Update(Guid.NewGuid(), moduleId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldBeOfType<ModuleResponse>();
    }

    [Fact]
    public async Task Update_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Update(Guid.NewGuid(), Guid.NewGuid(), new UpdateModuleRequest(Title: "x")));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Delete_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var moduleId = Guid.NewGuid();

        // Act
        var result = await _controller.Delete(Guid.NewGuid(), moduleId);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _moduleService.Received(1).DeleteAsync(moduleId, _userId, UserRole.Student);
    }

    [Fact]
    public async Task Reorder_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new ReorderRequest(new List<ReorderItem> { new(Guid.NewGuid(), 1) });

        // Act
        var result = await _controller.Reorder(courseId, request);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _moduleService.Received(1).ReorderAsync(courseId, request, _userId, UserRole.Student);
    }
}
