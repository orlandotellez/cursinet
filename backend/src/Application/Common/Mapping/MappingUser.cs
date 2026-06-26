using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Common.Mapping;

public static class MappingUser
{
    public static UserDto MapUserToDto(this User user)
    {
        if (user == null) throw AppExceptions.UnprocessableEntity(nameof(user));

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            EmailVerified = user.EmailVerified,
            Phone = user.Phone,
            Image = user.Image,
            Role = user.Role.ToString(),
            UserName = user.UserName,
            Bio = user.Bio,
            WebsiteUrl = user.WebsiteUrl,
            GithubUrl = user.GithubUrl,
            LinkedinUrl = user.LinkedinUrl,
            IsActive = user.IsActive,
            LastSeenAt = user.LastSeenAt,
            CreatedAt = user.CreatedAt,
            DeletedAt = user.DeletedAt,
            DeletedByUserId = user.DeletedByUserId,
            DeletedByName = user.DeletedByName,
        };
    }
}