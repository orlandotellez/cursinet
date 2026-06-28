using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Exceptions;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/courses/{courseId}/modules")]
public class ModuleController : ControllerBase
{
    private readonly IModuleService _moduleService;

    public ModuleController(IModuleService moduleService)
    {
        _moduleService = moduleService;
    }

    [HttpGet]
    [RequirePermission(Permissions.ModuleRead)]
    public async Task<ActionResult<List<ModuleResponse>>> GetAll(Guid courseId)
    {
        var userId = HttpContext.GetCurrentUserId();
        var role = HttpContext.GetCurrentUserRole();

        var modules = await _moduleService.GetAllAsync(courseId, userId, role);
        return Ok(modules);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.ModuleRead)]
    public async Task<ActionResult<ModuleResponse>> GetById(Guid courseId, Guid id)
    {
        var userId = HttpContext.GetCurrentUserId();
        var role = HttpContext.GetCurrentUserRole();

        var module = await _moduleService.GetByIdAsync(id, userId, role);
        return Ok(module);
    }

    [HttpGet("curriculum")]
    [AllowAnonymous]
    public async Task<ActionResult<CurriculumResponse>> GetCurriculum(Guid courseId)
    {
        var userId = HttpContext.GetCurrentUserId();
        var role = HttpContext.GetCurrentUserRole();

        var curriculum = await _moduleService.GetCurriculumAsync(courseId, userId, role);
        return Ok(curriculum);
    }

    [HttpPost]
    [RequirePermission(Permissions.ModuleCreate)]
    public async Task<ActionResult<ModuleResponse>> Create(Guid courseId, [FromBody] CreateModuleRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var role = HttpContext.GetCurrentUserRole();
        var module = await _moduleService.CreateAsync(courseId, request, userId, role);
        return CreatedAtAction(nameof(GetById), new { courseId, id = module.Id }, module);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.ModuleUpdate)]
    public async Task<ActionResult<ModuleResponse>> Update(Guid courseId, Guid id, [FromBody] UpdateModuleRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var role = HttpContext.GetCurrentUserRole();
        var module = await _moduleService.UpdateAsync(id, request, userId, role);
        return Ok(module);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.ModuleDelete)]
    public async Task<ActionResult> Delete(Guid courseId, Guid id)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var role = HttpContext.GetCurrentUserRole();
        await _moduleService.DeleteAsync(id, userId, role);
        return Ok(new { message = "Module deleted successfully" });
    }

    [HttpPut("reorder")]
    [RequirePermission(Permissions.ModuleUpdate)]
    public async Task<ActionResult> Reorder(Guid courseId, [FromBody] ReorderRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var role = HttpContext.GetCurrentUserRole();
        await _moduleService.ReorderAsync(courseId, request, userId, role);
        return Ok(new { message = "Modules reordered successfully" });
    }

}
