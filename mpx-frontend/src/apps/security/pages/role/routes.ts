import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./role-list/role-list.component').then((m) => m.RoleListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./role-edit/role-edit.component').then((m) => m.RoleEditComponent),
  },
  {
    path: ':id/claims',
    loadComponent: () =>
      import('./role-claim/role-claim.component').then((m) => m.RoleClaimComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./role-edit/role-edit.component').then((m) => m.RoleEditComponent),
  },
];

export default routes;
