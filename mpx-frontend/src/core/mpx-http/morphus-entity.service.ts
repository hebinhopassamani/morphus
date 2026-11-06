import { inject } from '@angular/core';
import { ParamMap } from '@angular/router';
import { catchError, concatMap, from, map, Observable, of, toArray } from 'rxjs';
import { MpxAuth } from '@core/mpx-auth';
import { MorphusFilter } from '@core/mpx-base';
import {
  IMorphusEntity,
  IMorphusRelatedEntity,
  MORPHUS_EMPTY_GUID,
} from '@core/mpx-entities';
import { HTTP_ERROR_CODE } from '@core/mpx-enums';
import { MorphusHttpErrorService } from './morphus-http-error.service';
import { MORPHUS_INSTABILITY_MESSAGE } from './morphus-http.messages';
import { MorphusHttpService } from './morphus-http.service';

export abstract class MorphusEntityService<
  T extends IMorphusEntity | IMorphusRelatedEntity = IMorphusEntity,
  TRelate extends IMorphusEntity = IMorphusEntity,
> {
  protected readonly http = inject(MorphusHttpService);
  protected readonly auth = inject(MpxAuth);
  protected readonly errorService = inject(MorphusHttpErrorService);
  public primaryKeys: (keyof T)[] = ['id' as keyof T];
  private hasCustomPrimaryKeys = false;

  constructor(
    public readonly baseUrl: string,
    primaryKeys?: (keyof T)[],
  ) {
    if (primaryKeys && primaryKeys.length > 0) {
      this.primaryKeys = primaryKeys;
      this.hasCustomPrimaryKeys = true;
    }
  }

  public addPk(key: keyof T): this {
    if (!this.hasCustomPrimaryKeys) {
      this.primaryKeys = [];
      this.hasCustomPrimaryKeys = true;
    }
    if (!this.primaryKeys.includes(key)) {
      this.primaryKeys.push(key);
    }
    return this;
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

  public validatePrimaryKeys(entity?: Partial<T> | null): void {
    if (!entity || !this.primaryKeys.length) {
      this.handleMissingPk(String(this.primaryKeys[0] ?? 'id'));
    }
    for (const key of this.primaryKeys) {
      const val = entity[key];
      if (!this.isValidPkValue(val)) {
        this.handleMissingPk(String(key));
      }
    }
  }

  public getPkAsRoute(...pks: [Partial<T>] | (string | number)[]): string {
    if (pks.length === 1 && typeof pks[0] === 'object' && pks[0] !== null) {
      const entity = pks[0] as Partial<T>;
      this.validatePrimaryKeys(entity);

      return this.primaryKeys
        .map((key) => encodeURIComponent(String(entity[key])))
        .join('/');
    }

    if (pks.length !== this.primaryKeys.length) {
      const missingKey = String(this.primaryKeys[pks.length] ?? this.primaryKeys[0] ?? 'id');
      this.handleMissingPk(missingKey);
    }

    const values = pks as (string | number)[];
    values.forEach((val, index) => {
      if (!this.isValidPkValue(val)) {
        this.handleMissingPk(String(this.primaryKeys[index]));
      }
    });

    return values.map((pk) => encodeURIComponent(String(pk))).join('/');
  }

  private isValidPkValue(val: unknown): boolean {
    return (
      val !== undefined &&
      val !== null &&
      String(val).trim() !== '' &&
      String(val) !== MORPHUS_EMPTY_GUID
    );
  }

  private handleMissingPk(keyName: string): never {
    if (keyName === 'corporationId' || !this.auth.isAuthenticated() || !this.auth.corporation()?.id) {
      this.auth.logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    this.errorService.notifyError({
      status: HTTP_ERROR_CODE.UNPROCESSABLE_ENTITY,
      code: HTTP_ERROR_CODE.UNPROCESSABLE_ENTITY,
      message: MORPHUS_INSTABILITY_MESSAGE,
      details: [`Chave primária obrigatória ausente: ${keyName}`],
      timestamp: new Date(),
    });

    throw new Error(MORPHUS_INSTABILITY_MESSAGE);
  }

  public getPkFromParamMap(paramMap: ParamMap): Partial<T> {
    const pkObject: Partial<T> = {};

    this.primaryKeys.forEach((key, index) => {
      const keyName = String(key);
      const val =
        paramMap.get(keyName) ??
        (paramMap.keys[index] ? paramMap.get(paramMap.keys[index]) : null);
      if (val !== null) {
        pkObject[key] = val as T[keyof T];
      }
    });

    return pkObject;
  }

  public list(filter?: MorphusFilter): Observable<T[]> {
    this.applyFilterParams(filter);
    return this.http.get<T[]>(this.baseUrl);
  }

  public getByPk(...pks: [Partial<T>] | (string | number)[]): Observable<T> {
    const pkRoute = this.getPkAsRoute(...pks);
    return this.http.get<T>(`${this.baseUrl}/${pkRoute}`);
  }

  public save(entity: Partial<T>): Observable<T> {
    if (this.itsNew(entity)) {
      return this.create(entity);
    }
    return this.update(entity);
  }

  public create(entity: Partial<T>): Observable<T> {
    const payload = this.sanitizePayload(entity, true);
    return this.http.post<T>(this.baseUrl, payload);
  }

  public update(entity: Partial<T>): Observable<T> {
    this.validatePrimaryKeys(entity);
    const payload = this.sanitizePayload(entity, false);
    return this.http.put<T>(this.baseUrl, payload);
  }

  private sanitizePayload(entity: Partial<T>, isCreate: boolean): Partial<T> {
    if (!entity || typeof entity !== 'object') {
      return entity;
    }
    const copy: Record<string, unknown> = { ...(entity as Record<string, unknown>) };
    if (isCreate) {
      for (const pk of this.primaryKeys) {
        const val = copy[String(pk)];
        if (
          val === undefined ||
          val === null ||
          String(val).trim() === '' ||
          String(val) === MORPHUS_EMPTY_GUID ||
          String(val).startsWith('catalog-')
        ) {
          delete copy[String(pk)];
        }
      }
    }
    for (const [k, v] of Object.entries(copy)) {
      if (k.endsWith('Id') && typeof v === 'string' && v.trim() === '') {
        copy[k] = null;
      }
    }
    return copy as Partial<T>;
  }

  public delete(...pks: [Partial<T>] | (string | number)[]): Observable<boolean> {
    const pkRoute = this.getPkAsRoute(...pks);
    return this.http.delete<boolean>(`${this.baseUrl}/${pkRoute}`);
  }

  // Métodos padronizados para telas de relacionamento N:N
  public getEntitiesToRelate(filter?: MorphusFilter | Partial<T>): Observable<TRelate[]> {
    this.applyFilterParams(filter as Record<string, unknown>);
    return this.http.get<TRelate[]>(`${this.baseUrl}/entities-to-relate`);
  }

  public getRelatedEntities(filter?: MorphusFilter | Partial<T>): Observable<T[]> {
    this.applyFilterParams(filter as Record<string, unknown>);
    return this.http.get<T[]>(`${this.baseUrl}/related-entities`);
  }

  public addRelationship(entity: Partial<T>): Observable<T> {
    this.validatePrimaryKeys(entity);
    const corpId = this.auth.corporation()?.id;
    const payload =
      corpId && !(entity as Record<string, unknown>)['corporationId']
        ? ({ ...entity, corporationId: corpId } as Partial<T>)
        : entity;
    return this.http.post<T>(`${this.baseUrl}/add-relationship`, payload);
  }

  public addRelationships(entities: Partial<T>[]): Observable<T[]> {
    if (!entities.length) {
      return of([]);
    }
    const corpId = this.auth.corporation()?.id;
    const payloads = entities.map((entity) => {
      this.validatePrimaryKeys(entity);
      return corpId && !(entity as Record<string, unknown>)['corporationId']
        ? ({ ...entity, corporationId: corpId } as Partial<T>)
        : entity;
    });
    return this.http.post<T[]>(`${this.baseUrl}/add-relationships`, payloads).pipe(
      catchError(() =>
        from(payloads).pipe(
          concatMap((entity) => this.addRelationship(entity)),
          toArray(),
        ),
      ),
    );
  }

  public removeRelationship(entity: Partial<T>): Observable<boolean> {
    this.validatePrimaryKeys(entity);
    const corpId = this.auth.corporation()?.id;
    const payload =
      corpId && !(entity as Record<string, unknown>)['corporationId']
        ? ({ ...entity, corporationId: corpId } as Partial<T>)
        : entity;
    return this.http.post<boolean>(`${this.baseUrl}/remove-relationship`, payload);
  }

  public removeRelationships(entities: Partial<T>[]): Observable<number> {
    if (!entities.length) {
      return of(0);
    }
    const corpId = this.auth.corporation()?.id;
    const payloads = entities.map((entity) => {
      this.validatePrimaryKeys(entity);
      return corpId && !(entity as Record<string, unknown>)['corporationId']
        ? ({ ...entity, corporationId: corpId } as Partial<T>)
        : entity;
    });
    return this.http.post<number>(`${this.baseUrl}/remove-relationships`, payloads).pipe(
      catchError(() =>
        from(payloads).pipe(
          concatMap((entity) => this.removeRelationship(entity)),
          toArray(),
          map((results) => results.length),
        ),
      ),
    );
  }

  public activate(entity: Partial<T>): Observable<boolean> {
    this.validatePrimaryKeys(entity);
    return this.http.post<boolean>(`${this.baseUrl}/activate`, entity);
  }

  public deactivate(entity: Partial<T>): Observable<boolean> {
    this.validatePrimaryKeys(entity);
    return this.http.post<boolean>(`${this.baseUrl}/deactivate`, entity);
  }

  public setOwner(entity: Partial<T>): Observable<boolean> {
    this.validatePrimaryKeys(entity);
    return this.http.post<boolean>(`${this.baseUrl}/set-owner`, entity);
  }

  public removeOwner(entity: Partial<T>): Observable<boolean> {
    this.validatePrimaryKeys(entity);
    return this.http.post<boolean>(`${this.baseUrl}/remove-owner`, entity);
  }

  protected applyFilterParams(filter?: Record<string, unknown>): void {
    if (!filter) {
      return;
    }
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== '') {
        this.http.addParam(key, String(value));
      }
    }
  }
}
