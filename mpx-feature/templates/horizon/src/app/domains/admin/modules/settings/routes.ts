import { Routes } from '@angular/router';
import SettingsLayout from '@/app/domains/admin/modules/settings/layout';

const routes: Routes = [
  {
    path: '',
    component: SettingsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'account',
      },
      {
        path: 'account',
        loadComponent: () => import('./features/account'),
      },
      {
        path: 'team',
        loadComponent: () => import('./features/team'),
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing'),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications'),
      },
      {
        path: 'security',
        loadComponent: () => import('./features/security'),
      },
      {
        path: 'channels',
        loadComponent: () => import('./features/channels'),
      },
      {
        path: 'rules',
        loadComponent: () => import('./features/rules'),
      },
    ],
  },
];

export default routes;
