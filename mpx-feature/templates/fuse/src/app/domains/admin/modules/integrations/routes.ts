import { Routes } from '@angular/router';

const routes: Routes = [
  // Integrations
  {
    path: '',
    loadComponent: () => import('./features/integrations/integrations'),
  },
];

export default routes;
