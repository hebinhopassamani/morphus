import { HttpHeaders, HttpParams } from '@angular/common/http';

export const OResponse = 'response';

export interface IRequestFullOptions {
  headers?: HttpHeaders;
  observe: 'response';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: unknown;
}
