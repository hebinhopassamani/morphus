import { IMorphusEntity } from '@core/mpx-entities';

export interface ICorporationReflected extends IMorphusEntity {
  name: string;
  email: string;
  personType?: 'PJ' | 'PF' | string;
  cpfCnpj?: string;
  fullName?: string;
  icon?: string;
  color?: string;
  description?: string;
  corporationId?: string;
}
