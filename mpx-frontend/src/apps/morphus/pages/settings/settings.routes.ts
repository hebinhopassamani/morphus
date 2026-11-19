import { Routes } from '@angular/router';
import { SettingsLayout } from '@morphus/pages/settings/layout';

export const routes: Routes = [
  {
    path: '',
    component: SettingsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile').then((m) => m.SettingsProfile),
      },
      {
        path: 'preferences',
        loadComponent: () => import('./features/preferences').then((m) => m.SettingsPreferences),
      },
      {
        path: 'security',
        loadComponent: () => import('./features/security').then((m) => m.SettingsSecurity),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications').then((m) => m.SettingsNotifications),
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing').then((m) => m.SettingsBilling),
      },
      {
        path: 'workspace',
        loadComponent: () => import('./features/workspace').then((m) => m.SettingsWorkspace),
      },
    ],
  },
];
