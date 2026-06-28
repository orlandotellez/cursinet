using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class CertificatesControllerTests : ControllerTestBase
{
    private readonly ICertificateService _certificateService;
    private readonly CertificatesController _controller;
    private readonly Guid _userId;

    public CertificatesControllerTests()
    {
        _certificateService = Substitute.For<ICertificateService>();
        _controller = new CertificatesController(_certificateService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task GetMyCertificates_WhenAuthorized_ShouldReturnCertificates()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var certificates = new List<CertificateResponse>
        {
            new() { Id = Guid.NewGuid(), CourseId = Guid.NewGuid(), CourseName = "C# Basics", CertificateNumber = "CERT-001" },
            new() { Id = Guid.NewGuid(), CourseId = Guid.NewGuid(), CourseName = "ASP.NET Core", CertificateNumber = "CERT-002" },
        };
        _certificateService.GetMyCertificatesAsync(_userId).Returns(certificates);

        // Act
        var result = await _controller.GetMyCertificates();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<CertificateResponse>>();
        returned.Count.ShouldBe(2);
        returned[0].CertificateNumber.ShouldBe("CERT-001");
        await _certificateService.Received(1).GetMyCertificatesAsync(_userId);
    }

    [Fact]
    public async Task GetMyCertificates_WhenNoCertificates_ShouldReturnEmptyList()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        _certificateService.GetMyCertificatesAsync(_userId).Returns(new List<CertificateResponse>());

        // Act
        var result = await _controller.GetMyCertificates();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<CertificateResponse>>();
        returned.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetMyCertificates_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetMyCertificates());
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task IssueCertificate_WithValidCourseId_ShouldReturnCreated()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var certificate = new CertificateResponse
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            CourseName = "Completed Course",
            CertificateNumber = "CERT-003",
            IssuedAt = DateTime.UtcNow,
        };
        _certificateService.IssueCertificateAsync(courseId, _userId).Returns(certificate);

        // Act
        var result = await _controller.IssueCertificate(courseId);

        // Assert
        var createdResult = result.Result.ShouldBeOfType<CreatedAtActionResult>();
        var returned = createdResult.Value.ShouldBeOfType<CertificateResponse>();
        returned.CertificateNumber.ShouldBe("CERT-003");
        await _certificateService.Received(1).IssueCertificateAsync(courseId, _userId);
    }

    [Fact]
    public async Task IssueCertificate_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.IssueCertificate(Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }
}
