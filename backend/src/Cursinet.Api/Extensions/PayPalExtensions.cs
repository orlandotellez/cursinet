using Cursinet.Application.Common.Interfaces;
using Cursinet.Infrastructure.Adapters.Payments;
using Cursinet.Infrastructure.Adapters.PayPal;
using Cursinet.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.Options;

namespace Cursinet.Api.Extensions;

public static class PayPalExtensions
{
    public static IServiceCollection AddPayPal(this IServiceCollection services, IConfiguration configuration)
    {
        // PayPal adapter wiring. Token cache + auth handler + signature-validating HttpClient are registered
        // up-front so the typed clients for PayPalPaymentProvider and PayPalWebhookSignatureValidator can
        // attach the handler in their respective pipelines. IPaymentProvider resolution switches between
        // the live PayPal adapter and MockPaymentProvider based on the PayPal:Enabled config toggle — no
        // branching lives inside the application services.
        services.AddMemoryCache();
        services.AddTransient<PayPalAuthenticationHandler>();
        services.Configure<PayPalOptions>(configuration.GetSection(PayPalOptions.SectionName));

        services.AddHttpClient<PayPalWebhookSignatureValidator>()
            .AddHttpMessageHandler<PayPalAuthenticationHandler>()
            .ConfigureHttpClient((sp, c) =>
            {
                var opts = sp.GetRequiredService<IOptions<PayPalOptions>>().Value;
                c.BaseAddress = new Uri(opts.BaseUrl);
                c.Timeout = TimeSpan.FromSeconds(15);
            });
        services.AddScoped<IPayPalWebhookSignatureValidator>(sp =>
            sp.GetRequiredService<PayPalWebhookSignatureValidator>());
        services.AddScoped<IPayPalWebhookEventRepository, PayPalWebhookEventRepository>();

        var paypalEnabled = configuration.GetSection("PayPal").GetValue<bool>("Enabled");
        if (paypalEnabled)
        {
            services.AddHttpClient<PayPalPaymentProvider>()
                .AddHttpMessageHandler<PayPalAuthenticationHandler>()
                .ConfigureHttpClient((sp, c) =>
                {
                    var opts = sp.GetRequiredService<IOptions<PayPalOptions>>().Value;
                    c.BaseAddress = new Uri(opts.BaseUrl);
                    c.Timeout = TimeSpan.FromSeconds(30);
                });
            // IMPORTANTE: IPaymentProvider resuelve a través del typed client registrado arriba
            // (AddHttpClient<PayPalPaymentProvider>) para que el HttpClient inyectado tenga el
            // PayPalAuthenticationHandler en su pipeline. Usar AddScoped<IPaymentProvider, PayPalPaymentProvider>
            // directamente crearía una instancia con un HttpClient default SIN el handler.
            services.AddScoped<IPaymentProvider>(sp =>
                sp.GetRequiredService<PayPalPaymentProvider>());
        }
        else
        {
            services.AddScoped<IPaymentProvider, MockPaymentProvider>();
        }

        return services;
    }
}
