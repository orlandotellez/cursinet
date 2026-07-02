using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/instructor")]
public class InstructorDashboardController : ControllerBase
{
    private readonly IInstructorDashboardService _instructorDashboardService;

    public InstructorDashboardController(IInstructorDashboardService instructorDashboardService)
    {
        _instructorDashboardService = instructorDashboardService;
    }

    [HttpGet("dashboard")]
    [RequirePermission(Permissions.CourseRead)]
    public async Task<ActionResult<InstructorDashboardResponse>> GetDashboard(
        [FromQuery] string? range = "30d")
    {
        var instructorId = HttpContext.GetCurrentUserId()
            ?? throw AppExceptions.Unauthorized();

        var data = await _instructorDashboardService.GetDashboardAsync(instructorId, range);
        return Ok(data);
    }
}
