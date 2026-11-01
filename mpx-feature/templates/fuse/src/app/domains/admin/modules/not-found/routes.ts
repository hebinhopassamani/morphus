import { Routes } from '@angular/router';
import { AdminLayout } from '@/app/domains/admin/layout/layout';

const routes: Routes = [
  // Not found
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '**',
        loadComponent: () => import('./features/not-found'),
      },
    ],
  },
];

export default routes;
