import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MpxFilter } from '@core/morphus';
import { MpxEntityService } from '@core/morphus';
import { WorkspaceUser } from '@morphus/entities/workspace-user';
import { User } from '@security/entities/user';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceUserService extends MpxEntityService<WorkspaceUser, User> {
  constructor() {
    super('workspace-user');
    this.addPk('workspaceId').addPk('userId');
  }

  public override getEntitiesToRelate(
    filter?: MpxFilter | Partial<WorkspaceUser>,
  ): Observable<User[]> {
    const wsId = (filter as Partial<WorkspaceUser>)?.workspaceId;
    if (wsId) {
      return this.http.get<User[]>(`${this.baseUrl}/entities-to-relate/${wsId}`);
    }
    return super.getEntitiesToRelate(filter);
  }

  public override getRelatedEntities(
    filter?: MpxFilter | Partial<WorkspaceUser>,
  ): Observable<WorkspaceUser[]> {
    const wsId = (filter as Partial<WorkspaceUser>)?.workspaceId;
    if (wsId) {
      return this.http.get<WorkspaceUser[]>(`${this.baseUrl}/related-entities/${wsId}`);
    }
    return super.getRelatedEntities(filter);
  }
}
