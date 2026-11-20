import { Routes } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';

const resolveRootRedirect = (): string => {
  if (typeof window === 'undefined') {
    return 'website';
  }

  const host = window.location.hostname.toLowerCase();
  const subdomain = host.split('.')[0];

  switch (subdomain) {
    case 'cloud':
      return 'morphus';
    case 'security':
      return 'security';
    case 'flow':
      return 'flow';
    case 'kalupa':
      return 'kalupa';
    case 'send':
      return 'send';
    default:
      if (
        host !== 'localhost' &&
        host !== '127.0.0.1' &&
        host !== 'morphus.one' &&
        host !== 'www.morphus.one' &&
        !host.startsWith('192.168.')
      ) {
        return 'app';
      }
      return 'website';
  }
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: resolveRootRedirect,
    pathMatch: 'full',
  },
  {
    path: 'website',
    loadChildren: () => import('@website/website.routes').then((m) => m.routes),
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
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@morphus/morphus.routes').then((m) => m.routes),
  },
  {
    path: 'cloud',
    redirectTo: 'morphus',
    pathMatch: 'prefix',
  },
  {
    path: 'security',
    loadChildren: () => import('@security/security.routes').then((m) => m.routes),
  },
  {
    path: 'flow',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@flow/flow.routes').then((m) => m.routes),
  },
  {
    path: 'kalupa',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@kalupa/kalupa.routes').then((m) => m.routes),
  },
  {
    path: 'send',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@send/send.routes').then((m) => m.routes),
  },
  {
    path: 'app',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@app-builder/app-builder.routes').then((m) => m.routes),
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
