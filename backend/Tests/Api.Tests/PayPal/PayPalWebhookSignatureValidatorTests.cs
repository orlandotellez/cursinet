using System.Net;
using Cursinet.Infrastructure.Adapters.PayPal;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Shouldly;

namespace Cursinet.Api.Tests.PayPal;

/// <summary>
/// Tests <see cref="PayPalWebhookSignatureValidator"/>: forge network responses from the
/// /v1/notifications/verify-webhook-signature endpoint and assert the verifier adopts
/// PayPal's verdict. Also covers the SSRF guard that limits cert_url to PayPal-controlled hosts
/// so a malicious sender cannot pivot the call.
/// </summary>
public class PayPalWebhookSignatureValidatorTests
{
    private const string SandboxBaseUrl = "https://api-m.sandbox.paypal.com";
    private const string TrustedCert = "https://api-m.sandbox.paypal.com/cert.pem";

    private static PayPalOptions DefaultOptions() => new()
    {
        BaseUrl = SandboxBaseUrl,
        ClientId = "x",
        ClientSecret = "y",
        WebhookId = "WB-1",
    };

    /// <summary>
    /// Prepends a successful OAuth-token response to the queue. The webhook validator goes through
    /// the same <c>PayPalAuthenticationHandler</c> as the payment provider, so tests must account
    /// for both the token round-trip and the verify response that the validator forwards.
    /// </summary>
    private static FakeHttpMessageHandler QueueWithToken(
        params (HttpStatusCode Status, string Body)[] responses)
    {
        var tokenResp = (HttpStatusCode.OK,
            """{"access_token":"AT-TEST","expires_in":32400,"token_type":"Bearer"}""");
        return FakeHttpMessageHandler.Queue(
            new[] { tokenResp }.Concat(responses).ToArray());
    }

    private static PayPalWebhookSignatureValidator Build(
        FakeHttpMessageHandler transport,
        PayPalOptions? options = null)
    {
        var auth = new PayPalAuthenticationHandler(
            new Microsoft.Extensions.Caching.Memory.MemoryCache(new Microsoft.Extensions.Caching.Memory.MemoryCacheOptions()),
            Options.Create(options ?? DefaultOptions()),
            NullLogger<PayPalAuthenticationHandler>.Instance);
        auth.InnerHandler = transport;

        var http = new HttpClient(auth) { BaseAddress = new Uri(SandboxBaseUrl) };

        return new PayPalWebhookSignatureValidator(
            http,
            Options.Create(options ?? DefaultOptions()),
            NullLogger<PayPalWebhookSignatureValidator>.Instance);
    }

    [Fact]
    public async Task VerifyAsync_PayPalReturnsSuccess_ReturnsTrue()
    {
        var validator = Build(QueueWithToken((HttpStatusCode.OK,
            """{"verification_status":"SUCCESS"}""")));

        var ok = await validator.VerifyAsync(
            "SHA256withRSA",
            TrustedCert,
            "trans-1",
            "signature-blob",
            "2024-01-01T00:00:00Z",
            """{"id":"WH-1","event_type":"PAYMENT.CAPTURE.COMPLETED"}""");

        ok.ShouldBeTrue();
    }

    [Fact]
    public async Task VerifyAsync_PayPalReturnsFailure_ReturnsFalse()
    {
        var validator = Build(QueueWithToken((HttpStatusCode.OK,
            """{"verification_status":"FAILURE"}""")));

        var ok = await validator.VerifyAsync(
            "SHA256withRSA",
            TrustedCert,
            "trans-1",
            "signature-blob",
            "2024-01-01T00:00:00Z",
            "{}");

        ok.ShouldBeFalse();
    }

    [Fact]
    public async Task VerifyAsync_PayPalUpstreamReturns4xx_ReturnsFalse()
    {
        var validator = Build(QueueWithToken((HttpStatusCode.Forbidden,
            """{"name":"FORBIDDEN"}""")));

        var ok = await validator.VerifyAsync(
            "SHA256withRSA",
            TrustedCert,
            "trans-1",
            "signature-blob",
            "2024-01-01T00:00:00Z",
            "{}");

        ok.ShouldBeFalse();
    }

    [Fact]
    public async Task VerifyAsync_CertUrlFromUntrustedHost_ReturnsFalseWithoutHittingPayPal()
    {
        // No responses queued — if the validator tries to call PayPal the test fails loudly.
        var validator = Build(FakeHttpMessageHandler.Queue());

        var ok = await validator.VerifyAsync(
            "SHA256withRSA",
            "https://evil.example.com/paypal-cert.pem",
            "trans-1",
            "signature-blob",
            "2024-01-01T00:00:00Z",
            "{}");

        ok.ShouldBeFalse();
    }

    [Fact]
    public async Task VerifyAsync_WebhookIdNotConfigured_ReturnsFalse()
    {
        var opts = DefaultOptions();
        opts.WebhookId = string.Empty;
        var validator = Build(FakeHttpMessageHandler.Queue(), opts);

        var ok = await validator.VerifyAsync(
            "SHA256withRSA",
            TrustedCert,
            "trans-1",
            "signature-blob",
            "2024-01-01T00:00:00Z",
            "{}");

        ok.ShouldBeFalse();
    }
}
