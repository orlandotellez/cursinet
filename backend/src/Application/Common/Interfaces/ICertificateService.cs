using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface ICertificateService
{
    /// Returns all certificates for the current user.
    Task<List<CertificateResponse>> GetMyCertificatesAsync(Guid userId);

    /// Issues a certificate for a course if the user has completed all lessons.
    /// Returns the certificate or throws if not eligible / already exists.
    Task<CertificateResponse> IssueCertificateAsync(Guid courseId, Guid userId);
}
