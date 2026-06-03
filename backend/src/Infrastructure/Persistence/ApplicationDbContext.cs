using Microsoft.EntityFrameworkCore;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;

namespace Cursinet.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Verification> Verifications => Set<Verification>();
    public DbSet<PasswordResetLogs> PasswordResetLogs => Set<PasswordResetLogs>();
    public DbSet<EmailVerificationLogs> EmailVerificationLogs => Set<EmailVerificationLogs>();
    public DbSet<UserTwoFactor> UserTwoFactor => Set<UserTwoFactor>();
    public DbSet<LoginLogs> LoginLogs => Set<LoginLogs>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseTag> CourseTags => Set<CourseTag>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresEnum<UserRole>();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
