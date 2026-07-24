using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Exceptions;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IUserCrudService _userCrudService;

    public UsersController(IUserCrudService userCrudService)
    {
        _userCrudService = userCrudService;
    }

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

    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.UserRead)]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        var user = await _userCrudService.GetByIdAsync(id);
        return Ok(user);
    }

    [HttpPost]
    [RequirePermission(Permissions.UserUpdate)]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var user = await _userCrudService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.UserUpdate)]
    public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var user = await _userCrudService.UpdateAsync(id, request, userId);
        return Ok(user);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.UserDelete)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var currentUser = await _userCrudService.GetByIdAsync(userId);
        await _userCrudService.DeleteAsync(id, userId, currentUser.Name);
        return NoContent();
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission(Permissions.UserUpdate)]
    public async Task<ActionResult<UserDto>> Restore(Guid id)
    {
        var user = await _userCrudService.RestoreAsync(id);
        return Ok(user);
    }

}
