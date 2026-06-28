using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Common.Helpers;

public static class Guard
{
    public static void AgainstNotOwner(Guid resourceOwnerId, Guid userId, UserRole role, string resourceName = "resource")
    {
        if (resourceOwnerId != userId && role != UserRole.Admin)
            throw AppExceptions.Forbidden($"You are not the owner of this {resourceName}");
    }
}
