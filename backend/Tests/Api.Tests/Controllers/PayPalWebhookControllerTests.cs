using System.Net;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Cursinet.Api.Controllers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Domain.Entities;
using Cursinet.Domain.Enums;
using Cursinet.Infrastructure.Persistence;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Shouldly;

namespace Cursinet.Api.Tests.Controllers;

/// <summary>
/// Tests <see cref="PayPalWebhookController"/> end-to-end via real HTTP context, with the
/// repository / validator / payment &amp; enrollment collaborators faked. The shared in-memory
/// DbContext simulates Postgres UNIQUE violation via a manually thrown <see cref="DbUpdateException"/>.
/// </summary>
public class PayPalWebhookControllerTests
{
    private static PayPalWebhookController BuildController(
        IPayPalWebhookSignatureValidator validator,
        IPayPalWebhookEventRepository events,
        IPaymentRepository payments,
        IEnrollmentRepository enrollments,
        out DefaultHttpContext ctx)
    {
        ctx = new DefaultHttpContext();
        ctx.Request.Method = "POST";
        ctx.Request.Path = "/api/v1/webhooks/paypal";
        var controller = new PayPalWebhookController(
            validator, events, payments, enrollments,
            NullLogger<PayPalWebhookController>.Instance)
        {
            ControllerContext = new ControllerContext { HttpContext = ctx },
        };
        return controller;
    }

    private static HttpRequest CreateRequestWithRawBody(DefaultHttpContext ctx, string body, params (string Key, string Value)[] headers)
    {
        var bytes = Encoding.UTF8.GetBytes(body);
        ctx.Request.Body = new MemoryStream(bytes);
        ctx.Request.ContentLength = bytes.Length;
        foreach (var (k, v) in headers)
        {
            ctx.Request.Headers[k] = v;
        }
        return ctx.Request;
    }

    [Fact]
    public async Task Receive_InvalidSignature_AcksButSkipsDispatch()
    {
        var validator = Substitute.For<IPayPalWebhookSignatureValidator>();
        validator.VerifyAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(),
            Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var events = Substitute.For<IPayPalWebhookEventRepository>();
        var payments = Substitute.For<IPaymentRepository>();
        var enrollments = Substitute.For<IEnrollmentRepository>();

        var controller = BuildController(validator, events, payments, enrollments, out var ctx);
        CreateRequestWithRawBody(ctx, "{}");

        var result = await controller.Receive(CancellationToken.None);

        var ok = result.ShouldBeOfType<OkResult>();
        await events.DidNotReceiveWithAnyArgs().InsertAsync(default!, default);
    }

    [Fact]
    public async Task Receive_ValidSignatureDuplicateEventId_AcksAndSkipsSecondDispatch()
    {
        var validator = Substitute.For<IPayPalWebhookSignatureValidator>();
        validator.VerifyAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(),
            Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var events = Substitute.For<IPayPalWebhookEventRepository>();
        events.InsertAsync(Arg.Any<PayPalWebhookEvent>(), Arg.Any<CancellationToken>())
            .Throws(new DbUpdateException(
                "duplicate key value violates unique constraint \"ux_paypal_webhook_events_event_id\"",
                new Exception("23505")));

        var payments = Substitute.For<IPaymentRepository>();
        var enrollments = Substitute.For<IEnrollmentRepository>();

        var controller = BuildController(validator, events, payments, enrollments, out var ctx);
        CreateRequestWithRawBody(ctx,
            """{"id":"WH-DUPE","event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"resource_type":"capture","id":"3MC-X"}}""");

        var result = await controller.Receive(CancellationToken.None);

        result.ShouldBeOfType<OkResult>();
        payments.DidNotReceiveWithAnyArgs().GetByPayPalCaptureIdAsync(default!);
    }

    [Fact]
    public async Task Receive_CaptureCompleted_MarksPaymentCompletedAndCreatesEnrollment()
    {
        var validator = Substitute.For<IPayPalWebhookSignatureValidator>();
        validator.VerifyAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(),
            Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var events = Substitute.For<IPayPalWebhookEventRepository>();
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CourseId = Guid.NewGuid(),
            Amount = 99m,
            Currency = "USD",
            Status = PaymentStatus.Pending,
        };
        events.InsertAsync(Arg.Any<PayPalWebhookEvent>(), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<PayPalWebhookEvent>());

        var payments = Substitute.For<IPaymentRepository>();
        payments.GetByPayPalCaptureIdAsync("3MC-DONE").Returns(payment);
        payments.UpdateAsync(Arg.Any<Payment>())
            .Returns(call => call.Arg<Payment>());

        var enrollments = Substitute.For<IEnrollmentRepository>();
        enrollments.GetByCourseAndUserAsync(payment.CourseId!.Value, payment.UserId)
            .Returns((Enrollment?)null);

