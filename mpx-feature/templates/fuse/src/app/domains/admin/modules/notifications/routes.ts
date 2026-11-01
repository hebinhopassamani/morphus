import { Routes } from '@angular/router';

const routes: Routes = [
  // Notifications
  {
    path: '',
    loadComponent: () => import('./features/notifications/notifications'),
  },
];

export default routes;
