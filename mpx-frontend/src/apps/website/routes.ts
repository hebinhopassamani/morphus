import { Routes } from '@angular/router';
import { MorphusOpenLayout } from '@src/components/morphus/layout';

export const routes: Routes = [
  {
    path: '',
    component: MorphusOpenLayout,
    loadChildren: () => import('@website/pages/routes'),
  },
];
