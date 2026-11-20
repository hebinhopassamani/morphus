import { Routes } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';
import { MpxAdminLayout } from '@src/components/morphus/layout';
import { FlowDashboardComponent } from './pages/dashboard/flow-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: MpxAdminLayout,
    canActivate: [MpxSecurityGuard],
    children: [
      {
        path: '',
        component: FlowDashboardComponent,
      },
    ],
  },
];
