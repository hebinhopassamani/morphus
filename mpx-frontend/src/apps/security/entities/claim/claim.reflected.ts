import { IMorphusEntity } from '@core/mpx-entities';

export interface IClaimReflected extends IMorphusEntity {
  name?: string;
  claimType: string;
  claimValue: string;
  description?: string;
  moduleId?: string;
  subModuleId?: string;
  corporationId?: string;
}
