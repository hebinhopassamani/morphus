import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'project',
  },

  // Project
  {
    path: 'project',
    loadComponent: () => import('./features/project/project'),
  },

  // Analytics
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics'),
  },
];

export default routes;
