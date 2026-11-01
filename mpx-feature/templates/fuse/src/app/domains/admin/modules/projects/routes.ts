import { Routes } from '@angular/router';

const routes: Routes = [
  // Projects
  {
    path: '',
    loadComponent: () => import('./features/projects/projects'),
  },

  // Project
  {
    path: ':id',
    loadComponent: () => import('./features/project/project'),
  },
];

export default routes;
