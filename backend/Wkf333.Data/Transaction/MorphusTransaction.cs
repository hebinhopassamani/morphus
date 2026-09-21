using Microsoft.EntityFrameworkCore.Storage;
using Morphus.Context;
using Morphus.Domain.ITransaction;

namespace Morphus.Data.Transaction;

public class MorphusTransaction(W3DbContext context) : IMorphusTransaction
{
    public W3DbContext mpsContext = context;

    public async Task<IDbContextTransaction> BeginTransaction()
    {
        await using var transaction = await mpsContext.Database.BeginTransactionAsync();

        return transaction;
    }

    public async Task CommitTransaction()
    {
        await mpsContext.Database.CommitTransactionAsync();
    }

    public async Task RollbackTransaction()
    {
        await mpsContext.Database.RollbackTransactionAsync();
    }

    public async Task<int> Commit()
    {
        return await mpsContext.SaveChangesAsync();
    }

    public Task Rollback()
    {
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        mpsContext.Dispose();
    }
}
