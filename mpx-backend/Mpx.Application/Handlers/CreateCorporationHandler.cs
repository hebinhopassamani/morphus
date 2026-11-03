using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

public class CreateCorporationHandler(IUnitOfWork unitOfWork, ICorporationRepository repository)
{
  public async Task Handle()
  {
    using var transaction = await unitOfWork.BeginTransactionAsync();

    try
    {
      await repository.AddAsync(new Corporation
      {
        Id = Guid.Empty,
        Name = "Morphus Corporation",
        Email = "hebinho@gmail.com",
        Key = Guid.NewGuid().ToString(),
        System = false
      });

      await unitOfWork.SaveChangesAsync();

      await transaction.Commit();
    }
    catch
    {
      await transaction.Rollback();
      throw;
    }
  }
}
