import { MpxEntity } from '@core/morphus';

export interface CorporationReflected extends MpxEntity {
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
