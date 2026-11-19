import { MpxEntity } from '@core/morphus';

export interface SubModuleReflected extends MpxEntity {
  name: string;
  moduleId: string;
  corporationId: string;
  description?: string;
}
