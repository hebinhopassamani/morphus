import { MpxHttpErrorCode } from '@core/morphus';

export interface MpxHttpError {
  status: number;
  code: MpxHttpErrorCode | number;
  message: string;
  details?: string[];
  url?: string | null;
  timestamp: Date;
}
