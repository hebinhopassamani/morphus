import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@website/pages/profile/profile.component').then((m) => m.WebProfileComponent),
  },
];

