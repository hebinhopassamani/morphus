import { computed, Directive, signal } from '@angular/core';
import { MorphusValidator } from '@core/mpx-validators';
import { MorphusComponent } from './morphus.component';

@Directive()
export abstract class MorphusEditComponent<
  T,
  V extends MorphusValidator<T> = MorphusValidator<T>,
> extends MorphusComponent<T> {
  public readonly validator: V;
  public readonly entity = signal<Partial<T>>({});
  public readonly isEditing = computed(() => this.hasPrimaryKeys(this.entity()));

  constructor(validatorClass: new () => V) {
    super();
    this.validator = new validatorClass();
  }

  public setEntity(data: Partial<T>): void {
    this.entity.set(data);
  }

  public updateField<K extends keyof T>(field: K, value: T[K]): void {
    this.entity.update((curr) => ({ ...curr, [field]: value }));
  }
}
