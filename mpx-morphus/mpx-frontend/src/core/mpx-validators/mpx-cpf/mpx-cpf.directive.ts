import { Directive, input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { cpf } from './mpx-cpf.validator';

@Directive({
  selector: '[invalid_cpf]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateCpf,
      multi: true,
    },
  ],
})
export class ValidateCpf implements Validator, OnChanges {
  private onChangeFn?: () => void;

  readonly enabled = input<boolean | string>(true, { alias: 'invalid_cpf' });

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.enabled() === false) {
      return null;
    }
    return cpf(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChangeFn = fn;
  }

  ngOnChanges(): void {
    this.onChangeFn?.();
  }
}
