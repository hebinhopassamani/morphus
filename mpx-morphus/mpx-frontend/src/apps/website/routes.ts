import { Routes } from '@angular/router';
import { WebSiteLayout } from '@website/layout/layout.component';
import { HomeComponent } from '@website/pages/home/home.component';
import { PrivacyComponent } from '@website/pages/privacy/privacy.component';
import { TermsComponent } from '@website/pages/terms/terms.component';

export const routes: Routes = [
  {
    path: '',
    component: WebSiteLayout,
    children: [
      { path: '', component: HomeComponent },
      { path: 'privacidade', component: PrivacyComponent },
      { path: 'termos', component: TermsComponent },
    ],
  },
];
