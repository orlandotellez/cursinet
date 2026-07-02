using System.Net;
using System.Net.Http.Headers;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Cursinet.Infrastructure.Adapters.PayPal;
using Shouldly;

namespace Cursinet.Api.Tests.PayPal;

/// <summary>
/// Tests the in-process behaviour of the DelegatingHandler responsible for attaching PayPal Bearer
/// tokens — covers cache hit/miss, the OAuth token request, and the documented one-shot retry on
/// 401. Network I/O is replaced with a controllable mock transport so no real PayPal endpoint is
/// contacted.
/// </summary>
public class PayPalAuthenticationHandlerTests
{
    private const string SandboxBaseUrl = "https://api-m.sandbox.paypal.com";
    private const string TestClientId = "test-client";
    private const string TestClientSecret = "test-secret";

    private static PayPalOptions DefaultOptions() => new()
    {
        BaseUrl = SandboxBaseUrl,
        ClientId = TestClientId,
        ClientSecret = TestClientSecret,
        WebhookId = "test-webhook-id",
        IsSandbox = true,
        PlanIds = new(),
    };

    private static PayPalAuthenticationHandler Build(
        MockHttpMessageHandler transport,
        out IMemoryCache cache,
        PayPalOptions? options = null)
    {
        cache = new MemoryCache(new MemoryCacheOptions());
        var opts = options ?? DefaultOptions();
        var handler = new PayPalAuthenticationHandler(
            cache,
            Options.Create(opts),
            NullLogger<PayPalAuthenticationHandler>.Instance);
        handler.InnerHandler = transport;
        return handler;
    }

    [Fact]
    public async Task FirstCall_FetchesToken_ThenIssuesBearerRequestToUpstream()
    {
        var token = HttpResponseFromJson(HttpStatusCode.OK,
            """{"access_token":"AT-1","expires_in":32400,"token_type":"Bearer"}""");
        var upstream = HttpResponseFromJson(HttpStatusCode.OK, """{"ok":true}""");
        var transport = new MockHttpMessageHandler(token, upstream);

        var handler = Build(transport, out _);
        using var http = new HttpClient(handler) { BaseAddress = new Uri(SandboxBaseUrl) };

        using var resp = await http.GetAsync("/v2/checkout/orders/8MC");

        resp.StatusCode.ShouldBe(HttpStatusCode.OK);
        transport.Requests.Count.ShouldBe(2); // 1× OAuth + 1× upstream
        transport.Requests[0].Uri.AbsolutePath.ShouldEndWith("/v1/oauth2/token");
        transport.Requests[0].AuthScheme.ShouldBe("Basic");
        transport.Requests[1].AuthScheme.ShouldBe("Bearer");
        transport.Requests[1].AuthParameter.ShouldBe("AT-1");
    }

    [Fact]
    public async Task SecondCall_ReusesCachedToken_DoesNotRefetch()
    {
        var token = HttpResponseFromJson(HttpStatusCode.OK,
            """{"access_token":"AT-2","expires_in":32400,"token_type":"Bearer"}""");
        var r1 = HttpResponseFromJson(HttpStatusCode.OK, """{}""");
        var r2 = HttpResponseFromJson(HttpStatusCode.OK, """{}""");
        var transport = new MockHttpMessageHandler(token, r1, r2);

        var handler = Build(transport, out _);
        using var http = new HttpClient(handler) { BaseAddress = new Uri(SandboxBaseUrl) };

        await http.GetAsync("/v2/checkout/orders/8MC");
        await http.GetAsync("/v2/checkout/orders/9MC");

        transport.Requests.Count.ShouldBe(3); // 1× OAuth + 2× upstream — token reused
        transport.Requests.Skip(1)
            .ShouldAllBe(r => r.AuthScheme == "Bearer" && r.AuthParameter == "AT-2");
    }

