export type AppBuilderHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AppBuilderEndpointConfig {
  id: string;
  key: string;
  name: string;
  method: AppBuilderHttpMethod;
  url: string;
  responsePath?: string | null;
  responseMapping?: Record<string, string> | null;
  headers?: Record<string, string> | null;
  defaultQueryParams?: Record<string, string> | null;
}

export interface AppBuilderDataResult<T = unknown> {
  raw: unknown;
  data: T;
  status: number;
  executedAt: string;
}
