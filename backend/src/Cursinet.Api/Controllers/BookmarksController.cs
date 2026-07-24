using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/bookmarks")]
[Authorize]
public class BookmarksController : ControllerBase
{
    private readonly IBookmarkService _bookmarkService;

    public BookmarksController(IBookmarkService bookmarkService)
    {
        _bookmarkService = bookmarkService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BookmarkResponse>>> GetMyBookmarks()
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        var bookmarks = await _bookmarkService.GetMyBookmarksAsync(userId);
        return Ok(bookmarks);
    }

    [HttpPost]
    public async Task<ActionResult> AddBookmark([FromBody] AddBookmarkRequest request)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        await _bookmarkService.AddAsync(userId, request.CourseId);
        return CreatedAtAction(nameof(GetMyBookmarks), null);
    }

    [HttpDelete("{courseId:guid}")]
    public async Task<ActionResult> RemoveBookmark(Guid courseId)
    {
        var userId = HttpContext.GetCurrentUserId() ?? throw AppExceptions.Unauthorized();

        await _bookmarkService.RemoveAsync(userId, courseId);
        return NoContent();
    }
}

public record AddBookmarkRequest(Guid CourseId);
