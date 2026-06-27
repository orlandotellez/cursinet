using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/bookmarks")]
[Authorize]
public class BookmarksController : ControllerBase
{
    private readonly IBookmarkService _bookmarkService;
    private readonly AuthHelper _authHelper;

    public BookmarksController(IBookmarkService bookmarkService, AuthHelper authHelper)
    {
        _bookmarkService = bookmarkService;
        _authHelper = authHelper;
    }

    [HttpGet]
    public async Task<ActionResult<List<BookmarkResponse>>> GetMyBookmarks()
    {
        var userId = await _authHelper.ResolveCurrentUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        var bookmarks = await _bookmarkService.GetMyBookmarksAsync(userId.Value);
        return Ok(bookmarks);
    }

    [HttpPost]
    public async Task<ActionResult> AddBookmark([FromBody] AddBookmarkRequest request)
    {
        var userId = await _authHelper.ResolveCurrentUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        await _bookmarkService.AddAsync(userId.Value, request.CourseId);
        return CreatedAtAction(nameof(GetMyBookmarks), null);
    }

    [HttpDelete("{courseId:guid}")]
    public async Task<ActionResult> RemoveBookmark(Guid courseId)
    {
        var userId = await _authHelper.ResolveCurrentUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        await _bookmarkService.RemoveAsync(userId.Value, courseId);
        return NoContent();
    }
}

public record AddBookmarkRequest(Guid CourseId);
