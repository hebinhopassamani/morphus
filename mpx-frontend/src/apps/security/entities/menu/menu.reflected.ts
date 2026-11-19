import { MpxEntity } from '@core/morphus';

export interface MenuReflected extends MpxEntity {
  label: string;
  applicationId: string;
  moduleId?: string | null;
  subModuleId?: string | null;
  menuId?: string | null;
  corporationId?: string;
  url?: string | null;
  icon?: string | null;
  description?: string | null;
  order: number;
}
