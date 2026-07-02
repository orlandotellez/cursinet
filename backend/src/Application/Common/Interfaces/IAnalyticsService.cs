using Cursinet.Application.Common.Models;

namespace Cursinet.Application.Common.Interfaces;

public interface IAnalyticsService
{
    Task<DashboardResponse> GetDashboardAsync(string? range = "30d");
    Task<AnalyticsResponse> GetAnalyticsAsync(string? range = "1a", Guid? categoryId = null, Guid? revenueCategoryId = null);
}
