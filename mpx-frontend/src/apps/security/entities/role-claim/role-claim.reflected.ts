import { MpxRelatedEntity } from '@core/morphus';

export interface RoleClaimReflected extends MpxRelatedEntity {
  roleId: string;
  claimId: string;
  corporationId: string;
}
