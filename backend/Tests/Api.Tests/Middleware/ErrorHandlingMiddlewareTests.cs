using System.Text.Json;
using Cursinet.Api.Middleware;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Shouldly;

namespace Cursinet.Api.Tests.Middleware;

public class ErrorHandlingMiddlewareTests
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly ErrorHandlingMiddleware _middleware;
    private readonly DefaultHttpContext _httpContext;

    public ErrorHandlingMiddlewareTests()
    {
        _next = Substitute.For<RequestDelegate>();
        _logger = Substitute.For<ILogger<ErrorHandlingMiddleware>>();
        _middleware = new ErrorHandlingMiddleware(_next, _logger);
        _httpContext = new DefaultHttpContext
        {
            Request = { Path = "/api/v1/test" },
        };
    }

    [Fact]
    public async Task Invoke_WhenNextSucceeds_ShouldNotWriteError()
    {
        // Arrange
        _next.Invoke(_httpContext).Returns(Task.CompletedTask);

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(200); // default
        _httpContext.Response.ContentType.ShouldNotBe("application/json");
        await _next.Received(1).Invoke(_httpContext);
    }

    [Fact]
    public async Task Invoke_WhenAppException401_ShouldSetUnauthorizedStatus()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("Not allowed", 401, "UNAUTHORIZED"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(401);
        _httpContext.Response.ContentType.ShouldBe("application/json");
    }

    [Fact]
    public async Task Invoke_WhenAppException404_ShouldSetNotFoundStatus()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("Missing", 404, "NOT_FOUND"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(404);
        _httpContext.Response.ContentType.ShouldBe("application/json");
    }

    [Fact]
    public async Task Invoke_WhenAppException400_ShouldSetBadRequestStatus()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("Bad", 400, "BAD_REQUEST"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(400);
    }

    [Fact]
    public async Task Invoke_WhenAppException409_ShouldSetConflictStatus()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("Conflict", 409, "CONFLICT"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(409);
    }

    [Fact]
    public async Task Invoke_WhenAppException422_ShouldSetUnprocessableEntityStatus()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("Unprocessable", 422, "UNPROCESSABLE_ENTITY"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(422);
    }

    [Fact]
    public async Task Invoke_WhenAppExceptionOtherStatus_ShouldSetStatusAsIs()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("Forbidden", 403, "FORBIDDEN"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(403);
    }

    [Fact]
    public async Task Invoke_WhenGenericException_ShouldSet500()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new InvalidOperationException("boom"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.StatusCode.ShouldBe(500);
        _httpContext.Response.ContentType.ShouldBe("application/json");
    }

    [Fact]
    public async Task Invoke_WhenAppException_ShouldWriteProblemDetailsJson()
    {
        // Arrange
        _httpContext.Response.Body = new MemoryStream();
        _next.Invoke(_httpContext).Throws(new AppException("Not Found entity", 404, "NOT_FOUND"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.Body.Position = 0;
        using var reader = new StreamReader(_httpContext.Response.Body);
        var json = await reader.ReadToEndAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("status").GetInt32().ShouldBe(404);
        root.GetProperty("code").GetString().ShouldBe("NOT_FOUND");
        root.GetProperty("detail").GetString().ShouldBe("Not Found entity");
        root.GetProperty("title").GetString().ShouldBe("Not Found");
        root.GetProperty("type").GetString().ShouldBe("https://tools.ietf.org/html/rfc7807");
    }

    [Fact]
    public async Task Invoke_WhenGenericException_ShouldWriteGenericProblemDetails()
    {
        // Arrange
        _httpContext.Response.Body = new MemoryStream();
        _next.Invoke(_httpContext).Throws(new InvalidOperationException("boom"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.Body.Position = 0;
        using var reader = new StreamReader(_httpContext.Response.Body);
        var json = await reader.ReadToEndAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("status").GetInt32().ShouldBe(500);
        root.GetProperty("code").GetString().ShouldBe("internal.error");
        root.GetProperty("title").GetString().ShouldBe("Internal Server Error");
        root.GetProperty("detail").GetString().ShouldBe("An unexpected error occurred. Please try again later.");
    }

    [Fact]
    public async Task Invoke_WhenException_ShouldLogError()
    {
        // Arrange
        _next.Invoke(_httpContext).Throws(new AppException("boom", 500, "ERR"));

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _logger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }
}
