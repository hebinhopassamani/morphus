import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IRoleClaimReflected extends IMorphusRelatedEntity {
  roleId: string;
  claimId: string;
  corporationId: string;
}
