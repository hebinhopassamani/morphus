import { MpxEntity } from './entity.entity';

export interface MpxRelatedEntity {
  corporationId?: string;
  system?: boolean;
  inactive?: boolean;
  concurrencyStamp?: string;
}

export type MpxBaseEntity = MpxEntity | MpxRelatedEntity;
