import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MorphusFilter } from '@core/mpx-base';
import { MorphusEntityService } from '@core/mpx-http';
import { WorkspaceUser } from '@morphus/entities/workspace-user';
import { User } from '@security/entities/user';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceUserService extends MorphusEntityService<WorkspaceUser, User> {
  constructor() {
    super('workspace-user');
    this.addPk('workspaceId').addPk('userId');
  }

  public override getEntitiesToRelate(
    filter?: MorphusFilter | Partial<WorkspaceUser>,
  ): Observable<User[]> {
    const wsId = (filter as Partial<WorkspaceUser>)?.workspaceId;
    if (wsId) {
      return this.http.get<User[]>(`${this.baseUrl}/entities-to-relate/${wsId}`);
    }
    return super.getEntitiesToRelate(filter);
  }

  public override getRelatedEntities(
    filter?: MorphusFilter | Partial<WorkspaceUser>,
  ): Observable<WorkspaceUser[]> {
    const wsId = (filter as Partial<WorkspaceUser>)?.workspaceId;
    if (wsId) {
      return this.http.get<WorkspaceUser[]>(`${this.baseUrl}/related-entities/${wsId}`);
    }
    return super.getRelatedEntities(filter);
  }
}
