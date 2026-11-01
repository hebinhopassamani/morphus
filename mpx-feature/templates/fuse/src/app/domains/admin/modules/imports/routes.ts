import { Routes } from '@angular/router';

const routes: Routes = [
  // Imports
  {
    path: '',
    loadComponent: () => import('./features/imports/imports'),
  },

  // New import
  {
    path: 'new',
    loadComponent: () => import('./features/new-import/new-import'),
  },

  // Import
  {
    path: ':id',
    loadComponent: () => import('./features/import/import'),
  },
];

export default routes;
