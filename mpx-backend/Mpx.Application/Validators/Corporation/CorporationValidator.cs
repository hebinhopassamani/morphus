using Microsoft.AspNetCore.Http;

using Mpx.Core.Validators;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Validators;

public class CorporationValidator(
    ICorporationRepository corporationRepository,
    IHttpContextAccessor httpContext)
    : MpxValidator<Corporation>(httpContext), ICorporationValidator
{
  public Task ValidateCorporation(Corporation corporation)
  {
    if (string.IsNullOrWhiteSpace(corporation.Name))
      AddErrorMessage("O nome da corporação é obrigatório.");

    if (string.IsNullOrWhiteSpace(corporation.FullName))
      AddErrorMessage("A razão social ou nome completo da corporação é obrigatório.");

    if (string.IsNullOrWhiteSpace(corporation.Key) || corporation.Key.Trim().Length != 12)
      AddErrorMessage("A chave de identificação (Key) deve possuir exatamente 12 caracteres.");

    if (!MpxDocumentValidator.IsEmail(corporation.Email))
      AddErrorMessage("Informe um endereço de e-mail válido para a corporação.");

    corporation.PersonType = string.Equals(corporation.PersonType?.Trim(), "PF", StringComparison.OrdinalIgnoreCase)
        ? "PF"
        : "PJ";

    corporation.CpfCnpj = MpxDocumentValidator.OnlyDigits(corporation.CpfCnpj);

    if (string.IsNullOrWhiteSpace(corporation.CpfCnpj))
    {
      AddErrorMessage(
          corporation.PersonType == "PF"
              ? "O CPF da corporação é obrigatório."
              : "O CNPJ da corporação é obrigatório.");
    }
    else if (corporation.PersonType == "PF" && !MpxDocumentValidator.IsCpf(corporation.CpfCnpj))
    {
      AddErrorMessage("O CPF informado é inválido.");
    }
    else if (corporation.PersonType == "PJ" && !MpxDocumentValidator.IsCnpj(corporation.CpfCnpj))
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
