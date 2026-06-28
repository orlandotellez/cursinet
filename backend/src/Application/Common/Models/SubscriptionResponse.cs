namespace Cursinet.Application.Common.Models;

public record SubscriptionResponse
{
    public string Plan { get; init; } = "free";
    public string Status { get; init; } = "active";
    public DateTime? CurrentPeriodStart { get; init; }
    public DateTime? CurrentPeriodEnd { get; init; }
    public bool CancelAtPeriodEnd { get; init; }
}
