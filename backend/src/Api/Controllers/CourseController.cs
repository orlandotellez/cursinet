using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Exceptions;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/courses")]
public class CourseController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<CourseController> _logger;

    public CourseController(ICourseService courseService, ILogger<CourseController> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    [ResponseCache(Duration = 30, VaryByQueryKeys = new[] { "categoryId", "level", "isPublished", "isFeatured", "search", "includeDeleted", "instructorId" })]
    public async Task<ActionResult<List<CourseResponse>>> GetAll(
        [FromQuery] Guid? categoryId,
        [FromQuery] CourseLevel? level,
        [FromQuery] bool? isPublished,
        [FromQuery] bool? isFeatured,
        [FromQuery] string? search,
        [FromQuery] bool? includeDeleted,
        [FromQuery] Guid? instructorId)
    {
        var filter = new CourseFilter(categoryId, level, isPublished, isFeatured, search, includeDeleted, instructorId);
        var courses = await _courseService.GetAllAsync(filter);
        return Ok(courses);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<CourseResponse>> GetById(Guid id)
    {
        var course = await _courseService.GetByIdAsync(id);
        return Ok(course);
    }

    [HttpGet("by-slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<CourseResponse>> GetBySlug(string slug)
    {
        var course = await _courseService.GetBySlugAsync(slug);
        return Ok(course);
    }

    [HttpPost]
    [RequirePermission(Permissions.CourseCreate)]
    public async Task<ActionResult<CourseResponse>> Create([FromBody] CreateCourseRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var course = await _courseService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(Permissions.CourseUpdate)]
    public async Task<ActionResult<CourseResponse>> Update(Guid id, [FromBody] UpdateCourseRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var userRole = HttpContext.GetCurrentUserRole();
        var course = await _courseService.UpdateAsync(id, request, userId, userRole);
        return Ok(course);
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission(Permissions.CourseDelete)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var userRole = HttpContext.GetCurrentUserRole();
        _logger.LogInformation("Delete course {CourseId} requested by user {UserId} with role {Role}", id, userId, userRole);
        await _courseService.DeleteAsync(id, userId, userRole);
        _logger.LogInformation("Course {CourseId} soft-deleted successfully", id);
        return Ok(new { message = "Course deleted successfully" });
    }

    [HttpPost("{id:guid}/publish")]
    [RequirePermission(Permissions.CoursePublish)]
    public async Task<ActionResult<CourseResponse>> Publish(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var userRole = HttpContext.GetCurrentUserRole();
        var course = await _courseService.PublishAsync(id, userId, userRole);
        return Ok(course);
    }

    [HttpPost("{id:guid}/unpublish")]
    [RequirePermission(Permissions.CoursePublish)]
    public async Task<ActionResult<CourseResponse>> Unpublish(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var userRole = HttpContext.GetCurrentUserRole();
        var course = await _courseService.UnpublishAsync(id, userId, userRole);
        return Ok(course);
    }
}
