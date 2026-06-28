using Cursinet.Api.Controllers;
using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class AuthControllerTests : ControllerTestBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly CookieHelper _cookieHelper;
    private readonly TokenHelper _tokenHelper;
    private readonly IUserCrudService _userCrudService;
    private readonly AuthController _controller;
    private readonly Guid _userId;

    public AuthControllerTests()
    {
        _authService = Substitute.For<IAuthService>();
        _configuration = Substitute.For<IConfiguration>();
        _environment = Substitute.For<IWebHostEnvironment>();
        _userCrudService = Substitute.For<IUserCrudService>();

        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        var tokenService = Substitute.For<ITokenService>();

        // ForPartsOf allows stubbing non-virtual methods like GetRefreshToken
        _tokenHelper = Substitute.ForPartsOf<TokenHelper>(tokenService, httpContextAccessor);

        // CookieHelper methods are non-virtual but safe to call real impl
        // (early-returns if HttpContext is null, which is the case here)
        _cookieHelper = Substitute.For<CookieHelper>(_environment, httpContextAccessor);

        _controller = new AuthController(
            _authService,
            _configuration,
            _environment,
            _cookieHelper,
            _tokenHelper,
            _userCrudService);

        _userId = Guid.NewGuid();
    }

    // ─── Register ─────────────────────────────────────────────────────

    [Fact]
    public async Task Register_WhenNotLoggedIn_ShouldReturnCreated()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new RegisterRequest("John", "john@test.com", "Pass123!");
        var response = new AuthResponse
        {
            Message = "Registration successful",
            User = new UserDto { Id = Guid.NewGuid(), Name = "John" },
            AccessToken = "access-token",
            RefreshToken = "refresh-token",
        };
        _authService.RegisterAsync(request).Returns(response);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        await _authService.Received(1).RegisterAsync(request);
    }

    [Fact]
    public async Task Register_WhenAlreadyLoggedIn_ShouldReturnConflict()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var request = new RegisterRequest("John", "john@test.com", "Pass123!");

        // Act
        var result = await _controller.Register(request);

        // Assert
        var conflictResult = result.Result.ShouldBeOfType<ConflictObjectResult>();

        // Service should NOT be called
        await _authService.DidNotReceiveWithAnyArgs().RegisterAsync(default!);
    }

    // ─── Login ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnOk()
    {
        // Arrange
        SetAnonymous(_controller);
        var request = new LoginRequest("john@test.com", "Pass123!");
        var response = new AuthResponse
        {
            Message = "Login successful",
            User = new UserDto { Id = _userId, Name = "John" },
            AccessToken = "access-token",
            RefreshToken = "refresh-token",
        };
        _authService.LoginAsync(request).Returns(response);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        await _authService.Received(1).LoginAsync(request);
    }

    [Fact]
    public async Task Login_WhenDifferentUserAlreadyLoggedIn_ShouldStillReturnOk()
    {
        // Arrange
        var existingUserId = Guid.NewGuid();
        SetUserAuth(_controller, existingUserId);
        var request = new LoginRequest("new@test.com", "Pass123!");
        var response = new AuthResponse
        {
            Message = "Login successful",
            User = new UserDto { Id = _userId, Name = "New User" },
            AccessToken = "new-token",
            RefreshToken = "new-refresh",
        };
        _authService.LoginAsync(request).Returns(response);

        // Act (should not throw despite the user switch check)
        var result = await _controller.Login(request);

        // Assert
        result.Result.ShouldBeOfType<OkObjectResult>();
    }

    // ─── Refresh ───────────────────────────────────────────────────────

    [Fact]
    public async Task Refresh_WithValidToken_ShouldReturnOk()
    {
        // Arrange
        _tokenHelper.GetRefreshToken(Arg.Any<string?>()).Returns("valid-refresh-token");
        var response = new RefreshResponse
        {
            Message = "Token refreshed",
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token",
        };
        _authService.RefreshAsync("valid-refresh-token").Returns(response);

        // Act
        var result = await _controller.Refresh(null);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<RefreshResponse>();
        returned.AccessToken.ShouldBe("new-access-token");
        await _authService.Received(1).RefreshAsync("valid-refresh-token");
    }

    [Fact]
    public async Task Refresh_WithoutToken_ShouldReturnBadRequest()
    {
        // Arrange
        _tokenHelper.GetRefreshToken(Arg.Any<string?>()).Returns(string.Empty);

        // Act
        var result = await _controller.Refresh(null);

        // Assert
        var badRequest = result.Result.ShouldBeOfType<BadRequestObjectResult>();
        await _authService.DidNotReceiveWithAnyArgs().RefreshAsync(default!);
    }

    // ─── VerifyEmail ───────────────────────────────────────────────────

    [Fact]
    public async Task VerifyEmail_WithValidCode_ShouldReturnOk()
    {
        // Arrange
        var request = new VerifyEmailRequest("john@test.com", "ABC123");
        _authService.VerifyEmailAsync(request.Identifier, request.Code)
            .Returns(new AuthResponse { Message = "Email verified" });

        // Act
        var result = await _controller.VerifyEmail(request);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _authService.Received(1).VerifyEmailAsync("john@test.com", "ABC123");
    }

    // ─── Me (Authorized) ───────────────────────────────────────────────

    [Fact]
    public async Task Me_WhenAuthorized_ShouldReturnUser()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var user = new UserDto { Id = _userId, Name = "John", Email = "john@test.com" };
        _userCrudService.GetByIdAsync(_userId).Returns(user);

        // Act
        var result = await _controller.Me();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<UserDto>();
        returned.Id.ShouldBe(_userId);
        returned.Name.ShouldBe("John");
    }

    [Fact]
    public async Task Me_WithoutAuth_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.Me());
        ex.StatusCode.ShouldBe(401);
    }

    // ─── UpdateMyProfile ──────────────────────────────────────────────

    [Fact]
    public async Task UpdateMyProfile_WithValidData_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var request = new UpdateMyProfileRequest(Name: "John Updated");
        var updated = new UserDto { Id = _userId, Name = "John Updated" };
        _authService.UpdateMyProfileAsync(_userId, request).Returns(updated);

        // Act
        var result = await _controller.UpdateMyProfile(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<UserDto>();
        returned.Name.ShouldBe("John Updated");
    }

    // ─── ChangePassword ───────────────────────────────────────────────

    [Fact]
    public async Task ChangePassword_WithValidData_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var request = new ChangePasswordRequest("OldPass123!", "NewPass456!");
        var user = new UserDto { Id = _userId, Name = "John" };
        _authService.ChangePasswordAsync(_userId, request).Returns(user);

        // Act
        var result = await _controller.ChangePassword(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        await _authService.Received(1).ChangePasswordAsync(_userId, request);
    }

    // ─── ForgotPassword / ResetPassword ───────────────────────────────

    [Fact]
    public async Task ForgotPassword_WithValidEmail_ShouldReturnOk()
    {
        // Arrange
        var request = new ForgotPasswordRequest("john@test.com");
        var response = new ForgotPasswordResponse
        {
            Message = "If the email exists, a reset code has been sent.",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
        };
        _authService.ForgotPasswordAsync(request.Email).Returns(response);

        // Act
        var result = await _controller.ForgotPassword(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<ForgotPasswordResponse>();
        returned.Message.ShouldContain("reset code");
    }

    [Fact]
    public async Task ResetPassword_WithValidCode_ShouldReturnOk()
    {
        // Arrange
        var request = new ResetPasswordRequest("john@test.com", "RESET123", "NewPass456!");
        var response = new ResetPasswordResponse { Message = "Password reset successfully" };
        _authService.ResetPasswordAsync(request.Email, request.Code, request.NewPassword).Returns(response);

        // Act
        var result = await _controller.ResetPassword(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<ResetPasswordResponse>();
        returned.Message.ShouldBe("Password reset successfully");
    }

    // ─── ResendVerification ────────────────────────────────────────────

    [Fact]
    public async Task ResendVerification_ShouldAlwaysReturnOk()
    {
        // Arrange
        var request = new ResendVerificationRequest("john@test.com");
        _authService.ResendVerificationAsync(request.Email).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ResendVerification(request);

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _authService.Received(1).ResendVerificationAsync("john@test.com");
    }

    // ─── Logout ────────────────────────────────────────────────────────

    [Fact]
    public async Task Logout_WhenLoggedIn_ShouldCallLogout()
    {
        // Arrange
        _tokenHelper.GetRefreshToken(Arg.Any<string?>()).Returns("valid-refresh-token");

        // Act
        var result = await _controller.Logout();

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _authService.Received(1).LogoutAsync("valid-refresh-token");
    }

    [Fact]
    public async Task Logout_WhenNotLoggedIn_ShouldNotCallLogout()
    {
        // Arrange
        _tokenHelper.GetRefreshToken(Arg.Any<string?>()).Returns(string.Empty);

        // Act
        var result = await _controller.Logout();

        // Assert
        result.ShouldBeOfType<OkObjectResult>();
        await _authService.DidNotReceiveWithAnyArgs().LogoutAsync(default!);
    }
}
