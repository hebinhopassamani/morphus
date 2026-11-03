import { IMorphusEntity } from '@core/mpx-entities';

export interface ISubModuleReflected extends IMorphusEntity {
  name: string;
  moduleId: string;
  corporationId: string;
  description?: string;
}
