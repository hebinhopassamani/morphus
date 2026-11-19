import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-role.component').then((m) => m.UserRoleComponent),
  },
];

