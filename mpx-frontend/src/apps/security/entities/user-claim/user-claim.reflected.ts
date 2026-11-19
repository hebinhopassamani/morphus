import { MpxRelatedEntity } from '@core/morphus';

export interface UserClaimReflected extends MpxRelatedEntity {
  userId: string;
  claimId: string;
  corporationId: string;
}
