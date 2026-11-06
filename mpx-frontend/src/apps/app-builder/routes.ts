import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';
import { AppBuilderShellComponent } from './layouts/builder-shell/builder-shell.component';

export const routes: Routes = [
  {
    path: ':appKey',
    component: AppBuilderShellComponent,
    canActivate: [authGuard],
    loadChildren: () => import('@app-builder/pages/routes'),
  },
];

export default routes;
