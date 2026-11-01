using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class MorphusRepository<TEntity>(MorphusDbContext context) : IMorphusRepository<TEntity> where TEntity : class
{
  protected readonly MorphusDbContext _context = context;
  protected readonly DbSet<TEntity> _dbSet = context.Set<TEntity>();

  public async Task<TEntity?> GetByIdAsync(Guid id)
  {
    return await _dbSet.FindAsync(id);
  }

  public async Task<IEnumerable<TEntity>> GetAllAsync()
  {
    return await _dbSet.ToListAsync();
  }

  public async Task AddAsync(TEntity entity)
  {
    await _dbSet.AddAsync(entity);
  }

  public void Update(TEntity entity)
  {
    // No EF Core moderno, marcar como Modified lida perfeitamente com a atualização
    _context.Entry(entity).State = EntityState.Modified;
  }

  public void Delete(TEntity entity)
  {
    _dbSet.Remove(entity);
  }
}
