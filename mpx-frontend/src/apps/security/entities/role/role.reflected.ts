import { IMorphusEntity } from '@core/mpx-entities';

export interface IRoleReflected extends IMorphusEntity {
  name: string;
  description?: string;
  moduleId?: string;
  subModuleId?: string;
  corporationId?: string;
}
