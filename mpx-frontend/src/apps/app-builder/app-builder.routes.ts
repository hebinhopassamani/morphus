import { Routes } from '@angular/router';
import { MpxSecurityGuard } from '@core/morphus';
import { AppBuilderShellComponent } from './layouts/builder-shell/builder-shell.component';

export const routes: Routes = [
  {
    path: ':appKey',
    component: AppBuilderShellComponent,
    canActivate: [MpxSecurityGuard],
    loadChildren: () => import('@app-builder/pages/pages.routes').then((m) => m.routes),
  },
];
