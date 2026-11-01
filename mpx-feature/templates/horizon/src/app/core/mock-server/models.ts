import { HttpParams, HttpRequest } from '@angular/common/http';

export enum HttpMethods {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}

// Path params
export type Path = string;
export type Params = Partial<Record<string, string>>;

export type ExtractedPathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Record<Param | keyof ExtractedPathParams<Rest>, string>
    : T extends `${string}:${infer Param}`
      ? Record<Param, string>
      : Record<string, never>;

// Response
export type ResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
};

export type Response<T = unknown> = {
  status: number;
  body: T;
  headers: Record<string, string>;
};

// Context
export type Context<P = Params, Q = unknown, R = unknown> = {
  req: {
    body: Q | null;
    params: P;
    queryParams: HttpParams;
    raw: HttpRequest<unknown>;
  };
  json: (body: R, options?: ResponseOptions) => Response<R>;
  text: (body: string, options?: ResponseOptions) => Response<string>;
  blob: (body: Blob, options?: ResponseOptions) => Response<Blob>;
  delay: (delay: number) => Promise<void>;
};

// Handler
export type Handler<P = Params, Q = unknown, R = unknown> = (
  context: Context<P, Q, R>
) => Response<R> | PromiseLike<Response<R>>;

// Mock server configuration
export type MockServerConfig = {
  baseURL: string;
  delay: number;
  logging: {
    bypass: boolean;
    handler: boolean;
  };
};
