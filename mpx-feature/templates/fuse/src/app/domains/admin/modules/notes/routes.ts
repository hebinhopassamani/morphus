import { Routes } from '@angular/router';

const routes: Routes = [
  // Notes
  {
    path: '',
    loadComponent: () => import('./features/notes/notes'),
    children: [
      // Note
      {
        path: ':id',
        loadComponent: () => import('./features/note/note'),
      },
    ],
  },
];

export default routes;
