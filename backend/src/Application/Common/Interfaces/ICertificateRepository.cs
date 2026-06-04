using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface ICertificateRepository
{
    Task<List<Certificate>> GetByUserAsync(Guid userId);
    Task<Certificate?> GetByUserAndCourseAsync(Guid userId, Guid courseId);
    Task<Certificate> CreateAsync(Certificate certificate);
}
