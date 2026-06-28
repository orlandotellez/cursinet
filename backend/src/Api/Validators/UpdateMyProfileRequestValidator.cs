using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateMyProfileRequestValidator : AbstractValidator<UpdateMyProfileRequest>
{
    public UpdateMyProfileRequestValidator()
    {
        When(x => x.Name is not null, () =>
        {
            RuleFor(x => x.Name!)
                .NotEmpty().WithMessage("Name cannot be empty");
        });

        When(x => x.UserName is not null, () =>
        {
            RuleFor(x => x.UserName!)
                .NotEmpty().WithMessage("Username cannot be empty");
        });

        When(x => x.Phone is not null, () =>
        {
            RuleFor(x => x.Phone!)
                .NotEmpty().WithMessage("Phone cannot be empty");
        });

        When(x => x.WebsiteUrl is not null, () =>
        {
            RuleFor(x => x.WebsiteUrl!)
                .NotEmpty().WithMessage("Website URL cannot be empty");
        });

        When(x => x.GithubUrl is not null, () =>
        {
            RuleFor(x => x.GithubUrl!)
                .NotEmpty().WithMessage("GitHub URL cannot be empty");
        });

        When(x => x.LinkedinUrl is not null, () =>
        {
            RuleFor(x => x.LinkedinUrl!)
                .NotEmpty().WithMessage("LinkedIn URL cannot be empty");
        });
    }
}
