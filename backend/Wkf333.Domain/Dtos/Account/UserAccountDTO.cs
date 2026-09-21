using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Dtos.Account;

public class UserAccountDTO : MorphusEntity
{
  public required string Name { get; set; }
  public required string Email { get; set; }
  public string? PasswordHash { get; set; }
  public required bool Inactive { get; set; }
  public required bool System { get; set; }
  public required bool TermsConfirmed { get; set; }
}
