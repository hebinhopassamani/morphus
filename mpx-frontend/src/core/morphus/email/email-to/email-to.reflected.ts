import { MpxEntity } from '@core/morphus';

export interface EmailToReflected extends MpxEntity {
  mail: string;
  name?: string;
  emailId: string;
}
