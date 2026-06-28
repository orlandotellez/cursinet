using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        When(x => x.Name is not null, () =>
        {
            RuleFor(x => x.Name!)
                .NotEmpty().WithMessage("Name cannot be empty")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters");
        });

        When(x => x.Email is not null, () =>
        {
            RuleFor(x => x.Email!)
                .NotEmpty().WithMessage("Email cannot be empty")
                .EmailAddress().WithMessage("Invalid email format");
        });

        When(x => x.Role is not null, () =>
        {
            RuleFor(x => x.Role!.Value)
                .IsInEnum().WithMessage("Invalid user role");
        });
    }
}
