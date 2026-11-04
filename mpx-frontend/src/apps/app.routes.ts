import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'website',
    pathMatch: 'full',
  },
  {
    path: 'website',
    loadChildren: () => import('@website/routes').then((m) => m.routes),
  },
  {
    path: 'morphus',
    canActivate: [authGuard],
    loadChildren: () => import('@morphus/routes').then((m) => m.routes),
  },
  {
    path: 'security',
    loadChildren: () => import('@security/routes').then((m) => m.routes),
  },
  {
    path: 'notfound',
    loadComponent: () => import('@website/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: 'notfound',
  },
];
