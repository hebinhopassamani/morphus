import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, switchMap, take } from 'rxjs';
import { environment } from '@/environments/environment';
import { Auth } from '@core/mpx-auth';
import { IRequestFullOptions, OResponse } from './request-full-options.interface';
import { IRequestOptions } from './request-options.interface';

@Injectable({
  providedIn: 'root',
})
export class MorphusHttpService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  private pendingHeaders = new HttpHeaders();
  private pendingParams = new HttpParams();

  public readonly activeRequests = signal<number>(0);
  public readonly isLoading = computed(() => this.activeRequests() > 0);

  public addHeader(key: string, value: string): MorphusHttpService {
    if (key && value !== undefined && value !== null) {
      this.pendingHeaders = this.pendingHeaders.set(key, String(value));
    }
    return this;
  }

  public addParam(key: string, value: string | number | boolean): MorphusHttpService {
    if (key && value !== undefined && value !== null && value !== '') {
      this.pendingParams = this.pendingParams.set(key, String(value));
    }
    return this;
  }

  public get<T>(url: string, options?: IRequestOptions): Observable<T> {
    const resolvedUrl = this.resolveUrl(url);
    const mergedOptions = this.consumeOptions(options);

    return this.executeWithAuth(() => this.http.get<T>(resolvedUrl, mergedOptions));
  }

  public post<T>(url: string, body?: unknown, options?: IRequestOptions): Observable<T> {
    const resolvedUrl = this.resolveUrl(url);
    const mergedOptions = this.consumeOptions(options);

    return this.executeWithAuth(() => this.http.post<T>(resolvedUrl, body ?? null, mergedOptions));
  }

  public postWithResponse<T>(
    url: string,
    body?: unknown,
    options?: IRequestOptions,
  ): Observable<HttpResponse<T>> {
    const resolvedUrl = this.resolveUrl(url);
    const mergedOptions = this.consumeFullOptions(options);

    return this.executeWithAuth(() =>
      this.http.post<T>(resolvedUrl, body ?? null, mergedOptions),
    );
  }

  public put<T>(url: string, body?: unknown, options?: IRequestOptions): Observable<T> {
    const resolvedUrl = this.resolveUrl(url);
    const mergedOptions = this.consumeOptions(options);

    return this.executeWithAuth(() => this.http.put<T>(resolvedUrl, body ?? null, mergedOptions));
  }

  public delete<T>(url: string, options?: IRequestOptions): Observable<T> {
    const resolvedUrl = this.resolveUrl(url);
    const mergedOptions = this.consumeOptions(options);

    return this.executeWithAuth(() => this.http.delete<T>(resolvedUrl, mergedOptions));
  }

  private executeWithAuth<T>(requestFn: () => Observable<T>): Observable<T> {
    this.activeRequests.update((count) => count + 1);

    const source$ = this.auth.refreshTokenRequired()
      ? this.waitForRefreshAndExecute(requestFn)
      : requestFn();

    return source$.pipe(
      finalize(() => {
        this.activeRequests.update((count) => Math.max(0, count - 1));
      }),
    );
  }

  private waitForRefreshAndExecute<T>(requestFn: () => Observable<T>): Observable<T> {
    this.auth.triggerRefreshToken();
    return this.auth.refreshToken$.pipe(
      take(1),
      switchMap(() => requestFn()),
    );
  }

  private resolveUrl(url: string): string {
    if (!url) {
      return environment.apiUrl;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = environment.apiUrl.replace(/\/+$/, '');
    const cleanUrl = url.replace(/^\/?api\/v1\/?/i, '');
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `${base}${path}`;
  }

  private consumeOptions(options?: IRequestOptions): IRequestOptions {
    let headers = this.pendingHeaders;
    let params = this.pendingParams;

    this.pendingHeaders = new HttpHeaders();
    this.pendingParams = new HttpParams();

    if (options?.headers) {
      for (const key of options.headers.keys()) {
        const value = options.headers.get(key);
        if (value !== null) {
          headers = headers.set(key, value);
        }
      }
    }

    if (options?.params) {
      for (const key of options.params.keys()) {
        const value = options.params.get(key);
        if (value !== null) {
          params = params.set(key, value);
        }
      }
    }

    return {
      ...options,
      headers,
      params,
    };
  }

  private consumeFullOptions(options?: IRequestOptions): IRequestFullOptions {
    const base = this.consumeOptions(options);
    return {
      ...base,
      observe: OResponse,
    };
  }
}
