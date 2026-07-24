using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Exceptions;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// Creates a payment for a course. Returns payment details + optional Stripe client_secret.
    [HttpPost("create")]
    [RequirePermission(Permissions.PaymentCreate)]
    public async Task<ActionResult<CreatePaymentResponse>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _paymentService.CreatePaymentAsync(userId, request);
        return Ok(result);
    }

    /// Confirms a payment and creates the enrollment.
    [HttpPost("confirm")]
    [RequirePermission(Permissions.PaymentCreate)]
    public async Task<ActionResult<PaymentResponse>> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _paymentService.ConfirmPaymentAsync(userId, request);
        return Ok(result);
    }

    /// Returns all payments for the authenticated user.
    [HttpGet("mine")]
    [RequirePermission(Permissions.PaymentRead)]
    public async Task<ActionResult<List<PaymentResponse>>> GetMyPayments()
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _paymentService.GetMyPaymentsAsync(userId);
        return Ok(result);
    }

    /// Returns a single payment by id.
    [HttpGet("{id:guid}")]
    [RequirePermission(Permissions.PaymentRead)]
    public async Task<ActionResult<PaymentResponse>> GetPayment(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var result = await _paymentService.GetPaymentAsync(userId, id);
        if (result == null)
            return NotFound(new { error = "Payment not found" });

        return Ok(result);
    }
}
