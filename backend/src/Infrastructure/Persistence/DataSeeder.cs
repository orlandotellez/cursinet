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
                Name = "Desarrollo Web",
                Slug = "desarrollo-web",
                Description = "Cursos de desarrollo web frontend y backend",
                IconName = "code",
                Color = "#3B82F6",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Programación",
                Slug = "programacion",
                Description = "Fundamentos de programación y lenguajes",
                IconName = "terminal",
                Color = "#10B981",
                SortOrder = 2,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Diseño UX/UI",
                Slug = "diseno-ux-ui",
                Description = "Diseño de interfaces y experiencia de usuario",
                IconName = "palette",
                Color = "#F59E0B",
                SortOrder = 3,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "DevOps & Cloud",
                Slug = "devops-cloud",
                Description = "Infraestructura, CI/CD, Docker, Kubernetes y cloud",
                IconName = "cloud",
                Color = "#8B5CF6",
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
                IconName = "chart-bar",
                Color = "#EF4444",
                SortOrder = 5,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        _context.Categories.AddRange(categories);
        await _context.SaveChangesAsync();
    }
}
