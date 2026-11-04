import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@website/pages/profile/profile.component').then((m) => m.WebProfileComponent),
  },
];

export default routes;
