using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence;
/// <summary>
/// Seeds initial data for development.
/// </summary>
public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordService _passwordService;

    public DataSeeder(ApplicationDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task SeedAsync()
    {
        await SeedUsersAsync();
        await SeedAccountsAsync();
        await SeedCategoriesAsync();
        await SeedCoursesAsync();
        await SeedModulesAndLessonsAsync();
    }

    private async Task SeedUsersAsync()
    {
        if (await _context.Users.AnyAsync()) return;

        var now = DateTime.UtcNow;
        var users = new List<User>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Email = "admin@cursinet.com",
                EmailVerified = true,
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Instructor",
                Email = "instructor@cursinet.com",
                EmailVerified = true,
                Role = UserRole.Instructor,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Moderator",
                Email = "moderator@cursinet.com",
                EmailVerified = true,
                Role = UserRole.Moderator,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Student",
                Email = "student@cursinet.com",
                EmailVerified = true,
                Role = UserRole.Student,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();
    }

    private async Task SeedAccountsAsync()
    {
        if (await _context.Accounts.AnyAsync()) return;

        var users = await _context.Users.ToListAsync();
        var now = DateTime.UtcNow;

        var accounts = users.Select(user => new Account
        {
            Id = Guid.NewGuid(),
            AccountId = user.Id.ToString(),
            ProviderId = "credentials",
            UserId = user.Id,
            Password = _passwordService.HashPassword("password123"),
            CreatedAt = now,
            UpdatedAt = now,
        }).ToList();

        _context.Accounts.AddRange(accounts);
        await _context.SaveChangesAsync();
    }

    private async Task SeedCategoriesAsync()
    {
        if (await _context.Categories.AnyAsync()) return;

        var now = DateTime.UtcNow;
        var categories = new List<Category>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Backend",
                Slug = "backend",
                Description = "APIs, bases de datos, autenticación y lógica del servidor",
                IconName = "Server",
                Color = "#3B82F6",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Frontend",
                Slug = "frontend",
                Description = "Interfaces de usuario con React, Angular, Vue y más",
                IconName = "Monitor",
                Color = "#8B5CF6",
                SortOrder = 2,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Arquitectura",
                Slug = "arquitectura",
                Description = "Patrones de diseño, arquitectura limpia y escalabilidad",
                IconName = "Layers",
                Color = "#10B981",
                SortOrder = 3,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Cloud & DevOps",
                Slug = "cloud-devops",
                Description = "Infraestructura, CI/CD, Docker, Kubernetes y cloud",
                IconName = "Cloud",
                Color = "#06B6D4",
                SortOrder = 4,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Data Science",
                Slug = "data-science",
                Description = "Ciencia de datos, machine learning e IA",
                IconName = "BarChart3",
                Color = "#F59E0B",
                SortOrder = 5,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Mobile",
                Slug = "mobile",
                Description = "Apps nativas e híbridas con iOS, Android, Flutter y React Native",
                IconName = "Smartphone",
                Color = "#EC4899",
                SortOrder = 6,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Testing",
                Slug = "testing",
                Description = "Pruebas unitarias, integración, E2E y calidad de software",
                IconName = "CheckCircle",
                Color = "#EF4444",
                SortOrder = 7,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Seguridad",
                Slug = "seguridad",
                Description = "Ciberseguridad, pentesting, OWASP y protección de datos",
                IconName = "Shield",
                Color = "#14B8A6",
                SortOrder = 8,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        _context.Categories.AddRange(categories);
        await _context.SaveChangesAsync();
    }

    private async Task SeedCoursesAsync()
    {
        if (await _context.Courses.AnyAsync()) return;

        var admin = await _context.Users.FirstAsync(u => u.Email == "admin@cursinet.com");
        var backendCategory = await _context.Categories.FirstAsync(c => c.Slug == "backend");

        var cursoFastify = new Course
        {
            Id = Guid.Parse("90ada200-8928-40b0-ad1e-2fea143fc18e"),
            InstructorId = admin.Id,
            CategoryId = backendCategory.Id,
            Title = "Curso de Fastify desde 0",
            Slug = "curso-de-fastify-desde-0",
            ShortDescription = "Curso de fastify desde 0 a experto",
            Description = "En este curso aprenderás a usar fastify desde 0 a experto",
            ThumbnailUrl = null,
            PreviewVideoUrl = null,
            Level = CourseLevel.Begginer,
            Language = "es",
            DurationMinutes = 240,
            Price = 0m,
            OriginalPrice = null,
            IsFree = true,
            IsPublished = true,
            IsFeatured = false,
            Requirements = ["Conocimientos mínimos de Node Js"],
            LearningObjectives = ["Dominar Fastify, estos son los modulos que tiene: Curso de fastify desde 0"],
            StudentsCount = 2,
            AverageRating = 0m,
            ReviewsCount = 0,
            PublishedAt = new DateTime(2026, 6, 23, 21, 11, 0, DateTimeKind.Utc),
            CreatedAt = new DateTime(2026, 6, 23, 21, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 6, 23, 21, 11, 0, DateTimeKind.Utc),
        };

        _context.Courses.Add(cursoFastify);
        await _context.SaveChangesAsync();
    }

    private async Task SeedModulesAndLessonsAsync()
    {
        if (await _context.Modules.AnyAsync()) return;

        var course = await _context.Courses.FirstAsync(c => c.Slug == "curso-de-fastify-desde-0");
        var now = new DateTime(2026, 6, 23, 21, 11, 0, DateTimeKind.Utc);

        var module = new Module
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            Title = "Primera clase",
            Description = "En este módulo exploraremos los fundamentos de Fastify.",
            SortOrder = 1,
            IsPublished = true,
            CreatedAt = now,
            UpdatedAt = now,
            Lessons = [],
        };

        var lessons = new List<Lesson>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ModuleId = module.Id,
                CourseId = course.Id,
                Title = "Clase 1",
                Slug = "clase-1",
                Type = LessonType.Video,
                VideoUrl = "https://www.youtube.com/watch?v=NGZ5h47VJY8&t=1s",
                VideoDurationSeconds = 3600,
                ContentMarkdown = null,
                SortOrder = 1,
                IsPublished = true,
                IsPreview = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                ModuleId = module.Id,
                CourseId = course.Id,
                Title = "Clase 2",
                Slug = "clase-2",
                Type = LessonType.Video,
                VideoUrl = "https://www.youtube.com/watch?v=pMtjL45iRlA&t=98s",
                VideoDurationSeconds = 3600,
                ContentMarkdown = null,
                SortOrder = 2,
                IsPublished = true,
                IsPreview = false,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                ModuleId = module.Id,
                CourseId = course.Id,
                Title = "Clase 3",
                Slug = "clase-3",
                Type = LessonType.Video,
                VideoUrl = "https://www.youtube.com/watch?v=sSvWBF10BeY&t=3778s",
                VideoDurationSeconds = 3600,
                ContentMarkdown = null,
                SortOrder = 3,
                IsPublished = true,
                IsPreview = false,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                ModuleId = module.Id,
                CourseId = course.Id,
                Title = "Clase 4",
                Slug = "clase-4",
                Type = LessonType.Video,
                VideoUrl = "https://www.youtube.com/watch?v=8nmHONj0aJ4&t=2716s",
                VideoDurationSeconds = 3600,
                ContentMarkdown = null,
                SortOrder = 4,
                IsPublished = true,
                IsPreview = false,
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        _context.Modules.Add(module);
        await _context.SaveChangesAsync();

        _context.Lessons.AddRange(lessons);
        await _context.SaveChangesAsync();
    }
}
