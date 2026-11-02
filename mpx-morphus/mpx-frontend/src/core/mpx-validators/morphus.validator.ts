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
      return this;
    }

    this.setFieldError(this.activeTarget, this.activeErrorKey, message);

    // Se for caminho aninhado (ex: "address.street"), indexa também pelo nome curto ("street")
    // no momento da configuração para evitar qualquer loop durante o showErros() no template
    const dotIndex = this.activeTarget.lastIndexOf('.');
    if (dotIndex !== -1) {
      const shortFieldName = this.activeTarget.substring(dotIndex + 1);
      if (shortFieldName && !this.fieldMessages.get(shortFieldName)?.has(this.activeErrorKey)) {
        this.setFieldError(shortFieldName, this.activeErrorKey, message);
      }
    }

    return this;
  }

  public showErros(control?: ErrorControlLike, explicitFieldName?: string): string {
    const errors = control?.errors;
    if (!errors) {
      return '';
    }

    // Pega a 1ª chave de erro sem alocar array com Object.keys()
    let firstError = '';
    for (const key in errors) {
      if (Object.prototype.hasOwnProperty.call(errors, key)) {
        firstError = key;
        break;
      }
    }

    if (!firstError) {
      return '';
    }

    const rawName =
      explicitFieldName ?? ('name' in control! && control.name ? String(control.name) : '');

    // Lookup O(1) direto no Map sem nenhum loop
    if (rawName) {
      const fieldMsg = this.fieldMessages.get(rawName)?.get(firstError);
      if (fieldMsg !== undefined) {
        return fieldMsg;
      }
    }

    return this.globalMessages.get(firstError) ?? '';
  }

  private setFieldError(field: string, errorKey: string, message: string): void {
    let fieldMap = this.fieldMessages.get(field);
    if (!fieldMap) {
      fieldMap = new Map<string, string>();
      this.fieldMessages.set(field, fieldMap);
    }
    fieldMap.set(errorKey, message);
  }
}
