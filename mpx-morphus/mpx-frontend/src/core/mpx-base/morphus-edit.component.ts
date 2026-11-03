import { computed, Directive, signal, WritableSignal } from '@angular/core';
import { ParamMap } from '@angular/router';
import { IMorphusEntity } from '@core/mpx-entities';
import { MorphusValidator } from '@core/mpx-validators';
import { MorphusComponent } from './morphus.component';

@Directive()
export abstract class MorphusEditComponent<
  T extends object = IMorphusEntity,
  V extends MorphusValidator<T> = MorphusValidator<T>,
> extends MorphusComponent<T> {
  public readonly validator: V;
  public readonly entity = signal<Partial<T>>({});
  public readonly isEditing = computed(() => this.hasPrimaryKeys(this.entity()));

  public get isNew(): boolean {
    return this.itsNew(this.entity());
  }

  constructor(validatorClass: new () => V) {
    super();
    this.validator = new validatorClass();
  }

  public override copyKey(keyValue?: string): void {
    const key = keyValue ?? (this.entity() as Partial<IMorphusEntity>).key;
    super.copyKey(key);
  }

  public loadPrimaryKey(
    targetEntity?: WritableSignal<Partial<T>> | Partial<T>,
    paramMap?: ParamMap,
  ): void {
    const target = targetEntity ?? this.entity;
    this.loadPrimaryKeyFromRoute(target, paramMap);
  }

  public override loadPrimariKey(
    targetEntity?: WritableSignal<Partial<T>> | Partial<T>,
    paramMap?: ParamMap,
  ): Partial<T> {
    const target = targetEntity ?? this.entity;
    return this.loadPrimaryKeyFromRoute(target, paramMap);
  }

  public setEntity(data: Partial<T>): void {
    this.entity.set(data);
  }

  public updateField<K extends keyof T>(field: K, value: T[K]): void {
    this.entity.update((curr) => ({ ...curr, [field]: value }));
  }
}
