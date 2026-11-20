namespace Mpx.Core.Validators;

public interface IMpxValidator<T>
{
  Guid? CorporationId { get; set; }
  void AddErrorMessage(string message);
  bool IsValid();
  string ErrorMessage { get; }
  IReadOnlyList<string> ErrorMessages { get; }
}
