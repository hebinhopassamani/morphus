import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface ICorporationUserReflected extends IMorphusRelatedEntity {
  corporationId: string;
  userId: string;
  isOwner: boolean;
}
