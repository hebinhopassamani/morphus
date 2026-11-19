import { Directive, input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { MpxCnpjValidator } from './cnpj.validator';

@Directive({
  selector: '[invalid_cnpj]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MpxValidateCnpjDirective,
      multi: true,
    },
  ],
})
export class MpxValidateCnpjDirective implements Validator, OnChanges {
  private onChangeFn?: () => void;

  readonly enabled = input<boolean | string>(true, { alias: 'invalid_cnpj' });

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.enabled() === false) {
      return null;
    }
    return MpxCnpjValidator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChangeFn = fn;
  }

  ngOnChanges(): void {
    this.onChangeFn?.();
  }
}
