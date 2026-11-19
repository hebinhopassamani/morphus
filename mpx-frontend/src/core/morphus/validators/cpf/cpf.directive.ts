import { Directive, input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { MpxCpfValidator } from './cpf.validator';

@Directive({
  selector: '[invalid_cpf]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MpxValidateCpfDirective,
      multi: true,
    },
  ],
})
export class MpxValidateCpfDirective implements Validator, OnChanges {
  private onChangeFn?: () => void;

  readonly enabled = input<boolean | string>(true, { alias: 'invalid_cpf' });

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.enabled() === false) {
      return null;
    }
    return MpxCpfValidator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChangeFn = fn;
  }

  ngOnChanges(): void {
    this.onChangeFn?.();
  }
}
