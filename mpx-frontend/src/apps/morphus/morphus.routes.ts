import { Routes } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';
import { MpxAdminLayout } from '@src/components/morphus/layout';

export const routes: Routes = [
  {
    path: '',
    component: MpxAdminLayout,
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@morphus/pages/pages.routes').then((m) => m.routes),
  },
];
