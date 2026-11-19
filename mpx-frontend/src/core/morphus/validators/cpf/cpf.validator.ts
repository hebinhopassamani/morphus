import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MpxUtil } from '@core/morphus';

export const MpxCpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (MpxUtil.isNotNull(Validators.required(control))) {
    return null;
  }

  const value = control.value
    ? String(control.value).replace(/\./g, '').replace(/-/g, '').replace(/\//g, '')
    : '';

  return MpxUtil.isCpf(value) ? null : { invalid_cpf: true };
};
