namespace Mpx.Application.MorphusValidator;

public interface IMorphusValidator<T>
{
  Guid? CorporationId { get; set; }
  void AddErrorMessage(string message);
  bool IsValid();
  string ErrorMessage { get; }
  IReadOnlyList<string> ErrorMessages { get; }
}
