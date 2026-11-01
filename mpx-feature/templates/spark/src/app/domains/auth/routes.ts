import { Route } from '@angular/router';
import AuthLayout from '@/app/domains/auth/layout';

const routes: Route[] = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('@/app/domains/auth/modules/sign-in/features/sign-in'),
      },
    ],
  },
];

export default routes;
