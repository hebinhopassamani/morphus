import { MpxRelatedEntity } from '@core/morphus';

export interface UserRoleReflected extends MpxRelatedEntity {
  userId: string;
  roleId: string;
  corporationId: string;
}
