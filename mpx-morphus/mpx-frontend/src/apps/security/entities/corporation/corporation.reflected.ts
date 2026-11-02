import { IMorphusEntity } from '@core/mpx-entities';

export interface ICorporationReflected extends IMorphusEntity {
  name: string;
  key: string;
  email: string;
  fullName?: string;
  icon?: string;
  description?: string;
  corporationId?: string;
}
