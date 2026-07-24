using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Exceptions;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/enrollments")]
public class EnrollmentController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    [HttpPost]
    [RequirePermission(Permissions.EnrollmentCreate)]
    public async Task<ActionResult<EnrollmentResponse>> Enroll([FromBody] EnrollmentRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _enrollmentService.EnrollAsync(userId, request.CourseId);
        return CreatedAtAction(null, result);
    }

    [HttpGet("mine")]
    [RequirePermission(Permissions.EnrollmentRead)]
    public async Task<ActionResult<List<EnrollmentResponse>>> GetMyEnrollments()
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _enrollmentService.GetMyEnrollmentsAsync(userId);
        return Ok(result);
    }

    [HttpGet("{courseId:guid}/status")]
    [RequirePermission(Permissions.EnrollmentRead)]
    public async Task<ActionResult<EnrollmentStatusResponse>> GetStatus(Guid courseId)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _enrollmentService.GetStatusAsync(userId, courseId);
        return Ok(result);
    }
}
