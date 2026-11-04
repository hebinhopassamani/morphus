import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./claim-list/claim-list.component').then((m) => m.ClaimListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./claim-edit/claim-edit.component').then((m) => m.ClaimEditComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./claim-edit/claim-edit.component').then((m) => m.ClaimEditComponent),
  },
];

export default routes;
