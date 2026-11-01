import { Routes } from '@angular/router';
import { authGuard } from '@/apps/core/auth';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('@morphus/routes').then((m) => m.routes),
  },
  {
    path: 'security',
    loadChildren: () => import('@security/routes').then((m) => m.routes),
  },
  {
    // Kept so the URLs already registered in Google (home page and privacy policy) keep working.
    path: 'home',
    loadChildren: () => import('@website/routes').then((m) => m.routes),
  },
  {
    path: '',
    loadChildren: () => import('@website/routes').then((m) => m.routes),
  },
];
