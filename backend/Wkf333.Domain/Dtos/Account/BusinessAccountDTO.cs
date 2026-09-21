using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Dtos.Account;

public class BusinessAccountDTO : MorphusEntity
{
  public required string Name { get; set; }
  public string? Email { get; set; }
  public required string Key { get; set; }
  public required bool System { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }
}
