import { MpxRelatedEntity } from '@core/morphus';

export interface ApplicationUserReflected extends MpxRelatedEntity {
  applicationId: string;
  userId: string;
  isOwner?: boolean;
}
