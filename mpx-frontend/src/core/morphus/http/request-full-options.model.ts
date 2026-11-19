import { HttpHeaders, HttpParams } from '@angular/common/http';

export const MPX_OBSERVE_RESPONSE = 'response';

export interface MpxRequestFullOptions {
  headers?: HttpHeaders;
  observe: 'response';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: unknown;
}
