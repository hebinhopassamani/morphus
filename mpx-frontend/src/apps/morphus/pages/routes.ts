import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('@morphus/pages/dashboard/routes') },
  { path: 'admin/dashboard', loadChildren: () => import('@morphus/pages/dashboard/routes') },
  { path: 'corporation', loadChildren: () => import('@morphus/pages/corporation/routes') },
  { path: 'workspace', loadChildren: () => import('@morphus/pages/workspace/routes') },
  { path: 'application', loadChildren: () => import('@morphus/pages/application/routes') },
  { path: 'settings', loadChildren: () => import('@morphus/pages/settings/routes') },
];

export default routes;
