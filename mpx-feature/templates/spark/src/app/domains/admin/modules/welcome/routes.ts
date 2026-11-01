import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@/app/domains/admin/modules/welcome/features/welcome'),
  },
];

export default routes;
