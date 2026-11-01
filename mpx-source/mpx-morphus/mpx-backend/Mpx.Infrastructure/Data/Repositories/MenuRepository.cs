using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class MenuRepository(MorphusDbContext context) : MorphusRepository<Menu>(context), IMenuRepository
{
  public async Task<List<Menu>> GetListAsync()
  {
    return await _context.Menus
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.Module)
        .Include(m => m.SubModule)
        .OrderBy(m => m.Order)
        .ThenBy(m => m.Label)
        .ToListAsync();
  }

  public async Task<List<Menu>> GetByApplicationIdAsync(Guid applicationId)
  {
    var allMenus = await _context.Menus
        .AsNoTracking()
        .Include(m => m.Module)
        .Include(m => m.SubModule)
        .Where(m => m.ApplicationId == applicationId)
        .OrderBy(m => m.Order)
        .ThenBy(m => m.Label)
        .ToListAsync();

    return BuildMenuTree(allMenus);
  }

  public async Task<List<Menu>> GetByApplicationKeyAsync(string applicationKey)
  {
    var keyUpper = applicationKey.ToUpperInvariant();
    var allMenus = await _context.Menus
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.Module)
        .Include(m => m.SubModule)
        .Where(m => m.Application!.Key == keyUpper)
        .OrderBy(m => m.Order)
        .ThenBy(m => m.Label)
        .ToListAsync();

    return BuildMenuTree(allMenus);
  }

  private static List<Menu> BuildMenuTree(List<Menu> allMenus)
  {
    var lookup = allMenus.ToDictionary(m => m.Id);
    var roots = new List<Menu>();

    foreach (var menu in allMenus)
    {
      menu.SubMenus = [];
    }

    foreach (var menu in allMenus)
    {
      if (menu.MenuId.HasValue && lookup.TryGetValue(menu.MenuId.Value, out var parent))
      {
        parent.SubMenus.Add(menu);
      }
      else if (!menu.MenuId.HasValue)
      {
        roots.Add(menu);
      }
    }

    return roots;
  }
}
