import { Routes } from '@angular/router';
import { WebLayout } from '@/app/domains/website/layout/layout';

const routes: Routes = [
  {
    path: '',
    component: WebLayout,
    children: [
      // Home
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home'),
      },

      // Pricing
      {
        path: 'pricing',
        loadComponent: () => import('./pages/pricing'),
      },

      // About
      {
        path: 'about',
        loadComponent: () => import('./pages/about'),
      },
    ],
  },
];

export default routes;
