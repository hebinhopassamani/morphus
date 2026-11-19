import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MpxUtil } from '@core/morphus';

export const MpxEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (MpxUtil.isNotNull(Validators.required(control))) {
    return null;
  }

  const v = String(control.value ?? '');
  return MpxUtil.isEmail(v) ? null : { invalid_email: true };
};
