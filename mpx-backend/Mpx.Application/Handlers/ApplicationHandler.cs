using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class ApplicationHandler(
    IApplicationRepository applicationRepository,
    IApplicationUserRepository applicationUserRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<MorphusApplication>(httpContext)
{
  public Task<MorphusApplication?> GetByIdAsync(Guid id) => applicationRepository.GetByIdAsync(id);

  public Task<List<MorphusApplication>> GetListAsync() => applicationRepository.GetListAsync();

  public Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId) =>
      applicationRepository.GetByWorkspaceAsync(workspaceId);

  public Task<MorphusApplication?> GetByKeyAsync(string key) => applicationRepository.GetByKeyAsync(key);

  public Task<List<Category>> GetCategoriesAsync() => applicationRepository.GetCategoriesAsync();

  public Task<ApplicationModule> SaveModuleAsync(Guid applicationId, ApplicationModule module) =>
      applicationRepository.SaveModuleAsync(applicationId, module);

  public Task DeleteModuleAsync(Guid moduleId) =>
      applicationRepository.DeleteModuleAsync(moduleId);

  public Task<ApplicationSubModule> SaveSubModulePageAsync(Guid moduleId, ApplicationSubModule page) =>
      applicationRepository.SaveSubModulePageAsync(moduleId, page);

  public Task DeleteSubModulePageAsync(Guid pageId) =>
      applicationRepository.DeleteSubModulePageAsync(pageId);

  public async Task<MorphusApplication> CreateAsync(MorphusApplication application, Guid? creatorUserId = null)
  {
    if (application.Id == Guid.Empty)
      application.Id = Guid.NewGuid();

    await ResolveAndValidatePrefixAsync(application);

    await applicationRepository.AddAsync(application);
    await applicationRepository.EnsureInitialWorkspaceAndDashboardForNewAppAsync(application);

    var ownerId = creatorUserId is not null && creatorUserId != Guid.Empty
        ? creatorUserId.Value
        : (UserId ?? Guid.Empty);

    if (ownerId != Guid.Empty)
    {
      await applicationUserRepository.AddRelationshipAsync(new ApplicationUser
      {
        ApplicationId = application.Id,
        UserId = ownerId,
        IsOwner = true,
        System = false
      });
    }

    await unitOfWork.SaveChangesAsync();
    return await applicationRepository.GetByIdAsync(application.Id) ?? application;
  }

  public async Task<MorphusApplication> UpdateAsync(MorphusApplication application)
  {
    await ResolveAndValidatePrefixAsync(application);
    await applicationRepository.UpdateNotNull(application, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return application;
  }

  private async Task ResolveAndValidatePrefixAsync(MorphusApplication application)
  {
    var existingApps = await applicationRepository.GetListAsync();
    var usedPrefixes = existingApps
        .Where(a => a.Id != application.Id && !string.IsNullOrWhiteSpace(a.Prefix))
        .Select(a => a.Prefix.Trim().ToUpperInvariant())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    var normalizedPrefix = NormalizeAlphanumeric(application.Prefix);

    if (string.IsNullOrWhiteSpace(normalizedPrefix))
    {
      application.Prefix = GenerateUniquePrefix(application.Name, usedPrefixes);
      return;
    }

    if (normalizedPrefix.Length != 3)
      throw new InvalidOperationException("A sigla da aplicação deve conter exatamente 3 caracteres alfanuméricos.");

    if (usedPrefixes.Contains(normalizedPrefix))
      throw new InvalidOperationException($"A sigla '{normalizedPrefix}' já está sendo utilizada por outra aplicação nesta corporação.");

    application.Prefix = normalizedPrefix;
  }

  private static string GenerateUniquePrefix(string name, HashSet<string> usedPrefixes)
  {
    var clean = NormalizeAlphanumeric(name);
    if (clean.Length < 3)
      clean = clean.PadRight(3, 'X');

    var candidates = new List<string>();
    candidates.Add(clean[..3]);

    var words = RemoveDiacritics(name ?? string.Empty)
        .ToUpperInvariant()
        .Split([' ', '-', '_'], StringSplitOptions.RemoveEmptyEntries)
        .Select(NormalizeAlphanumeric)
        .Where(w => w.Length > 0)
        .ToList();

    if (words.Count >= 3)
      candidates.Add($"{words[0][0]}{words[1][0]}{words[2][0]}");
    if (words.Count >= 2 && words[1].Length >= 2)
      candidates.Add($"{words[0][0]}{words[1][0]}{words[1][1]}");
    if (words.Count >= 2 && words[0].Length >= 2)
      candidates.Add($"{words[0][0]}{words[0][1]}{words[1][0]}");

    var consonants = new string(clean.Where(c => !"AEIOU".Contains(c)).ToArray());
    if (consonants.Length >= 3)
      candidates.Add(consonants[..3]);

    for (var i = 2; i < clean.Length; i++)
    {
      candidates.Add($"{clean[0]}{clean[1]}{clean[i]}");
    }

    var prefix2 = clean[..2];
    foreach (var ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    {
      candidates.Add($"{prefix2}{ch}");
    }

    foreach (var candidate in candidates.Distinct(StringComparer.OrdinalIgnoreCase))
    {
      if (candidate.Length == 3 && !usedPrefixes.Contains(candidate))
        return candidate;
    }

    for (var n = 1; n <= 999; n++)
    {
      var fallback = $"{clean[0]}{n:D2}";
      if (!usedPrefixes.Contains(fallback))
        return fallback;
    }

    return "APP";
  }

  private static string NormalizeAlphanumeric(string? input)
  {
    if (string.IsNullOrWhiteSpace(input))
      return string.Empty;

    var noDiacritics = RemoveDiacritics(input).ToUpperInvariant();
    return new string(noDiacritics.Where(char.IsLetterOrDigit).ToArray());
  }

  private static string RemoveDiacritics(string text)
  {
    var normalized = text.Normalize(NormalizationForm.FormD);
    var sb = new StringBuilder(normalized.Length);
    foreach (var c in normalized)
    {
      if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
        sb.Append(c);
    }
    return sb.ToString().Normalize(NormalizationForm.FormC);
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await applicationRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir uma aplicação padrão do sistema.");

    applicationRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
