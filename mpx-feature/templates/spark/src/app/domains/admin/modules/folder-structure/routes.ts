import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@/app/domains/admin/modules/folder-structure/features/folder-structure'),
  },
];

export default routes;
