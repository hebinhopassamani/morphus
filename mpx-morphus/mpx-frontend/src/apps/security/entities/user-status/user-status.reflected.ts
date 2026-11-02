import { IMorphusEntity } from '@core/mpx-entities';

export interface IUserStatusReflected extends IMorphusEntity {
  name: string;
  key: string;
  corporationId: string;
  description?: string;
}
