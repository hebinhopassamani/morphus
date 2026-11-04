import { Injectable } from '@angular/core';
import { MorphusEntityService } from '@core/mpx-http';
import { CorporationUser } from '@security/entities/corporation-user';
import { User } from '@security/entities/user';

@Injectable({
  providedIn: 'root',
})
export class CorporationUserService extends MorphusEntityService<CorporationUser, User> {
  constructor() {
    super('corporation-user');
    this.addPk('corporationId').addPk('userId');
  }
}
