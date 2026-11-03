import { IMorphusEntity } from './morphus-entity.interface';

export interface IMorphusRelatedEntity {
  corporationId?: string;
  system?: boolean;
  inactive?: boolean;
  concurrencyStamp?: string;
}

export type MorphusBaseEntity = IMorphusEntity | IMorphusRelatedEntity;
