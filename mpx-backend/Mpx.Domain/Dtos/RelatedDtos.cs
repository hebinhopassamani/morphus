namespace Mpx.Domain.Dtos;

public abstract class MorphusRelatedDto
{
    public Guid CorporationId { get; set; }
    public bool System { get; set; }
    public bool Inactive { get; set; }
}

public class CorporationUserDto : MorphusRelatedDto
{
    public Guid UserId { get; set; }
    public bool IsOwner { get; set; }
    public CorporationReflectedDto? Corporation { get; set; }
    public UserReflectedDto? User { get; set; }
}

public class WorkspaceUserDto : MorphusRelatedDto
{
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public bool IsOwner { get; set; }
    public WorkspaceReflectedDto? Workspace { get; set; }
    public UserReflectedDto? User { get; set; }
}

public class WorkspaceApplicationDto : MorphusRelatedDto
{
    public Guid WorkspaceId { get; set; }
    public Guid ApplicationId { get; set; }
    public WorkspaceReflectedDto? Workspace { get; set; }
    public ApplicationReflectedDto? Application { get; set; }
}

public class ApplicationUserDto : MorphusRelatedDto
{
    public Guid ApplicationId { get; set; }
    public Guid UserId { get; set; }
    public bool IsOwner { get; set; }
    public ApplicationReflectedDto? Application { get; set; }
    public UserReflectedDto? User { get; set; }
}

public class UserRoleDto : MorphusRelatedDto
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public UserReflectedDto? User { get; set; }
    public RoleReflectedDto? Role { get; set; }
}

public class UserClaimDto : MorphusRelatedDto
{
    public Guid UserId { get; set; }
    public Guid ClaimId { get; set; }
    public UserReflectedDto? User { get; set; }
    public ClaimReflectedDto? Claim { get; set; }
}

public class RoleClaimDto : MorphusRelatedDto
{
    public Guid RoleId { get; set; }
    public Guid ClaimId { get; set; }
    public RoleReflectedDto? Role { get; set; }
    public ClaimReflectedDto? Claim { get; set; }
}
