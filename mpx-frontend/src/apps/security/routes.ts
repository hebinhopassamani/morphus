import { Routes, UrlSegment } from '@angular/router';
import { authGuard } from '@core/mpx-auth';
import { MorphusAuthLayout, MorphusWorkspaceLayout } from '@src/components/morphus/layout';

const AUTH_LAYOUT_ROUTES = new Set([
  'signin',
  'signup',
  'signout',
  'forgot-password',
  'reset-password',
  'confirm-email',
  'onboarding',
  'select-corporation',
]);

export const routes: Routes = [
  {
    matcher: (segments: UrlSegment[]) =>
      segments.length > 0 && AUTH_LAYOUT_ROUTES.has(segments[0].path)
        ? { consumed: [] }
        : null,
    component: MorphusAuthLayout,
    loadChildren: () => import('@security/pages/auth.routes'),
  },
  {
    path: '',
    component: MorphusWorkspaceLayout,
    canActivate: [authGuard],
    loadChildren: () => import('@security/pages/routes'),
  },
];
