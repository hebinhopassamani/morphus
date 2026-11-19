import { Routes } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';

export const routes: Routes = [
  {
    path: 'signin',
    loadChildren: () => import('@security/pages/signin/signin.routes').then((m) => m.routes),
  },
  {
    path: 'signup',
    loadChildren: () => import('@security/pages/signup/signup.routes').then((m) => m.routes),
  },
  {
    path: 'signout',
    loadChildren: () => import('@security/pages/signout/signout.routes').then((m) => m.routes),
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('@security/pages/forgot-password/forgot-password.routes').then((m) => m.routes),
  },
  {
    path: 'reset-password',
    loadChildren: () =>
      import('@security/pages/reset-password/reset-password.routes').then((m) => m.routes),
  },
  {
    path: 'confirm-email',
    loadChildren: () =>
      import('@security/pages/confirm-email/confirm-email.routes').then((m) => m.routes),
  },
  {
    path: 'onboarding',
    canActivate: [MpxSecurityGuard],
    loadChildren: () =>
      import('@security/pages/onboarding/onboarding.routes').then((m) => m.routes),
  },
  {
    path: 'select-corporation',
    canActivate: [MpxSecurityGuard],
    loadChildren: () =>
      import('@security/pages/select-corporation/select-corporation.routes').then((m) => m.routes),
  },
];
