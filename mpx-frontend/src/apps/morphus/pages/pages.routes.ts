import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@morphus/pages/dashboard/dashboard.routes').then((m) => m.routes),
  },
  {
    path: 'admin/dashboard',
    loadChildren: () => import('@morphus/pages/dashboard/dashboard.routes').then((m) => m.routes),
  },
  {
    path: 'corporation',
    loadChildren: () => import('@morphus/pages/corporation/corporation.routes').then((m) => m.routes),
  },
  {
    path: 'workspace',
    loadChildren: () => import('@morphus/pages/workspace/workspace.routes').then((m) => m.routes),
  },
  {
    path: 'application',
    loadChildren: () => import('@morphus/pages/application/application.routes').then((m) => m.routes),
  },
  {
    path: 'settings',
    loadChildren: () => import('@morphus/pages/settings/settings.routes').then((m) => m.routes),
  },
];
