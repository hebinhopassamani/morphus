namespace Morphus.Domain.Dtos.Account;

public class AccountDTO
{
  public Guid? BusinessId { get; set; }
  public Guid? UserId { get; set; }
  public required bool Inactive { get; set; }
  public required bool IsOwner { get; set; }
  public required bool System { get; set; }
  public required BusinessAccountDTO Business { get; set; }
  public required UserAccountDTO User { get; set; }
}
