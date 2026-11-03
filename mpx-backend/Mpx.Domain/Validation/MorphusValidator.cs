using System.Text.RegularExpressions;

namespace Mpx.Domain.Validation;

public static partial class MorphusDocumentValidator
{
  [GeneratedRegex(@"^(([^<>()\[\]\\.,;:\s@""]+(\.[^<>()\[\]\\.,;:\s@""]+)*)|("".+""))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$")]
  private static partial Regex EmailRegex();

  public static string OnlyDigits(string? value) =>
      string.IsNullOrWhiteSpace(value)
          ? string.Empty
          : new string(value.Where(char.IsDigit).ToArray());

  public static bool IsEmail(string? email) =>
      !string.IsNullOrWhiteSpace(email) && EmailRegex().IsMatch(email.Trim());

  public static bool IsCpf(string? cpf)
  {
    var digits = OnlyDigits(cpf);
    if (digits.Length != 11 || digits.Distinct().Count() == 1)
      return false;

    var numbers = digits.Select(c => c - '0').ToArray();

    int sum1 = 0;
    for (int i = 0; i < 9; i++)
      sum1 += numbers[i] * (10 - i);

    int rem1 = sum1 % 11;
    int check1 = rem1 < 2 ? 0 : 11 - rem1;
    if (numbers[9] != check1)
      return false;

    int sum2 = 0;
    for (int i = 0; i < 10; i++)
      sum2 += numbers[i] * (11 - i);

    int rem2 = sum2 % 11;
    int check2 = rem2 < 2 ? 0 : 11 - rem2;
    return numbers[10] == check2;
  }

  public static bool IsCnpj(string? cnpj)
  {
    var digits = OnlyDigits(cnpj);
    if (digits.Length != 14 || digits.Distinct().Count() == 1)
      return false;

    var numbers = digits.Select(c => c - '0').ToArray();
    int[] weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    int[] weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    int sum1 = 0;
    for (int i = 0; i < 12; i++)
      sum1 += numbers[i] * weights1[i];

    int rem1 = sum1 % 11;
    int check1 = rem1 < 2 ? 0 : 11 - rem1;
    if (numbers[12] != check1)
      return false;

    int sum2 = 0;
    for (int i = 0; i < 13; i++)
      sum2 += numbers[i] * weights2[i];

    int rem2 = sum2 % 11;
    int check2 = rem2 < 2 ? 0 : 11 - rem2;
    return numbers[13] == check2;
  }
}
