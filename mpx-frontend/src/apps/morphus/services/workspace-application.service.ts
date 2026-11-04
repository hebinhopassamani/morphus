import { Injectable } from '@angular/core';
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
}
