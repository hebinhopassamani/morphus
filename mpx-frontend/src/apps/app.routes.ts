import { Routes } from '@angular/router';
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
  if (['morphus', 'security', 'workflow', 'kalupa', 'relay', 'www'].includes(sub)) {
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
    path: 'security',
    loadChildren: () => import('@security/security.routes').then((m) => m.routes),
  },
  {
    path: 'workflow',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@workflow/workflow.routes').then((m) => m.routes),
  },
  {
    path: 'kalupa',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@kalupa/kalupa.routes').then((m) => m.routes),
  },
  {
    path: 'relay',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@relay/relay.routes').then((m) => m.routes),
  },
  {
    path: 'app',
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@app-builder/app-builder.routes').then((m) => m.routes),
  },
  {
    path: '',
    canMatch: [() => isSubdomain('morphus')],
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@morphus/morphus.routes').then((m) => m.routes),
  },
  {
    path: '',
    canMatch: [() => isSubdomain('security')],
    loadChildren: () => import('@security/security.routes').then((m) => m.routes),
  },
  {
    path: '',
    canMatch: [() => isSubdomain('workflow')],
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@workflow/workflow.routes').then((m) => m.routes),
  },
  {
    path: '',
    canMatch: [() => isSubdomain('kalupa')],
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@kalupa/kalupa.routes').then((m) => m.routes),
  },
  {
    path: '',
    canMatch: [() => isSubdomain('relay')],
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@relay/relay.routes').then((m) => m.routes),
  },
  {
    path: '',
    canMatch: [() => isCustomAppDomain()],
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@app-builder/app-builder.routes').then((m) => m.routes),
  },
  {
    path: '',
    loadChildren: () => import('@morphus/morphus-public.routes').then((m) => m.publicRoutes),
  },
  {
    path: 'notfound',
    loadComponent: () => import('@morphus/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: 'notfound',
  },
];
