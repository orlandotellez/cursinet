using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

public record UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public string? Phone { get; set; }
    public string? Image { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? Bio { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedByUserId { get; set; }
    public string? DeletedByName { get; set; }
}

public record SessionResponse
{
    public Guid Id { get; init; }
    public DateTime ExpiresAt { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
