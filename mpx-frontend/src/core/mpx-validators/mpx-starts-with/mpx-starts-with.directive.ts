import { Directive, input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[starts-with]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: StartsWithValidators,
      multi: true,
    },
  ],
})
export class StartsWithValidators implements Validator, OnChanges {
  private fn?: () => void;

  readonly startsWith = input.required<string | null | undefined>({
    alias: 'starts-with',
  });

  validate(control: AbstractControl): ValidationErrors | null {
    const controlValue = control.value as string | null;
    if (!controlValue) {
      return null;
    }

    if (controlValue.startsWith(this.startsWith() as string)) {
      return null;
    }

    return {
      startsWith: this.startsWith(),
      currentValue: controlValue,
    };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.fn = fn;
  }

  ngOnChanges(): void {
    this.fn?.();
  }
}
