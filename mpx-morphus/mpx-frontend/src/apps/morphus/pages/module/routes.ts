import { Routes } from '@angular/router';
import { ModuleEditComponent } from './module-edit/module-edit.component';
import { ModuleListComponent } from './module-list/module-list.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleListComponent,
  },
  {
    path: 'new',
    component: ModuleEditComponent,
  },
  {
    path: ':id',
    component: ModuleEditComponent,
  },
];

export default routes;
