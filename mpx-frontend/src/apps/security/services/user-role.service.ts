import { Injectable } from '@angular/core';
import { MorphusEntityService } from '@core/mpx-http';
import { Role } from '@security/entities/role';
import { UserRole } from '@security/entities/user-role';

@Injectable({
  providedIn: 'root',
})
export class UserRoleService extends MorphusEntityService<UserRole, Role> {
  constructor() {
    super('user-role');
    this.addPk('userId').addPk('roleId');
  }
}

