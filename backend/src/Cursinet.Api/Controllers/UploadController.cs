using Cursinet.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/upload")]
public class UploadController : ControllerBase
{
    private readonly IFileStorageService _storageService;
    private readonly ILogger<UploadController> _logger;

    // Max 10 MB
    private const long MaxFileSize = 10 * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp"
    };

    public UploadController(IFileStorageService storageService, ILogger<UploadController> logger)
    {
        _storageService = storageService;
        _logger = logger;
    }

    /// <summary>
    /// Uploads an image file to Cloudflare R2 and returns the public URL.
    /// Requires authentication. The file must be sent as multipart/form-data with the field name "file".
    /// </summary>
    [HttpPost]
    [Authorize]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<UploadResponse>> Upload(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided or file is empty." });

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { error = $"File type '{extension}' is not supported. Allowed: {string.Join(", ", AllowedExtensions)}" });

        if (file.Length > MaxFileSize)
            return BadRequest(new { error = "File exceeds maximum size of 10 MB." });

        _logger.LogInformation("Upload request: {FileName}, {Size} bytes", file.FileName, file.Length);

        await using var stream = file.OpenReadStream();
        var url = await _storageService.UploadImageAsync(stream, file.FileName, ct);

        return Ok(new UploadResponse { Url = url });
    }
}

public record UploadResponse
{
    public string Url { get; init; } = string.Empty;
}
