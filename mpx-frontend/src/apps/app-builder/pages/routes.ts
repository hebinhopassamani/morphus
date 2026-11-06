import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    loadComponent: () =>
      import('./builder-page/builder-page.component').then((m) => m.AppBuilderPageComponent),
  },
];

export default routes;
