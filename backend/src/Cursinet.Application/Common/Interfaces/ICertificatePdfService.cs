namespace Cursinet.Application.Common.Interfaces;

/// <summary>Generates PDF certificates.</summary>
public interface ICertificatePdfService
{
    /// <summary>Generates a PDF certificate for the given certificate ID.
    /// Throws NotFound if the certificate doesn't exist or doesn't belong to the user.</summary>
    Task<byte[]> GenerateCertificatePdfAsync(Guid certificateId, Guid userId);
}
