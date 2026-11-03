import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';
import { MorphusWorkspaceLayout } from '@src/components/morphus/layout';

export const routes: Routes = [
  {
    path: '',
    component: MorphusWorkspaceLayout,
    canActivate: [authGuard],
    loadChildren: () => import('@morphus/pages/routes'),
  },
];
