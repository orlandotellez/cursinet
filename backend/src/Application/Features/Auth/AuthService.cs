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
    private readonly IVerificationRepository _verificationRepository;
    private readonly IEmailService _emailService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IAccountRepository accountRepository,
        ITokenService tokenService,
        ISessionRepository sessionRepository,
        IVerificationRepository verificationRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _accountRepository = accountRepository;
        _tokenService = tokenService;
        _sessionRepository = sessionRepository;
        _verificationRepository = verificationRepository;
        _emailService = emailService;
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
            IsActive = true,
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

        // Send verification email
        var verificationCode = GenerateVerificationCode();
        var verification = new Verification
        {
            Id = Guid.NewGuid(),
            Identifier = user.Email,
            Value = verificationCode,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        await _verificationRepository.CreateAsync(verification);
        await _emailService.SendVerificationEmailAsync(user.Email, user.Name, verificationCode);

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

    public async Task<AuthResponse> VerifyEmailAsync(string identifier, string code)
    {
        var verification = await _verificationRepository.GetByIdentifierAndValueAsync(identifier, code);
        if (verification == null)
            throw AppExceptions.BadRequest("Invalid or expired verification code");

        var user = await _userRepository.GetByEmailAsync(identifier);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        if (user.EmailVerified)
            return new AuthResponse { Message = "Email already verified." };

        user.EmailVerified = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        await _verificationRepository.DeleteAsync(verification.Id);

        // TODO: Add audit log entry (EmailVerificationLogs) when repository is available

        return new AuthResponse
        {
            Message = "Email verified successfully. You can now access all features.",
        };
    }

    public async Task ResendVerificationAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        if (user.EmailVerified)
            throw AppExceptions.BadRequest("Email is already verified");

        // Remove old verification codes for this email
        await _verificationRepository.DeleteByIdentifierAsync(email);

        // Generate new code
        var code = GenerateVerificationCode();
        var verification = new Verification
        {
            Id = Guid.NewGuid(),
            Identifier = email,
            Value = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _verificationRepository.CreateAsync(verification);
        await _emailService.SendVerificationEmailAsync(email, user.Name, code);
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(string email)
    {
        // Security: always return the same message regardless of whether the email exists
        // to prevent email enumeration attacks
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            return new ForgotPasswordResponse
            {
                Message = "If the email exists, a password reset link has been sent.",
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            };

        // Remove old reset codes for this email
        await _verificationRepository.DeleteByIdentifierAsync(email);

        // Generate new code
        var code = GenerateVerificationCode();
        var verification = new Verification
        {
            Id = Guid.NewGuid(),
            Identifier = email,
            Value = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _verificationRepository.CreateAsync(verification);
        await _emailService.SendPasswordResetEmailAsync(email, user.Name, code);

        return new ForgotPasswordResponse
        {
            Message = "If the email exists, a password reset link has been sent.",
            ExpiresAt = verification.ExpiresAt,
        };
    }

    public async Task<ResetPasswordResponse> ResetPasswordAsync(string email, string code, string newPassword)
    {
        var verification = await _verificationRepository.GetByIdentifierAndValueAsync(email, code);
        if (verification == null)
            throw AppExceptions.BadRequest("Invalid or expired reset code");

        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        var account = await _accountRepository.GetCredentialsByEmailAsync(email);
        if (account == null)
            throw AppExceptions.NotFound("Password account not found");

        // Hash new password and update
        var hashedPassword = _passwordService.HashPassword(newPassword);
        account.Password = hashedPassword;
        account.UpdatedAt = DateTime.UtcNow;
        await _accountRepository.UpdateAsync(account);

        // Delete the used verification
        await _verificationRepository.DeleteAsync(verification.Id);

        // Invalidate all sessions for this user (force re-login)
        await _sessionRepository.DeleteByUserIdAsync(user.Id);

        return new ResetPasswordResponse
        {
            Message = "Password reset successfully. Please login with your new password.",
        };
    }

    public async Task<UserDto> UpdateMyProfileAsync(Guid userId, UpdateMyProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        if (request.Name != null)
            user.Name = request.Name;
        if (request.Bio != null)
            user.Bio = request.Bio;
        if (request.Phone != null)
            user.Phone = request.Phone;
        if (request.UserName != null)
            user.UserName = request.UserName;
        if (request.WebsiteUrl != null)
            user.WebsiteUrl = request.WebsiteUrl;
        if (request.GithubUrl != null)
            user.GithubUrl = request.GithubUrl;
        if (request.LinkedinUrl != null)
            user.LinkedinUrl = request.LinkedinUrl;
        if (request.Image != null)
            user.Image = request.Image;

        user.UpdatedAt = DateTime.UtcNow;

        // Email update needs special handling (re-verification)
        // For now, email is not updatable via this endpoint

        var updated = await _userRepository.UpdateAsync(user);
        return updated.MapUserToDto();
    }

    public async Task<UserDto> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw AppExceptions.NotFound("User not found");

        var account = await _accountRepository.GetCredentialsByUserIdAsync(userId);
        if (account == null)
            throw AppExceptions.NotFound("Password account not found");

        if (account.Password == null || !_passwordService.VerifyPassword(request.CurrentPassword, account.Password))
            throw AppExceptions.BadRequest("Current password is incorrect");

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            throw AppExceptions.BadRequest("New password must be at least 8 characters");

        account.Password = _passwordService.HashPassword(request.NewPassword);
        account.UpdatedAt = DateTime.UtcNow;
        await _accountRepository.UpdateAsync(account);

        return user.MapUserToDto();
    }

    private static string GenerateVerificationCode()
    {
        const string chars = "0123456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}
