using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IInstructorDashboardService
{
    Task<InstructorDashboardResponse> GetDashboardAsync(Guid instructorId, string? range = "30d");
}
