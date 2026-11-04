import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';

const routes: Routes = [
  { path: 'signin', loadChildren: () => import('@security/pages/signin/routes') },
  { path: 'signup', loadChildren: () => import('@security/pages/signup/routes') },
  { path: 'signout', loadChildren: () => import('@security/pages/signout/routes') },
  { path: 'forgot-password', loadChildren: () => import('@security/pages/forgot-password/routes') },
  { path: 'reset-password', loadChildren: () => import('@security/pages/reset-password/routes') },
  { path: 'confirm-email', loadChildren: () => import('@security/pages/confirm-email/routes') },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadChildren: () => import('@security/pages/onboarding/routes'),
  },
  {
    path: 'select-corporation',
    canActivate: [authGuard],
    loadChildren: () => import('@security/pages/select-corporation/routes'),
  },
];

export default routes;
