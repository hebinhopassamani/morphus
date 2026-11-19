import {
  MpxStartsWithValidatorDirective,
  MpxValidateCnpjDirective,
  MpxValidateCpfDirective,
  MpxValidateEmailDirective,
} from '@core/morphus';

export const MpxValidationCpfCnpjShared = [
  MpxValidateCpfDirective,
  MpxValidateCnpjDirective,
] as const;

export const MpxValidationEmailShared = [MpxValidateEmailDirective] as const;

export const MpxValidationStartsWithShared = [MpxStartsWithValidatorDirective] as const;
