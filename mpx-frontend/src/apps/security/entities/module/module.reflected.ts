import { MpxEntity } from '@core/morphus';

export interface ModuleReflected extends MpxEntity {
  name: string;
  applicationId?: string;
  corporationId: string;
  description?: string;
}
