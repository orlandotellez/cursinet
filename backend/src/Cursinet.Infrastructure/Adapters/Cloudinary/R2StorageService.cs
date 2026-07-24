using Cursinet.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace Cursinet.Infrastructure.Adapters.Cloudinary;

public class R2StorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly R2Options _options;
    private readonly ILogger<R2StorageService> _logger;

    public R2StorageService(IOptions<R2Options> options, ILogger<R2StorageService> logger)
    {
        _options = options.Value;
        _logger = logger;

        _logger.LogInformation(
            "R2 config — Endpoint: {Endpoint}, Bucket: {Bucket}, KeyId: {KeyId}, PublicUrl: {PublicUrl}",
            _options.Endpoint,
            _options.BucketName,
            _options.AccessKeyId,
            _options.PublicUrl
        );

        if (string.IsNullOrEmpty(_options.AccessKeyId) || string.IsNullOrEmpty(_options.SecretAccessKey))
        {
            _logger.LogWarning("Cloudflare R2 is not configured. File uploads will fail.");
            _minioClient = null!;
            return;
        }

        // Get hostname from full URL
        var endpoint = _options.Endpoint;
        if (Uri.TryCreate(endpoint, UriKind.Absolute, out var uri))
        {
            endpoint = uri.Host;
        }

        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(_options.AccessKeyId, _options.SecretAccessKey)
            .WithRegion("auto")
            .WithSSL()
            .Build();
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, CancellationToken ct = default)
    {
        if (_minioClient == null)
            throw new InvalidOperationException("Cloudflare R2 is not configured. Set R2__Endpoint, R2__AccessKeyId, R2__SecretAccessKey, and R2__BucketName.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = GetContentType(ext);
        var key = $"courses/{Guid.NewGuid():N}-image{ext}";

        // Ensure bucket exists
        var bucketExists = await _minioClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(_options.BucketName), ct);

        if (!bucketExists)
        {
            _logger.LogWarning("Bucket {Bucket} does not exist. Attempting to create it...", _options.BucketName);
            await _minioClient.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(_options.BucketName), ct);
        }

        var putArgs = new PutObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(key)
            .WithStreamData(fileStream)
            .WithObjectSize(fileStream.Length)
            .WithContentType(contentType);

        _logger.LogInformation("Uploading {Key} to R2 bucket {Bucket}...", key, _options.BucketName);

        await _minioClient.PutObjectAsync(putArgs, ct);

        var publicUrl = $"{_options.PublicUrl.TrimEnd('/')}/{key}";
        _logger.LogInformation("Image uploaded successfully: {Url}", publicUrl);

        return publicUrl;
    }

    private static string GetContentType(string extension)
    {
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream",
        };
    }
}

public class R2Options
{
    public const string SectionName = "R2";

    public string Endpoint { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
}
