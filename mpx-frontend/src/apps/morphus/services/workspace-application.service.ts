import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MpxEntityService } from '@core/morphus';
import { MpxApplication } from '@morphus/entities/application';
import { WorkspaceApplication } from '@morphus/entities/workspace-application';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceApplicationService extends MpxEntityService<
  WorkspaceApplication,
  MpxApplication
> {
  constructor() {
    super('workspace-application');
    this.addPk('workspaceId').addPk('applicationId');
  }

  public override getEntitiesToRelate(
    filter?: Record<string, unknown> | Partial<WorkspaceApplication>,
  ): Observable<MpxApplication[]> {
    const wsId = (filter as Partial<WorkspaceApplication>)?.workspaceId;
    if (wsId) {
      return this.http.get<MpxApplication[]>(`${this.baseUrl}/entities-to-relate/${wsId}`);
    }
    return super.getEntitiesToRelate(filter as any);
  }

  public override getRelatedEntities(
    filter?: Record<string, unknown> | Partial<WorkspaceApplication>,
  ): Observable<WorkspaceApplication[]> {
    const wsId = (filter as Partial<WorkspaceApplication>)?.workspaceId;
    if (wsId) {
      return this.http.get<WorkspaceApplication[]>(`${this.baseUrl}/related-entities/${wsId}`);
    }
    return super.getRelatedEntities(filter as any);
  }

  startTrial(payload: Partial<WorkspaceApplication>): Observable<WorkspaceApplication> {
    return this.http.post<WorkspaceApplication>(`${this.baseUrl}/start-trial`, payload);
  }

  addToWorkspace(payload: Partial<WorkspaceApplication>): Observable<WorkspaceApplication> {
    return this.http.post<WorkspaceApplication>(`${this.baseUrl}/add-relationship`, payload);
  }
}
