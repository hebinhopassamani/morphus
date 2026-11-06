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
    path: 'produtos',
    redirectTo: 'website/produtos',
    pathMatch: 'full',
  },
  {
    path: 'contato',
    redirectTo: 'website/contato',
    pathMatch: 'full',
  },
  {
    path: 'privacidade',
    redirectTo: 'website/privacidade',
    pathMatch: 'full',
  },
  {
    path: 'termos',
    redirectTo: 'website/termos',
    pathMatch: 'full',
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
    path: 'app',
    canActivate: [authGuard],
    loadChildren: () => import('@app-builder/routes').then((m) => m.routes),
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
