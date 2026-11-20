import { Routes } from '@angular/router';
import { MpxOnboardingRedirectGuard } from '@core/morphus';
import { MpxLandingLayout } from '@src/components/morphus/layout';

export const publicRoutes: Routes = [
  {
    path: '',
    component: MpxLandingLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [MpxOnboardingRedirectGuard],
        loadChildren: () => import('@morphus/pages/home/home.routes').then((m) => m.routes),
      },
      { path: 'home', pathMatch: 'full', redirectTo: '' },
      {
        path: 'produtos',
        loadChildren: () => import('@morphus/pages/products/products.routes').then((m) => m.routes),
      },
      { path: 'products', redirectTo: 'produtos', pathMatch: 'full' },
      {
        path: 'contato',
        loadChildren: () => import('@morphus/pages/contact/contact.routes').then((m) => m.routes),
      },
      { path: 'contact', redirectTo: 'contato', pathMatch: 'full' },
      {
        path: 'profile',
        canActivate: [MpxOnboardingRedirectGuard],
        loadChildren: () => import('@morphus/pages/profile/profile.routes').then((m) => m.routes),
      },
      {
        path: 'privacidade',
        loadChildren: () => import('@morphus/pages/privacy/privacy.routes').then((m) => m.routes),
      },
      {
        path: 'termos',
        loadChildren: () => import('@morphus/pages/terms/terms.routes').then((m) => m.routes),
      },
    ],
  },
];
