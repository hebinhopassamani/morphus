import { MpxEntity } from '@core/morphus';

export interface EmailBccReflected extends MpxEntity {
  mail: string;
  name?: string;
  emailId: string;
}
