using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Interfaces;

public interface IEnrollmentRepository
{
    Task<List<Enrollment>> GetAllAsync();
    Task<List<Enrollment>> GetSinceAsync(DateTime since);
    Task<Enrollment?> GetByCourseAndUserAsync(Guid courseId, Guid userId);
    Task<List<Enrollment>> GetByUserAsync(Guid userId);
    Task<Enrollment> CreateAsync(Enrollment enrollment, Guid courseId);
    Task UpdateAsync(Enrollment enrollment);
}