    [Fact]
    public async Task UpstreamReturns401_RetriesOnceWithFreshToken()
    {
        var token1 = HttpResponseFromJson(HttpStatusCode.OK,
            """{"access_token":"AT-STALE","expires_in":32400,"token_type":"Bearer"}""");
        var unauthorized = new HttpResponseMessage(HttpStatusCode.Unauthorized);
        var token2 = HttpResponseFromJson(HttpStatusCode.OK,
            """{"access_token":"AT-FRESH","expires_in":32400,"token_type":"Bearer"}""");
        var success = HttpResponseFromJson(HttpStatusCode.OK, """{"ok":true}""");

        var transport = new MockHttpMessageHandler(token1, unauthorized, token2, success);

        var cache = new MemoryCache(new MemoryCacheOptions());
        var handler = new PayPalAuthenticationHandler(
            cache,
            Options.Create(DefaultOptions()),
            NullLogger<PayPalAuthenticationHandler>.Instance);
        handler.InnerHandler = transport;

        using var http = new HttpClient(handler) { BaseAddress = new Uri(SandboxBaseUrl) };
        using var resp = await http.GetAsync("/v2/checkout/orders/8MC");

        resp.StatusCode.ShouldBe(HttpStatusCode.OK);
        transport.Requests.Count.ShouldBe(4); // token1 + 401 + token2 + retry-200
        var bearerParameters = transport.Requests
            .Where(r => r.AuthScheme == "Bearer")
            .Select(r => r.AuthParameter)
            .ToList();
        bearerParameters.ShouldBe(new[] { "AT-STALE", "AT-FRESH" });
    }

    [Fact]
    public async Task TokenEndpointFails_ThrowsHttpRequestException()
    {
        var bad = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("upstream down"),
        };
        var transport = new MockHttpMessageHandler(bad);

        var handler = Build(transport, out _);
        using var http = new HttpClient(handler) { BaseAddress = new Uri(SandboxBaseUrl) };

        await Should.ThrowAsync<HttpRequestException>(
            () => http.GetAsync("/v2/checkout/orders/8MC"));
    }

    private static HttpResponseMessage HttpResponseFromJson(HttpStatusCode status, string json)
        => new(status) { Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json") };

    /// <summary>
    /// Minimal in-process mock transport. Returns a queued response per matched request, or invokes
    /// a fallback lambda for dynamic responses. Captures request snapshots rather than raw
    /// <see cref="HttpRequestMessage"/> references because the auth handler disposes its outbound
    /// requests via <c>using var</c> before we can inspect them.
    /// </summary>
    internal sealed class MockHttpMessageHandler : HttpMessageHandler
    {
        public List<RequestSnapshot> Requests { get; } = new();
        private readonly Queue<HttpResponseMessage> _queued;
        private readonly Func<HttpRequestMessage, HttpResponseMessage>? _fallback;

        public MockHttpMessageHandler(params HttpResponseMessage[] responses)
            : this((IEnumerable<HttpResponseMessage>)responses)
        {
        }

        public MockHttpMessageHandler(IEnumerable<HttpResponseMessage> responses)
        {
            _queued = new Queue<HttpResponseMessage>(responses);
        }

        public MockHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> fallback)
        {
            _fallback = fallback;
            _queued = new Queue<HttpResponseMessage>();
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            Requests.Add(RequestSnapshot.From(request));
            if (_fallback != null)
            {
                return Task.FromResult(_fallback(request));
            }
            if (_queued.Count == 0)
            {
                throw new InvalidOperationException(
                    $"MockHttpMessageHandler received an unexpected request: {request.Method} {request.RequestUri}");
            }
            return Task.FromResult(_queued.Dequeue());
        }
    }

    internal readonly record struct RequestSnapshot(
        string Method,
        Uri Uri,
        string? AuthScheme,
        string? AuthParameter)
    {
        public static RequestSnapshot From(HttpRequestMessage request)
        {
            var auth = request.Headers.Authorization;
            return new RequestSnapshot(
                request.Method.Method,
                request.RequestUri ?? new Uri("about:blank"),
                auth?.Scheme,
                auth?.Parameter);
        }
    }
}
