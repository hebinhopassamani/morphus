using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mpx.Application.Handlers;
using Mpx.Domain.Security;
using Mpx.Infrastructure.Data;

namespace Mpx.Api.Controllers;

[ApiController]
[Route("api/v1/website")]
[AllowAnonymous]
public class WebsiteController(MorphusDbContext dbContext, EmailHandler emailHandler) : ControllerBase
{
  [HttpGet("showcase")]
  public async Task<IActionResult> GetShowcaseAsync()
  {
    var features = await dbContext.Features
        .AsNoTracking()
        .Where(f => !f.Inactive)
        .Include(f => f.Highlights.Where(h => !h.Inactive).OrderBy(h => h.Order))
        .OrderBy(f => f.Order)
        .Select(f => new
        {
          f.Id,
          f.Key,
          f.Title,
          f.HighlightPhrase,
          f.Description,
          f.Order,
          Highlights = f.Highlights
              .Where(h => !h.Inactive)
              .OrderBy(h => h.Order)
              .Select(h => new
              {
                h.Id,
                h.FeatureId,
                h.Title,
                h.TitleIcon,
                h.Highlight,
                h.HighlightIcon,
                h.Order
              })
              .ToList()
        })
        .ToListAsync();

    var modules = await dbContext.ShowcaseModules
        .AsNoTracking()
        .Where(m => !m.Inactive)
        .Include(m => m.Category)
        .OrderBy(m => m.Order)
        .Select(m => new
        {
          m.Id,
          m.Key,
          m.CategoryId,
          CategoryName = m.Category != null ? m.Category.Name : "Geral",
          CategoryColor = m.Category != null ? m.Category.Color : "violet",
          m.Icon,
          m.Title,
          m.Description,
          m.ActionText,
          m.Order
        })
        .ToListAsync();

    return Ok(new
    {
      features,
      modules
    });
  }

  [HttpGet("products")]
  public async Task<IActionResult> GetProductsAsync()
  {
    var dbApps = await dbContext.Applications
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(a => a.Category)
        .Where(a => !a.Inactive)
        .OrderBy(a => a.System ? 0 : 1)
        .ThenBy(a => a.Name)
        .ToListAsync();

    if (dbApps.Count > 0)
    {
      var distinctApps = dbApps
          .GroupBy(a => a.Name.Trim().ToUpperInvariant())
          .Select(g => g.First())
          .Select(a => new
          {
            a.Id,
            a.Name,
            a.Prefix,
            a.Icon,
            a.Color,
            a.Description,
            a.System,
            CategoryName = a.Category != null ? a.Category.Name : "Ecossistema Morphus",
            CategoryLabel = a.Category != null ? a.Category.Label : "Morphus",
            CategoryColor = a.Category != null ? a.Category.Color : (a.Color ?? "violet")
          })
          .ToList();

      return Ok(distinctApps);
    }

    var (seedCorp, _) = MorphusAccountSeed.CreateCorporationBaseForOnboarding(
        "Morphus",
        "contato@morphus.me",
        Guid.Empty);

    var categoryMap = seedCorp.Categories.ToDictionary(c => c.Id);

    var fallbackApps = seedCorp.Applications
        .Where(a => !a.Inactive)
        .Select(a =>
        {
          var cat = a.CategoryId.HasValue && categoryMap.TryGetValue(a.CategoryId.Value, out var found)
              ? found
              : null;
          return new
          {
            a.Id,
            a.Name,
            a.Prefix,
            a.Icon,
            a.Color,
            a.Description,
            a.System,
            CategoryName = cat?.Name ?? "Ecossistema Morphus",
            CategoryLabel = cat?.Label ?? "Morphus",
            CategoryColor = cat?.Color ?? (a.Color ?? "violet")
          };
        })
        .ToList();

    return Ok(fallbackApps);
  }

  public record ContactFormRequest(
      string Name,
      string Email,
      string? Company,
      string? Phone,
      string? Subject,
      string Message);

  [HttpPost("contact")]
  public async Task<IActionResult> SubmitContactAsync([FromBody] ContactFormRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Name) ||
        string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Message))
    {
      return BadRequest(new { message = "Por favor, preencha nome, e-mail e mensagem." });
    }

    try
    {
      var subject = string.IsNullOrWhiteSpace(request.Subject)
          ? $"Contato Comercial Morphus - {request.Name}"
          : $"Contato Morphus: {request.Subject} ({request.Name})";

      var html = $"""
          <h2>Novo contato pelo portal Morphus</h2>
          <p><strong>Nome:</strong> {System.Net.WebUtility.HtmlEncode(request.Name)}</p>
          <p><strong>E-mail:</strong> {System.Net.WebUtility.HtmlEncode(request.Email)}</p>
          <p><strong>Empresa:</strong> {System.Net.WebUtility.HtmlEncode(request.Company ?? "Não informada")}</p>
          <p><strong>Telefone:</strong> {System.Net.WebUtility.HtmlEncode(request.Phone ?? "Não informado")}</p>
          <p><strong>Mensagem:</strong></p>
          <p>{System.Net.WebUtility.HtmlEncode(request.Message)}</p>
          """;

      await emailHandler
          .NewEmail()
          .Subject(subject)
          .SetHtmlBody(html)
          .MailTo("laupaconsultoria@gmail.com", "Equipe Morphus")
          .SendEmailAsync();
    }
    catch
    {
      // Ignora erro de SMTP externo para não bloquear o envio do formulário
    }

    return Ok(new
    {
      message = "Recebemos sua mensagem! Nossa equipe de especialistas entrará em contato em breve."
    });
  }
}
