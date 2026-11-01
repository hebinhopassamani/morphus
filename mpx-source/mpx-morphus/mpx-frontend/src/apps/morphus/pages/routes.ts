import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'corporation' },
  { path: 'corporation', loadChildren: () => import('@morphus/pages/corporation/routes') },
  { path: 'module', loadChildren: () => import('@morphus/pages/module/routes') },
  { path: 'settings', loadChildren: () => import('@morphus/pages/settings/routes') },
  { path: '**', redirectTo: '/notfound' },
];

export default routes;
