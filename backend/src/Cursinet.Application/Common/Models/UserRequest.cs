using Cursinet.Domain.Enums;

namespace Cursinet.Application.Common.Models;

public record CreateUserRequest(
    string Name,
    string Email,
    string Password,
    UserRole Role,
    string? Phone = null
);

public record UpdateUserRequest(
    string? Name = null,
    string? Email = null,
    UserRole? Role = null,
    string? Phone = null,
    string? Bio = null,
    string? UserName = null,
    string? WebsiteUrl = null,
    string? GithubUrl = null,
    string? LinkedinUrl = null,
    bool? IsActive = null
);

public record UserFilter(
    string? Search = null,
    UserRole? Role = null,
    bool? IsActive = null,
    bool? IncludeDeleted = null
);
