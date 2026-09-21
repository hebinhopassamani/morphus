namespace Morphus.Domain.ITransaction;

public interface IMorphusTransaction : IDisposable
{
    Task<int> Commit();
    Task Rollback();
}
