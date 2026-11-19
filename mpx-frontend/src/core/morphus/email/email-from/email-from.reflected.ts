import { MpxEntity } from '@core/morphus';

export interface EmailFromReflected extends MpxEntity {
  mail: string;
  name?: string;
  emailId: string;
}
