import { IMorphusEntity } from '@core/mpx-entities';

export interface IModuleReflected extends IMorphusEntity {
  name: string;
  applicationId?: string;
  corporationId: string;
  description?: string;
}
