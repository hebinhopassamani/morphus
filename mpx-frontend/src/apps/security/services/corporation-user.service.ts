import { Injectable } from '@angular/core';
import { MpxEntityService } from '@core/morphus';
import { CorporationUser } from '@security/entities/corporation-user';
import { User } from '@security/entities/user';

@Injectable({
  providedIn: 'root',
})
export class CorporationUserService extends MpxEntityService<CorporationUser, User> {
  constructor() {
    super('corporation-user');
    this.addPk('corporationId').addPk('userId');
  }
}
