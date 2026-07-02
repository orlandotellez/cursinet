namespace Cursinet.Infrastructure.Adapters.PayPal;

/// <summary>
/// Configuración de la API REST de PayPal vinculada desde la sección de configuración <c>PayPal</c>.
/// </summary>
public class PayPalOptions
{
    public const string SectionName = "PayPal";

    /// <summary>URL base de la API REST de PayPal. Sandbox por defecto; sobrescribir a <c>https://api-m.paypal.com</c> en producción.</summary>
    public string BaseUrl { get; set; } = "https://api-m.sandbox.paypal.com";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>Webhook ID asignado por el dashboard de desarrollador de PayPal. Requerido para verificación de firmas.</summary>
    public string WebhookId { get; set; } = string.Empty;

    /// <summary>Flag de conveniencia — cuando es true, apunta <see cref="BaseUrl"/> al host de sandbox al iniciar la app.</summary>
    public bool IsSandbox { get; set; } = true;

    /// <summary>
    /// Mapping de los valores del enum <c>SubscriptionPlan</c> (como strings: <c>Monthly</c>, <c>Yearly</c>,
    /// <c>Lifetime</c>) a los billing-plan ids de PayPal configurados en el merchant dashboard. Poblar
    /// desde configuración: <c>PayPal:PlanIds:Monthly</c>, <c>PayPal:PlanIds:Yearly</c>, etc.
    /// </summary>
    public Dictionary<string, string> PlanIds { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
