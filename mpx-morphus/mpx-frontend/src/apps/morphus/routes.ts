import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';
import { MorphusLayout } from '@morphus/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MorphusLayout,
    canActivate: [authGuard],
    loadChildren: () => import('@morphus/pages/routes'),
  },
];
