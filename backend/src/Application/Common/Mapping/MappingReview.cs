using Cursinet.Application.Common.Models;
using Cursinet.Domain.Entities;

namespace Cursinet.Application.Common.Mapping;

public static class MappingReview
{
    public static ReviewResponse MapToDto(this Review review)
    {
        return new ReviewResponse
        {
            Id = review.Id,
            CourseId = review.CourseId,
            UserId = review.UserId,
            UserName = review.User.Name,
            UserAvatar = review.User.Image,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
        };
    }
}
