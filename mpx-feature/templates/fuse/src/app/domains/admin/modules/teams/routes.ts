import { Routes } from '@angular/router';

const routes: Routes = [
  // Teams
  {
    path: '',
    loadComponent: () => import('./features/teams/teams'),
  },

  // Team
  {
    path: ':id',
    loadComponent: () => import('./features/team/team'),
  },
];

export default routes;
