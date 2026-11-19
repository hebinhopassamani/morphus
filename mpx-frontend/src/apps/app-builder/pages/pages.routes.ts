import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'settings',
    loadComponent: () =>
      import('./app-settings/app-settings.component').then((m) => m.AppSettingsPageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./builder-page/builder-page.component').then((m) => m.AppBuilderPageComponent),
  },
];

