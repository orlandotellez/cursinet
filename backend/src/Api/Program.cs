using System.Text;
using Cursinet.Api.Authorization;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Features.Auth;
using Cursinet.Application.Features.Courses;
using Cursinet.Application.Features.Enrollments;
using Cursinet.Application.Features.Modules;
using Cursinet.Application.Features.Lessons;
using Cursinet.Application.Features.Reviews;
using Cursinet.Application.Features.Certificates;
using Cursinet.Application.Features.Payments;
using Cursinet.Domain.Enums;
using Cursinet.Infrastructure.Persistence;
using Cursinet.Infrastructure.Persistence.Repositories;
using Cursinet.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// CORS 
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // necesario para cookies HttpOnly
    });
});

// REGISTRO DE SERVICIOS (Antes de builder.Build)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();

// Helpers de Autenticación, Cookies y Tokens
builder.Services.AddScoped<AuthHelper>();
builder.Services.AddScoped<CookieHelper>();
builder.Services.AddScoped<TokenHelper>();

// CONFIGURACIÓN DE ENTITY FRAMEWORK CORE
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Database=cursinet_db;Username=dev-espada;Password=espadaPOSTGRES";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("Infrastructure")));

// CONFIGURACIÓN DE JWT AUTHENTICATION
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret is not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };

        // Leer el token de la cookie si no viene en Authorization header
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Cookies["accessToken"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Authorization RBAC
builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All)
    {
        options.AddPolicy(permission, policy =>
            policy.Requirements.Add(new PermissionRequirement(permission)));
    }
});

// SERVICIOS DE APLICACIÓN E INFRAESTRUCTURA
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IModuleService, ModuleService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, DevEmailService>();

// REPOSITORIOS
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<IModuleRepository, ModuleRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<ILessonProgressRepository, LessonProgressRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<IVerificationRepository, VerificationRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ICertificateRepository, CertificateRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

// DATA SEEDER
builder.Services.AddScoped<DataSeeder>();

// CONSTRUCCIÓN DE LA APLICACIÓN
var app = builder.Build();

// EJECUTAR SEED AL INICIAR
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
}

// CONFIGURACIÓN DEL PIPELINE (Middlewares)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// Enrutamiento de controladores (api/v1/auth/register, etc.)
app.MapControllers();

// Endpoint rápido de prueba
app.MapGet("/health", () => "ok");

app.Run();
