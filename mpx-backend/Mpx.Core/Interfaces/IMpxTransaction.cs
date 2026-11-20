namespace Mpx.Core.Interfaces;

public interface IMpxTransaction : IDisposable
{
  Task<int> Commit();
  Task Rollback();
}
