using Cursinet.Api.Helpers;
using Cursinet.Application.Common.Interfaces;
using Cursinet.Application.Common.Models;
using Cursinet.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cursinet.Api.Controllers;

[ApiController]
[Route("api/v1/lessons/{lessonId}/notes")]
public class LessonNotesController : ControllerBase
{
    private readonly ILessonNoteService _noteService;

    public LessonNotesController(ILessonNoteService noteService)
    {
        _noteService = noteService;
    }

    /// <summary>Authenticated: get my note for a lesson.</summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<NoteResponse?>> GetNote(Guid lessonId)
    {
        var userId = HttpContext.GetCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var note = await _noteService.GetNoteAsync(userId, lessonId);
        return Ok(note);
    }

    /// <summary>Authenticated: save/update note for a lesson.</summary>
    [HttpPut]
    [Authorize]
    public async Task<ActionResult<NoteResponse>> SaveNote(
        Guid lessonId,
        [FromBody] SaveNoteRequest request)
    {
        var userId = HttpContext.GetCurrentUserId()
            ?? throw AppExceptions.Unauthorized();
        var result = await _noteService.SaveNoteAsync(userId, lessonId, request.Content);
        return Ok(result);
    }
}

public record SaveNoteRequest(string Content);
