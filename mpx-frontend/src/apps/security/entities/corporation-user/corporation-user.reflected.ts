import { MpxRelatedEntity } from '@core/morphus';

export interface CorporationUserReflected extends MpxRelatedEntity {
  corporationId: string;
  userId: string;
  isOwner: boolean;
}
