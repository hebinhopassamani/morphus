import { HttpHeaders, HttpParams } from '@angular/common/http';

export const OBody = 'body';

export interface IRequestOptions {
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: unknown;
}
