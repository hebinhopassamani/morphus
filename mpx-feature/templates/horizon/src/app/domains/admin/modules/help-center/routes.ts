import { Routes } from '@angular/router';
import HelpCenterLayout from '@/app/domains/admin/modules/help-center/layout';

const routes: Routes = [
  {
    path: '',
    component: HelpCenterLayout,
    children: [
      // Articles
      {
        path: '',
        loadComponent: () => import('./features/articles'),
      },

      // Category
      {
        path: 'category/:id',
        loadComponent: () => import('./features/articles'),
      },
    ],
  },

  // Article
  {
    path: 'article/new',
    loadComponent: () => import('./features/article'),
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./features/article'),
  },
];

export default routes;
