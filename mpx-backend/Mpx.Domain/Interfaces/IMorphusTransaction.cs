namespace Mpx.Domain.Interfaces
{
  public interface IMorphusTransaction : IDisposable
  {
    Task<int> Commit();
    Task Rollback();
  }
}

