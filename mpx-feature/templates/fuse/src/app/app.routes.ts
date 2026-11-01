import { Routes } from '@angular/router';
import { signedIn } from '@/app/domains/auth/data/auth';

export const routes: Routes = [
  // Admin
  {
    path: '',
    canMatch: [signedIn],
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
    canMatch: [signedIn],
    loadChildren: () => import('@/app/domains/admin/modules/not-found/routes'),
  },

  // Signed out
  {
    path: '**',
    redirectTo: 'sign-in',
  },
];
