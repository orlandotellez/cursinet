using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/enrollments")]
public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly AuthHelper _authHelper;

    public EnrollmentController(IEnrollmentService enrollmentService, AuthHelper authHelper)
    {
        _enrollmentService = enrollmentService;
        _authHelper = authHelper;
    }

    [HttpPost]
    [RequirePermission(Permissions.EnrollmentCreate)]
    public async Task<ActionResult<EnrollmentResponse>> Enroll([FromBody] EnrollmentRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var result = await _enrollmentService.EnrollAsync(userId.Value, request.CourseId);
        return CreatedAtAction(null, result);
    }

    [HttpGet("mine")]
    [RequirePermission(Permissions.EnrollmentRead)]
    public async Task<ActionResult<List<EnrollmentResponse>>> GetMyEnrollments()
    {
        var userId = await _authHelper.ResolveCurrentUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var result = await _enrollmentService.GetMyEnrollmentsAsync(userId.Value);
        return Ok(result);
    }

    [HttpGet("{courseId:guid}/status")]
    [RequirePermission(Permissions.EnrollmentRead)]
    public async Task<ActionResult<EnrollmentStatusResponse>> GetStatus(Guid courseId)
    {
        var userId = await _authHelper.ResolveCurrentUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var result = await _enrollmentService.GetStatusAsync(userId.Value, courseId);
        return Ok(result);
    }
}
