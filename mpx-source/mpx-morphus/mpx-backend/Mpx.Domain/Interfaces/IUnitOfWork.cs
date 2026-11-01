using Mpx.Domain.Interfaces;

namespace mpx.Domain.Interfaces
{
  public interface IUnitOfWork
  {
    Task<IMorphusTransaction> BeginTransactionAsync();
    Task<int> SaveChangesAsync();
  }
}
