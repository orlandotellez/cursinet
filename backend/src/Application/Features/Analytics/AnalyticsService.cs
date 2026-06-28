using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;

namespace Cursinet.Application.Features.Analytics;

public class AnalyticsService : IAnalyticsService
{
    private readonly IUserRepository _userRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IPaymentRepository _paymentRepository;
    private readonly ICategoryRepository _categoryRepository;

    public AnalyticsService(
        IUserRepository userRepository,
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository,
        IPaymentRepository paymentRepository,
        ICategoryRepository categoryRepository)
    {
        _userRepository = userRepository;
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
        _paymentRepository = paymentRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<DashboardResponse> GetDashboardAsync(string? range = "30d")
    {
        var now = DateTime.UtcNow;
        var rangeDays = range switch
        {
            "7d" => 7,
            "30d" => 30,
            "12s" => 84,
            "1a" => 365,
            _ => 30,
        };

        var users = await _userRepository.GetAllAsync(new UserFilter());
        var courses = await _courseRepository.GetAllIncludingDeletedAsync();
        var enrollments = await _enrollmentRepository.GetSinceAsync(now.AddDays(-rangeDays * 2));
        var payments = await _paymentRepository.GetCompletedSinceAsync(now.AddDays(-Math.Max(rangeDays * 2, 60)));

        var totalUsers = users.Count;
        var usersPreviousPeriod = users.Count(u => u.CreatedAt < now.AddDays(-rangeDays));
        var usersChange = CalculateChange(totalUsers, usersPreviousPeriod);

        var activeCourses = courses.Count(c => c.IsPublished && !c.DeletedAt.HasValue);
        var coursesPrevious = courses.Count(c => c.IsPublished && !c.DeletedAt.HasValue && c.PublishedAt < now.AddDays(-rangeDays));
        var coursesChange = CalculateChange(activeCourses, coursesPrevious);

        var currentRevenue = payments
            .Where(p => p.PaidAt >= now.AddDays(-rangeDays))
            .Sum(p => p.Amount);
        var previousRevenue = payments
            .Where(p => p.PaidAt < now.AddDays(-rangeDays) && p.PaidAt >= now.AddDays(-rangeDays * 2))
            .Sum(p => p.Amount);
        var revenueChange = CalculateChange(currentRevenue, previousRevenue);

        var mrr = payments
            .Where(p => p.PaidAt >= now.AddDays(-30))
            .Sum(p => p.Amount);
        var mrrPrevious = payments
            .Where(p => p.PaidAt >= now.AddDays(-60) && p.PaidAt < now.AddDays(-30))
            .Sum(p => p.Amount);
        var mrrChange = CalculateChange(mrr, mrrPrevious);

        var currentEnrollments = enrollments.Count(e => e.CreatedAt >= now.AddDays(-rangeDays));
        var previousEnrollments = enrollments.Count(e =>
            e.CreatedAt >= now.AddDays(-rangeDays * 2) && e.CreatedAt < now.AddDays(-rangeDays));
        var enrollmentsChange = CalculateChange(currentEnrollments, previousEnrollments);

        var (revenuePoints, studentPoints) = GetChartData(payments, enrollments, rangeDays);

        var recentUsers = users
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .Select(u => u.MapUserToDto())
            .ToList();

        return new DashboardResponse
        {
            Kpis =
            [
                new() { Label = "Usuarios totales", Value = totalUsers.ToString("N0"), ChangePercent = usersChange, Trend = usersChange >= 0 ? "up" : "down" },
                new() { Label = "MRR", Value = $"${mrr:N0}", ChangePercent = mrrChange, Trend = mrrChange >= 0 ? "up" : "down" },
                new() { Label = "Cursos activos", Value = activeCourses.ToString("N0"), ChangePercent = coursesChange, Trend = coursesChange >= 0 ? "up" : "down" },
                new() { Label = "Ventas del mes", Value = currentEnrollments.ToString("N0"), ChangePercent = enrollmentsChange, Trend = enrollmentsChange >= 0 ? "up" : "down" },
            ],
            RevenuePoints = revenuePoints,
            StudentPoints = studentPoints,
            RecentUsers = recentUsers,
        };
    }

    public async Task<AnalyticsResponse> GetAnalyticsAsync(string? range = "1a")
    {
        var now = DateTime.UtcNow;

        var rangeDays = range switch
        {
            "7d" => 7,
            "30d" => 30,
            "12s" => 84,
            "1a" => 365,
            _ => 365,
        };

        var users = await _userRepository.GetAllAsync(new UserFilter { IncludeDeleted = true });
        var courses = await _courseRepository.GetAllIncludingDeletedAsync();
        var payments = await _paymentRepository.GetCompletedSinceAsync(now.AddDays(-Math.Max(60, rangeDays)));
        var categories = await _categoryRepository.GetAllAsync();

        var mrr = payments
            .Where(p => p.PaidAt >= now.AddDays(-30))
            .Sum(p => p.Amount);
        var arr = mrr * 12;
        var previousMonth = payments
            .Where(p => p.PaidAt >= now.AddDays(-60) && p.PaidAt < now.AddDays(-30))
            .Sum(p => p.Amount);
        var growth = previousMonth > 0
            ? Math.Round((mrr - previousMonth) / previousMonth * 100, 1)
            : 0;

        var (revenuePoints, _) = GetChartData(payments, [], rangeDays);

        var usersByRole = new UsersByRoleDto
        {
            Students = users.Count(u => u.Role == UserRole.Student),
            Instructors = users.Count(u => u.Role == UserRole.Instructor),
            Admins = users.Count(u => u.Role == UserRole.Admin),
            Moderators = users.Count(u => u.Role == UserRole.Moderator),
        };

        var coursesByCategory = categories
            .Select(c => new CategoryCourseCountDto
            {
                CategoryName = c.Name,
                CourseCount = courses.Count(course => course.CategoryId == c.Id && !course.DeletedAt.HasValue),
            })
            .OrderByDescending(c => c.CourseCount)
            .ToList();

        return new AnalyticsResponse
        {
            Mrr = mrr,
            Arr = arr,
            GrowthPercent = growth,
            RevenuePoints = revenuePoints,
            UsersByRole = usersByRole,
            CoursesByCategory = coursesByCategory,
        };
    }

    private static decimal CalculateChange(decimal current, decimal previous)
    {
        if (previous == 0) return current > 0 ? 100 : 0;
        return Math.Round((current - previous) / previous * 100, 1);
    }

    private static (List<ChartPointDto> revenue, List<ChartPointDto> students) GetChartData(
        List<Payment> payments, List<Enrollment> enrollments, int rangeDays)
    {
        var now = DateTime.UtcNow;
        var revenue = new List<ChartPointDto>();
        var students = new List<ChartPointDto>();

        if (rangeDays <= 7)
        {

            for (int i = 6; i >= 0; i--)
            {
                var day = now.AddDays(-i).Date;
                var nextDay = day.AddDays(1);
                revenue.Add(new ChartPointDto
                {
                    Label = day.ToString("d MMM"),
                    Value = payments.Where(p => p.PaidAt >= day && p.PaidAt < nextDay).Sum(p => p.Amount),
                });
                students.Add(new ChartPointDto
                {
                    Label = day.ToString("d MMM"),
                    Value = enrollments.Count(e => e.CreatedAt >= day && e.CreatedAt < nextDay),
                });
            }
        }
        else if (rangeDays <= 30)
        {

            var weeks = 5;
            var daysPerWeek = rangeDays / weeks;
            for (int w = weeks - 1; w >= 0; w--)
            {
                var weekStart = now.AddDays(-(w + 1) * daysPerWeek).Date;
                var weekEnd = w == 0
                    ? now.AddDays(1).Date
                    : now.AddDays(-w * daysPerWeek).Date;

                var weekRev = payments
                    .Where(p => p.PaidAt >= weekStart && p.PaidAt < weekEnd)
                    .Sum(p => p.Amount);
                var weekStudents = enrollments
                    .Count(e => e.CreatedAt >= weekStart && e.CreatedAt < weekEnd);

                revenue.Add(new ChartPointDto { Label = weekStart.ToString("d MMM"), Value = weekRev });
                students.Add(new ChartPointDto { Label = weekStart.ToString("d MMM"), Value = weekStudents });
            }
        }
        else
        {

            var monthNames = new[] { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };
            for (int i = 11; i >= 0; i--)
            {
                var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1);
                revenue.Add(new ChartPointDto
                {
                    Label = monthNames[monthStart.Month - 1],
                    Value = payments.Where(p => p.PaidAt >= monthStart && p.PaidAt < monthEnd).Sum(p => p.Amount),
                });
                students.Add(new ChartPointDto
                {
                    Label = monthNames[monthStart.Month - 1],
                    Value = enrollments.Count(e => e.CreatedAt >= monthStart && e.CreatedAt < monthEnd),
                });
            }
        }

        return (revenue, students);
    }
}
