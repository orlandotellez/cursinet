using Cursinet.Api.Authorization;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("dashboard")]
    [RequirePermission(Permissions.AdminPanel)]
    public async Task<ActionResult<DashboardResponse>> GetDashboard([FromQuery] string? range = "30d")
    {
        var data = await _analyticsService.GetDashboardAsync(range);
        return Ok(data);
    }

    [HttpGet("analytics")]
    [RequirePermission(Permissions.AdminPanel)]
    public async Task<ActionResult<AnalyticsResponse>> GetAnalytics(
        [FromQuery] string? range = "1a",
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? revenueCategoryId = null)
    {
        var data = await _analyticsService.GetAnalyticsAsync(range, categoryId, revenueCategoryId);
        return Ok(data);
    }
}
