using Cursinet.Domain.Enums;

namespace Cursinet.Domain.Entities;

public class User
{
	public Guid Id {get; set;}

	public string Name {get; set;} = string.Empty;

	public string Email {get; set;} = string.Empty;

	public bool EmailVerified {get; set;}

	public string? Phone {get; set;}

	public string? Image {get; set;}

	public UserRole Role {get; set;}

	public string? UserName {get; set;}

	public string? Bio {get; set;}

	public string? WebsiteUrl {get; set;}

	public string? GithubUrl {get; set;}

	public string? LinkedinUrl {get; set;}

	public string? StripeCustomerId {get; set;}

	public bool IsActive {get; set;}

	public DateTime? LastSeenAt {get; set;}

	public DateTime CreatedAt {get; set;}

	public DateTime UpdatedAt {get; set;}

	public DateTime? DeletedAt {get; set;}

	public Guid? DeletedByUserId {get; set;}

	public string? DeletedByName {get; set;}

	public int FailedLoginAttempts {get; set;}

	public DateTime? LockoutEnd {get; set;}
}
