import { Injectable } from '@angular/core';
import { MorphusEntityService } from '@core/mpx-http';
import { IRoleReflected } from '@security/entities/role';
import { IUserRoleReflected } from '@security/entities/user-role';

@Injectable({
  providedIn: 'root',
})
export class UserRoleService extends MorphusEntityService<IUserRoleReflected, IRoleReflected> {
  constructor() {
    super('user-role');
    this.addPk('userId').addPk('roleId').addPk('corporationId');
  }
}
