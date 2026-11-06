import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { AppBuilderDataResult, AppBuilderEndpointConfig } from '@app-builder/entities';

@Injectable({
  providedIn: 'root',
})
export class AppBuilderDataService {
  private readonly http = inject(HttpClient);

  execute<T = unknown>(
    config: AppBuilderEndpointConfig,
    options?: {
      routeParams?: Record<string, string>;
      queryParams?: Record<string, string>;
      body?: unknown;
    },
  ): Observable<AppBuilderDataResult<T>> {
    const resolvedUrl = this.resolveUrl(config.url, options?.routeParams);
    const headers = new HttpHeaders(config.headers ?? {});
    const mergedQuery = {
      ...(config.defaultQueryParams ?? {}),
      ...(options?.queryParams ?? {}),
    };
    const params = new HttpParams({ fromObject: mergedQuery });

    return this.http
      .request<unknown>(config.method, resolvedUrl, {
        headers,
        params,
        body: options?.body,
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const rawBody = response.body;
          const extracted = this.extractByPath(rawBody, config.responsePath);
          const mapped = this.applyResponseMapping<T>(extracted, config.responseMapping);

          return {
            raw: rawBody,
            data: mapped,
            status: response.status,
            executedAt: new Date().toISOString(),
          };
        }),
      );
  }

  private resolveUrl(rawUrl: string, routeParams?: Record<string, string>): string {
    let url = (rawUrl || '').trim();
    if (routeParams) {
      for (const [key, value] of Object.entries(routeParams)) {
        url = url
          .replace(new RegExp(`:${key}\\b`, 'g'), encodeURIComponent(value))
          .replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(value));
      }
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const base = (environment.apiUrl || '').replace(/\/+$/, '');
    const cleanPath = url.replace(/^\/+/, '');
    return `${base}/${cleanPath}`;
  }

  private extractByPath(source: unknown, path?: string | null): unknown {
    if (!path || !source || typeof source !== 'object') {
      return source;
    }

    const segments = path
      .split('.')
      .map((s) => s.trim())
      .filter(Boolean);

    let current: unknown = source;
    for (const seg of segments) {
      if (current && typeof current === 'object' && seg in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[seg];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private applyResponseMapping<T>(
    payload: unknown,
    mapping?: Record<string, string> | null,
  ): T {
    if (!mapping || Object.keys(mapping).length === 0 || !payload) {
      return payload as T;
    }

    const mapSingleObject = (item: Record<string, unknown>): Record<string, unknown> => {
      const result: Record<string, unknown> = { ...item };
      for (const [targetKey, sourcePath] of Object.entries(mapping)) {
        result[targetKey] = this.extractByPath(item, sourcePath);
      }
      return result;
    };

    if (Array.isArray(payload)) {
      return payload.map((item) =>
        item && typeof item === 'object' ? mapSingleObject(item as Record<string, unknown>) : item,
      ) as unknown as T;
    }

    if (typeof payload === 'object') {
      return mapSingleObject(payload as Record<string, unknown>) as unknown as T;
    }

    return payload as T;
  }
}
