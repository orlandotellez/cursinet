using Cursinet.Infrastructure.Adapters.Cloudinary;
using Cursinet.Infrastructure.Services;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Features.Analytics;
using Cursinet.Application.Features.Auth;
using Cursinet.Application.Features.Bookmarks;
using Cursinet.Application.Features.Categories;
using Cursinet.Application.Features.Certificates;
using Cursinet.Application.Features.Comments;
using Cursinet.Application.Features.Courses;
using Cursinet.Application.Features.Enrollments;
using Cursinet.Application.Features.Instructor;
using Cursinet.Application.Features.LessonNotes;
using Cursinet.Application.Features.Lessons;
using Cursinet.Application.Features.Modules;
using Cursinet.Application.Features.NotificationPreferences;
using Cursinet.Application.Features.Payments;
using Cursinet.Application.Features.Reviews;
using Cursinet.Application.Features.Subscriptions;
using Cursinet.Application.Features.Users;
using Cursinet.Api.Helpers;
using Cursinet.Infrastructure.Persistence;
using Cursinet.Infrastructure.Persistence.Repositories;

namespace Cursinet.Api.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Helpers
        services.AddScoped<CookieHelper>();
        services.AddScoped<TokenHelper>();

        // SendGrid options
        services.Configure<SendGridOptions>(
            configuration.GetSection(SendGridOptions.SectionName));

        // Cloudflare R2 options + service
        services.Configure<R2Options>(
            configuration.GetSection(R2Options.SectionName));
        services.AddScoped<IFileStorageService, R2StorageService>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<IEnrollmentService, EnrollmentService>();
        services.AddScoped<IModuleService, ModuleService>();
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ICertificateService, CertificateService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IInstructorDashboardService, InstructorDashboardService>();
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IBookmarkService, BookmarkService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<ILessonNoteService, LessonNoteService>();
        services.AddScoped<INotificationPreferenceService, NotificationPreferenceService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IUserCrudService, UserCrudService>();

        // Email service: SendGrid si hay API key configurada, DevEmailService como fallback
        var sendGridApiKey = configuration["SendGrid:ApiKey"];
        if (!string.IsNullOrEmpty(sendGridApiKey))
        {
            services.AddScoped<IEmailService, SendGridEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, DevEmailService>();
        }

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<ILessonRepository, LessonRepository>();
        services.AddScoped<ILessonProgressRepository, LessonProgressRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<IVerificationRepository, VerificationRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<ICertificateRepository, CertificateRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<ILessonNoteRepository, LessonNoteRepository>();
        services.AddScoped<IUserNotificationPreferenceRepository, UserNotificationPreferenceRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IBookmarkRepository, BookmarkRepository>();

        // Data seeder
        services.AddScoped<DataSeeder>();

        return services;
    }
}
