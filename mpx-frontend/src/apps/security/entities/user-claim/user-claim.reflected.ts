import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IUserClaimReflected extends IMorphusRelatedEntity {
  userId: string;
  claimId: string;
  corporationId: string;
}
