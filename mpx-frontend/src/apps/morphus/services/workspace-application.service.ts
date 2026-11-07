import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MorphusEntityService } from '@core/mpx-http';
import { MorphusApplication } from '@morphus/entities/application';
import { WorkspaceApplication } from '@morphus/entities/workspace-application';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceApplicationService extends MorphusEntityService<
  WorkspaceApplication,
  MorphusApplication
> {
  constructor() {
    super('workspace-application');
    this.addPk('workspaceId').addPk('applicationId');
  }

  public override getEntitiesToRelate(
    filter?: Record<string, unknown> | Partial<WorkspaceApplication>,
  ): Observable<MorphusApplication[]> {
    const wsId = (filter as Partial<WorkspaceApplication>)?.workspaceId;
    if (wsId) {
      return this.http.get<MorphusApplication[]>(`${this.baseUrl}/entities-to-relate/${wsId}`);
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
