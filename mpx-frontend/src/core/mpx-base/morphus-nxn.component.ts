import { Directive, signal } from '@angular/core';
import { IMorphusEntity, IMorphusRelatedEntity } from '@core/mpx-entities';
import { MorphusComponent } from './morphus.component';

@Directive()
export abstract class MorphusNxNComponent<
  T extends IMorphusRelatedEntity = IMorphusRelatedEntity,
  TRelate extends IMorphusEntity = IMorphusEntity,
> extends MorphusComponent<T> {
  public readonly entitiesToRelate = signal<TRelate[]>([]);
  public readonly relatedEntities = signal<T[]>([]);

  public setEntitiesToRelate(entities: TRelate[]): void {
    this.entitiesToRelate.set(entities);
  }

  public clearEntitiesToRelate(): void {
    this.entitiesToRelate.set([]);
  }

  public setRelatedEntities(entities: T[]): void {
    this.relatedEntities.set(entities);
  }

  public clearRelatedEntities(): void {
    this.relatedEntities.set([]);
  }
}
