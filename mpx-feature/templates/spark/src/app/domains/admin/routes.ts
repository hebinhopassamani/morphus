import { Routes } from '@angular/router';
import AdminLayout from '@/app/domains/admin/layout/layout';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'welcome',
      },

      // Welcome
      {
        path: 'welcome',
        loadChildren: () =>
          import('@/app/domains/admin/modules/welcome/routes'),
      },

      // Folder structure
      {
        path: 'folder-structure',
        loadChildren: () =>
          import('@/app/domains/admin/modules/folder-structure/routes'),
      },
    ],
  },
];

export default routes;
