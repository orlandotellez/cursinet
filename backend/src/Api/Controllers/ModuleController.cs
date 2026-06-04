using System.Security.Claims;
using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
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
    private readonly AuthHelper _authHelper;

    public ModuleController(IModuleService moduleService, AuthHelper authHelper)
    {
        _moduleService = moduleService;
        _authHelper = authHelper;
    }

    /// Obtener todos los módulos de un curso
    [HttpGet]
    [RequirePermission(Permissions.ModuleRead)]
    public async Task<ActionResult<List<ModuleResponse>>> GetAll(Guid courseId)
    {
        var userId = await GetCurrentUserIdAsync();
        var role = GetCurrentUserRole();

        var modules = await _moduleService.GetAllAsync(courseId, userId, role);
        return Ok(modules);
    }

    /// Obtener detalle de un módulo por ID
    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.ModuleRead)]
    public async Task<ActionResult<ModuleResponse>> GetById(Guid courseId, Guid id)
    {
        var userId = await GetCurrentUserIdAsync();
        var role = GetCurrentUserRole();

        var module = await _moduleService.GetByIdAsync(id, userId, role);
        return Ok(module);
    }

    /// Obtener curriculum de un curso (público — no requiere auth)
    [HttpGet("curriculum")]
    [AllowAnonymous]
    public async Task<ActionResult<CurriculumResponse>> GetCurriculum(Guid courseId)
    {
        var userId = await GetCurrentUserIdAsync();
        var role = GetCurrentUserRole();

        var curriculum = await _moduleService.GetCurriculumAsync(courseId, userId, role);
        return Ok(curriculum);
    }

    /// Crear un módulo
    [HttpPost]
    [RequirePermission(Permissions.ModuleCreate)]
    public async Task<ActionResult<ModuleResponse>> Create(Guid courseId, [FromBody] CreateModuleRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var module = await _moduleService.CreateAsync(courseId, request, userId.Value);
        return CreatedAtAction(nameof(GetById), new { courseId, id = module.Id }, module);
    }

    /// Actualizar un módulo
    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.ModuleUpdate)]
    public async Task<ActionResult<ModuleResponse>> Update(Guid courseId, Guid id, [FromBody] UpdateModuleRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        var module = await _moduleService.UpdateAsync(id, request, userId.Value, role);
        return Ok(module);
    }

    /// Soft-delete de un módulo
    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.ModuleDelete)]
    public async Task<ActionResult> Delete(Guid courseId, Guid id)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        await _moduleService.DeleteAsync(id, userId.Value, role);
        return Ok(new { message = "Module deleted successfully" });
    }

    /// Reordenar módulos
    [HttpPut("reorder")]
    [RequirePermission(Permissions.ModuleUpdate)]
    public async Task<ActionResult> Reorder(Guid courseId, [FromBody] ReorderRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        await _moduleService.ReorderAsync(courseId, request, userId.Value, role);
        return Ok(new { message = "Modules reordered successfully" });
    }

    // ─── Helpers ───────────────────────────────────────────

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
