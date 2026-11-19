import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MpxUtil } from '@core/morphus';

export const MpxCnpjValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (MpxUtil.isNotNull(Validators.required(control))) {
    return null;
  }

  const value = control.value
    ? String(control.value).replace(/\./g, '').replace(/-/g, '').replace(/\//g, '')
    : '';

  return MpxUtil.isCnpj(value) ? null : { invalid_cnpj: true };
};
