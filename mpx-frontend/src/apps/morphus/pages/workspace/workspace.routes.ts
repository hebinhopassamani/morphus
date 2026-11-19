import { Routes } from '@angular/router';
import { WorkspaceEditComponent } from './workspace-edit/workspace-edit.component';
import { WorkspaceListComponent } from './workspace-list/workspace-list.component';

export const routes: Routes = [
  {
    path: '',
    component: WorkspaceListComponent,
  },
  {
    path: 'new',
    component: WorkspaceEditComponent,
  },
  {
    path: ':id',
    component: WorkspaceEditComponent,
  },
];
