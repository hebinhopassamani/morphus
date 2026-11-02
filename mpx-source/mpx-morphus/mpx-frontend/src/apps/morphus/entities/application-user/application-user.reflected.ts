import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IApplicationUserReflected extends IMorphusRelatedEntity {
  applicationId: string;
  userId: string;
  isOwner?: boolean;
}
