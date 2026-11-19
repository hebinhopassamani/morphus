import { MpxEntity } from '@core/morphus';

export interface UserStatusReflected extends MpxEntity {
  name: string;
  corporationId: string;
  description?: string;
}
