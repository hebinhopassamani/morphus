import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { email } from './mpx-email.validator';

@Directive({
  selector: '[invalid_email]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateEmail,
      multi: true,
    },
  ],
})
export class ValidateEmail implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return email(control);
  }
}
