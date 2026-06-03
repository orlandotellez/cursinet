using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence;

/// Puebla la base de datos con datos iniciales (seed).
/// Se ejecuta al iniciar la app si la DB está vacía.
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
        if (await _context.Users.AnyAsync())
            return; // ya hay datos, no seedear

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

        // CATEGORÍAS
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
}
