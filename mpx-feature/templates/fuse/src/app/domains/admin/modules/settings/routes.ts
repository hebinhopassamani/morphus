import { Routes } from '@angular/router';
import SettingsLayout from '@/app/domains/admin/modules/settings/layout';

const routes: Routes = [
  // Settings
  {
    path: '',
    component: SettingsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile',
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile'),
      },

      // Preferences
      {
        path: 'preferences',
        loadComponent: () => import('./features/preferences'),
      },

      // Security
      {
        path: 'security',
        loadComponent: () => import('./features/security'),
      },

      // Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications'),
      },

      // Billing
      {
        path: 'billing',
        loadComponent: () => import('./features/billing'),
      },

      // Workspace
      {
        path: 'workspace',
        loadComponent: () => import('./features/workspace'),
      },
    ],
  },
];

export default routes;
