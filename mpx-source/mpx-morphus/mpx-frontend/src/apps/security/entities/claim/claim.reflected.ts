import { IMorphusEntity } from '@core/mpx-entities';

export interface IClaimReflected extends IMorphusEntity {
  name: string;
  key: string;
  claimType: string;
  claimValue: string;
  description?: string;
  subModuleId: string;
  corporationId: string;
}
