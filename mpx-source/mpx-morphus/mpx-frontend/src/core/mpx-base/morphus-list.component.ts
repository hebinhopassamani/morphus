import { Directive, signal } from '@angular/core';
import { IMorphusEntity, IMorphusRelatedEntity } from '@core/mpx-entities';
import { MorphusComponent } from './morphus.component';

@Directive()
export abstract class MorphusListComponent<
  T extends IMorphusEntity | IMorphusRelatedEntity = IMorphusEntity,
> extends MorphusComponent<T> {
  public list = signal<T[]>([]);

  public setList(entities: T[]): void {
    this.list.set(entities);
  }

  public clearList(): void {
    this.list.set([]);
  }
}
