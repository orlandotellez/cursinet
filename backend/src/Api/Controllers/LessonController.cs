using System.Security.Claims;
using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/modules/{moduleId}/lessons")]
public class LessonController : ControllerBase
{
    private readonly ILessonService _lessonService;
    private readonly AuthHelper _authHelper;

    public LessonController(ILessonService lessonService, AuthHelper authHelper)
    {
        _lessonService = lessonService;
        _authHelper = authHelper;
    }

    /// Obtener todas las lecciones de un módulo
    [HttpGet]
    [RequirePermission(Permissions.LessonRead)]
    public async Task<ActionResult<List<LessonSummary>>> GetAll(Guid moduleId)
    {
        var userId = await GetCurrentUserIdAsync();
        var role = GetCurrentUserRole();

        var lessons = await _lessonService.GetAllAsync(moduleId, userId, role);
        return Ok(lessons);
    }

    /// Obtener detalle de una lección por ID
    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.LessonRead)]
    public async Task<ActionResult<LessonResponse>> GetById(Guid moduleId, Guid id)
    {
        var lesson = await _lessonService.GetByIdAsync(id);
        return Ok(lesson);
    }

    /// Crear una lección
    [HttpPost]
    [RequirePermission(Permissions.LessonCreate)]
    public async Task<ActionResult<LessonResponse>> Create(Guid moduleId, [FromBody] CreateLessonRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        var lesson = await _lessonService.CreateAsync(moduleId, request, userId.Value, role);
        return CreatedAtAction(nameof(GetById), new { moduleId, id = lesson.Id }, lesson);
    }

    /// Actualizar una lección
    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.LessonUpdate)]
    public async Task<ActionResult<LessonResponse>> Update(Guid moduleId, Guid id, [FromBody] UpdateLessonRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        var lesson = await _lessonService.UpdateAsync(id, request, userId.Value, role);
        return Ok(lesson);
    }

    /// Soft-delete de una lección
    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.LessonDelete)]
    public async Task<ActionResult> Delete(Guid moduleId, Guid id)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        await _lessonService.DeleteAsync(id, userId.Value, role);
        return Ok(new { message = "Lesson deleted successfully" });
    }

    /// Reordenar lecciones
    [HttpPut("reorder")]
    [RequirePermission(Permissions.LessonUpdate)]
    public async Task<ActionResult> Reorder(Guid moduleId, [FromBody] ReorderRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var role = GetCurrentUserRole();
        await _lessonService.ReorderAsync(moduleId, request, userId.Value, role);
        return Ok(new { message = "Lessons reordered successfully" });
    }

    /// Obtener progreso de una lección para el usuario actual
    [HttpGet("{id:guid}/progress")]
    [RequirePermission(Permissions.LessonRead)]
    public async Task<ActionResult<LessonProgressResponse>> GetProgress(Guid moduleId, Guid id)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var progress = await _lessonService.GetProgressAsync(id, userId.Value);
        return Ok(progress);
    }

    /// Actualizar progreso de una lección
    [HttpPut("{id:guid}/progress")]
    [RequirePermission(Permissions.LessonRead)]
    public async Task<ActionResult<LessonProgressResponse>> UpsertProgress(Guid moduleId, Guid id, [FromBody] UpsertProgressRequest request)
    {
        var userId = await GetCurrentUserIdAsync();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var progress = await _lessonService.UpsertProgressAsync(id, userId.Value, request);
        return Ok(progress);
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
