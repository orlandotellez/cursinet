using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/notification-preferences")]
public class NotificationPreferencesController : ControllerBase
{
    private readonly INotificationPreferenceService _service;
    private readonly AuthHelper _authHelper;

    public NotificationPreferencesController(
        INotificationPreferenceService service,
        AuthHelper authHelper)
    {
        _service = service;
        _authHelper = authHelper;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<NotificationPreferenceResponse>> Get()
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _service.GetAsync(userId);
        return Ok(result);
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult<NotificationPreferenceResponse>> Save(
        [FromBody] UpdateNotificationPreferenceRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _service.SaveAsync(userId, request);
        return Ok(result);
    }
}
