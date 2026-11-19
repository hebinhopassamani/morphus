import { HttpHeaders, HttpParams } from '@angular/common/http';

export const MPX_OBSERVE_BODY = 'body';

export interface MpxRequestOptions {
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: unknown;
}
