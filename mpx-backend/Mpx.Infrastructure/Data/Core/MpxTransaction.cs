using Microsoft.EntityFrameworkCore.Storage;

using Mpx.Core.Interfaces;

namespace Mpx.Infrastructure.Data.Core;

public class MpxTransaction(MpxDbContext context, IDbContextTransaction efTransaction) : IMpxTransaction
{
  private readonly MpxDbContext _context = context ?? throw new ArgumentNullException(nameof(context));
  private readonly IDbContextTransaction _efTransaction = efTransaction ?? throw new ArgumentNullException(nameof(efTransaction));

  public async Task<int> Commit()
  {
    var affectedRows = await _context.SaveChangesAsync();
    await _efTransaction.CommitAsync();
    return affectedRows;
  }

  public async Task Rollback()
  {
    await _efTransaction.RollbackAsync();
  }

  public void Dispose()
  {
    _efTransaction.Dispose();
    GC.SuppressFinalize(this);
  }
}
