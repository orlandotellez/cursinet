using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Features.Instructor;

public class InstructorDashboardService : IInstructorDashboardService
{
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IPaymentRepository _paymentRepository;

    public InstructorDashboardService(
        ICourseRepository courseRepository,
        IEnrollmentRepository enrollmentRepository,
        IPaymentRepository paymentRepository)
    {
        _courseRepository = courseRepository;
        _enrollmentRepository = enrollmentRepository;
        _paymentRepository = paymentRepository;
    }

    public async Task<InstructorDashboardResponse> GetDashboardAsync(Guid instructorId, string? range = "30d")
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

        // Obtener cursos del instructor
        var instructorCourses = await _courseRepository.GetFilteredAsync(new CourseFilter
        {
            InstructorId = instructorId,
            IncludeDeleted = true,
        });

        var courseIds = instructorCourses.Select(c => c.Id).ToHashSet();
        var courseNames = instructorCourses.ToDictionary(c => c.Id, c => c.Title);
        var publishedCourses = instructorCourses.Where(c => c.IsPublished && !c.DeletedAt.HasValue).ToList();

        // Obtener enrollments y payments de los cursos del instructor
        var enrollments = (await _enrollmentRepository.GetSinceAsync(now.AddDays(-rangeDays * 2)))
            .Where(e => courseIds.Contains(e.CourseId))
            .ToList();

        var payments = (await _paymentRepository.GetCompletedSinceAsync(now.AddDays(-Math.Max(rangeDays * 2, 60))))
            .Where(p => p.CourseId.HasValue && courseIds.Contains(p.CourseId.Value))
            .ToList();

        // ── KPIs ──

        // Total estudiantes (enrollments activos)
        var currentEnrollments = enrollments.Count(e => e.CreatedAt >= now.AddDays(-rangeDays));
        var previousEnrollments = enrollments.Count(e =>
            e.CreatedAt >= now.AddDays(-rangeDays * 2) && e.CreatedAt < now.AddDays(-rangeDays));
        var enrollmentsChange = CalculateChange(currentEnrollments, previousEnrollments);

        // Ingresos
        var currentRevenue = payments
            .Where(p => p.PaidAt >= now.AddDays(-rangeDays))
            .Sum(p => p.Amount);
        var previousRevenue = payments
            .Where(p => p.PaidAt < now.AddDays(-rangeDays) && p.PaidAt >= now.AddDays(-rangeDays * 2))
            .Sum(p => p.Amount);
        var revenueChange = CalculateChange(currentRevenue, previousRevenue);

        // Cursos activos
        var activeCourses = publishedCourses.Count;
        var coursesPrevious = instructorCourses.Count(c =>
            c.IsPublished && !c.DeletedAt.HasValue && c.PublishedAt < now.AddDays(-rangeDays));
        var coursesChange = CalculateChange(activeCourses, coursesPrevious);

        // Rating promedio
        var avgRating = publishedCourses.Count > 0
            ? Math.Round(publishedCourses.Average(c => (double)c.AverageRating), 1)
            : 0;

        var kpis = new List<KpiDto>
        {
            new() { Label = "Estudiantes", Value = currentEnrollments.ToString("N0"), ChangePercent = enrollmentsChange, Trend = enrollmentsChange >= 0 ? "up" : "down" },
            new() { Label = "Ingresos", Value = $"${currentRevenue:N2}", ChangePercent = revenueChange, Trend = revenueChange >= 0 ? "up" : "down" },
            new() { Label = "Cursos activos", Value = activeCourses.ToString("N0"), ChangePercent = coursesChange, Trend = coursesChange >= 0 ? "up" : "down" },
            new() { Label = "Rating", Value = avgRating.ToString("F1"), ChangePercent = 0, Trend = "up" },
        };

        // ── Charts ──
        var (revenuePoints, studentPoints) = GetChartData(payments, enrollments, rangeDays);

        // ── Actividad reciente (últimos 7 días) ──
        var recentActivity = await GetRecentActivityAsync(courseIds, courseNames);

        return new InstructorDashboardResponse
        {
            Kpis = kpis,
            RevenuePoints = revenuePoints,
            StudentPoints = studentPoints,
            RecentActivity = recentActivity,
        };
    }

    private async Task<List<RecentActivityDto>> GetRecentActivityAsync(
        HashSet<Guid> courseIds, Dictionary<Guid, string> courseNames)
    {
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var recentEnrollments = await _enrollmentRepository.GetSinceWithUserAsync(sevenDaysAgo);

        var activity = recentEnrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => new RecentActivityDto
            {
                Action = "Nuevo estudiante inscrito",
                CourseName = courseNames.GetValueOrDefault(e.CourseId, "Curso"),
                StudentName = e.User?.Name ?? "Estudiante",
                Timestamp = FormatRelativeTime(e.CreatedAt),
                CreatedAt = e.CreatedAt,
            })
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .ToList();

        return activity;
    }

    private static string FormatRelativeTime(DateTime dateTime)
    {
        var diff = DateTime.UtcNow - dateTime;
        if (diff.TotalMinutes < 1) return "Hace unos segundos";
        if (diff.TotalMinutes < 60) return $"Hace {(int)diff.TotalMinutes} min";
        if (diff.TotalHours < 24) return $"Hace {(int)diff.TotalHours} hs";
        if (diff.TotalDays < 7) return $"Hace {(int)diff.TotalDays} día(s)";
        return dateTime.ToString("d MMM");
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
        else if (rangeDays <= 90)
        {
            var points = 12;
            var daysPerPoint = rangeDays / points;
            for (int i = points - 1; i >= 0; i--)
            {
                var start = now.AddDays(-(i + 1) * daysPerPoint).Date;
                var end = i == 0
                    ? now.AddDays(1).Date
                    : now.AddDays(-i * daysPerPoint).Date;

                revenue.Add(new ChartPointDto
                {
                    Label = start.ToString("d MMM"),
                    Value = payments.Where(p => p.PaidAt >= start && p.PaidAt < end).Sum(p => p.Amount),
                });
                students.Add(new ChartPointDto
                {
                    Label = start.ToString("d MMM"),
                    Value = enrollments.Count(e => e.CreatedAt >= start && e.CreatedAt < end),
                });
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


