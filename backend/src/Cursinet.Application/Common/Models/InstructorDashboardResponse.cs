namespace Cursinet.Application.Common.Models;

public record InstructorDashboardResponse
{
    public List<KpiDto> Kpis { get; init; } = [];
    public List<ChartPointDto> RevenuePoints { get; init; } = [];
    public List<ChartPointDto> StudentPoints { get; init; } = [];
    public List<RecentActivityDto> RecentActivity { get; init; } = [];
}

public record RecentActivityDto
{
    public string Action { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public string Timestamp { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
