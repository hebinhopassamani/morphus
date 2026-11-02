import { DestroyRef, Directive, inject, isSignal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IMorphusEntity,
  IMorphusRelatedEntity,
  MORPHUS_EMPTY_GUID,
} from '@core/mpx-entities';
import { MorphusMessageService } from '@core/mpx-message';

@Directive()
export abstract class MorphusComponent<
  T extends object = IMorphusEntity,
> {
  public readonly router = inject(Router);
  public readonly activatedRoute = inject(ActivatedRoute);
  public readonly messageService = inject(MorphusMessageService);
  protected readonly destroyRef = inject(DestroyRef);

  public readonly title1 = signal<string>('');
  public readonly title2 = signal<string>('');
  public readonly title3 = signal<string>('');

  public sub1?: Subscription;
  public sub2?: Subscription;
  public sub3?: Subscription;
  public sub4?: Subscription;

  public primaryKeys: (keyof T)[] = ['id' as keyof T];
  private readonly primaryKeyRouteMap = new Map<keyof T, string>([
    ['id' as keyof T, 'id'],
  ]);
  private hasCustomPrimaryKeys = false;

  // Loading Global (para carregamento da página ou painel)
  public readonly loading = signal<boolean>(false);

  // Loading por Entidade (para girar spinner apenas na linha/registro específico)
  private readonly loadingEntitiesState = signal<Set<T>>(new Set());

  constructor() {
    this.destroyRef.onDestroy(() => this.destroySubscriptions());
  }

  public addPrimaryKey(key: keyof T, routeParam?: string): this {
    if (!this.hasCustomPrimaryKeys) {
      this.primaryKeys = [];
      this.primaryKeyRouteMap.clear();
      this.hasCustomPrimaryKeys = true;
    }
    if (!this.primaryKeys.includes(key)) {
      this.primaryKeys.push(key);
    }
    this.primaryKeyRouteMap.set(key, routeParam ?? String(key));
    return this;
  }

  public addPk(key: keyof T, routeParam?: string): this {
    return this.addPrimaryKey(key, routeParam);
  }

  public loadPrimaryKeyFromRoute(
    targetEntity?: WritableSignal<Partial<T>> | Partial<T>,
    paramMap?: ParamMap,
  ): Partial<T> {
    const loaded = this.getPkFromRoute(paramMap);

    if (targetEntity) {
      if (isSignal(targetEntity)) {
        (targetEntity as WritableSignal<Partial<T>>).update((curr) => ({
          ...curr,
          ...loaded,
        }));
      } else {
        Object.assign(targetEntity, loaded);
      }
    }

    return loaded;
  }

  // Alias com a grafia original caso seja encadeado como .loadPrimariKey(this.entity)
  public loadPrimariKey(
    targetEntity?: WritableSignal<Partial<T>> | Partial<T>,
    paramMap?: ParamMap,
  ): Partial<T> {
    return this.loadPrimaryKeyFromRoute(targetEntity, paramMap);
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
      return (
        val !== undefined &&
        val !== null &&
        val !== '' &&
        String(val) !== MORPHUS_EMPTY_GUID
      );
    });
  }

  public itsNew(entity?: Partial<T> | null): boolean {
    return !this.hasPrimaryKeys(entity);
  }

  public compareByPk(entityA?: Partial<T> | null, entityB?: Partial<T> | null): boolean {
    if (this.itsNew(entityA) || this.itsNew(entityB) || !entityA || !entityB) {
      return false;
    }
    return this.primaryKeys.every((key) => entityA[key] === entityB[key]);
  }

  public getPkAsRoute(...pks: [Partial<T>] | (string | number)[]): string {
    if (pks.length === 1 && typeof pks[0] === 'object' && pks[0] !== null) {
      const entity = pks[0] as Partial<T>;
      if (!this.hasPrimaryKeys(entity)) {
        throw new Error(
          'Ops! Estamos passando por uma breve instabilidade, já já estaremos de volta.',
        );
      }
      return this.primaryKeys
        .map((key) => encodeURIComponent(String(entity[key])))
        .join('/');
    }

    if (
      pks.length !== this.primaryKeys.length ||
      (pks as (string | number)[]).some(
        (pk) =>
          pk === undefined ||
          pk === null ||
          String(pk).trim() === '' ||
          String(pk) === MORPHUS_EMPTY_GUID,
      )
    ) {
      throw new Error(
        'Ops! Estamos passando por uma breve instabilidade, já já estaremos de volta.',
      );
    }

    return (pks as (string | number)[])
      .map((pk) => encodeURIComponent(String(pk)))
      .join('/');
  }

  public getPkFromRoute(paramMap?: ParamMap): Partial<T> {
    const map = paramMap ?? this.activatedRoute.snapshot.paramMap;
    const pkObject: Partial<T> = {};

    this.primaryKeys.forEach((key, index) => {
      const routeParamName = this.primaryKeyRouteMap.get(key) ?? String(key);
      const val =
        map.get(routeParamName) ??
        map.get(String(key)) ??
        (map.keys[index] ? map.get(map.keys[index]) : null);
      if (val !== null) {
        pkObject[key] = val as T[keyof T];
      }
    });

    return pkObject;
  }

  public destroySubscriptions(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
    this.sub4?.unsubscribe();
  }
}
