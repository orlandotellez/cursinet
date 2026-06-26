using System.Security.Claims;
using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IUserCrudService _userCrudService;
    private readonly AuthHelper _authHelper;

    public UsersController(IUserCrudService userCrudService, AuthHelper authHelper)
    {
        _userCrudService = userCrudService;
        _authHelper = authHelper;
    }

    /
    [HttpGet]
    [RequirePermission(Permissions.UserRead)]
    public async Task<ActionResult<List<UserDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] UserRole? role,
        [FromQuery] bool? isActive,
        [FromQuery] bool includeDeleted = false)
    {
        var filter = new UserFilter
        {
            Search = search,
            Role = role,
            IsActive = isActive,
            IncludeDeleted = includeDeleted,
        };

        var users = await _userCrudService.GetAllAsync(filter);
        return Ok(users);
    }

    /
    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.UserRead)]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        var user = await _userCrudService.GetByIdAsync(id);
        return Ok(user);
    }

    /
    [HttpPost]
    [RequirePermission(Permissions.UserUpdate)]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var user = await _userCrudService.CreateAsync(request, userId.Value);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    /
    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.UserUpdate)]
    public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var user = await _userCrudService.UpdateAsync(id, request, userId.Value);
        return Ok(user);
    }

    /
    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.UserDelete)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var currentUser = await _userCrudService.GetByIdAsync(userId.Value);
        await _userCrudService.DeleteAsync(id, userId.Value, currentUser.Name);
        return NoContent();
    }

    /
    [HttpPost("{id:guid}/restore")]
    [RequirePermission(Permissions.UserUpdate)]
    public async Task<ActionResult<UserDto>> Restore(Guid id)
    {
        var user = await _userCrudService.RestoreAsync(id);
        return Ok(user);
    }

    private async Task<Guid?> GetCurrentUserIdAsync()
        => await _authHelper.ResolveCurrentUserId();

    private UserRole GetCurrentUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (Enum.TryParse<UserRole>(roleClaim, out var role))
            return role;

        return UserRole.Student;
    }
}
