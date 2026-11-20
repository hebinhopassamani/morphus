import { Routes, UrlSegment } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';

const isSubdomain = (target: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname.toLowerCase();
  return host.split('.')[0] === target;
};

const isCustomAppDomain = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname.toLowerCase();
  const sub = host.split('.')[0];
  if (['cloud', 'security', 'flow', 'kalupa', 'send', 'www'].includes(sub)) {
    return false;
  }
  return (
    host !== 'localhost' &&
    host !== '127.0.0.1' &&
    host !== 'morphus.one' &&
    host !== 'www.morphus.one' &&
    !host.startsWith('192.168.')
  );
};

export const routes: Routes = [
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
    matcher: (segments: UrlSegment[]) => (isSubdomain('cloud') ? { consumed: [] } : null),
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@morphus/morphus.routes').then((m) => m.routes),
  },
  {
    matcher: (segments: UrlSegment[]) => (isSubdomain('security') ? { consumed: [] } : null),
    loadChildren: () => import('@security/security.routes').then((m) => m.routes),
  },
  {
    matcher: (segments: UrlSegment[]) => (isSubdomain('flow') ? { consumed: [] } : null),
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@flow/flow.routes').then((m) => m.routes),
  },
  {
    matcher: (segments: UrlSegment[]) => (isSubdomain('kalupa') ? { consumed: [] } : null),
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@kalupa/kalupa.routes').then((m) => m.routes),
  },
  {
    matcher: (segments: UrlSegment[]) => (isSubdomain('send') ? { consumed: [] } : null),
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@send/send.routes').then((m) => m.routes),
  },
  {
    matcher: (segments: UrlSegment[]) => (isCustomAppDomain() ? { consumed: [] } : null),
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@app-builder/app-builder.routes').then((m) => m.routes),
  },
  {
    path: 'website/home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'website/privacidade',
    redirectTo: 'privacidade',
    pathMatch: 'full',
  },
  {
    path: 'website/termos',
    redirectTo: 'termos',
    pathMatch: 'full',
  },
  {
    path: 'website/produtos',
    redirectTo: 'produtos',
    pathMatch: 'full',
  },
  {
    path: 'website/contato',
    redirectTo: 'contato',
    pathMatch: 'full',
  },
  {
    path: 'website/profile',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
  {
    path: 'website',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () => import('@website/website.routes').then((m) => m.routes),
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
