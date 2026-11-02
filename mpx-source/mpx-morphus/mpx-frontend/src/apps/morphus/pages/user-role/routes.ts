import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-role.component').then((m) => m.UserRoleComponent),
  },
];

export default routes;
