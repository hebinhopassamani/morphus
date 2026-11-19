import { MpxEntity } from '@core/morphus';

export interface EmailCcReflected extends MpxEntity {
  mail: string;
  name?: string;
  emailId: string;
}
