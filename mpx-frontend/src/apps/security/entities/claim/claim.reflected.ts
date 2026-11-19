import { MpxEntity } from '@core/morphus';

export interface ClaimReflected extends MpxEntity {
  name?: string;
  claimType: string;
  claimValue: string;
  description?: string;
  moduleId?: string;
  subModuleId?: string;
  corporationId?: string;
}
