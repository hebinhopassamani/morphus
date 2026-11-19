import { Routes } from '@angular/router';
import { MpxLandingLayout } from '@src/components/morphus/layout';

export const routes: Routes = [
  {
    path: '',
    component: MpxLandingLayout,
    loadChildren: () => import('@website/pages/pages.routes').then((m) => m.routes),
  },
];
