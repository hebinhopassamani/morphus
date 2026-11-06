using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/application")]
public class ApplicationController(
    ApplicationHandler applicationHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<MorphusApplication>(httpContext)
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "APPLICATION_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await applicationHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "APPLICATION_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await applicationHandler.GetListAsync());

  [HttpGet("workspace/{workspaceId:guid}")]
  [Authorize(Policy = "APPLICATION_LIST")]
  public async Task<IActionResult> GetByWorkspace(Guid workspaceId) =>
      Ok(await applicationHandler.GetByWorkspaceAsync(workspaceId));

  [HttpGet("key/{key}")]
  [Authorize]
  public async Task<IActionResult> GetByKey(string key) =>
      Ok(await applicationHandler.GetByKeyAsync(key));

  [HttpGet("categories")]
  [Authorize]
  public async Task<IActionResult> GetCategories() =>
      Ok(await applicationHandler.GetCategoriesAsync());

  [HttpPost("{applicationId:guid}/modules")]
  [Authorize(Policy = "APPLICATION_UPDATE")]
  public async Task<IActionResult> SaveModule(Guid applicationId, [FromBody] ApplicationModule module) =>
      Ok(await applicationHandler.SaveModuleAsync(applicationId, module));

  [HttpDelete("modules/{moduleId:guid}")]
  [Authorize(Policy = "APPLICATION_UPDATE")]
  public async Task<IActionResult> DeleteModule(Guid moduleId)
  {
    await applicationHandler.DeleteModuleAsync(moduleId);
    return NoContent();
  }

  [HttpPost("modules/{moduleId:guid}/pages")]
  [Authorize(Policy = "APPLICATION_UPDATE")]
  public async Task<IActionResult> SaveSubModulePage(Guid moduleId, [FromBody] ApplicationSubModule page) =>
      Ok(await applicationHandler.SaveSubModulePageAsync(moduleId, page));

  [HttpDelete("pages/{pageId:guid}")]
  [Authorize(Policy = "APPLICATION_UPDATE")]
  public async Task<IActionResult> DeleteSubModulePage(Guid pageId)
  {
    await applicationHandler.DeleteSubModulePageAsync(pageId);
    return NoContent();
  }

  [HttpPost]
  [Authorize(Policy = "APPLICATION_CREATE")]
  public async Task<IActionResult> Create([FromBody] MorphusApplication application) =>
      Ok(await applicationHandler.CreateAsync(application, UserId));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "APPLICATION_UPDATE")]
  public async Task<IActionResult> Update([FromBody] MorphusApplication application, Guid? id = null)
  {
    if (id.HasValue && application.Id == Guid.Empty)
      application.Id = id.Value;

    return Ok(await applicationHandler.UpdateAsync(application));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "APPLICATION_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await applicationHandler.DeleteAsync(id);
    return NoContent();
  }

  [HttpPost("vscode-bridge/open")]
  [AllowAnonymous]
  public IActionResult OpenInVsCode([FromBody] VsCodeBridgeOpenRequest request)
  {
    var safePrefix = SanitizeSegment(request.AppPrefix ?? "APP");
    var safeSlug = SanitizeSegment(request.FileName ?? "pagina");
    var studioDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".morphus-studio", safePrefix));
    Directory.CreateDirectory(studioDir);

    var filePath = Path.Combine(studioDir, $"{safeSlug}.html");
    System.IO.File.WriteAllText(filePath, request.HtmlContent ?? string.Empty, System.Text.Encoding.UTF8);
    var ticks = System.IO.File.GetLastWriteTimeUtc(filePath).Ticks;

    var openedByServer = false;
    try
    {
      System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
      {
        FileName = "cmd.exe",
        Arguments = $"/c code --reuse-window \"{filePath}\"",
        CreateNoWindow = true,
        UseShellExecute = false
      });
      openedByServer = true;
    }
    catch
    {
      // Fallback via protocolo vscode:// no navegador
    }

    var normalizedForUrl = filePath.Replace('\\', '/');
    return Ok(new
    {
      filePath,
      vscodeUrl = $"vscode://file/{normalizedForUrl}",
      lastModifiedTicks = ticks,
      openedByServer
    });
  }

  [HttpGet("vscode-bridge/poll")]
  [AllowAnonymous]
  public IActionResult PollVsCodeFile([FromQuery] string filePath, [FromQuery] long sinceTicks)
  {
    if (string.IsNullOrWhiteSpace(filePath) || !System.IO.File.Exists(filePath))
      return Ok(new { changed = false, lastModifiedTicks = sinceTicks, htmlContent = string.Empty });

    var ticks = System.IO.File.GetLastWriteTimeUtc(filePath).Ticks;
    if (ticks <= sinceTicks)
      return Ok(new { changed = false, lastModifiedTicks = ticks, htmlContent = string.Empty });

    var content = System.IO.File.ReadAllText(filePath, System.Text.Encoding.UTF8);
    return Ok(new
    {
      changed = true,
      lastModifiedTicks = ticks,
      htmlContent = content
    });
  }

  private static string SanitizeSegment(string raw)
  {
    var chars = raw
        .Select(c => char.IsLetterOrDigit(c) || c == '-' || c == '_' ? c : '-')
        .ToArray();
    var clean = new string(chars).Trim('-');
    return string.IsNullOrWhiteSpace(clean) ? "pagina" : clean;
  }
}

public sealed class VsCodeBridgeOpenRequest
{
  public string? AppPrefix { get; set; }
  public string? FileName { get; set; }
  public string? HtmlContent { get; set; }
}
