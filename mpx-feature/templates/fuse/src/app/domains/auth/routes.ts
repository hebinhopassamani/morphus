import { Route } from '@angular/router';
import AuthLayout from '@/app/domains/auth/layout';

const routes: Route[] = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sign-in',
      },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('@/app/domains/auth/modules/sign-in/features/sign-in'),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('@/app/domains/auth/modules/sign-up/features/sign-up'),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('@/app/domains/auth/modules/forgot-password/features/forgot-password'),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('@/app/domains/auth/modules/reset-password/features/reset-password'),
      },
    ],
  },
];

export default routes;
