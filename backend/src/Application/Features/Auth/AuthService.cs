using System.Security.Claims;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Mapping;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;

namespace Cursinet.Application.Features.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IAccountRepository _accountRepository;
    private readonly ITokenService _tokenService;
    private readonly ISessionRepository _sessionRepository;

    public AuthService(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IAccountRepository accountRepository,
        ITokenService tokenService,
        ISessionRepository sessionRepository)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _accountRepository = accountRepository;
        _tokenService = tokenService;
        _sessionRepository = sessionRepository;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Verificar si el email ya existe
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null) throw AppExceptions.Conflict("Email already registered");

        // Hashear password
        var hashedPassword = _passwordService.HashPassword(request.Password);

        // Crear usuario 
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Role = request.Role ?? UserRole.Student,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        user = await _userRepository.CreateAsync(user);

        // Crear cuenta credentials
        var account = new Account
        {
            Id = Guid.NewGuid(),
            AccountId = user.Id.ToString(),
            ProviderId = "credentials",
            UserId = user.Id,
            Password = hashedPassword,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _accountRepository.CreateAsync(account);

        // Generar tokens
        var (accessToken, refreshToken) = _tokenService.GenerateTokens(user.Id, user.Email, user.Role);

        // Crear sesión
        var session = new Session
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _sessionRepository.CreateAsync(session);

        var response = new AuthResponse
        {
            Message = "User created successfully. Please verify your email.",
            User = user.MapUserToDto(),
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };

        return response;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Buscar cuenta credentials por email
        var account = await _accountRepository.GetCredentialsByEmailAsync(request.Email);
        if (account == null) throw AppExceptions.Unauthorized("Invalid credentials");

        // Verificar password
        if (account.Password == null || !_passwordService.VerifyPassword(request.Password, account.Password))
            throw AppExceptions.Unauthorized("Invalid credentials");

        // Obtener usuario
        if (account.UserId == null) throw AppExceptions.Unauthorized("Invalid credentials");

        var user = await _userRepository.GetByIdAsync(account.UserId);
        if (user == null) throw AppExceptions.Unauthorized("User not found");

        // Verificar soft delete
        if (user.DeletedAt != null) throw AppExceptions.Unauthorized("Account has been deactivated");

        // Generar tokens
        var (accessToken, refreshToken) = _tokenService.GenerateTokens(user.Id, user.Email, user.Role);

        // Crear sesión
        var session = new Session
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _sessionRepository.CreateAsync(session);

        var response = new AuthResponse
        {
            Message = "Login successful",
            User = user.MapUserToDto(),
            AccessToken = accessToken,
            RefreshToken = refreshToken

        };

        return response;
    }

    public async Task<RefreshResponse> RefreshAsync(string refreshToken)
    {
        // Validar el refresh token JWT
        var principal = _tokenService.ValidateRefreshToken(refreshToken);
        if (principal == null)
            throw AppExceptions.Unauthorized("Invalid or expired refresh token");

        // Extraer userId del token
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            throw AppExceptions.Unauthorized("Invalid refresh token");

        // Buscar la sesión activa con este refresh token
        var existingSession = await _sessionRepository.GetByTokenAsync(refreshToken);
        if (existingSession == null)
            throw AppExceptions.Unauthorized("Session not found");

        // Verificar que la sesión no haya expirado
        if (existingSession.ExpiresAt < DateTime.UtcNow)
            throw AppExceptions.Unauthorized("Session expired");

        // Buscar usuario y verificar que esté activo
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.DeletedAt != null)
            throw AppExceptions.Unauthorized("User not found or deactivated");

        // Generar NUEVOS tokens (rotación completa)
        var (newAccessToken, newRefreshToken) = _tokenService.GenerateTokens(user.Id, user.Email, user.Role);

        // Eliminar la sesión vieja (invalida el refresh token anterior)
        await _sessionRepository.DeleteAsync(refreshToken);

        // Crear nueva sesión con el nuevo refresh token
        var newSession = new Session
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        await _sessionRepository.CreateAsync(newSession);

        return new RefreshResponse
        {
            Message = "Tokens refreshed successfully",
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        await _sessionRepository.DeleteAsync(refreshToken);
    }
}
