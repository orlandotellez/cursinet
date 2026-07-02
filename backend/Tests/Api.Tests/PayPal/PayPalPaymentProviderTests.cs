using System.Net;
using Cursinet.Infrastructure.Adapters.PayPal;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Enums;
using Cursinet.Domain.Exceptions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Shouldly;

namespace Cursinet.Api.Tests.PayPal;

/// <summary>
/// Tests <see cref="PayPalPaymentProvider"/> against an in-process mock transport that speaks the
/// real PayPal Orders v2 / Subscriptions / Refunds JSON envelope. Each test asserts one happy or
/// sad path so failures localise quickly.
/// </summary>
public class PayPalPaymentProviderTests
{
    private const string SandboxBaseUrl = "https://api-m.sandbox.paypal.com";

    private static PayPalOptions DefaultOptions() => new()
    {
        BaseUrl = SandboxBaseUrl,
        ClientId = "x",
        ClientSecret = "y",
        WebhookId = "z",
        PlanIds = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Monthly"] = "P-MONTHLY-NYC",
            ["Yearly"] = "P-YEARLY-NYC",
            ["Lifetime"] = "P-LIFETIME-NYC",
        },
    };

    /// <summary>
    /// Prepends a successful OAuth-token response to the queued responses so the auth handler can
    /// mint a bearer before driving the actual provider call. Without this every test must queue
    /// the token explicitly; forgetting causes a deserialisation failure on the fake transport,
    /// not the assertion failure the test author was debugging.
    /// </summary>
    private static FakeHttpMessageHandler QueueWithToken(
        params (HttpStatusCode Status, string Body)[] responses)
    {
        var tokenResp = (HttpStatusCode.OK,
            """{"access_token":"AT-TEST","expires_in":32400,"token_type":"Bearer"}""");
        return FakeHttpMessageHandler.Queue(
            new[] { tokenResp }.Concat(responses).ToArray());
    }

    private static PayPalPaymentProvider BuildHandler(
        FakeHttpMessageHandler transport,
        PayPalOptions? options = null)
    {
        var inner = (HttpMessageHandler)transport;
        var handler = new PayPalAuthenticationHandler(
            new Microsoft.Extensions.Caching.Memory.MemoryCache(new Microsoft.Extensions.Caching.Memory.MemoryCacheOptions()),
            Options.Create(options ?? DefaultOptions()),
            NullLogger<PayPalAuthenticationHandler>.Instance);
        handler.InnerHandler = inner;
        var http = new HttpClient(handler) { BaseAddress = new Uri(SandboxBaseUrl) };

        return new PayPalPaymentProvider(
            http,
            Options.Create(options ?? DefaultOptions()),
            NullLogger<PayPalPaymentProvider>.Instance);
    }

    [Fact]
    public async Task CreateOrderAsync_HappyPath_MapsPayPalResponseToProviderResult()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, """
        {
          "id": "8MC12345",
          "status": "CREATED",
          "links": [
            { "href": "https://api-m.sandbox.paypal.com/checkoutnow?token=8MC12345", "rel": "approve", "method": "GET" }
          ]
        }
        """)));

        var result = await provider.CreateOrderAsync(
            new ProviderOrderRequest(
                UserId: Guid.NewGuid(),
                CourseId: Guid.NewGuid(),
                Amount: 99.99m,
                Currency: "USD",
                Description: "Course X"),
            CancellationToken.None);

        result.ProviderOrderId.ShouldBe("8MC12345");
        result.Status.ShouldBe("CREATED");
        result.ApprovalUrl.ShouldNotBeNull();
    }

    [Fact]
    public async Task CaptureOrderAsync_PayPalReturnsDeclined_ThrowsPaymentProviderRejected()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, """
        {
          "id": "8MC99999",
          "status": "COMPLETED",
          "purchase_units": [{
            "payments": {
              "captures": [{
                "id": "3MC-DECLINED",
                "status": "DECLINED",
                "amount": { "currency_code": "USD", "value": "99.99" }
              }]
            }
          }]
        }
        """)));

        var ex = await Should.ThrowAsync<AppException>(() => provider.CaptureOrderAsync("8MC99999"));
        ex.Code.ShouldBe("PAYMENT_PROVIDER_REJECTED");
        ex.StatusCode.ShouldBe(402);
    }

    [Fact]
    public async Task RefundAsync_PayPalRejects_ThrowsPaymentProviderRejected()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.UnprocessableEntity, """
        { "name": "UNPROCESSABLE_ENTITY", "message": "Refund amount exceeds captured amount" }
        """)));

        var ex = await Should.ThrowAsync<AppException>(() =>
            provider.RefundAsync("3MC-CAPTURE", 1000m, "test"));
        ex.Code.ShouldBe("PAYMENT_PROVIDER_REJECTED");
        ex.StatusCode.ShouldBe(422);
    }

    [Fact]
    public async Task RefundAsync_HappyPath_ReturnsRefundIdAndAmount()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, """
        { "id": "7MC-REFUND", "status": "COMPLETED", "amount": { "currency_code": "USD", "value": "50.00" } }
        """)));

        var result = await provider.RefundAsync("3MC-CAPTURE", 50m, "test");
        result.ProviderRefundId.ShouldBe("7MC-REFUND");
        result.Status.ShouldBe("COMPLETED");
        result.Amount.ShouldBe(50m);
    }

    [Fact]
    public async Task CancelSubscriptionAsync_PayPalReturns204_ReturnsTrue()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.NoContent, "")));

        var ok = await provider.CancelSubscriptionAsync("I-BX12345");
        ok.ShouldBeTrue();
    }

    [Fact]
    public async Task CancelSubscriptionAsync_PayPalReturns200Empty_ReturnsTrue()
    {
        // PayPal may evolve the contract; tolerate any 2xx.
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, "")));

        var ok = await provider.CancelSubscriptionAsync("I-BX12345");
        ok.ShouldBeTrue();
    }

    [Fact]
    public async Task CreateSubscriptionAsync_NoPlanConfigured_ThrowsPaymentProviderRejected()
    {
        var opts = DefaultOptions();
        opts.PlanIds.Clear();
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, "{}")), opts);

        var ex = await Should.ThrowAsync<AppException>(() =>
            provider.CreateSubscriptionAsync(
                new ProviderSubscriptionRequest(Guid.NewGuid(), SubscriptionPlan.Monthly, "USD")));
        ex.Code.ShouldBe("PAYMENT_PROVIDER_REJECTED");
        ex.StatusCode.ShouldBe(422);
    }

    [Fact]
    public async Task CaptureOrderAsync_HappyPath_ReturnsCaptureIdAndCompletedStatus()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, """
        {
          "id": "8MC-DONE",
          "status": "COMPLETED",
          "purchase_units": [{
            "payments": {
              "captures": [{
                "id": "3MC-DONE",
                "status": "COMPLETED",
                "amount": { "currency_code": "USD", "value": "99.99" }
              }]
            }
          }]
        }
        """)));

        var result = await provider.CaptureOrderAsync("8MC-DONE");

        result.ProviderCaptureId.ShouldBe("3MC-DONE");
        result.Status.ShouldBe("COMPLETED");
        result.Amount.ShouldBe(99.99m);
        result.Currency.ShouldBe("USD");
    }

    [Fact]
    public async Task CaptureOrderAsync_NoCapturesInResponse_ThrowsInternalError()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.OK, """
        { "id": "8MC-X", "status": "COMPLETED", "purchase_units": [] }
        """)));

        var ex = await Should.ThrowAsync<AppException>(() => provider.CaptureOrderAsync("8MC-X"));
        ex.Code.ShouldBe("INTERNAL_SERVER_ERROR");
    }

    [Fact]
    public async Task EnsureSuccess_On5xx_ThrowsInternalError()
    {
        var provider = BuildHandler(QueueWithToken((HttpStatusCode.BadGateway,
            "{ \"message\": \"PayPal gateway is down\" }")));

        var ex = await Should.ThrowAsync<AppException>(() => provider.CaptureOrderAsync("8MC-X"));
        ex.Code.ShouldBe("INTERNAL_SERVER_ERROR");
    }
}

/// <summary>Shared in-process transport mock for PayPal tests.</summary>
internal sealed class FakeHttpMessageHandler : HttpMessageHandler
{
    private readonly Queue<(HttpStatusCode Status, string Body)> _queue = new();

    public List<HttpRequestMessage> Requests { get; } = new();

    private FakeHttpMessageHandler(IEnumerable<(HttpStatusCode Status, string Body)> responses)
    {
        foreach (var r in responses) _queue.Enqueue(r);
    }

    public static FakeHttpMessageHandler Queue(params (HttpStatusCode, string)[] responses)
        => new(responses);

    public static FakeHttpMessageHandler Queue(HttpStatusCode status, string body)
        => new(new[] { (status, body) });

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Requests.Add(request);
        if (_queue.Count == 0)
        {
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{}"),
            });
        }
        var (status, body) = _queue.Dequeue();
        return Task.FromResult(new HttpResponseMessage(status)
        {
            Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json"),
        });
    }
}
