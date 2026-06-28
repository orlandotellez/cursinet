using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/certificates")]
[Authorize]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificateService;

    public CertificatesController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    /// <summary>Get all certificates for the authenticated user.</summary>
    [HttpGet]
    public async Task<ActionResult<List<CertificateResponse>>> GetMyCertificates()
    {
        var userId = HttpContext.GetCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var certificates = await _certificateService.GetMyCertificatesAsync(userId);
        return Ok(certificates);
    }

    /// <summary>Issue a certificate for a completed course.</summary>
    [HttpPost("{courseId}")]
    public async Task<ActionResult<CertificateResponse>> IssueCertificate(Guid courseId)
    {
        var userId = HttpContext.GetCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var certificate = await _certificateService.IssueCertificateAsync(courseId, userId);
        return CreatedAtAction(null, certificate);
    }
}
