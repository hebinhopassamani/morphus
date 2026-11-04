import { Injectable } from '@angular/core';
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
}
