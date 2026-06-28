using Cursinet.Application.Common.Models;
using FluentValidation;

namespace Cursinet.Api.Validators;

public class UpdateNotificationPreferenceRequestValidator : AbstractValidator<UpdateNotificationPreferenceRequest>
{
    public UpdateNotificationPreferenceRequestValidator()
    {
    }
}
