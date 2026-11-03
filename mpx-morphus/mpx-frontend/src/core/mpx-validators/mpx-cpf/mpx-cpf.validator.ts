import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MorphusUtil } from '@core/mpx-utils';

export const cpf: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (MorphusUtil.isNotNull(Validators.required(control))) {
    return null;
  }

  const value = control.value
    ? String(control.value).replace(/\./g, '').replace(/-/g, '').replace(/\//g, '')
    : '';

  return MorphusUtil.isCpf(value) ? null : { invalid_cpf: true };
};
