namespace Cursinet.Application.Common.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Uploads an image file to Cloudflare R2 and returns the public URL.
    /// Supported formats: jpg, jpeg, png, gif, webp.
    /// </summary>
    Task<string> UploadImageAsync(Stream fileStream, string fileName, CancellationToken ct = default);
}
