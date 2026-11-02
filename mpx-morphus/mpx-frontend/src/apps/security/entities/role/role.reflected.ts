import { IMorphusEntity } from '@core/mpx-entities';

export interface IRoleReflected extends IMorphusEntity {
  name: string;
  key: string;
  description?: string;
  corporationId: string;
}
