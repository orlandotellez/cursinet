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

public class UsersControllerTests : ControllerTestBase
{
    private readonly IUserCrudService _userCrudService;
    private readonly UsersController _controller;
    private readonly Guid _userId;

    public UsersControllerTests()
    {
        _userCrudService = Substitute.For<IUserCrudService>();
        _controller = new UsersController(_userCrudService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetAll_WithFilters_ShouldPassFilterToService()
    {
        // Arrange
        _userCrudService.GetAllAsync(Arg.Any<UserFilter>()).Returns(new List<UserDto>());

        // Act
        await _controller.GetAll(search: "john", role: UserRole.Instructor, isActive: true, includeDeleted: false);

        // Assert
        await _userCrudService.Received(1).GetAllAsync(Arg.Is<UserFilter>(f =>
            f.Search == "john" &&
            f.Role == UserRole.Instructor &&
            f.IsActive == true &&
            f.IncludeDeleted == false));
    }

    [Fact]
    public async Task GetAll_WithoutFilters_ShouldReturnAllUsers()
    {
        // Arrange
        var users = new List<UserDto>
        {
            new() { Id = Guid.NewGuid(), Name = "Alice" },
            new() { Id = Guid.NewGuid(), Name = "Bob" },
        };
        _userCrudService.GetAllAsync(Arg.Any<UserFilter>()).Returns(users);

        // Act
        var result = await _controller.GetAll(search: null, role: null, isActive: null);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<UserDto>>();
        returned.Count.ShouldBe(2);
    }

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new UserDto { Id = userId, Name = "Alice" };
        _userCrudService.GetByIdAsync(userId).Returns(user);

        // Act
        var result = await _controller.GetById(userId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<UserDto>();
        returned.Id.ShouldBe(userId);
    }

    [Fact]
    public async Task Create_WhenAuthorized_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var userId = Guid.NewGuid();
        var request = new CreateUserRequest("New User", "new@test.com", "Pass123!", UserRole.Student);
        var created = new UserDto { Id = userId, Name = "New User", Email = "new@test.com" };
        _userCrudService.CreateAsync(request, _userId).Returns(created);

        // Act
        var result = await _controller.Create(request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        createdResult.ActionName.ShouldBe(nameof(UsersController.GetById));
        await _userCrudService.Received(1).CreateAsync(request, _userId);
    }

    [Fact]
    public async Task Create_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Create(new CreateUserRequest("n", "e@e.com", "p", UserRole.Student)));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Update_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var userId = Guid.NewGuid();
        var request = new UpdateUserRequest(Name: "Updated");
        var updated = new UserDto { Id = userId, Name = "Updated" };
        _userCrudService.UpdateAsync(userId, request, _userId).Returns(updated);

        // Act
        var result = await _controller.Update(userId, request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<UserDto>();
        returned.Name.ShouldBe("Updated");
    }

    [Fact]
    public async Task Update_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.Update(Guid.NewGuid(), new UpdateUserRequest(Name: "x")));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Delete_WhenAuthorized_ShouldReturnNoContentAndPassDeleterName()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var targetId = Guid.NewGuid();
        var currentUser = new UserDto { Id = _userId, Name = "Current Admin" };
        _userCrudService.GetByIdAsync(_userId).Returns(currentUser);

        // Act
        var result = await _controller.Delete(targetId);

        // Assert
        result.ShouldBeOfType<NoContentResult>();
        await _userCrudService.Received(1).DeleteAsync(targetId, _userId, "Current Admin");
    }

    [Fact]
    public async Task Delete_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.Delete(Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task Restore_WhenAuthorized_ShouldReturnRestoredUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var restored = new UserDto { Id = userId, Name = "Restored", IsActive = true };
        _userCrudService.RestoreAsync(userId).Returns(restored);

        // Act
        var result = await _controller.Restore(userId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<UserDto>();
        returned.Name.ShouldBe("Restored");
        await _userCrudService.Received(1).RestoreAsync(userId);
    }
}
