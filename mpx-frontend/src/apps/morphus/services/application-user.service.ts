import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MorphusFilter } from '@core/mpx-base';
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

  public override getEntitiesToRelate(
    filter?: MorphusFilter | Partial<ApplicationUser>,
  ): Observable<User[]> {
    const appId = (filter as Partial<ApplicationUser>)?.applicationId;
    if (appId) {
      return this.http.get<User[]>(`${this.baseUrl}/entities-to-relate/${appId}`);
    }
    return super.getEntitiesToRelate(filter);
  }

  public override getRelatedEntities(
    filter?: MorphusFilter | Partial<ApplicationUser>,
  ): Observable<ApplicationUser[]> {
    const appId = (filter as Partial<ApplicationUser>)?.applicationId;
    if (appId) {
      return this.http.get<ApplicationUser[]>(`${this.baseUrl}/related-entities/${appId}`);
    }
    return super.getRelatedEntities(filter);
  }
}
