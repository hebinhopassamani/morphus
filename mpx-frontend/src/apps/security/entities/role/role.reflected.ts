import { MpxEntity } from '@core/morphus';

export interface RoleReflected extends MpxEntity {
  name: string;
  description?: string;
  moduleId?: string;
  subModuleId?: string;
  corporationId?: string;
}
