import {
  StartsWithValidators,
  ValidateCnpj,
  ValidateCpf,
  ValidateEmail,
} from '@core/mpx-validators';

export * from '@core/mpx-validators';

/**
 * Diretivas de validação de CPF e CNPJ agrupadas para telas que possuem documento PF/PJ.
 */
export const MorphusValidationCpfCnpjShared = [ValidateCpf, ValidateCnpj] as const;

/**
 * Diretiva de validação de E-mail para telas que possuem campo de e-mail.
 */
export const MorphusValidationEmailShared = [ValidateEmail] as const;

/**
 * Diretiva de validação de prefixo (StartsWith).
 */
export const MorphusValidationStartsWithShared = [StartsWithValidators] as const;
