import { DestroyRef, Directive, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive()
export abstract class MorphusComponent<T> {
  public readonly router = inject(Router);
  public readonly activatedRoute = inject(ActivatedRoute);
  protected readonly destroyRef = inject(DestroyRef);

  public readonly title1 = signal<string>('');
  public readonly title2 = signal<string>('');
  public readonly title3 = signal<string>('');

  public sub1?: Subscription;
  public sub2?: Subscription;
  public sub3?: Subscription;
  public sub4?: Subscription;

  public primaryKeys: (keyof T)[] = ['id' as keyof T];

  // Loading Global (para carregamento da página ou painel)
  public readonly loading = signal<boolean>(false);

  // Loading por Entidade (para girar spinner apenas na linha/registro específico)
  private readonly loadingEntitiesState = signal<Set<T>>(new Set());

  constructor() {
    this.destroyRef.onDestroy(() => this.destroySubscriptions());
  }

  public startLoading(entity?: T): void {
    if (entity) {
      this.loadingEntitiesState.update((set) => {
        const next = new Set(set);
        next.add(entity);
        return next;
      });
      return;
    }
    this.loading.set(true);
  }

  public stopLoading(entity?: T): void {
    if (entity) {
      this.loadingEntitiesState.update((set) => {
        const next = new Set(set);
        next.delete(entity);
        return next;
      });
      return;
    }
    this.loading.set(false);
  }

  public isEntityLoading(entity: T): boolean {
    return this.loadingEntitiesState().has(entity);
  }

  public hasPrimaryKeys(entity?: Partial<T> | null): boolean {
    if (!entity || !this.primaryKeys.length) {
      return false;
    }
    return this.primaryKeys.every((key) => {
      const val = entity[key];
      return val !== undefined && val !== null && val !== '';
    });
  }

  public destroySubscriptions(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
    this.sub4?.unsubscribe();
  }
}
