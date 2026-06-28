using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/lessons/{lessonId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly AuthHelper _authHelper;

    public CommentsController(ICommentService commentService, AuthHelper authHelper)
    {
        _commentService = commentService;
        _authHelper = authHelper;
    }

    /// <summary>Authenticated: get all comments for a lesson.</summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<CommentResponse>>> GetComments(Guid lessonId)
    {
        var comments = await _commentService.GetLessonCommentsAsync(lessonId);
        return Ok(comments);
    }

    /// <summary>Authenticated: create a comment on a lesson.</summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CommentResponse>> CreateComment(
        Guid lessonId,
        [FromBody] CreateCommentRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _commentService.CreateCommentAsync(
            lessonId, userId, request.Body, request.ParentId);
        return CreatedAtAction(null, result);
    }

    /// <summary>Authenticated: update your own comment.</summary>
    [HttpPut("{commentId}")]
    [Authorize]
    public async Task<ActionResult<CommentResponse>> UpdateComment(
        Guid lessonId,
        Guid commentId,
        [FromBody] UpdateCommentRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _commentService.UpdateCommentAsync(commentId, userId, request.Body);
        return Ok(result);
    }

    /// <summary>Authenticated: delete your own comment.</summary>
    [HttpDelete("{commentId}")]
    [Authorize]
    public async Task<ActionResult> DeleteComment(Guid lessonId, Guid commentId)
    {
        var userId = await _authHelper.ResolveCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        await _commentService.DeleteCommentAsync(commentId, userId);
        return Ok(new { message = "Comment deleted successfully." });
    }
}

// ─── Request DTOs ─────────────────────────────────────────

public record CreateCommentRequest(
    string Body,
    Guid? ParentId
);

public record UpdateCommentRequest(
    string Body
);
