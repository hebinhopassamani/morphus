import { Injectable } from '@angular/core';
import { MpxEntityService } from '@core/morphus';
import { Role } from '@security/entities/role';
import { UserRole } from '@security/entities/user-role';

@Injectable({
  providedIn: 'root',
})
export class UserRoleService extends MpxEntityService<UserRole, Role> {
  constructor() {
    super('user-role');
    this.addPk('userId').addPk('roleId');
  }
}
