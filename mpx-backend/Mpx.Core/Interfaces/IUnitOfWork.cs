namespace Mpx.Core.Interfaces;

public interface IUnitOfWork
{
  Task<IMpxTransaction> BeginTransactionAsync();
  Task<int> SaveChangesAsync();
}
