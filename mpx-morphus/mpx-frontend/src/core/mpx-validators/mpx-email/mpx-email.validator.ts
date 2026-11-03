import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MorphusUtil } from '@core/mpx-utils';

export const email: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (MorphusUtil.isNotNull(Validators.required(control))) {
    return null;
  }

  const v = String(control.value ?? '');
  return MorphusUtil.isEmail(v) ? null : { invalid_email: true };
};
