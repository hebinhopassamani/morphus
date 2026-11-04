import { computed, Directive, signal } from '@angular/core';
import { IMorphusEntity, IMorphusRelatedEntity } from '@core/mpx-entities';
import { MorphusComponent } from './morphus.component';

@Directive()
export abstract class MorphusNxNComponent<
  T extends IMorphusRelatedEntity = IMorphusRelatedEntity,
  TRelate extends IMorphusEntity = IMorphusEntity,
> extends MorphusComponent<T> {
  public readonly entitiesToRelate = signal<TRelate[]>([]);
  public readonly relatedEntities = signal<T[]>([]);

  public readonly selectedToRelateKeys = signal<Set<string>>(new Set());
  public readonly selectedRelatedKeys = signal<Set<string>>(new Set());

  public readonly selectedToRelateCount = computed(() => this.selectedToRelateKeys().size);
  public readonly selectedRelatedCount = computed(() => this.selectedRelatedKeys().size);

  public setEntitiesToRelate(entities: TRelate[]): void {
    this.entitiesToRelate.set(entities ?? []);
    this.selectedToRelateKeys.set(new Set());
  }

  public clearEntitiesToRelate(): void {
    this.entitiesToRelate.set([]);
    this.selectedToRelateKeys.set(new Set());
  }

  public setRelatedEntities(entities: T[]): void {
    this.relatedEntities.set(entities ?? []);
    this.selectedRelatedKeys.set(new Set());
  }

  public clearRelatedEntities(): void {
    this.relatedEntities.set([]);
    this.selectedRelatedKeys.set(new Set());
  }

  public getToRelateKey(item: TRelate): string {
    return String(item.id ?? item.key ?? '');
  }

  public getRelatedKey(item: T): string {
    return this.primaryKeys.map((k) => String(item[k] ?? '')).join('|');
  }

  public canRemoveRelated(item: T): boolean {
    const withOwner = item as T & { isOwner?: boolean };
    return !item.system && !withOwner.isOwner;
  }

  public isToRelateSelected(item: TRelate): boolean {
    return this.selectedToRelateKeys().has(this.getToRelateKey(item));
  }

  public toggleToRelateSelection(item: TRelate): void {
    const key = this.getToRelateKey(item);
    if (!key) {
      return;
    }
    this.selectedToRelateKeys.update((curr) => {
      const next = new Set(curr);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  public areAllToRelateSelected(visibleItems: TRelate[]): boolean {
    if (!visibleItems.length) {
      return false;
    }
    const set = this.selectedToRelateKeys();
    return visibleItems.every((item) => set.has(this.getToRelateKey(item)));
  }

  public toggleSelectAllToRelate(visibleItems: TRelate[]): void {
    const allSelected = this.areAllToRelateSelected(visibleItems);
    this.selectedToRelateKeys.update((curr) => {
      const next = new Set(curr);
      for (const item of visibleItems) {
        const key = this.getToRelateKey(item);
        if (!key) {
          continue;
        }
        if (allSelected) {
          next.delete(key);
        } else {
          next.add(key);
        }
      }
      return next;
    });
  }

  public getSelectedToRelateEntities(): TRelate[] {
    const set = this.selectedToRelateKeys();
    return this.entitiesToRelate().filter((item) => set.has(this.getToRelateKey(item)));
  }

  public clearToRelateSelection(): void {
    this.selectedToRelateKeys.set(new Set());
  }

  public isRelatedSelected(item: T): boolean {
    return this.selectedRelatedKeys().has(this.getRelatedKey(item));
  }

  public clearRelatedSelection(): void {
    this.selectedRelatedKeys.set(new Set());
  }

  public toggleRelatedSelection(item: T): void {
    if (!this.canRemoveRelated(item)) {
      this.toast.warn('Você não pode alterar um vínculo que foi atribuído pelo sistema.');
      return;
    }
    const key = this.getRelatedKey(item);
    if (!key) {
      return;
    }
    this.selectedRelatedKeys.update((curr) => {
      const next = new Set(curr);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  public hasRemovableRelated(visibleItems: T[]): boolean {
    return visibleItems.some((item) => this.canRemoveRelated(item));
  }

  public areAllRelatedSelected(visibleItems: T[]): boolean {
    const removable = visibleItems.filter((item) => this.canRemoveRelated(item));
    if (!removable.length) {
      return false;
    }
    const set = this.selectedRelatedKeys();
    return removable.every((item) => set.has(this.getRelatedKey(item)));
  }

  public toggleSelectAllRelated(visibleItems: T[]): void {
    const removable = visibleItems.filter((item) => this.canRemoveRelated(item));
    const allSelected = this.areAllRelatedSelected(removable);
    this.selectedRelatedKeys.update((curr) => {
      const next = new Set(curr);
      for (const item of removable) {
        const key = this.getRelatedKey(item);
        if (!key) {
          continue;
        }
        if (allSelected) {
          next.delete(key);
        } else {
          next.add(key);
        }
      }
      return next;
    });
  }

  public getSelectedRelatedEntities(): T[] {
    const set = this.selectedRelatedKeys();
    return this.relatedEntities().filter(
      (item) => this.canRemoveRelated(item) && set.has(this.getRelatedKey(item)),
    );
  }
}
