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

  startTrial(payload: Partial<WorkspaceApplication>): Observable<WorkspaceApplication> {
    return this.http.post<WorkspaceApplication>(`${this.baseUrl}/start-trial`, payload);
  }

  addToWorkspace(payload: Partial<WorkspaceApplication>): Observable<WorkspaceApplication> {
    return this.http.post<WorkspaceApplication>(`${this.baseUrl}/add-relationship`, payload);
  }
}
