import { computed, Directive, signal, WritableSignal } from '@angular/core';
import { ParamMap } from '@angular/router';
import { MpxEntity } from '@core/morphus';
import { MpxValidator } from '@core/morphus';
import { MpxBaseComponent } from './base.component';

@Directive()
export abstract class MpxEditComponent<
  T extends object = MpxEntity,
  V extends MpxValidator<T> = MpxValidator<T>,
> extends MpxBaseComponent<T> {
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
    const key = keyValue ?? (this.entity() as Partial<MpxEntity>).key;
    super.copyKey(key);
  }

  public loadPrimaryKey(targetEntity?: WritableSignal<Partial<T>> | Partial<T>, paramMap?: ParamMap): void {
    const target = targetEntity ?? this.entity;
    this.loadPrimaryKeyFromRoute(target, paramMap);
  }

  public override loadPrimariKey(targetEntity?: WritableSignal<Partial<T>> | Partial<T>, paramMap?: ParamMap): Partial<T> {
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
