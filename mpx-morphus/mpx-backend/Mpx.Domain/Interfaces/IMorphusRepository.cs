namespace Mpx.Domain.Interfaces
{
  public interface IMorphusRepository<TEntity> where TEntity : class
  {
    Task<TEntity?> GetByIdAsync(Guid id);
    Task<IEnumerable<TEntity>> GetAllAsync();
    Task AddAsync(TEntity entity);
    void Update(TEntity entity);
    void Delete(TEntity entity);
  }
}

