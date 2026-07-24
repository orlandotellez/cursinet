using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentResponse> EnrollAsync(Guid userId, Guid courseId);
    Task<List<EnrollmentResponse>> GetMyEnrollmentsAsync(Guid userId);
    Task<EnrollmentStatusResponse> GetStatusAsync(Guid userId, Guid courseId);
}
