import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./application-list/application-list.component').then(
        (m) => m.ApplicationListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./application-edit/application-edit.component').then(
        (m) => m.ApplicationEditComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./application-edit/application-edit.component').then(
        (m) => m.ApplicationEditComponent,
      ),
  },
];

export default routes;
