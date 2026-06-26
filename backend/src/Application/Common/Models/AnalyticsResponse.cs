namespace Cursinet.Application.Common.Models;

public record DashboardResponse
{
    public List<KpiDto> Kpis { get; init; } = [];
    public List<ChartPointDto> RevenuePoints { get; init; } = [];
    public List<ChartPointDto> StudentPoints { get; init; } = [];
    public List<UserDto> RecentUsers { get; init; } = [];
}

public record AnalyticsResponse
{
    public decimal Mrr { get; init; }
    public decimal Arr { get; init; }
    public decimal GrowthPercent { get; init; }
    public List<ChartPointDto> RevenuePoints { get; init; } = [];
    public UsersByRoleDto UsersByRole { get; init; } = new();
    public List<CategoryCourseCountDto> CoursesByCategory { get; init; } = [];
}

public record KpiDto
{
    public string Label { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public decimal ChangePercent { get; init; }
    public string Trend { get; init; } = "up";
}

public record ChartPointDto
{
    public string Label { get; init; } = string.Empty;
    public decimal Value { get; init; }
}

public record UsersByRoleDto
{
    public int Students { get; init; }
    public int Instructors { get; init; }
    public int Admins { get; init; }
    public int Moderators { get; init; }
    public int Total => Students + Instructors + Admins + Moderators;
}

public record CategoryCourseCountDto
{
    public string CategoryName { get; init; } = string.Empty;
    public int CourseCount { get; init; }
}
