import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./user-edit/user-edit.component').then((m) => m.UserEditComponent),
  },
  {
    path: ':id/roles',
    loadComponent: () =>
      import('./user-role/user-role.component').then((m) => m.UserRoleComponent),
  },
  {
    path: ':id/claims',
    loadComponent: () =>
      import('./user-claim/user-claim.component').then((m) => m.UserClaimComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./user-edit/user-edit.component').then((m) => m.UserEditComponent),
  },
];

export default routes;
