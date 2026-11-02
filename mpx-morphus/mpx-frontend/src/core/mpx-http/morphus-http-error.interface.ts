import { HTTP_ERROR_CODE } from './http-error-code.enum';

export interface MorphusHttpError {
  status: number;
  code: HTTP_ERROR_CODE | number;
  message: string;
  details?: string[];
  url?: string | null;
  timestamp: Date;
}
