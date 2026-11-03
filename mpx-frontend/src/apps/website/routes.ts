import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';
import { SelectCorporationComponent } from '@security/pages/select-corporation/select-corporation.component';
import { MorphusOpenLayout } from '@src/components/morphus/layout';
import { HomeComponent } from '@website/pages/home/home.component';
import { PrivacyComponent } from '@website/pages/privacy/privacy.component';
import { TermsComponent } from '@website/pages/terms/terms.component';

export const routes: Routes = [
  {
    path: '',
    component: MorphusOpenLayout,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'privacidade', component: PrivacyComponent },
      { path: 'termos', component: TermsComponent },
      {
        path: 'select-corporation',
        canActivate: [authGuard],
        component: SelectCorporationComponent,
      },
    ],
  },
];
