import { Routes } from '@angular/router';

const routes: Routes = [
  // Members
  {
    path: '',
    loadComponent: () => import('./features/members/members'),
    children: [
      // Member
      {
        path: ':id',
        loadComponent: () => import('./features/member/member'),
      },
    ],
  },
];

export default routes;
