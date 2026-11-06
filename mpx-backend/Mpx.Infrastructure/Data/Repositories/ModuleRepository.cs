using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ModuleRepository(MorphusDbContext context) : MorphusRepository<Module>(context), IModuleRepository
{
  public async Task<List<SubModule>> GetSubModulesAsync(Guid id)
  {
    return await _context.SubModules
        .AsNoTracking()
        .Where(s => s.ModuleId == id)
        .OrderBy(s => s.Name)
        .ToListAsync();
  }

  public async Task<List<Module>> GetModulesByKeyAsync(string key)
  {
    return await _context.Modules
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.SubModules)
        .Where(m => m.Key == key)
        .ToListAsync();
  }

  public async Task<List<Module>> GetByApplicationIdAsync(Guid applicationId)
  {
    return await _context.Modules
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.SubModules)
        .Where(m => m.ApplicationId == applicationId)
        .OrderBy(m => m.Name)
        .ToListAsync();
  }

  public async Task<List<Module>> GetListAsync()
  {
    await EnsureApplicationSecurityModulesSyncedAsync();

    return await _context.Modules
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.SubModules)
        .OrderBy(m => m.Name)
        .ToListAsync();
  }

  private async Task EnsureApplicationSecurityModulesSyncedAsync()
  {
    try
    {
      await _context.Database.ExecuteSqlRawAsync("""
          UPDATE security_modules sm
          SET application_id = app.id
          FROM applications app
          WHERE sm.corporation_id = app.corporation_id
            AND UPPER(app.name) IN ('SEGURANÇA', 'SEGURANCA')
            AND sm.name IN ('Usuários', 'Corporações', 'Permissões', 'Perfis de acesso')
            AND (sm.application_id IS NULL OR sm.application_id <> app.id);

          UPDATE security_modules sm
          SET application_id = app.id
          FROM applications app
          WHERE sm.corporation_id = app.corporation_id
            AND UPPER(app.name) = 'MORPHUS'
            AND sm.name IN ('Workspaces', 'Aplicações', 'Menus', 'Módulos')
            AND sm.application_id IS NULL;

          INSERT INTO security_modules (id, key, system, inactive, name, description, corporation_id, application_id)
          SELECT
              am.id,
              UPPER(SUBSTRING(REPLACE(am.id::text, '-', ''), 1, 12)),
              am.system,
              am.inactive,
              am.name,
              am.description,
              am.corporation_id,
              am.application_id
          FROM application_modules am
          JOIN applications app ON app.id = am.application_id
          WHERE UPPER(app.name) NOT IN ('MORPHUS', 'SEGURANÇA', 'SEGURANCA')
            AND NOT EXISTS (
                SELECT 1 FROM security_modules sm
                WHERE sm.corporation_id = am.corporation_id
                  AND sm.application_id = am.application_id
                  AND LOWER(sm.name) = LOWER(am.name)
            )
            AND NOT EXISTS (
                SELECT 1 FROM security_modules sm2
                WHERE sm2.id = am.id
            );

          INSERT INTO security_sub_modules (id, key, system, inactive, name, description, corporation_id, module_id)
          SELECT
              asm.id,
              UPPER(SUBSTRING(REPLACE(asm.id::text, '-', ''), 1, 12)),
              asm.system,
              asm.inactive,
              asm.name,
              asm.description,
              asm.corporation_id,
              sm.id
          FROM application_sub_modules asm
          JOIN application_modules am ON am.id = asm.application_module_id
          JOIN security_modules sm ON sm.corporation_id = am.corporation_id
                                  AND sm.application_id = am.application_id
                                  AND LOWER(sm.name) = LOWER(am.name)
          WHERE NOT EXISTS (
              SELECT 1 FROM security_sub_modules ssm
              WHERE ssm.module_id = sm.id
                AND LOWER(ssm.name) = LOWER(asm.name)
          )
          AND NOT EXISTS (
              SELECT 1 FROM security_sub_modules ssm2
              WHERE ssm2.id = asm.id
          );
          """);
    }
    catch
    {
      // Ignora caso a sincronização já tenha ocorrido
    }
  }

  public async Task<bool> HasDependenciesAsync(Guid moduleId)
  {
    var hasSubModules = await _context.SubModules.AsNoTracking().AnyAsync(s => s.ModuleId == moduleId);
    if (hasSubModules)
      return true;

    var hasRoles = await _context.Roles.AsNoTracking().AnyAsync(r => r.ModuleId == moduleId);
    if (hasRoles)
      return true;

    return await _context.Claims.AsNoTracking().AnyAsync(c => c.ModuleId == moduleId);
  }

  public async Task<DeleteDependenciesSummary> GetDependenciesSummaryAsync(Guid moduleId)
  {
    var subModules = await _context.SubModules
        .AsNoTracking()
        .Where(s => s.ModuleId == moduleId)
        .Select(s => new { s.Id, s.Name })
        .ToListAsync();

    var subModuleIds = subModules.Select(s => s.Id).ToList();

    var roles = await _context.Roles
        .AsNoTracking()
        .Where(r => r.ModuleId == moduleId || subModuleIds.Contains(r.SubModuleId))
        .Select(r => string.IsNullOrWhiteSpace(r.Name) ? "(Sem nome)" : r.Name)
        .ToListAsync();

    var claims = await _context.Claims
        .AsNoTracking()
        .Where(c => c.ModuleId == moduleId || subModuleIds.Contains(c.SubModuleId))
        .Select(c => !string.IsNullOrWhiteSpace(c.ClaimValue) ? c.ClaimValue : (!string.IsNullOrWhiteSpace(c.ClaimType) ? c.ClaimType : "(Sem nome)"))
        .ToListAsync();

    return new DeleteDependenciesSummary
    {
      SubModules = subModules.Select(s => string.IsNullOrWhiteSpace(s.Name) ? "(Sem nome)" : s.Name).ToList(),
      Roles = roles,
      Claims = claims,
    };
  }

  public async Task DeleteWithDependenciesAsync(Guid moduleId)
  {
    var subModules = await _context.SubModules
        .Where(s => s.ModuleId == moduleId && !s.System)
        .ToListAsync();
    var subModuleIds = subModules.Select(s => s.Id).ToList();

    var roles = await _context.Roles
        .Where(r => !r.System && (r.ModuleId == moduleId || subModuleIds.Contains(r.SubModuleId)))
        .ToListAsync();
    var roleIds = roles.Select(r => r.Id).ToList();

    var claims = await _context.Claims
        .Where(c => !c.System && (c.ModuleId == moduleId || subModuleIds.Contains(c.SubModuleId)))
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

    if (subModules.Count > 0)
      _context.SubModules.RemoveRange(subModules);

    var module = await _context.Modules.FirstOrDefaultAsync(m => m.Id == moduleId && !m.System);
    if (module is not null)
      _context.Modules.Remove(module);
  }
}
