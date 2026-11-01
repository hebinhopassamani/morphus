import { AbstractControl, NgModel } from '@angular/forms';

export type StandardValidationError =
  | 'required'
  | 'email'
  | 'minlength'
  | 'maxlength'
  | 'min'
  | 'max'
  | 'pattern';

type ErrorControlLike =
  | AbstractControl
  | NgModel
  | {
      name?: string | number | null;
      errors?: Record<string, unknown> | null;
      dirty?: boolean | null;
      touched?: boolean | null;
    }
  | null
  | undefined;

export abstract class MorphusValidator<T> {
  private readonly globalMessages = new Map<string, string>();
  private readonly fieldMessages = new Map<string, Map<string, string>>();

  private activeTarget: '__ALL__' | string = '__ALL__';
  private activeErrorKey = '';

  constructor() {
    this.configure(this);
  }

  public abstract configure(builder: MorphusValidator<T>): void;

  public messageForAll(): this {
    this.activeTarget = '__ALL__';
    return this;
  }

  public messageFor(field: (keyof T & string) | string): this {
    this.activeTarget = field;
    if (!this.fieldMessages.has(field)) {
      this.fieldMessages.set(field, new Map<string, string>());
    }
    return this;
  }

  public withError(error: StandardValidationError): this {
    this.activeErrorKey = error;
    return this;
  }

  public withCustomError(error: string): this {
    this.activeErrorKey = error;
    return this;
  }

  public showMessage(message: string): this {
    if (!this.activeErrorKey) {
      return this;
    }

    if (this.activeTarget === '__ALL__') {
      this.globalMessages.set(this.activeErrorKey, message);
    } else {
      let fieldMap = this.fieldMessages.get(this.activeTarget);
      if (!fieldMap) {
        fieldMap = new Map<string, string>();
        this.fieldMessages.set(this.activeTarget, fieldMap);
      }
      fieldMap.set(this.activeErrorKey, message);
    }

    return this;
  }

  public showErros(control?: ErrorControlLike, explicitFieldName?: string): string {
    if (!control || !control.errors) {
      return '';
    }

    const errorKeys = Object.keys(control.errors);
    if (errorKeys.length === 0) {
      return '';
    }

    const firstError = errorKeys[0];
    const rawName = explicitFieldName ?? ('name' in control && control.name ? String(control.name) : '');

    // 1. Procura regra específica para o caminho exato ou pelo nome curto da propriedade
    if (rawName) {
      const exactMap = this.fieldMessages.get(rawName);
      if (exactMap?.has(firstError)) {
        return exactMap.get(firstError)!;
      }

      for (const [configuredField, map] of this.fieldMessages.entries()) {
        if (
          (configuredField === rawName || configuredField.endsWith(`.${rawName}`)) &&
          map.has(firstError)
        ) {
          return map.get(firstError)!;
        }
      }
    }

    // 2. Fallback para regras globais configuradas via messageForAll()
    if (this.globalMessages.has(firstError)) {
      return this.globalMessages.get(firstError)!;
    }

    return '';
  }
}
