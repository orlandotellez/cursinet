using Cursinet.Domain.Entities;

namespace Cursinet.Domain.Entities;

public class AuditLog
{
	public Guid Id {get; set;}

	public Guid? UserId {get; set;}
	public User? User {get; set;}

	public string Action {get; set;} = null!;

	public string EntityType {get; set;} = null!;

	public Guid? EntityId {get; set;}

	public string? OldValues {get; set;}

	public string? NewValues {get; set;}

	public string? IpAddress {get; set;}

	public DateTime CreatedAt {get; set;}
}
