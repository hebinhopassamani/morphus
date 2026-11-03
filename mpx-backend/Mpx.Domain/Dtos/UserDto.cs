using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class UserReflectedDto<TDto> : MorphusDto<User, TDto>
    where TDto : UserReflectedDto<TDto>, new()
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneConfirmed { get; set; }
    public bool TermsConfirmed { get; set; }
    public bool OnboardingCompleted { get; set; }
    public Guid? UserStatusId { get; set; }
    public string? NickName { get; set; }
    public string? Picture { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Website { get; set; }
    public string? Gender { get; set; }
    public DateTime? Birthdate { get; set; }

    protected override Expression<Func<User, TDto>> BaseProjection => u => new TDto
    {
        Id = u.Id,
        Key = u.Key,
        System = u.System,
        Inactive = u.Inactive,
        CorporationId = u.CorporationId,
        Name = u.Name,
        Email = u.Email,
        EmailConfirmed = u.EmailConfirmed,
        PhoneConfirmed = u.PhoneConfirmed,
        TermsConfirmed = u.TermsConfirmed,
        OnboardingCompleted = u.OnboardingCompleted,
        UserStatusId = u.UserStatusId,
        NickName = u.NickName,
        Picture = u.Picture,
        PhoneNumber = u.PhoneNumber,
        Website = u.Website,
        Gender = u.Gender,
        Birthdate = u.Birthdate
    };
}

public class UserReflectedDto : UserReflectedDto<UserReflectedDto>;

public class UserDto : UserReflectedDto<UserDto>
{
    public CorporationReflectedDto? Corporation { get; set; }
    public UserStatusReflectedDto? UserStatus { get; set; }
    public List<CorporationReflectedDto>? Corporations { get; set; }
    public List<WorkspaceReflectedDto>? Workspaces { get; set; }
    public List<ApplicationReflectedDto>? Applications { get; set; }
    public List<RoleReflectedDto>? Roles { get; set; }
    public List<ClaimReflectedDto>? Claims { get; set; }

    public UserDto WithCorporation()
    {
        Include(
            dto => dto.Corporation,
            u => u.Corporation == null
                ? null
                : new CorporationReflectedDto
                {
                    Id = u.Corporation.Id,
                    Key = u.Corporation.Key,
                    System = u.Corporation.System,
                    Inactive = u.Corporation.Inactive,
                    CorporationId = u.Corporation.CorporationId,
                    Name = u.Corporation.Name,
                    Email = u.Corporation.Email,
                    PersonType = u.Corporation.PersonType,
                    CpfCnpj = u.Corporation.CpfCnpj,
                    FullName = u.Corporation.FullName,
                    Icon = u.Corporation.Icon,
                    Description = u.Corporation.Description
                });

        return this;
    }

    public UserDto WithUserStatus()
    {
        Include(
            dto => dto.UserStatus,
            u => u.UserStatus == null
                ? null
                : new UserStatusReflectedDto
                {
                    Id = u.UserStatus.Id,
                    Key = u.UserStatus.Key,
                    System = u.UserStatus.System,
                    Inactive = u.UserStatus.Inactive,
                    CorporationId = u.UserStatus.CorporationId,
                    Name = u.UserStatus.Name,
                    Label = u.UserStatus.Label,
                    Description = u.UserStatus.Description
                });

        return this;
    }

    public UserDto WithCorporations()
    {
        Include(
            dto => dto.Corporations,
            u => u.CorporationUsers
                .Where(cu => !cu.Inactive && cu.Corporation != null && !cu.Corporation.Inactive)
                .Select(cu => new CorporationReflectedDto
                {
                    Id = cu.Corporation!.Id,
                    Key = cu.Corporation.Key,
                    System = cu.Corporation.System,
                    Inactive = cu.Corporation.Inactive,
                    CorporationId = cu.Corporation.CorporationId,
                    Name = cu.Corporation.Name,
                    Email = cu.Corporation.Email,
                    PersonType = cu.Corporation.PersonType,
                    CpfCnpj = cu.Corporation.CpfCnpj,
                    FullName = cu.Corporation.FullName,
                    Icon = cu.Corporation.Icon,
                    Description = cu.Corporation.Description
                })
                .ToList());

        return this;
    }

    public UserDto WithWorkspaces()
    {
        Include(
            dto => dto.Workspaces,
            u => u.WorkspaceUsers
                .Where(wu => !wu.Inactive && wu.Workspace != null && !wu.Workspace.Inactive)
                .Select(wu => new WorkspaceReflectedDto
                {
                    Id = wu.Workspace!.Id,
                    Key = wu.Workspace.Key,
                    System = wu.Workspace.System,
                    Inactive = wu.Workspace.Inactive,
                    CorporationId = wu.Workspace.CorporationId,
                    Name = wu.Workspace.Name,
                    Description = wu.Workspace.Description,
                    Icon = wu.Workspace.Icon,
                    Default = wu.Workspace.Default
                })
                .ToList());

        return this;
    }

    public UserDto WithApplications()
    {
        Include(
            dto => dto.Applications,
            u => u.ApplicationUsers
                .Where(au => !au.Inactive && au.Application != null && !au.Application.Inactive)
                .Select(au => new ApplicationReflectedDto
                {
                    Id = au.Application!.Id,
                    Key = au.Application.Key,
                    System = au.Application.System,
                    Inactive = au.Application.Inactive,
                    CorporationId = au.Application.CorporationId,
                    Name = au.Application.Name,
                    Description = au.Application.Description,
                    Icon = au.Application.Icon
                })
                .ToList());

        return this;
    }

    public UserDto WithRoles()
    {
        Include(
            dto => dto.Roles,
            u => u.UserRoles
                .Where(ur => !ur.Inactive && ur.Role != null && !ur.Role.Inactive)
                .Select(ur => new RoleReflectedDto
                {
                    Id = ur.Role!.Id,
                    Key = ur.Role.Key,
                    System = ur.Role.System,
                    Inactive = ur.Role.Inactive,
                    CorporationId = ur.Role.CorporationId,
                    ModuleId = ur.Role.ModuleId,
                    SubModuleId = ur.Role.SubModuleId,
                    Name = ur.Role.Name,
                    Description = ur.Role.Description
                })
                .ToList());

        return this;
    }

    public UserDto WithClaims()
    {
        Include(
            dto => dto.Claims,
            u => u.UserClaims
                .Where(uc => !uc.Inactive && uc.Claim != null && !uc.Claim.Inactive)
                .Select(uc => new ClaimReflectedDto
                {
                    Id = uc.Claim!.Id,
                    Key = uc.Claim.Key,
                    System = uc.Claim.System,
                    Inactive = uc.Claim.Inactive,
                    CorporationId = uc.Claim.CorporationId,
                    ModuleId = uc.Claim.ModuleId,
                    SubModuleId = uc.Claim.SubModuleId,
                    ClaimType = uc.Claim.ClaimType,
                    ClaimValue = uc.Claim.ClaimValue,
                    Description = uc.Claim.Description
                })
                .ToList());

        return this;
    }
}
