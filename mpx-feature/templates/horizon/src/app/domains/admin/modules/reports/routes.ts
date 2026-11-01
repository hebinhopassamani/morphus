import { Routes } from '@angular/router';

const routes: Routes = [
  // Reports
  {
    path: '',
    loadComponent: () => import('./features/reports/reports'),
  },
];

export default routes;
