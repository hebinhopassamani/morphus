using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;

namespace Mpx.Application.Handlers;

public class SecurityHandler(
    IUserRepository userRepository,
    ICorporationRepository corporationRepository,
    IWorkspaceRepository workspaceRepository,
    IWorkspaceUserRepository workspaceUserRepository,
    IWorkspaceApplicationRepository workspaceApplicationRepository,
    IApplicationUserRepository applicationUserRepository,
    EmailHandler emailHandler,
    IUnitOfWork unitOfWork,
    IConfiguration configuration)
{
  private static readonly HttpClient GoogleHttpClient = new();

  private sealed class GoogleUserInfoResponse
  {
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("email_verified")]
    public bool EmailVerified { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("picture")]
    public string? Picture { get; set; }
  }

  public async Task<MorphusSession?> LoginWithGoogleAsync(GoogleLoginRequest request)
  {
    GoogleUserInfoResponse? googleUser = null;

    if (!string.IsNullOrWhiteSpace(request.AccessToken))
    {
      using var httpRequest = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
      httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", request.AccessToken);

      using var response = await GoogleHttpClient.SendAsync(httpRequest);
      if (!response.IsSuccessStatusCode)
        return null;

      googleUser = await response.Content.ReadFromJsonAsync<GoogleUserInfoResponse>();
    }
    else if (!string.IsNullOrWhiteSpace(request.IdToken))
    {
      using var response = await GoogleHttpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(request.IdToken)}");
      if (!response.IsSuccessStatusCode)
        return null;

      googleUser = await response.Content.ReadFromJsonAsync<GoogleUserInfoResponse>();
    }

    if (googleUser is null || string.IsNullOrWhiteSpace(googleUser.Email))
      return null;

    var email = googleUser.Email.Trim().ToLowerInvariant();
    var user = await userRepository.GetByLoginAsync(email);
    if (user is null)
    {
      var displayName = !string.IsNullOrWhiteSpace(googleUser.Name)
          ? googleUser.Name.Trim()
          : email.Split('@')[0];

      var newUser = new User
      {
        Id = Guid.NewGuid(),
        Name = displayName,
        Email = email,
        PasswordHash = MorphusSecurity.HashPassword(MorphusSecurity.GenerateSecureToken()),
        Picture = googleUser.Picture,
        EmailConfirmed = true,
        TermsConfirmed = true,
        OnboardingCompleted = false,
        System = true,
        Inactive = false,
        CorporationId = null,
        UserStatusId = null
      };

      await userRepository.AddAsync(newUser);
      await unitOfWork.SaveChangesAsync();

      user = await userRepository.GetByLoginAsync(email);
      if (user is null)
        return null;
    }

    if (!string.IsNullOrWhiteSpace(googleUser.Picture) && user.Picture != googleUser.Picture)
    {
      user.Picture = googleUser.Picture;
    }

    if (googleUser.EmailVerified && !user.EmailConfirmed)
    {
      user.EmailConfirmed = true;
    }

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    Corporation? selectedCorporation = null;

    if (activeCorporationUsers.Count > 0)
    {
      if (request.CorporationId is not null && request.CorporationId != Guid.Empty)
      {
        selectedCorporation = activeCorporationUsers
            .FirstOrDefault(cu => cu.CorporationId == request.CorporationId)?.Corporation;
      }

      selectedCorporation ??= activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
          ?? activeCorporationUsers[0].Corporation;
    }
    else if (user.OnboardingCompleted)
    {
      return null;
    }

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> LoginAsync(LoginRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
      return null;

    var user = await userRepository.GetByLoginAsync(request.Email);
    if (user is null || string.IsNullOrWhiteSpace(user.PasswordHash))
      return null;

    if (!MorphusSecurity.VerifyPassword(request.Password, user.PasswordHash))
      return null;

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    Corporation? selectedCorporation = null;

    if (activeCorporationUsers.Count > 0)
    {
      if (request.CorporationId is not null && request.CorporationId != Guid.Empty)
      {
        selectedCorporation = activeCorporationUsers
            .FirstOrDefault(cu => cu.CorporationId == request.CorporationId)?.Corporation;
      }

      selectedCorporation ??= activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
          ?? activeCorporationUsers[0].Corporation;
    }
    else if (user.OnboardingCompleted)
    {
      return null;
    }

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> RefreshTokenAsync(RefreshTokenRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.RefreshToken))
      return null;

    var user = await userRepository.GetByRefreshTokenAsync(request.RefreshToken);
    if (user is null)
      return null;

    if (user.RefreshTokenExpiration is null || user.RefreshTokenExpiration < DateTime.UtcNow)
      return null;

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    Corporation? selectedCorporation = null;

    if (activeCorporationUsers.Count > 0)
    {
      if (request.CorporationId is not null && request.CorporationId != Guid.Empty)
      {
        selectedCorporation = activeCorporationUsers
            .FirstOrDefault(cu => cu.CorporationId == request.CorporationId)?.Corporation;
      }

      selectedCorporation ??= activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
          ?? activeCorporationUsers[0].Corporation;
    }
    else if (user.OnboardingCompleted)
    {
      return null;
    }

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> RefreshSessionOrSwitchCorporationAsync(Guid userId, Guid? targetCorporationId)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return null;

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    Corporation? selectedCorporation = null;

    if (activeCorporationUsers.Count > 0)
    {
      if (targetCorporationId is not null && targetCorporationId != Guid.Empty)
      {
        selectedCorporation = activeCorporationUsers
            .FirstOrDefault(cu => cu.CorporationId == targetCorporationId)?.Corporation;
      }

      selectedCorporation ??= activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
          ?? activeCorporationUsers[0].Corporation;
    }
    else if (user.OnboardingCompleted)
    {
      return null;
    }

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> CreateAccountAndLoginAsync(CreateAccountRequest request, string? frontendBaseUrl = null)
  {
    if (await userRepository.ExistsEmailAsync(request.AdminEmail))
    {
      throw new InvalidOperationException("Já existe um usuário cadastrado com este e-mail.");
    }

    var cleanEmail = request.AdminEmail.Trim().ToLowerInvariant();
    var baseUrl = string.IsNullOrWhiteSpace(frontendBaseUrl) ? "https://morphus.me" : frontendBaseUrl.TrimEnd('/');

    // Fluxo Novo: Cria apenas o User (com OnboardingCompleted = false e EmailConfirmed = false)
    // para validar o e-mail em tempo real e configurar Matriz, Workspace e Apps na tela de Onboarding
    if (string.IsNullOrWhiteSpace(request.CorporationName))
    {
      var initialName = string.IsNullOrWhiteSpace(request.AdminName)
          ? cleanEmail.Split('@')[0]
          : request.AdminName.Trim();

      var confirmToken = MorphusSecurity.GenerateSecureToken();

      var newUser = new User
      {
        Id = Guid.NewGuid(),
        Name = initialName,
        Email = cleanEmail,
        PasswordHash = MorphusSecurity.HashPassword(request.AdminPassword),
        PhoneNumber = request.PhoneNumber,
        SecurityStamp = confirmToken,
        Inactive = false,
        System = true,
        EmailConfirmed = false,
        TermsConfirmed = true,
        OnboardingCompleted = false,
        CorporationId = null,
        UserStatusId = null
      };

      await userRepository.AddAsync(newUser);
      await unitOfWork.SaveChangesAsync();

      try
      {
        var encodedEmail = Uri.EscapeDataString(cleanEmail);
        var encodedToken = Uri.EscapeDataString(confirmToken);
        var confirmLink = $"{baseUrl}/security/confirm-email?email={encodedEmail}&token={encodedToken}";

        await emailHandler
            .NewEmail()
            .Subject("Confirme seu e-mail - Morphus")
            .LoadHtmlFile("confirm-email")
            .SetVariable("{{Nome}}", initialName)
            .SetVariable("{{LinkConfirmacao}}", confirmLink)
            .MailTo(cleanEmail, initialName)
            .SendEmailAsync();
      }
      catch
      {
        // Não impede o login caso o servidor SMTP externo esteja temporariamente indisponível
      }

      return await LoginAsync(new LoginRequest
      {
        Email = cleanEmail,
        Password = request.AdminPassword
      });
    }

    using var transaction = await unitOfWork.BeginTransactionAsync();

    Corporation corporation;
    try
    {
      var seedResult = MorphusAccountSeed.CreateInitialAccountGraph(request);
      corporation = seedResult.Corporation;

      await corporationRepository.AddAsync(corporation);
      await transaction.Commit();
    }
    catch
    {
      await transaction.Rollback();
      throw;
    }

    try
    {
      await emailHandler
          .NewEmail(corporation.Id)
          .Subject("Bem-vindo ao Morphus")
          .LoadHtmlFile("welcome")
          .SetVariable("{{Nome}}", request.AdminName ?? cleanEmail)
          .SetVariable("{{Empresa}}", request.CorporationName)
          .MailTo(cleanEmail, request.AdminName ?? cleanEmail)
          .SendEmailAsync();
    }
    catch
    {
      // Não impede o login caso o servidor SMTP externo esteja temporariamente indisponível
    }

    return await LoginAsync(new LoginRequest
    {
      Email = cleanEmail,
      Password = request.AdminPassword,
      CorporationId = corporation.Id
    });
  }

  public async Task<OnboardingStateResponse?> GetOnboardingStateAsync(Guid userId)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return null;

    var state = new OnboardingStateResponse
    {
      UserId = user.Id,
      UserName = user.Name,
      UserNickName = user.NickName,
      UserEmail = user.Email,
      EmailConfirmed = user.EmailConfirmed,
      OnboardingCompleted = user.OnboardingCompleted
    };

    var corporationId = user.CorporationId
        ?? user.CorporationUsers.FirstOrDefault(cu => !cu.Inactive)?.CorporationId;

    if (corporationId is not null && corporationId != Guid.Empty)
    {
      var corpGraph = await corporationRepository.GetOnboardingGraphAsync(corporationId.Value);
      if (corpGraph is not null)
      {
        state.CorporationId = corpGraph.Id;
        state.CorporationName = corpGraph.Name;

        var workspace = corpGraph.Workspaces.FirstOrDefault(w => !w.Inactive);
        if (workspace is not null)
        {
          state.WorkspaceId = workspace.Id;
          state.WorkspaceName = workspace.Name;

          state.SelectedApplicationIds = corpGraph.WorkspaceApplications
              .Where(wa => wa.WorkspaceId == workspace.Id && !wa.Inactive)
              .Select(wa => wa.ApplicationId)
              .ToList();
        }

        state.AvailableApplications = corpGraph.Applications
            .Where(a => !a.Inactive &&
                        !string.Equals(a.Name, "Segurança", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(a.Name, "Website", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(a.Key, "SECURITY", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(a.Key, "WEBSITE", StringComparison.OrdinalIgnoreCase))
            .OrderBy(a => a.System ? 0 : 1)
            .ThenBy(a => a.Name)
            .Select(a => new MorphusApplication
            {
              Id = a.Id,
              CorporationId = a.CorporationId,
              Name = a.Name,
              Prefix = a.Prefix,
              Key = a.Key,
              Icon = a.Icon,
              Color = a.Color,
              Description = a.Description,
              AvailableForTrial = a.AvailableForTrial,
              System = a.System,
              Inactive = a.Inactive
            })
            .ToList();
      }
    }

    return state;
  }

  public async Task<MorphusSession?> SaveOnboardingCorporationStepAsync(
      Guid userId,
      OnboardingCorporationStepRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.CorporationName))
      throw new InvalidOperationException("Preencha o nome da matriz da sua empresa.");

    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return null;

    var cleanCorpName = request.CorporationName.Trim();
    var cleanUserName = !string.IsNullOrWhiteSpace(request.UserName)
        ? request.UserName.Trim()
        : (user.Name ?? string.Empty);

    if (!string.IsNullOrWhiteSpace(request.UserName))
    {
      user.Name = cleanUserName;
    }
    if (request.UserNickName is not null)
    {
      user.NickName = string.IsNullOrWhiteSpace(request.UserNickName) ? null : request.UserNickName.Trim();
    }

    var existingCorpId = user.CorporationId
        ?? user.CorporationUsers.FirstOrDefault(cu => !cu.Inactive)?.CorporationId;

    if (existingCorpId is null || existingCorpId == Guid.Empty)
    {
      using var transaction = await unitOfWork.BeginTransactionAsync();
      try
      {
        var (newCorporation, activeStatusId) = MorphusAccountSeed.CreateCorporationBaseForOnboarding(
            cleanCorpName,
            user.Email ?? string.Empty,
            user.Id);

        await corporationRepository.AddAsync(newCorporation);

        user.CorporationId = newCorporation.Id;
        user.UserStatusId = activeStatusId;
        userRepository.Update(user);

        await transaction.Commit();

        try
        {
          if (!string.IsNullOrWhiteSpace(user.Email))
          {
            await emailHandler
                .NewEmail(newCorporation.Id)
                .Subject("Bem-vindo ao Morphus")
                .LoadHtmlFile("welcome")
                .SetVariable("{{Nome}}", cleanUserName)
                .SetVariable("{{Empresa}}", cleanCorpName)
                .MailTo(user.Email, cleanUserName)
                .SendEmailAsync();
          }
        }
        catch
        {
          // Ignora falha de SMTP externo durante o onboarding
        }
      }
      catch
      {
        await transaction.Rollback();
        throw;
      }
    }
    else
    {
      var corpGraph = await corporationRepository.GetOnboardingGraphAsync(existingCorpId.Value);
      if (corpGraph is not null)
      {
        corpGraph.Name = cleanCorpName;
        corpGraph.FullName = cleanCorpName;
        if (string.IsNullOrWhiteSpace(corpGraph.Key))
        {
          corpGraph.Key = MorphusEntity.GenerateKey();
        }
        corporationRepository.Update(corpGraph);
      }

      userRepository.Update(user);
      await unitOfWork.SaveChangesAsync();
    }

    var refreshedUser = await userRepository.GetByIdWithAccessAsync(userId);
    if (refreshedUser is null)
      return null;

    var activeCorporationUsers = refreshedUser.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    var selectedCorporation = activeCorporationUsers
        .FirstOrDefault(cu => cu.CorporationId == refreshedUser.CorporationId)?.Corporation
        ?? activeCorporationUsers.FirstOrDefault()?.Corporation;

    var session = BuildAuthorizedSession(refreshedUser, selectedCorporation, activeCorporationUsers);
    userRepository.Update(refreshedUser);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<OnboardingStateResponse?> SaveOnboardingWorkspaceStepAsync(
      Guid userId,
      OnboardingWorkspaceStepRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.WorkspaceName))
      throw new InvalidOperationException("Informe o nome do seu Workspace.");

    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return null;

    var corporationId = user.CorporationId
        ?? user.CorporationUsers.FirstOrDefault(cu => !cu.Inactive)?.CorporationId;

    if (corporationId is null || corporationId == Guid.Empty)
      throw new InvalidOperationException("Configure os dados da Matriz antes de criar o Workspace.");

    var corpGraph = await corporationRepository.GetOnboardingGraphAsync(corporationId.Value)
        ?? throw new InvalidOperationException("Corporação não encontrada.");

    var cleanWorkspaceName = request.WorkspaceName.Trim();

    var existingWorkspace = corpGraph.Workspaces.FirstOrDefault(w => !w.Inactive);
    if (existingWorkspace is null)
    {
      var newWorkspace = new Workspace
      {
        Id = Guid.NewGuid(),
        CorporationId = corpGraph.Id,
        Name = cleanWorkspaceName,
        Icon = "layout-grid",
        Color = "violet",
        Default = true,
        System = true,
        Inactive = false,
        Description = "Workspace principal"
      };

      await workspaceRepository.AddAsync(newWorkspace);

      await workspaceUserRepository.AddRelationshipAsync(new WorkspaceUser
      {
        CorporationId = corpGraph.Id,
        WorkspaceId = newWorkspace.Id,
        UserId = user.Id,
        IsOwner = true,
        Inactive = false,
        System = true
      });

      // Vincula as aplicações nativas do sistema (MORPHUS, SECURITY, WEBSITE) ao Workspace criado
      var defaultTrialDays = int.TryParse(configuration["TrialSettings:DefaultDays"], out var parsedDays) && parsedDays > 0
          ? parsedDays
          : 14;

      foreach (var sysApp in corpGraph.Applications.Where(a => a.System))
      {
        await workspaceApplicationRepository.AddRelationshipAsync(new WorkspaceApplication
        {
          CorporationId = corpGraph.Id,
          WorkspaceId = newWorkspace.Id,
          ApplicationId = sysApp.Id,
          TrialStartDate = null,
          TrialDays = null,
          TrialUsed = false,
          Inactive = false,
          System = true
        });
      }
    }
    else
    {
      existingWorkspace.Name = cleanWorkspaceName;
      if (string.IsNullOrWhiteSpace(existingWorkspace.Key))
      {
        existingWorkspace.Key = MorphusEntity.GenerateKey();
      }
      workspaceRepository.Update(existingWorkspace);
    }

    await unitOfWork.SaveChangesAsync();

    return await GetOnboardingStateAsync(userId);
  }

  public async Task<MorphusSession?> CompleteOnboardingAsync(
      Guid userId,
      OnboardingCompleteRequest request)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return null;

    var corporationId = user.CorporationId
        ?? user.CorporationUsers.FirstOrDefault(cu => !cu.Inactive)?.CorporationId;

    if (corporationId is null || corporationId == Guid.Empty)
      throw new InvalidOperationException("Configure a Matriz antes de concluir.");

    var corpGraph = await corporationRepository.GetOnboardingGraphAsync(corporationId.Value)
        ?? throw new InvalidOperationException("Corporação não encontrada.");

    var workspace = corpGraph.Workspaces.FirstOrDefault(w => !w.Inactive)
        ?? throw new InvalidOperationException("Configure o seu Workspace antes de concluir.");

    var requestedIds = (request.ApplicationIds ?? []).ToHashSet();
    var defaultTrialDays = int.TryParse(configuration["TrialSettings:DefaultDays"], out var parsedDays) && parsedDays > 0
        ? parsedDays
        : 14;

    // Garante que as aplicações nativas (System = true) estejam sempre vinculadas,
    // e vincula também as aplicações opcionais selecionadas pelo usuário para teste
    var hasDefaultAppAssigned = corpGraph.WorkspaceApplications
        .Any(wa => wa.WorkspaceId == workspace.Id && !wa.Inactive && wa.Default);

    foreach (var app in corpGraph.Applications.Where(a => !a.Inactive))
    {
      var shouldBeLinked = app.System || requestedIds.Contains(app.Id);
      var existingWa = corpGraph.WorkspaceApplications
          .FirstOrDefault(wa => wa.WorkspaceId == workspace.Id && wa.ApplicationId == app.Id);

      if (shouldBeLinked)
      {
        var isTrialApp = !app.System;
        var markAsDefault = isTrialApp && !hasDefaultAppAssigned;
        if (markAsDefault)
        {
          hasDefaultAppAssigned = true;
          app.Default = true;
        }

        if (existingWa is null)
        {
          await workspaceApplicationRepository.AddRelationshipAsync(new WorkspaceApplication
          {
            CorporationId = corpGraph.Id,
            WorkspaceId = workspace.Id,
            ApplicationId = app.Id,
            Default = markAsDefault,
            TrialStartDate = isTrialApp ? DateTime.UtcNow : null,
            TrialDays = isTrialApp ? defaultTrialDays : null,
            TrialUsed = isTrialApp,
            Inactive = false,
            System = app.System
          });
        }
        else
        {
          var updatedWa = false;
          if (markAsDefault && !existingWa.Default)
          {
            existingWa.Default = true;
            updatedWa = true;
          }
          if (existingWa.Inactive)
          {
            existingWa.Inactive = false;
            updatedWa = true;
          }
          if (isTrialApp && existingWa.TrialStartDate is null)
          {
            existingWa.TrialStartDate = DateTime.UtcNow;
            existingWa.TrialDays ??= defaultTrialDays;
            updatedWa = true;
          }
          if (isTrialApp && !existingWa.TrialUsed)
          {
            existingWa.TrialUsed = true;
            updatedWa = true;
          }
          if (updatedWa)
          {
            workspaceApplicationRepository.Update(existingWa);
          }
        }

        var existingAu = corpGraph.ApplicationUsers
            .FirstOrDefault(au => au.ApplicationId == app.Id && au.UserId == user.Id);

        if (existingAu is null)
        {
          await applicationUserRepository.AddRelationshipAsync(new ApplicationUser
          {
            CorporationId = corpGraph.Id,
            WorkspaceId = workspace.Id,
            ApplicationId = app.Id,
            UserId = user.Id,
            Color = app.Color,
            IsOwner = true,
            Inactive = false,
            System = app.System
          });
        }
        else if (existingAu.Inactive)
        {
          existingAu.Inactive = false;
          applicationUserRepository.Update(existingAu);
        }
      }
      else if (existingWa is not null && !existingWa.System)
      {
        if (existingWa.TrialUsed || existingWa.TrialStartDate is not null)
        {
          existingWa.Inactive = true;
          existingWa.TrialUsed = true;
          workspaceApplicationRepository.Update(existingWa);
        }
        else
        {
          workspaceApplicationRepository.RemoveRelationship(existingWa);
        }
      }
    }

    user.OnboardingCompleted = true;
    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    var refreshedUser = await userRepository.GetByIdWithAccessAsync(userId);
    if (refreshedUser is null)
      return null;

    var activeCorporationUsers = refreshedUser.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    var selectedCorporation = activeCorporationUsers
        .FirstOrDefault(cu => cu.CorporationId == refreshedUser.CorporationId)?.Corporation
        ?? activeCorporationUsers.FirstOrDefault()?.Corporation;

    var session = BuildAuthorizedSession(refreshedUser, selectedCorporation, activeCorporationUsers);
    userRepository.Update(refreshedUser);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task RequestPasswordResetAsync(ForgotPasswordRequest request, string frontendBaseUrl)
  {
    if (string.IsNullOrWhiteSpace(request.Email))
      return;

    var user = await userRepository.GetByLoginAsync(request.Email);
    if (user is null || string.IsNullOrWhiteSpace(user.Email) || user.CorporationId is null)
      return;

    var resetToken = MorphusSecurity.GenerateSecureToken();
    user.SecurityStamp = resetToken;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    var encodedEmail = Uri.EscapeDataString(user.Email);
    var encodedToken = Uri.EscapeDataString(resetToken);
    var resetLink = $"{frontendBaseUrl.TrimEnd('/')}/security/reset-password?email={encodedEmail}&token={encodedToken}";

    await emailHandler
        .NewEmail(user.CorporationId.Value)
        .Subject("Recuperação de Senha - Morphus")
        .LoadHtmlFile("password-reset")
        .SetVariable("{{Nome}}", user.Name ?? user.Email)
        .SetVariable("{{LinkRecuperacao}}", resetLink)
        .MailTo(user.Email, user.Name)
        .SendEmailAsync();
  }

  public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Token) ||
        string.IsNullOrWhiteSpace(request.NewPassword))
    {
      return false;
    }

    var user = await userRepository.GetByLoginAsync(request.Email);
    if (user is null || string.IsNullOrWhiteSpace(user.SecurityStamp))
      return false;

    var expectedBytes = Encoding.UTF8.GetBytes(user.SecurityStamp);
    var providedBytes = Encoding.UTF8.GetBytes(request.Token);

    if (!CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes))
      return false;

    user.PasswordHash = MorphusSecurity.HashPassword(request.NewPassword);
    user.SecurityStamp = MorphusSecurity.GenerateSecureToken();
    user.RefreshToken = null;
    user.RefreshTokenExpiration = null;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();
    return true;
  }

  public async Task<bool> ConfirmEmailAsync(ConfirmEmailRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token))
      return false;

    var user = await userRepository.GetByLoginAsync(request.Email.Trim());
    if (user is null)
      return false;

    if (user.EmailConfirmed)
      return true;

    if (string.IsNullOrWhiteSpace(user.SecurityStamp))
      return false;

    var expectedBytes = Encoding.UTF8.GetBytes(user.SecurityStamp);
    var providedBytes = Encoding.UTF8.GetBytes(request.Token);

    if (!CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes))
      return false;

    user.EmailConfirmed = true;
    user.SecurityStamp = MorphusSecurity.GenerateSecureToken();

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();
    return true;
  }

  public async Task<bool> ResendConfirmationEmailAsync(Guid userId, string frontendBaseUrl)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null || string.IsNullOrWhiteSpace(user.Email) || user.EmailConfirmed)
      return false;

    var confirmToken = MorphusSecurity.GenerateSecureToken();
    user.SecurityStamp = confirmToken;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    var encodedEmail = Uri.EscapeDataString(user.Email);
    var encodedToken = Uri.EscapeDataString(confirmToken);
    var baseUrl = string.IsNullOrWhiteSpace(frontendBaseUrl) ? "https://morphus.me" : frontendBaseUrl.TrimEnd('/');
    var confirmLink = $"{baseUrl}/security/confirm-email?email={encodedEmail}&token={encodedToken}";

    await emailHandler
        .NewEmail(user.CorporationId)
        .Subject("Confirme seu e-mail - Morphus")
        .LoadHtmlFile("confirm-email")
        .SetVariable("{{Nome}}", user.Name ?? user.Email)
        .SetVariable("{{LinkConfirmacao}}", confirmLink)
        .MailTo(user.Email, user.Name)
        .SendEmailAsync();

    return true;
  }

  public async Task<bool> RevokeAsync(Guid userId)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return false;

    user.RefreshToken = null;
    user.RefreshTokenExpiration = null;
    user.SecurityStamp = null;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();
    return true;
  }

  public async Task<User?> UpdateProfileAsync(Guid userId, UpdateUserProfileRequest request)
  {
    var user = await userRepository.GetByIdAsync(userId);
    if (user is null)
      return null;

    if (!string.IsNullOrWhiteSpace(request.Name))
    {
      user.Name = request.Name.Trim();
    }

    if (request.NickName is not null)
    {
      user.NickName = string.IsNullOrWhiteSpace(request.NickName) ? null : request.NickName.Trim();
    }

    if (request.PhoneNumber is not null)
    {
      user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
    }

    if (request.Website is not null)
    {
      user.Website = string.IsNullOrWhiteSpace(request.Website) ? null : request.Website.Trim();
    }

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return new User
    {
      Id = user.Id,
      Name = user.Name,
      NickName = user.NickName,
      Email = user.Email,
      Inactive = user.Inactive,
      EmailConfirmed = user.EmailConfirmed,
      PhoneConfirmed = user.PhoneConfirmed,
      TermsConfirmed = user.TermsConfirmed,
      OnboardingCompleted = user.OnboardingCompleted,
      System = user.System,
      UserStatusId = user.UserStatusId,
      CorporationId = user.CorporationId,
      Picture = user.Picture,
      PhoneNumber = user.PhoneNumber,
      Website = user.Website,
      Gender = user.Gender,
      Birthdate = user.Birthdate
    };
  }

  private MorphusSession BuildAuthorizedSession(
      User user,
      Corporation? activeCorporation,
      List<CorporationUser> activeCorporationUsers)
  {
    var nowUtc = DateTime.UtcNow;

    var accessTokenMinutes = int.TryParse(configuration["JWT:AccessTokenExpires"], out var atm) ? atm : 60;
    var refreshTokenMinutes = int.TryParse(configuration["JWT:RefreshTokenExpires"], out var rtm) ? rtm : 1440;

    var accessExpiresUtc = nowUtc.AddMinutes(accessTokenMinutes);
    var refreshExpiresUtc = nowUtc.AddMinutes(refreshTokenMinutes);

    var claims = BuildClaims(user, activeCorporation);
    var jwtString = GenerateJwtToken(claims, nowUtc, accessExpiresUtc);

    var newRefreshToken = MorphusSecurity.GenerateSecureToken();
    user.RefreshToken = newRefreshToken;
    user.RefreshTokenExpiration = refreshExpiresUtc;
    if (user.EmailConfirmed || string.IsNullOrWhiteSpace(user.SecurityStamp))
    {
      user.SecurityStamp = MorphusSecurity.GenerateSecureToken();
    }

    return new MorphusSession
    {
      User = new User
      {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Inactive = user.Inactive,
        EmailConfirmed = user.EmailConfirmed,
        PhoneConfirmed = user.PhoneConfirmed,
        TermsConfirmed = user.TermsConfirmed,
        OnboardingCompleted = user.OnboardingCompleted,
        System = user.System,
        UserStatusId = user.UserStatusId,
        CorporationId = user.CorporationId,
        NickName = user.NickName,
        Picture = user.Picture,
        PhoneNumber = user.PhoneNumber,
        Website = user.Website,
        Gender = user.Gender,
        Birthdate = user.Birthdate
      },
      Corporation = activeCorporation is null ? null : new Corporation
      {
        Id = activeCorporation.Id,
        Name = activeCorporation.Name,
        FullName = activeCorporation.FullName,
        Icon = activeCorporation.Icon,
        Key = activeCorporation.Key,
        Email = activeCorporation.Email,
        System = activeCorporation.System,
        CorporationId = activeCorporation.CorporationId,
        Description = activeCorporation.Description
      },
      AccessToken = new AccessTokenInfo
      {
        Value = jwtString,
        CreationDate = nowUtc,
        ExpirationDate = accessExpiresUtc,
        ExpirationTime = new DateTimeOffset(accessExpiresUtc).ToUnixTimeSeconds()
      },
      RefreshToken = new RefreshTokenInfo
      {
        Value = newRefreshToken,
        CreationDate = nowUtc,
        ExpirationDate = refreshExpiresUtc,
        ExpirationTime = new DateTimeOffset(refreshExpiresUtc).ToUnixTimeSeconds()
      },
      AvailableCorporations = (user.CorporationUsers.Count > 0 ? user.CorporationUsers : activeCorporationUsers)
          .Where(cu => cu.Corporation is not null && !cu.Corporation.Inactive)
          .Select(cu => new CorporationSummary
          {
            Id = cu.Corporation!.Id,
            Name = cu.Corporation.Name,
            Key = cu.Corporation.Key,
            Icon = cu.Corporation.Icon,
            Color = !string.IsNullOrWhiteSpace(cu.Color) ? cu.Color : cu.Corporation.Color,
            Description = cu.Corporation.Description,
            ParentCorporationId = cu.Corporation.CorporationId,
            IsOwner = cu.IsOwner,
            Favorite = cu.Favorite,
            Inactive = cu.Inactive,
            Roles = user.UserRoles
                .Where(ur => !ur.Inactive && ur.CorporationId == cu.Corporation.Id && ur.Role is not null && !string.IsNullOrWhiteSpace(ur.Role.Name))
                .Select(ur => ur.Role!.Name.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList()
          })
          .ToList()
    };
  }

  private string GenerateJwtToken(
      IEnumerable<System.Security.Claims.Claim> claims,
      DateTime createdAtUtc,
      DateTime expiresAtUtc)
  {
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? configuration["JWT:SecretKey"]
        ?? throw new InvalidOperationException("Chave secreta JWT não configurada.");

    var keyBytes = Encoding.UTF8.GetBytes(secretKey);
    var signingCredentials = new SigningCredentials(
        new SymmetricSecurityKey(keyBytes),
        SecurityAlgorithms.HmacSha256Signature);

    var descriptor = new SecurityTokenDescriptor
    {
      Subject = new ClaimsIdentity(claims),
      NotBefore = createdAtUtc,
      Expires = expiresAtUtc,
      Issuer = configuration["JWT:ValidIssuer"] ?? "https://morphus.me",
      Audience = configuration["JWT:ValidAudience"] ?? "https://morphus.me",
      SigningCredentials = signingCredentials
    };

    var tokenHandler = new JsonWebTokenHandler();
    return tokenHandler.CreateToken(descriptor);
  }

  private static List<System.Security.Claims.Claim> BuildClaims(User user, Corporation? activeCorporation)
  {
    var authClaims = new List<System.Security.Claims.Claim>
    {
      new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
      new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
      new(ClaimTypes.NameIdentifier, user.Id.ToString())
    };

    if (!string.IsNullOrWhiteSpace(user.Email))
      authClaims.Add(new(ClaimTypes.Email, user.Email));

    if (!string.IsNullOrWhiteSpace(user.Name))
      authClaims.Add(new(ClaimTypes.Name, user.Name));

    if (activeCorporation is null)
      return authClaims;

    authClaims.Add(new("corporation_id", activeCorporation.Id.ToString()));

    // 1. Claims atribuídas diretamente ao usuário na Corporação/Filial ativa
    foreach (var uc in user.UserClaims.Where(uc => !uc.Inactive && uc.CorporationId == activeCorporation.Id))
    {
      if (uc.Claim is not null && !string.IsNullOrWhiteSpace(uc.Claim.ClaimType) && !string.IsNullOrWhiteSpace(uc.Claim.ClaimValue))
      {
        if (!authClaims.Any(c => c.Type == uc.Claim.ClaimType && c.Value == uc.Claim.ClaimValue))
        {
          authClaims.Add(new(uc.Claim.ClaimType, uc.Claim.ClaimValue));
        }
      }
    }

    // 2. Roles e Claims herdadas dos Perfis (Roles) na Corporação/Filial ativa
    foreach (var ur in user.UserRoles.Where(ur => !ur.Inactive && ur.CorporationId == activeCorporation.Id))
    {
      if (ur.Role is not null && !string.IsNullOrWhiteSpace(ur.Role.Name))
      {
        var roleName = ur.Role.Name.Trim().ToUpperInvariant();
        if (!authClaims.Any(c => c.Type == ClaimTypes.Role && c.Value == roleName))
        {
          authClaims.Add(new(ClaimTypes.Role, roleName));
        }

        foreach (var rc in ur.Role.RoleClaims.Where(rc => !rc.Inactive && rc.CorporationId == activeCorporation.Id))
        {
          if (rc.Claim is not null && !string.IsNullOrWhiteSpace(rc.Claim.ClaimType) && !string.IsNullOrWhiteSpace(rc.Claim.ClaimValue))
          {
            if (!authClaims.Any(c => c.Type == rc.Claim.ClaimType && c.Value == rc.Claim.ClaimValue))
            {
              authClaims.Add(new(rc.Claim.ClaimType, rc.Claim.ClaimValue));
            }
          }
        }
      }
    }

    return authClaims;
  }
}
