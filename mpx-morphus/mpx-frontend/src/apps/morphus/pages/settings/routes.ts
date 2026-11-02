import { Routes } from '@angular/router';
import SettingsLayout from '@morphus/pages/settings/layout';

const routes: Routes = [
  {
    path: '',
    component: SettingsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'preferences',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile'),
      },
      {
        path: 'preferences',
        loadComponent: () => import('./features/preferences'),
      },
      {
        path: 'security',
        loadComponent: () => import('./features/security'),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications'),
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing'),
      },
      {
        path: 'workspace',
        loadComponent: () => import('./features/workspace'),
      },
    ],
  },
];

export default routes;

