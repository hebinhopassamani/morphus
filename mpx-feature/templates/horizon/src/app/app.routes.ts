import { Routes } from '@angular/router';

export const routes: Routes = [
  // Admin
  {
    path: '',
    loadChildren: () => import('@/app/domains/admin/routes'),
  },

  // Auth
  {
    path: '',
    loadChildren: () => import('@/app/domains/auth/routes'),
  },

  // Not found
  {
    path: '',
    loadChildren: () => import('@/app/domains/admin/modules/not-found/routes'),
  },
];
