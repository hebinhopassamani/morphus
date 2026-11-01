import { Routes } from '@angular/router';

export const routes: Routes = [
  // Website
  {
    path: '',
    loadChildren: () => import('@/app/domains/website/routes'),
  },
];
