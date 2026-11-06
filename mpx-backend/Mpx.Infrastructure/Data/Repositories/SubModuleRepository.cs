using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class SubModuleRepository(MorphusDbContext context) : MorphusRepository<SubModule>(context), ISubModuleRepository
{
  public async Task<List<SubModule>> GetListAsync()
  {
    return await _context.SubModules
        .AsNoTracking()
        .Include(s => s.Module)
        .OrderBy(s => s.Name)
        .ToListAsync();
  }

  public async Task<List<SubModule>> GetByModuleIdAsync(Guid moduleId)
  {
    return await _context.SubModules
        .AsNoTracking()
        .Include(s => s.Module)
        .Where(s => s.ModuleId == moduleId)
        .OrderBy(s => s.Name)
        .ToListAsync();
  }

  public async Task<bool> HasDependenciesAsync(Guid subModuleId)
  {
    var hasRoles = await _context.Roles.AsNoTracking().AnyAsync(r => r.SubModuleId == subModuleId);
    if (hasRoles)
      return true;

    return await _context.Claims.AsNoTracking().AnyAsync(c => c.SubModuleId == subModuleId);
  }

  public async Task<DeleteDependenciesSummary> GetDependenciesSummaryAsync(Guid subModuleId)
  {
    var roles = await _context.Roles
        .AsNoTracking()
        .Where(r => r.SubModuleId == subModuleId)
        .Select(r => string.IsNullOrWhiteSpace(r.Name) ? "(Sem nome)" : r.Name)
        .ToListAsync();

    var claims = await _context.Claims
        .AsNoTracking()
        .Where(c => c.SubModuleId == subModuleId)
        .Select(c => !string.IsNullOrWhiteSpace(c.ClaimValue) ? c.ClaimValue : (!string.IsNullOrWhiteSpace(c.ClaimType) ? c.ClaimType : "(Sem nome)"))
        .ToListAsync();

    return new DeleteDependenciesSummary
    {
      Roles = roles,
      Claims = claims,
    };
  }

  public async Task DeleteWithDependenciesAsync(Guid subModuleId)
  {
    var roles = await _context.Roles
        .Where(r => !r.System && r.SubModuleId == subModuleId)
        .ToListAsync();
    var roleIds = roles.Select(r => r.Id).ToList();

    var claims = await _context.Claims
        .Where(c => !c.System && c.SubModuleId == subModuleId)
        .ToListAsync();
    var claimIds = claims.Select(c => c.Id).ToList();

    if (roleIds.Count > 0 || claimIds.Count > 0)
    {
      var roleClaims = await _context.RoleClaims
          .Where(rc => roleIds.Contains(rc.RoleId) || claimIds.Contains(rc.ClaimId))
          .ToListAsync();
      if (roleClaims.Count > 0)
        _context.RoleClaims.RemoveRange(roleClaims);
    }

    if (claimIds.Count > 0)
    {
      var userClaims = await _context.UserClaims
          .Where(uc => claimIds.Contains(uc.ClaimId))
          .ToListAsync();
      if (userClaims.Count > 0)
        _context.UserClaims.RemoveRange(userClaims);
    }

    if (roleIds.Count > 0)
    {
      var userRoles = await _context.UserRoles
          .Where(ur => roleIds.Contains(ur.RoleId))
          .ToListAsync();
      if (userRoles.Count > 0)
        _context.UserRoles.RemoveRange(userRoles);
    }

    if (claims.Count > 0)
      _context.Claims.RemoveRange(claims);

    if (roles.Count > 0)
      _context.Roles.RemoveRange(roles);

    var subModule = await _context.SubModules.FirstOrDefaultAsync(s => s.Id == subModuleId && !s.System);
    if (subModule is not null)
      _context.SubModules.Remove(subModule);
  }
}

