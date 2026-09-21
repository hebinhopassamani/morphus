using Microsoft.AspNetCore.Mvc;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.MailSerrvice;
using Morphus.Domain.Entities.Models;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/email")]
public class EmailController(IEmailService mpsEmailService, IHttpContextAccessor httpContext) : MorphusController<Email>(httpContext)
{
  private readonly IEmailService emailService = mpsEmailService;

  [HttpPost]
  [Route("send")]
  public async Task<ObjectResult> SendEmail([FromBody] Email email)
  {
    emailService.LoadEmail(email);

    email = await emailService.SendEmailAsync();

    return Ok(email);
  }

  [HttpPost]
  [Route("create")]
  public async Task<ObjectResult> Create([FromBody] Email email)
  {
    email = await emailService.Create(email);

    return Ok(email);
  }
}
