using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Cursinet.Api.Tests.TestInfrastructure;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

public class PaymentsControllerTests : ControllerTestBase
{
    private readonly IPaymentService _paymentService;
    private readonly PaymentsController _controller;
    private readonly Guid _userId;

    public PaymentsControllerTests()
    {
        _paymentService = Substitute.For<IPaymentService>();
        _controller = new PaymentsController(_paymentService);
        _userId = Guid.NewGuid();
    }

    [Fact]
    public async Task CreatePayment_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var courseId = Guid.NewGuid();
        var request = new CreatePaymentRequest { CourseId = courseId };
        var response = new CreatePaymentResponse
        {
            PaymentId = Guid.NewGuid(),
            Amount = 99.99m,
            Currency = "USD",
            Status = "Pending",
        };
        _paymentService.CreatePaymentAsync(_userId, request).Returns(response);

        // Act
        var result = await _controller.CreatePayment(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<CreatePaymentResponse>();
        returned.Amount.ShouldBe(99.99m);
        await _paymentService.Received(1).CreatePaymentAsync(_userId, request);
    }

    [Fact]
    public async Task CreatePayment_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.CreatePayment(new CreatePaymentRequest { CourseId = Guid.NewGuid() }));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task ConfirmPayment_WhenAuthorized_ShouldReturnOk()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var paymentId = Guid.NewGuid();
        var request = new ConfirmPaymentRequest
        {
            PaymentId = paymentId,
            StripePaymentIntentId = "pi_test_123",
        };
        var response = new PaymentResponse
        {
            Id = paymentId,
            UserId = _userId,
            Status = "Completed",
            Amount = 99.99m,
        };
        _paymentService.ConfirmPaymentAsync(_userId, request).Returns(response);

        // Act
        var result = await _controller.ConfirmPayment(request);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<PaymentResponse>();
        returned.Status.ShouldBe("Completed");
    }

    [Fact]
    public async Task ConfirmPayment_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() =>
            _controller.ConfirmPayment(new ConfirmPaymentRequest { PaymentId = Guid.NewGuid() }));
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task GetMyPayments_WhenAuthorized_ShouldReturnPayments()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var payments = new List<PaymentResponse>
        {
            new() { Id = Guid.NewGuid(), UserId = _userId, Status = "Completed", Amount = 50m },
            new() { Id = Guid.NewGuid(), UserId = _userId, Status = "Pending", Amount = 30m },
        };
        _paymentService.GetMyPaymentsAsync(_userId).Returns(payments);

        // Act
        var result = await _controller.GetMyPayments();

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<List<PaymentResponse>>();
        returned.Count.ShouldBe(2);
    }

    [Fact]
    public async Task GetMyPayments_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetMyPayments());
        ex.StatusCode.ShouldBe(401);
    }

    [Fact]
    public async Task GetPayment_WithValidId_ShouldReturnPayment()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var paymentId = Guid.NewGuid();
        var payment = new PaymentResponse { Id = paymentId, UserId = _userId, Status = "Completed" };
        _paymentService.GetPaymentAsync(_userId, paymentId).Returns(payment);

        // Act
        var result = await _controller.GetPayment(paymentId);

        // Assert
        var okResult = result.Result.ShouldBeOfType<OkObjectResult>();
        var returned = okResult.Value.ShouldBeOfType<PaymentResponse>();
        returned.Id.ShouldBe(paymentId);
    }

    [Fact]
    public async Task GetPayment_WhenPaymentNotFound_ShouldReturnNotFound()
    {
        // Arrange
        SetUserAuth(_controller, _userId);
        var paymentId = Guid.NewGuid();
        _paymentService.GetPaymentAsync(_userId, paymentId).Returns((PaymentResponse?)null);

        // Act
        var result = await _controller.GetPayment(paymentId);

        // Assert
        result.Result.ShouldBeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetPayment_WhenAnonymous_ShouldThrowUnauthorized()
    {
        // Arrange
        SetAnonymous(_controller);

        // Act & Assert
        var ex = await Should.ThrowAsync<AppException>(() => _controller.GetPayment(Guid.NewGuid()));
        ex.StatusCode.ShouldBe(401);
    }
}
