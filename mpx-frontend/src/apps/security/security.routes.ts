import { Routes, UrlSegment } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';
import { MpxAdminLayout, MpxLandingLayout } from '@src/components/morphus/layout';

const LANDING_LAYOUT_ROUTES = new Set([
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
      segments.length > 0 && LANDING_LAYOUT_ROUTES.has(segments[0].path)
        ? { consumed: [] }
        : null,
    component: MpxLandingLayout,
    loadChildren: () => import('@security/pages/landing.routes').then((m) => m.routes),
  },
  {
    path: '',
    component: MpxAdminLayout,
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@security/pages/pages.routes').then((m) => m.routes),
  },
];
