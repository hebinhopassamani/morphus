import { IMorphusEntity } from '@core/mpx-entities';

export interface ISubModuleReflected extends IMorphusEntity {
  name: string;
  key: string;
  moduleId: string;
  corporationId: string;
  description?: string;
}
