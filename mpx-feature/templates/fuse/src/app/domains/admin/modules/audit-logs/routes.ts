import { Routes } from '@angular/router';

const routes: Routes = [
  // Audit logs
  {
    path: '',
    loadComponent: () => import('./features/audit-logs/audit-logs'),
  },
];

export default routes;
