import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MpxFilter } from '@core/morphus';
import { MpxEntityService } from '@core/morphus';
import { ApplicationUser } from '@morphus/entities/application-user';
import { User } from '@security/entities/user';

@Injectable({
  providedIn: 'root',
})
export class ApplicationUserService extends MpxEntityService<ApplicationUser, User> {
  constructor() {
    super('application-user');
    this.addPk('applicationId').addPk('userId');
  }

  public override getEntitiesToRelate(
    filter?: MpxFilter | Partial<ApplicationUser>,
  ): Observable<User[]> {
    const appId = (filter as Partial<ApplicationUser>)?.applicationId;
    if (appId) {
      return this.http.get<User[]>(`${this.baseUrl}/entities-to-relate/${appId}`);
    }
    return super.getEntitiesToRelate(filter);
  }

  public override getRelatedEntities(
    filter?: MpxFilter | Partial<ApplicationUser>,
  ): Observable<ApplicationUser[]> {
    const appId = (filter as Partial<ApplicationUser>)?.applicationId;
    if (appId) {
      return this.http.get<ApplicationUser[]>(`${this.baseUrl}/related-entities/${appId}`);
    }
    return super.getRelatedEntities(filter);
  }
}
