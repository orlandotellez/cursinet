using System.Text.Json.Serialization;
using Cursinet.Api.Extensions;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddResponseCaching();
builder.Services.AddRateLimiterConfiguration();
builder.Services.AddCorsConfiguration(builder.Configuration);
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddAuthenticationConfiguration(builder.Configuration);
builder.Services.AddAuthorizationConfiguration();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddPayPal(builder.Configuration);

var app = builder.Build();

await app.ConfigureMiddlewareAsync();

app.Run();
