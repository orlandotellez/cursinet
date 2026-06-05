using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Cursinet.Infrastructure.Persistence;

/// Puebla la base de datos con datos iniciales (seed).
/// Se ejecuta al iniciar la app con guards por entidad — solo seedea lo que falta.
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

    // ─── USUARIOS ────────────────────────────────────────────────────────

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

    // ─── ACCOUNTS ────────────────────────────────────────────────────────

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

    // ─── CATEGORÍAS ──────────────────────────────────────────────────────

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

    // ─── CURSOS ──────────────────────────────────────────────────────────

    private async Task SeedCoursesAsync()
    {
        if (await _context.Courses.AnyAsync()) return;

        var now = DateTime.UtcNow;
        var publishedAt = now.AddDays(-30);
        var instructor = await _context.Users.FirstAsync(u => u.Email == "instructor@cursinet.com");
        var categories = await _context.Categories.OrderBy(c => c.SortOrder).ToListAsync();

        var courses = new List<Course>
        {
            // 1. Backend — TypeScript Avanzado
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[0].Id,
                Title = "TypeScript Avanzado: Tipos Genéricos y Patrones",
                Slug = "typescript-avanzado",
                ShortDescription = "Domina TypeScript con tipos condicionales, mapped types, template literals y patrones de diseño avanzados.",
                Description = "En este curso aprenderás TypeScript a nivel profesional. Desde tipos condicionales y mapped types hasta patrones como Builder, Factory y Repository tipados. Incluye ejercicios prácticos con genéricos complejos, inferencia avanzada, y técnicas de type-level programming.\n\nPerfecto para devs que ya conocen TypeScript básico y quieren llevar sus habilidades al siguiente nivel.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=3sR7CqAiS74",
                Level = CourseLevel.Advanced,
                Language = "es",
                DurationMinutes = 480,
                Price = 39.99m,
                OriginalPrice = 79.99m,
                IsFree = false,
                IsPublished = true,
                IsFeatured = true,
                Requirements = ["Conocimientos básicos de TypeScript", "Node.js instalado"],
                LearningObjectives = ["Dominar tipos condicionales y mapped types", "Implementar patrones de diseño tipados", "Crear utility types propios", "Escribir código type-safe en proyectos reales"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 2. Frontend — React 19 + Server Components
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[1].Id,
                Title = "React 19: Server Components y el Nuevo Ecosistema",
                Slug = "react-19-server-components",
                ShortDescription = "Aprendé React 19 desde cero: Server Components, Server Actions, el nuevo compilador y el ecosistema moderno.",
                Description = "El curso definitivo de React 19. Cubrimos Server Components, Server Actions, el nuevo compilador (React Forget), hooks mejorados y el ecosistema moderno con Next.js.\n\nIncluye proyectos prácticos con streaming SSR, Suspense patterns, y migración desde React 18.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=6l8R3FL1QAk",
                Level = CourseLevel.Intermediate,
                Language = "es",
                DurationMinutes = 600,
                Price = 44.99m,
                OriginalPrice = 89.99m,
                IsFree = false,
                IsPublished = true,
                IsFeatured = true,
                Requirements = ["Conocimientos de JavaScript moderno", "Conceptos básicos de React"],
                LearningObjectives = ["Dominar Server Components y Actions", "Implementar streaming SSR", "Migrar proyectos de React 18 a 19", "Construir apps full-stack con Next.js"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 3. Arquitectura — Domain-Driven Design
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[2].Id,
                Title = "Domain-Driven Design en la Práctica",
                Slug = "domain-driven-design-practico",
                ShortDescription = "Aplicá DDD táctico y estratégico en proyectos reales con TypeScript y .NET.",
                Description = "Aprendé Domain-Driven Design desde la teoría hasta la implementación. Cubrimos lenguaje ubicuo, agregados, value objects, domain events, y la integración con Clean Architecture.\n\nIncluye ejemplos en TypeScript y .NET, ejercicios de modelado y un proyecto completo paso a paso.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=7dN6t7h-3cQ",
                Level = CourseLevel.Advanced,
                Language = "es",
                DurationMinutes = 540,
                Price = 54.99m,
                OriginalPrice = 99.99m,
                IsFree = false,
                IsPublished = true,
                IsFeatured = false,
                Requirements = ["Experiencia con programación orientada a objetos", "Conceptos de arquitectura de software"],
                LearningObjectives = ["Modelar dominios complejos con DDD", "Implementar agregados y value objects", "Diseñar domain events", "Integrar DDD con Clean Architecture"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 4. Cloud & DevOps — AWS con Terraform
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[3].Id,
                Title = "AWS con Terraform: Infraestructura como Código",
                Slug = "aws-terraform-iac",
                ShortDescription = "Automatizá tu infraestructura en AWS con Terraform, desde cero hasta producción.",
                Description = "Aprendé Infrastructure as Code con Terraform y AWS. Desde los fundamentos de HCL hasta módulos reutilizables, workspaces, remote state, y pipelines de CI/CD para infraestructura.\n\nIncluye proyectos con VPC, ECS, RDS, Lambda, y S3 con ejemplos listos para producción.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=SLB_c_ayRMo",
                Level = CourseLevel.Intermediate,
                Language = "es",
                DurationMinutes = 420,
                Price = 49.99m,
                OriginalPrice = null,
                IsFree = false,
                IsPublished = true,
                IsFeatured = false,
                Requirements = ["Conocimientos básicos de AWS", "Familiaridad con línea de comandos"],
                LearningObjectives = ["Escribir configuraciones Terraform reutilizables", "Gestionar estado remoto", "Desplegar infraestructura AWS completa", "Implementar CI/CD para infraestructura"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 5. Data Science — Python para ML
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[4].Id,
                Title = "Python para Machine Learning: De Cero a Producción",
                Slug = "python-machine-learning",
                ShortDescription = "Aprendé Machine Learning con Python: pandas, scikit-learn, TensorFlow y deployment.",
                Description = "Curso intensivo de Machine Learning con Python. Desde limpieza de datos con pandas hasta modelos de deep learning con TensorFlow. Incluye deployment con FastAPI y Docker.\n\nProyectos prácticos: clasificación, regresión, NLP, y computer vision con datasets reales.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=7eh4d6sabA0",
                Level = CourseLevel.Intermediate,
                Language = "es",
                DurationMinutes = 720,
                Price = 59.99m,
                OriginalPrice = 119.99m,
                IsFree = false,
                IsPublished = true,
                IsFeatured = true,
                Requirements = ["Python básico", "Matemáticas de nivel secundario"],
                LearningObjectives = ["Procesar datos con pandas", "Entrenar modelos de ML", "Implementar pipelines de datos", "Desplegar modelos en producción"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 6. Mobile — Flutter Multiplataforma
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[5].Id,
                Title = "Flutter: Apps Multiplataforma desde Cero",
                Slug = "flutter-apps-multiplataforma",
                ShortDescription = "Construí apps nativas para iOS, Android, web y desktop con Flutter y Dart.",
                Description = "Aprendé Flutter desde cero, el framework de Google para apps nativas multiplataforma. Cubrimos Dart, widgets, estado, navegación, Firebase, y publicación en stores.\n\nIncluye 3 proyectos completos: una app de clima, un e-commerce y un clon de Twitter.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=1ukSR1grgAc",
                Level = CourseLevel.Begginer,
                Language = "es",
                DurationMinutes = 660,
                Price = 34.99m,
                OriginalPrice = 69.99m,
                IsFree = false,
                IsPublished = true,
                IsFeatured = false,
                Requirements = ["Ganas de aprender", "Conocimientos básicos de programación"],
                LearningObjectives = ["Dominar Dart y Flutter", "Crear UIs nativas con widgets", "Conectar apps con Firebase", "Publicar en App Store y Play Store"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 7. Testing — TDD con Jest y Playwright
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[6].Id,
                Title = "TDD con Jest y Playwright: Testing Profesional",
                Slug = "tdd-jest-playwright",
                ShortDescription = "Aprendé Test-Driven Development con Jest, React Testing Library y Playwright.",
                Description = "Domina el testing profesional con TDD. Cubrimos testing unitario con Jest, testing de componentes con React Testing Library, testing E2E con Playwright, y estrategias de cobertura.\n\nIncluye ejercicios prácticos de TDD, mocks, spies, integration testing y un pipeline de CI con GitHub Actions.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=BX7o_M2S3vw",
                Level = CourseLevel.Intermediate,
                Language = "es",
                DurationMinutes = 360,
                Price = 29.99m,
                OriginalPrice = null,
                IsFree = true,
                IsPublished = true,
                IsFeatured = false,
                Requirements = ["Conocimientos de JavaScript/TypeScript", "Familiaridad con React"],
                LearningObjectives = ["Aplicar TDD en proyectos reales", "Escribir tests unitarios y de integración", "Automatizar tests E2E con Playwright", "Integrar testing en CI/CD"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
            // 8. Seguridad — Ethical Hacking
            new()
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                CategoryId = categories[7].Id,
                Title = "Ethical Hacking y Ciberseguridad: Curso Completo",
                Slug = "ethical-hacking-ciberseguridad",
                ShortDescription = "Aprendé ethical hacking, penetration testing y cómo proteger sistemas contra ciberataques.",
                Description = "Curso completo de ciberseguridad ofensiva y defensiva. Cubrimos reconocimiento, scanning, explotación, post-explotación, OWASP Top 10, y hardening.\n\nIncluye laboratorios prácticos con Kali Linux, Metasploit, Burp Suite, y ejercicios en entornos controlados.",
                ThumbnailUrl = null,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=3FNYvj2U0HM",
                Level = CourseLevel.Begginer,
                Language = "es",
                DurationMinutes = 540,
                Price = 49.99m,
                OriginalPrice = 99.99m,
                IsFree = false,
                IsPublished = true,
                IsFeatured = false,
                Requirements = ["Conocimientos básicos de redes", "Linux a nivel usuario"],
                LearningObjectives = ["Realizar pentesting en entornos controlados", "Identificar y explotar vulnerabilidades OWASP", "Implementar medidas de hardening", "Escribir reports de seguridad profesionales"],
                StudentsCount = 0,
                AverageRating = 0m,
                ReviewsCount = 0,
                PublishedAt = publishedAt,
                CreatedAt = now,
                UpdatedAt = now,
            },
        };

        _context.Courses.AddRange(courses);
        await _context.SaveChangesAsync();
    }

    // ─── MÓDULOS Y LECCIONES ──────────────────────────────────────────────

    private async Task SeedModulesAndLessonsAsync()
    {
        if (await _context.Modules.AnyAsync()) return;

        var courses = await _context.Courses.ToListAsync();
        var now = DateTime.UtcNow;
        var sortOrder = 1;

        var modules = new List<Module>();
        var lessons = new List<Lesson>();

        foreach (var course in courses)
        {
            var moduleCount = course.Title.Contains("Flutter") || course.Title.Contains("React") ? 3 : 2;
            for (int m = 1; m <= moduleCount; m++)
            {
                var module = new Module
                {
                    Id = Guid.NewGuid(),
                    CourseId = course.Id,
                    Title = m switch
                    {
                        1 => "Introducción y Fundamentos",
                        2 => "Contenido Principal",
                        3 => "Proyecto Final",
                        _ => $"Módulo {m}"
                    },
                    Description = $"En este módulo exploraremos los conceptos fundamentales de {course.Title.Split(':')[0].Trim()}.",
                    SortOrder = sortOrder++,
                    IsPublished = true,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Lessons = [],
                };
                modules.Add(module);

                var lessonCount = Random.Shared.Next(3, 6);
                var lessonTypes = new[] { LessonType.Video, LessonType.Text, LessonType.Code, LessonType.Quiz, LessonType.Resource };
                for (int l = 1; l <= lessonCount; l++)
                {
                    var lessonType = lessonTypes[(l - 1) % lessonTypes.Length];
                    var isVideo = lessonType == LessonType.Video;
                    lessons.Add(new Lesson
                    {
                        Id = Guid.NewGuid(),
                        ModuleId = module.Id,
                        CourseId = course.Id,
                        Title = $"{m}.{l} — {GetLessonTitle(m, l, lessonType, course.Title)}",
                        Slug = $"leccion-{m}-{l}-{course.Slug}",
                        Type = lessonType,
                        VideoUrl = isVideo ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
                        VideoDurationSeconds = isVideo ? Random.Shared.Next(300, 1800) : null,
                        ContentMarkdown = !isVideo
                            ? $"# Contenido de la lección\n\nEste es el contenido de la lección **{m}.{l}** del curso.\n\n```\nconsole.log(\"Hello, Cursinet!\");\n```\n\nPracticá los conceptos explicados en el video."
                            : null,
                        SortOrder = l,
                        IsPublished = true,
                        IsPreview = l == 1 && m == 1,
                        CreatedAt = now,
                        UpdatedAt = now,
                    });
                }
            }
        }

        _context.Modules.AddRange(modules);
        await _context.SaveChangesAsync();

        _context.Lessons.AddRange(lessons);
        await _context.SaveChangesAsync();
    }

    // ─── Helper ───────────────────────────────────────────────────────────

    private static string GetLessonTitle(int modNum, int lessonNum, LessonType type, string courseTitle)
    {
        var prefix = courseTitle.Split(':')[0].Trim();
        return (modNum, lessonNum, type) switch
        {
            (1, 1, _) => $"Bienvenida y {prefix}",
            (1, 2, _) => $"¿Qué es {prefix}?",
            (1, 3, _) => $"Configuración del Entorno",
            (1, 4, _) => $"Primeros Pasos con {prefix}",
            (1, 5, _) => "Ejercicio Práctico Inicial",
            (2, 1, _) => $"{prefix} en Profundidad",
            (2, 2, _) => "Patrones y Buenas Prácticas",
            (2, 3, _) => "Integración con Otras Herramientas",
            (2, 4, _) => "Ejercicio Intermedio",
            (2, 5, _) => "Desafío de Código",
            (3, 1, _) => "Planificación del Proyecto",
            (3, 2, _) => "Implementación Paso a Paso",
            (3, 3, _) => "Testing y Calidad",
            (3, 4, _) => "Deploy y Publicación",
            (3, 5, _) => "Presentación Final y Próximos Pasos",
            _ => $"Lección {modNum}.{lessonNum}"
        };
    }
}
