using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/subscriptions")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly AuthHelper _authHelper;

    public SubscriptionsController(
        ISubscriptionService subscriptionService,
        AuthHelper authHelper)
    {
        _subscriptionService = subscriptionService;
        _authHelper = authHelper;
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<SubscriptionResponse>> GetMySubscription()
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _subscriptionService.GetMySubscriptionAsync(userId);
        return Ok(result);
    }

    [HttpPost("cancel")]
    [Authorize]
    public async Task<ActionResult<SubscriptionResponse>> Cancel()
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _subscriptionService.CancelMySubscriptionAsync(userId);
        return Ok(result);
    }

    [HttpPost("reactivate")]
    [Authorize]
    public async Task<ActionResult<SubscriptionResponse>> Reactivate()
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _subscriptionService.ReactivateMySubscriptionAsync(userId);
        return Ok(result);
    }
}
