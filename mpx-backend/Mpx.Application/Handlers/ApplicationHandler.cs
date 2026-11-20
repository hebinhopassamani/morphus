using System.Globalization;
using System.Text;

using Microsoft.AspNetCore.Http;

using Mpx.Application.Dtos;
using Mpx.Core.Handlers;
using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

using Application = Mpx.Domain.Entities.MpxApplication;

public class ApplicationHandler(
    IApplicationRepository applicationRepository,
    IApplicationUserRepository applicationUserRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MpxHandler<Application>(httpContext)
{
  private static readonly HashSet<string> ReservedMorphusSubdomains = new(StringComparer.OrdinalIgnoreCase)
  {
    "www",
    "morphus",
    "cloud",
    "security",
    "seguranca",
    "flow",
    "workflow",
    "kalupa",
    "send",
    "mail",
    "website",
    "api",
    "admin",
    "auth"
  };

  public Task<Application?> GetByIdAsync(Guid id) => applicationRepository.GetByIdAsync(id);

  public Task<List<Application>> GetListAsync() => applicationRepository.GetListAsync();

  public Task<List<Application>> GetByWorkspaceAsync(Guid workspaceId) =>
      applicationRepository.GetByWorkspaceAsync(workspaceId);

  public Task<Application?> GetByKeyAsync(string key) => applicationRepository.GetByKeyAsync(key);

  public Task<List<Category>> GetCategoriesAsync() => applicationRepository.GetCategoriesAsync();

  public Task<ApplicationModule> SaveModuleAsync(Guid applicationId, ApplicationModule module) =>
      applicationRepository.SaveModuleAsync(applicationId, module);

  public Task DeleteModuleAsync(Guid moduleId) =>
      applicationRepository.DeleteModuleAsync(moduleId);

  public Task<ApplicationSubModule> SaveSubModulePageAsync(Guid moduleId, ApplicationSubModule page) =>
      applicationRepository.SaveSubModulePageAsync(moduleId, page);

  public Task DeleteSubModulePageAsync(Guid pageId) =>
      applicationRepository.DeleteSubModulePageAsync(pageId);

  public Task<List<CorporationDomain>> GetCorporationDomainsAsync() =>
      applicationRepository.GetCorporationDomainsAsync();

  public Task<CorporationDomain> SaveCorporationDomainAsync(CorporationDomain domain) =>
      applicationRepository.SaveCorporationDomainAsync(domain);

  public Task<List<ApplicationSetting>> GetApplicationSettingsAsync(Guid applicationId) =>
      applicationRepository.GetApplicationSettingsAsync(applicationId);

  public Task<ApplicationSetting> SaveApplicationSettingAsync(Guid applicationId, ApplicationSetting setting) =>
      applicationRepository.SaveApplicationSettingAsync(applicationId, setting);

  public Task DeleteApplicationSettingAsync(Guid settingId) =>
      applicationRepository.DeleteApplicationSettingAsync(settingId);

  public async Task<ApplicationDomainPreviewResponse> PreviewDomainAsync(ApplicationDomainPreviewRequest request)
  {
    var cleanName = (request.Name ?? string.Empty).Trim();
    var allGlobalApps = await applicationRepository.GetAllApplicationsIgnoreFiltersAsync();
    var excludeId = request.ExcludeApplicationId ?? Guid.Empty;

    var otherCustomerApps = allGlobalApps
        .Where(a => a.Id != excludeId && !a.System && !string.Equals(a.Prefix, "KAL", StringComparison.OrdinalIgnoreCase))
        .ToList();

    var usedPrefixesInCorp = (await applicationRepository.GetListAsync())
        .Where(a => a.Id != excludeId && !string.IsNullOrWhiteSpace(a.Prefix))
        .Select(a => a.Prefix.Trim().ToUpperInvariant())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    var normalizedPrefix = NormalizeAlphanumeric(request.Prefix);
    if (string.IsNullOrWhiteSpace(normalizedPrefix) || normalizedPrefix.Length != 3)
    {
      normalizedPrefix = GenerateUniquePrefix(cleanName, usedPrefixesInCorp);
    }

    var prefixLower = normalizedPrefix.ToLowerInvariant();

    // Regra: Nunca uma app pode ter o mesmo nome e mesma sigla nem em clientes diferentes dentro do mesmo ambiente compartilhado
    var nameAndPrefixConflict = !string.IsNullOrWhiteSpace(cleanName) &&
        otherCustomerApps.Any(a =>
            string.Equals(a.Name?.Trim(), cleanName, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(a.Prefix?.Trim(), normalizedPrefix, StringComparison.OrdinalIgnoreCase));

    var usedFullDomains = otherCustomerApps
        .Where(a => !string.IsNullOrWhiteSpace(a.FullDomain))
        .Select(a => a.FullDomain!.Trim().ToLowerInvariant())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    // Também reserva os domínios oficiais de sistema
    usedFullDomains.Add("morphus.one");
    usedFullDomains.Add("www.morphus.one");
    usedFullDomains.Add("cloud.morphus.one");
    usedFullDomains.Add("security.morphus.one");
    usedFullDomains.Add("flow.morphus.one");
    usedFullDomains.Add("kalupa.morphus.one");
    usedFullDomains.Add("send.morphus.one");
    usedFullDomains.Add("morphus.mpx.morphus.one");
    usedFullDomains.Add("seguranca.sec.morphus.one");
    usedFullDomains.Add("website.web.morphus.one");
    usedFullDomains.Add("kalupa.kal.morphus.one");
    usedFullDomains.Add("flow.flw.morphus.one");
    usedFullDomains.Add("send.snd.morphus.one");

    var words = ExtractCleanLowerWords(cleanName);
    if (words.Count == 0)
    {
      words.Add("app");
    }

    var progressiveSubdomains = new List<string>();
    var acc = string.Empty;
    foreach (var word in words)
    {
      acc += word;
      progressiveSubdomains.Add(acc);
    }

    var firstSubdomain = progressiveSubdomains[0];
    var firstFullDomain = $"{firstSubdomain}.{prefixLower}.morphus.one";
    var firstAvailable = !usedFullDomains.Contains(firstFullDomain) && !nameAndPrefixConflict;

    string? suggestedSubdomain = null;
    string? suggestedFullDomain = null;

    foreach (var candidateSub in progressiveSubdomains)
    {
      var candidateFull = $"{candidateSub}.{prefixLower}.morphus.one";
      if (!usedFullDomains.Contains(candidateFull))
      {
        suggestedSubdomain = candidateSub;
        suggestedFullDomain = candidateFull;
        break;
      }
    }

    string? customAttemptSubdomain = null;
    string? customAttemptDomain = null;
    bool? customAttemptAvailable = null;

    var mode = string.IsNullOrWhiteSpace(request.DomainMode) ? "MorphusSuggested" : request.DomainMode.Trim();

    if (!string.IsNullOrWhiteSpace(request.CustomSubdomain))
    {
      customAttemptSubdomain = SanitizeDomainLabel(request.CustomSubdomain);
      if (!string.IsNullOrWhiteSpace(customAttemptSubdomain))
      {
        if (string.Equals(mode, "MorphusSuggested", StringComparison.OrdinalIgnoreCase) || request.CorporationDomainId is null || request.CorporationDomainId == Guid.Empty)
        {
          customAttemptDomain = $"{customAttemptSubdomain}.{prefixLower}.morphus.one";
          customAttemptAvailable = !usedFullDomains.Contains(customAttemptDomain);
        }
        else
        {
          var corpDomains = await applicationRepository.GetCorporationDomainsAsync();
          var targetDomain = corpDomains.FirstOrDefault(d => d.Id == request.CorporationDomainId);
          if (targetDomain is not null)
          {
            customAttemptDomain = $"{customAttemptSubdomain}.{targetDomain.DomainName.Trim().ToLowerInvariant()}";
            customAttemptAvailable = !usedFullDomains.Contains(customAttemptDomain);
          }
        }
      }
    }

    return new ApplicationDomainPreviewResponse
    {
      ResolvedPrefix = normalizedPrefix,
      NameAndPrefixConflict = nameAndPrefixConflict,
      FirstAttemptSubdomain = firstSubdomain,
      FirstAttemptDomain = firstFullDomain,
      FirstAttemptAvailable = firstAvailable,
      SuggestedAvailableSubdomain = suggestedSubdomain,
      SuggestedAvailableDomain = suggestedFullDomain,
      ProgressiveCandidates = progressiveSubdomains
          .Select(sub =>
          {
            var full = $"{sub}.{prefixLower}.morphus.one";
            return new DomainCandidateItem
            {
              Subdomain = sub,
              FullDomain = full,
              Available = !usedFullDomains.Contains(full)
            };
          })
          .ToList(),
      CustomAttemptSubdomain = customAttemptSubdomain,
      CustomAttemptDomain = customAttemptDomain,
      CustomAttemptAvailable = customAttemptAvailable
    };
  }

  public async Task<Application> UpdateBasicSettingsAsync(Guid applicationId, UpdateApplicationBasicSettingsRequest request)
  {
    var existing = await applicationRepository.GetByIdAsync(applicationId)
        ?? throw new InvalidOperationException("Aplicação não encontrada.");

    if (!string.IsNullOrWhiteSpace(request.Name))
    {
      existing.Name = request.Name.Trim();
    }

    if (!string.IsNullOrWhiteSpace(request.DomainMode))
    {
      existing.DomainMode = request.DomainMode.Trim();
    }

    if (request.Subdomain is not null)
    {
      existing.Subdomain = SanitizeDomainLabel(request.Subdomain);
    }

    existing.CorporationDomainId = request.CorporationDomainId;

    await ResolveAndValidateDomainAsync(existing);
    await applicationRepository.UpdateNotNull(existing, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();

    return await applicationRepository.GetByIdAsync(applicationId) ?? existing;
  }

  public async Task<Application> CreateAsync(Application application, Guid? creatorUserId = null)
  {
    if (application.Id == Guid.Empty)
      application.Id = Guid.NewGuid();

    await ResolveAndValidatePrefixAsync(application);
    await ResolveAndValidateDomainAsync(application);

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

  public async Task<Application> UpdateAsync(Application application)
  {
    await ResolveAndValidatePrefixAsync(application);
    await ResolveAndValidateDomainAsync(application);
    await applicationRepository.UpdateNotNull(application, updateCorporationId: false);
    if (application.WorkspaceIds is not null)
    {
      await applicationRepository.SyncApplicationWorkspacesAsync(application.Id, application.WorkspaceIds);
    }
    await unitOfWork.SaveChangesAsync();
    return await applicationRepository.GetByIdAsync(application.Id) ?? application;
  }

  private async Task ResolveAndValidatePrefixAsync(Application application)
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

  private async Task ResolveAndValidateDomainAsync(Application application)
  {
    if (application.System || string.Equals(application.Prefix, "KAL", StringComparison.OrdinalIgnoreCase))
    {
      if (string.IsNullOrWhiteSpace(application.FullDomain))
      {
        var sysSub = SanitizeDomainLabel(ExtractCleanLowerWords(application.Name).FirstOrDefault() ?? "app");
        application.DomainMode = "MorphusSuggested";
        application.Subdomain = sysSub;
        application.FullDomain = $"{sysSub}.{application.Prefix.ToLowerInvariant()}.morphus.one";
      }
      return;
    }

    var allGlobalApps = await applicationRepository.GetAllApplicationsIgnoreFiltersAsync();
    var otherCustomerApps = allGlobalApps
        .Where(a => a.Id != application.Id && !a.System && !string.Equals(a.Prefix, "KAL", StringComparison.OrdinalIgnoreCase))
        .ToList();

    var cleanName = (application.Name ?? string.Empty).Trim();
    var cleanPrefix = (application.Prefix ?? string.Empty).Trim().ToUpperInvariant();

    // Regra Global: Nunca uma app pode ter o mesmo nome e mesma sigla nem em clientes diferentes no ambiente compartilhado
    var sameNameAndPrefix = otherCustomerApps.Any(a =>
        string.Equals(a.Name?.Trim(), cleanName, StringComparison.OrdinalIgnoreCase) &&
        string.Equals(a.Prefix?.Trim(), cleanPrefix, StringComparison.OrdinalIgnoreCase));

    if (sameNameAndPrefix)
    {
      throw new InvalidOperationException($"Já existe uma aplicação com o nome '{cleanName}' e a sigla '{cleanPrefix}' no ecossistema Morphus. Escolha outro nome ou outra sigla.");
    }

    var usedFullDomains = otherCustomerApps
        .Where(a => !string.IsNullOrWhiteSpace(a.FullDomain))
        .Select(a => a.FullDomain!.Trim().ToLowerInvariant())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    usedFullDomains.Add("morphus.mpx.morphus.one");
    usedFullDomains.Add("seguranca.sec.morphus.one");
    usedFullDomains.Add("website.web.morphus.one");
    usedFullDomains.Add("kalupa.kal.morphus.one");

    var mode = string.IsNullOrWhiteSpace(application.DomainMode) ? "MorphusSuggested" : application.DomainMode.Trim();
    application.DomainMode = mode;

    var prefixLower = cleanPrefix.ToLowerInvariant();

    if ((string.Equals(mode, "CustomerOwned", StringComparison.OrdinalIgnoreCase) ||
         string.Equals(mode, "PurchasedWithMorphus", StringComparison.OrdinalIgnoreCase)) &&
        application.CorporationDomainId.HasValue &&
        application.CorporationDomainId.Value != Guid.Empty)
    {
      var corpDomains = await applicationRepository.GetCorporationDomainsAsync();
      var targetDomain = corpDomains.FirstOrDefault(d => d.Id == application.CorporationDomainId.Value)
          ?? throw new InvalidOperationException("Domínio da corporação selecionado não foi encontrado.");

      var sub = SanitizeDomainLabel(application.Subdomain);
      if (string.IsNullOrWhiteSpace(sub))
      {
        sub = ExtractCleanLowerWords(cleanName).FirstOrDefault() ?? prefixLower;
      }

      var candidateFull = $"{sub}.{targetDomain.DomainName.Trim().ToLowerInvariant()}";
      if (usedFullDomains.Contains(candidateFull))
      {
        throw new InvalidOperationException($"O endereço '{candidateFull}' já está sendo utilizado por outra aplicação. Escolha outro subdomínio.");
      }

      application.Subdomain = sub;
      application.FullDomain = candidateFull;
      return;
    }

    // Modo MorphusSuggested (.morphus.one)
    application.CorporationDomainId = null;
    var requestedSub = SanitizeDomainLabel(application.Subdomain);
    if (string.IsNullOrWhiteSpace(requestedSub))
    {
      requestedSub = ExtractCleanLowerWords(cleanName).FirstOrDefault() ?? "app";
    }

    if (string.Equals(mode, "MorphusSuggested", StringComparison.OrdinalIgnoreCase) &&
        ReservedMorphusSubdomains.Contains(requestedSub))
    {
      throw new InvalidOperationException($"O subdomínio '{requestedSub}' é reservado para aplicações oficiais do ecossistema Morphus.");
    }

    var morphusFullDomain = $"{requestedSub}.{prefixLower}.morphus.one";
    if (usedFullDomains.Contains(morphusFullDomain))
    {
      throw new InvalidOperationException($"O domínio '{morphusFullDomain}' já está sendo utilizado. Escolha outro prefixo de domínio ou altere a sigla.");
    }

    application.Subdomain = requestedSub;
    application.FullDomain = morphusFullDomain;
  }

  private static List<string> ExtractCleanLowerWords(string? text)
  {
    if (string.IsNullOrWhiteSpace(text))
      return [];

    return RemoveDiacritics(text)
        .ToLowerInvariant()
        .Split([' ', '-', '_', '.', '/'], StringSplitOptions.RemoveEmptyEntries)
        .Select(SanitizeDomainLabel)
        .Where(w => !string.IsNullOrWhiteSpace(w))
        .ToList();
  }

  private static string SanitizeDomainLabel(string? raw)
  {
    if (string.IsNullOrWhiteSpace(raw))
      return string.Empty;

    var clean = RemoveDiacritics(raw).ToLowerInvariant();
    var chars = clean.Where(c => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-').ToArray();
    return new string(chars).Trim('-');
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


