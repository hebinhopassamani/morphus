import { Routes } from '@angular/router';
import { MpxOnboardingRedirectGuard } from '@core/morphus';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    canActivate: [MpxOnboardingRedirectGuard],
    loadChildren: () => import('@website/pages/home/home.routes').then((m) => m.routes),
  },
  {
    path: 'produtos',
    loadChildren: () => import('@website/pages/products/products.routes').then((m) => m.routes),
  },
  { path: 'products', redirectTo: 'produtos', pathMatch: 'full' },
  {
    path: 'contato',
    loadChildren: () => import('@website/pages/contact/contact.routes').then((m) => m.routes),
  },
  { path: 'contact', redirectTo: 'contato', pathMatch: 'full' },
  {
    path: 'profile',
    canActivate: [MpxOnboardingRedirectGuard],
    loadChildren: () => import('@website/pages/profile/profile.routes').then((m) => m.routes),
  },
  {
    path: 'privacidade',
    loadChildren: () => import('@website/pages/privacy/privacy.routes').then((m) => m.routes),
  },
  {
    path: 'termos',
    loadChildren: () => import('@website/pages/terms/terms.routes').then((m) => m.routes),
  },
];
