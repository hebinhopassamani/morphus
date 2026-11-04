import { Injectable } from '@angular/core';
import { MorphusEntityService } from '@core/mpx-http';
import { ApplicationUser } from '@morphus/entities/application-user';
import { User } from '@security/entities/user';

@Injectable({
  providedIn: 'root',
})
export class ApplicationUserService extends MorphusEntityService<ApplicationUser, User> {
  constructor() {
    super('application-user');
    this.addPk('applicationId').addPk('userId');
  }
}
