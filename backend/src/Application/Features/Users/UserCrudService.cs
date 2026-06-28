using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Users;

public class UserCrudService : IUserCrudService
{
    private readonly IUserRepository _userRepository;
    private readonly IAccountRepository _accountRepository;
    private readonly IPasswordService _passwordService;

    public UserCrudService(
        IUserRepository userRepository,
        IAccountRepository accountRepository,
        IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _accountRepository = accountRepository;
        _passwordService = passwordService;
    }

    public async Task<List<UserDto>> GetAllAsync(UserFilter? filter = null)
    {
        filter ??= new UserFilter();
        var users = await _userRepository.GetAllAsync(filter);
        return users.Select(u => u.MapUserToDto()).ToList();
    }

    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        return user.MapUserToDto();
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, Guid createdByUserId)
    {

        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            throw AppExceptions.Conflict("A user with this email already exists");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Role = request.Role,
            Phone = request.Phone,
            IsActive = true,
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _userRepository.CreateAsync(user);

        var hash = _passwordService.HashPassword(request.Password);
        var account = new Account
        {
            UserId = created.Id,
            ProviderId = "credentials",
            AccountId = request.Email,
            Password = hash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _accountRepository.CreateAsync(account);

        return created.MapUserToDto();
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, Guid userId)
    {

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        if (request.Name != null)
            user.Name = request.Name;

        if (request.Email != null)
            user.Email = request.Email;

        if (request.Role.HasValue)
            user.Role = request.Role.Value;

        if (request.Phone != null)
            user.Phone = request.Phone;

        if (request.Bio != null)
            user.Bio = request.Bio;

        if (request.UserName != null)
            user.UserName = request.UserName;

        if (request.WebsiteUrl != null)
            user.WebsiteUrl = request.WebsiteUrl;

        if (request.GithubUrl != null)
            user.GithubUrl = request.GithubUrl;

        if (request.LinkedinUrl != null)
            user.LinkedinUrl = request.LinkedinUrl;

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        user.UpdatedAt = DateTime.UtcNow;

        var updated = await _userRepository.UpdateAsync(user);
        return updated.MapUserToDto();
    }

    public async Task DeleteAsync(Guid id, Guid deletedByUserId, string deletedByName)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        await _userRepository.SoftDeleteAsync(id, deletedByUserId, deletedByName);
    }

    public async Task<UserDto> RestoreAsync(Guid id)
    {
        await _userRepository.RestoreAsync(id);
        var user = await _userRepository.GetByIdAsync(id);
        return user!.MapUserToDto();
    }
}
