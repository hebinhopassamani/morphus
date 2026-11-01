using Microsoft.EntityFrameworkCore.Storage;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Data;

namespace Morphus.Infrastructure.Data;

public class MorphusTransaction(MorphusDbContext context, IDbContextTransaction efTransaction) : IMorphusTransaction
{
  private readonly MorphusDbContext _context = context ?? throw new ArgumentNullException(nameof(context));
  private readonly IDbContextTransaction _efTransaction = efTransaction ?? throw new ArgumentNullException(nameof(efTransaction));

  // Salva todas as alterações pendentes no contexto e confirma a transação no banco
  public async Task<int> Commit()
  {
    var affectedRows = await _context.SaveChangesAsync();
    await _efTransaction.CommitAsync();
    return affectedRows;
  }

  // Desfaz a transação no banco
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
