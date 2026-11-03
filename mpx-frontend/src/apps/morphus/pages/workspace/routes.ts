import { Routes } from '@angular/router';
import { WorkspaceEditComponent } from './workspace-edit/workspace-edit.component';
import { WorkspaceListComponent } from './workspace-list/workspace-list.component';

export default [
  {
    path: '',
    component: WorkspaceListComponent,
  },
  {
    path: ':id',
    component: WorkspaceEditComponent,
  },
] as Routes;
