import { Routes } from '@angular/router';

const routes: Routes = [
  // Tasks
  {
    path: '',
    loadComponent: () => import('./features/tasks/tasks'),
    children: [
      // Task
      {
        path: ':key',
        loadComponent: () => import('./features/tasks/task'),
      },
    ],
  },
];

export default routes;
