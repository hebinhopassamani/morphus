import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { MpxEmailValidator } from './email.validator';

@Directive({
  selector: '[invalid_email]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MpxValidateEmailDirective,
      multi: true,
    },
  ],
})
export class MpxValidateEmailDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return MpxEmailValidator(control);
  }
}
