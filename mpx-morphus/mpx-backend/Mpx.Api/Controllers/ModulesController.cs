using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class ModuleController(ModuleHandler moduleHandler, EmailHandler emailHandler) : ControllerBase
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "MODULE_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await moduleHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "MODULE_LIST")]
  public async Task<IActionResult> GetAllModules() =>
      Ok(await moduleHandler.GetListAsync());

  [HttpGet("application/{applicationId:guid}")]
  [Authorize(Policy = "MODULE_LIST")]
  public async Task<IActionResult> GetByApplication(Guid applicationId) =>
      Ok(await moduleHandler.GetByApplicationIdAsync(applicationId));

  [HttpGet("key/{key}")]
  [Authorize(Policy = "MODULE_GET_BY_KEY")]
  public async Task<IActionResult> GetModulesByKey(string key) =>
      Ok(await moduleHandler.GetModulesByKeyAsync(key));

  [HttpGet("{id:guid}/sub-modules")]
  [Authorize(Policy = "MODULE_SUB_MODULES")]
  public async Task<IActionResult> GetSubModules(Guid id) =>
      Ok(await moduleHandler.GetSubModulesAsync(id));

  [HttpPost]
  [Authorize(Policy = "MODULE_CREATE")]
  public async Task<IActionResult> Create([FromBody] Module module) =>
      Ok(await moduleHandler.CreateAsync(module));

  [HttpPut]
  [Authorize(Policy = "MODULE_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Module module) =>
      Ok(await moduleHandler.UpdateAsync(module));

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "MODULE_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await moduleHandler.DeleteAsync(id);
    return NoContent();
  }

  [HttpPost("verify")]
  public async Task<IActionResult> VerifySystemModules()
  {
    try
    {
      await emailHandler
          .NewEmail()
          .Subject("Auditoria de Módulos - Morphus Workspace")
          .LoadHtmlFile("welcome")
          .SetVariable("{{Nome}}", "Antônio Heber")
          .SetVariable("{{Empresa}}", "Morphus Enterprise Suite")
          .MailTo("hebinhopassamani@gmail.com", "Antônio Heber")
          .SendEmailAsync();

      return Ok(new { message = "Auditoria disparada com sucesso! O motor de e-mails processou a fila no PostgreSQL." });
    }
    catch (Exception ex)
    {
      return BadRequest(new { message = $"Falha ao executar auditoria: {ex.Message}" });
    }
  }
}
