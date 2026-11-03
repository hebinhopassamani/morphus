using Microsoft.AspNetCore.Http;
using Mpx.Application.MorphusValidator;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Validation;

namespace Mpx.Application.Validators;

public class CorporationValidator(
    ICorporationRepository corporationRepository,
    IHttpContextAccessor httpContext)
    : MorphusValidator<Corporation>(httpContext), ICorporationValidator
{
  public Task ValidateCorporation(Corporation corporation)
  {
    if (string.IsNullOrWhiteSpace(corporation.Name))
      AddErrorMessage("O nome da corporação é obrigatório.");

    if (string.IsNullOrWhiteSpace(corporation.FullName))
      AddErrorMessage("A razão social ou nome completo da corporação é obrigatório.");

    if (string.IsNullOrWhiteSpace(corporation.Key) || corporation.Key.Trim().Length != 12)
      AddErrorMessage("A chave de identificação (Key) deve possuir exatamente 12 caracteres.");

    if (!MorphusDocumentValidator.IsEmail(corporation.Email))
      AddErrorMessage("Informe um endereço de e-mail válido para a corporação.");

    corporation.PersonType = string.Equals(corporation.PersonType?.Trim(), "PF", StringComparison.OrdinalIgnoreCase)
        ? "PF"
        : "PJ";

    corporation.CpfCnpj = MorphusDocumentValidator.OnlyDigits(corporation.CpfCnpj);

    if (string.IsNullOrWhiteSpace(corporation.CpfCnpj))
    {
      AddErrorMessage(
          corporation.PersonType == "PF"
              ? "O CPF da corporação é obrigatório."
              : "O CNPJ da corporação é obrigatório.");
    }
    else if (corporation.PersonType == "PF" && !MorphusDocumentValidator.IsCpf(corporation.CpfCnpj))
    {
      AddErrorMessage("O CPF informado é inválido.");
    }
    else if (corporation.PersonType == "PJ" && !MorphusDocumentValidator.IsCnpj(corporation.CpfCnpj))
    {
      AddErrorMessage("O CNPJ informado é inválido.");
    }

    return Task.CompletedTask;
  }

  public async Task ValidateDeleteCorporation(Guid id)
  {
    var existing = await corporationRepository.GetByIdAsync(id);
    if (existing is null)
    {
      AddErrorMessage("A corporação informada não foi encontrada.");
      return;
    }

    if (existing.System)
    {
      AddErrorMessage("Não é permitido excluir a corporação matriz do sistema.");
    }
  }
}
