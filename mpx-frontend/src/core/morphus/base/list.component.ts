import { Directive, signal } from '@angular/core';
import { MpxEntity, MpxRelatedEntity } from '@core/morphus';
import { MpxBaseComponent } from './base.component';

@Directive()
export abstract class MpxListComponent<
  T extends MpxEntity | MpxRelatedEntity = MpxEntity,
> extends MpxBaseComponent<T> {
  public list = signal<T[]>([]);

  public setList(entities: T[]): void {
    this.list.set(entities);
  }

  public clearList(): void {
    this.list.set([]);
  }
}