        var controller = BuildController(validator, events, payments, enrollments, out var ctx);
        CreateRequestWithRawBody(ctx,
            """{"id":"WH-OK","event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"resource_type":"capture","id":"3MC-DONE"}}""");

        var result = await controller.Receive(CancellationToken.None);

        result.ShouldBeOfType<OkResult>();
        payment.Status.ShouldBe(PaymentStatus.Completed);
        payment.PaidAt.ShouldNotBeNull();
        payment.PayPalCaptureId.ShouldBe("3MC-DONE");
        await enrollments.Received(1).CreateAsync(
            Arg.Is<Enrollment>(e => e.PaymentId == payment.Id),
            payment.CourseId!.Value);
    }

    [Fact]
    public async Task Receive_CaptureRefundEvent_MarksPaymentRefunded_WithRefundedAt()
    {
        var validator = Substitute.For<IPayPalWebhookSignatureValidator>();
        validator.VerifyAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(),
            Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var events = Substitute.For<IPayPalWebhookEventRepository>();
        events.InsertAsync(Arg.Any<PayPalWebhookEvent>(), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<PayPalWebhookEvent>());

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CourseId = null,
            Amount = 99m,
            Currency = "USD",
            Status = PaymentStatus.Completed,
            PayPalCaptureId = "3MC-REFUND",
        };
        var payments = Substitute.For<IPaymentRepository>();
        payments.GetByPayPalCaptureIdAsync("3MC-REFUND").Returns(payment);
        payments.UpdateAsync(Arg.Any<Payment>())
            .Returns(call => call.Arg<Payment>());

        var enrollments = Substitute.For<IEnrollmentRepository>();
        var controller = BuildController(validator, events, payments, enrollments, out var ctx);
        CreateRequestWithRawBody(ctx,
            """{"id":"WH-RF","event_type":"PAYMENT.CAPTURE.REFUNDED","resource":{"resource_type":"capture","id":"3MC-REFUND"}}""");

        var result = await controller.Receive(CancellationToken.None);

        result.ShouldBeOfType<OkResult>();
        payment.Status.ShouldBe(PaymentStatus.Refunded);
        payment.RefundedAt.ShouldNotBeNull();
    }

    [Fact]
    public async Task Receive_CaptureDenied_MarksPaymentFailed()
    {
        var validator = Substitute.For<IPayPalWebhookSignatureValidator>();
        validator.VerifyAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(),
            Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var events = Substitute.For<IPayPalWebhookEventRepository>();
        events.InsertAsync(Arg.Any<PayPalWebhookEvent>(), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<PayPalWebhookEvent>());

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CourseId = null,
            Amount = 99m,
            Currency = "USD",
            Status = PaymentStatus.Pending,
            PayPalCaptureId = "3MC-DENY",
        };
        var payments = Substitute.For<IPaymentRepository>();
        payments.GetByPayPalCaptureIdAsync("3MC-DENY").Returns(payment);
        payments.UpdateAsync(Arg.Any<Payment>())
            .Returns(call => call.Arg<Payment>());
        var enrollments = Substitute.For<IEnrollmentRepository>();

        var controller = BuildController(validator, events, payments, enrollments, out var ctx);
        CreateRequestWithRawBody(ctx,
            """{"id":"WH-D","event_type":"PAYMENT.CAPTURE.DENIED","resource":{"resource_type":"capture","id":"3MC-DENY"}}""");

        await controller.Receive(CancellationToken.None);

        payment.Status.ShouldBe(PaymentStatus.Failed);
    }

    [Fact]
    public async Task Receive_UnsupportedEventType_AcksAndMarksProcessed()
    {
        var validator = Substitute.For<IPayPalWebhookSignatureValidator>();
        validator.VerifyAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(),
            Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var captured = new Dictionary<Guid, string?>();
        var events = Substitute.For<IPayPalWebhookEventRepository>();
        events.InsertAsync(Arg.Any<PayPalWebhookEvent>(), Arg.Any<CancellationToken>())
            .Returns(call => call.Arg<PayPalWebhookEvent>());
        events.MarkProcessedAsync(Arg.Any<Guid>(), Arg.Any<string?>(), Arg.Any<CancellationToken>())
            .Returns(call =>
            {
                captured[call.Arg<Guid>()] = call.Arg<string?>();
                return Task.CompletedTask;
            });

        var payments = Substitute.For<IPaymentRepository>();
        var enrollments = Substitute.For<IEnrollmentRepository>();

        var controller = BuildController(validator, events, payments, enrollments, out var ctx);
        CreateRequestWithRawBody(ctx,
            """{"id":"WH-X","event_type":"UNKNOWN.EVENT","resource":{"resource_type":"x","id":"X1"}}""");

        var result = await controller.Receive(CancellationToken.None);

        result.ShouldBeOfType<OkResult>();
        captured.Values.Single().ShouldStartWith("dispatched:");
    }
}
