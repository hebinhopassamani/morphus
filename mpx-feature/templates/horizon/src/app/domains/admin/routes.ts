import { Routes } from '@angular/router';
import { AdminLayout } from '@/app/domains/admin/layout/layout';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tickets',
      },

      // Tickets
      {
        path: 'tickets',
        loadChildren: () => import('./modules/tickets/routes'),
      },

      // Customers
      {
        path: 'customers',
        loadChildren: () => import('./modules/customers/routes'),
      },

      // Reports
      {
        path: 'reports',
        loadChildren: () => import('./modules/reports/routes'),
      },

      // Help center
      {
        path: 'help-center',
        loadChildren: () => import('./modules/help-center/routes'),
      },

      // Settings
      {
        path: 'settings',
        loadChildren: () => import('./modules/settings/routes'),
      },
    ],
  },
];

export default routes;
