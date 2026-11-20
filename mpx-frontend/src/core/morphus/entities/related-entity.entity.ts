import { MpxEntity } from './entity.entity';

export interface MpxRelatedEntity {
  corporationId?: string;
  system?: boolean;
  inactive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  concurrencyStamp?: string;
}

export type MpxBaseEntity = MpxEntity | MpxRelatedEntity;
