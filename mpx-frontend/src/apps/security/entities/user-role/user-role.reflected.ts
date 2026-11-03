import { IMorphusRelatedEntity } from '@core/mpx-entities';

export interface IUserRoleReflected extends IMorphusRelatedEntity {
  userId: string;
  roleId: string;
  corporationId: string;
}
