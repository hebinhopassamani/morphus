import { Routes } from '@angular/router';
import { authGuard } from '@core/mpx-auth';
import { SecurityLayout } from '@security/layout/layout.component';
import { ConfirmEmailComponent } from '@security/pages/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from '@security/pages/forgot-password/forgot-password.component';
import { OnboardingComponent } from '@security/pages/onboarding/onboarding.component';
import { ResetPasswordComponent } from '@security/pages/reset-password/reset-password.component';
import { SelectCorporationComponent } from '@security/pages/select-corporation/select-corporation.component';
import { SigninComponent } from '@security/pages/signin/signin.component';
import { SignoutComponent } from '@security/pages/signout/signout.component';
import { SignupComponent } from '@security/pages/signup/signup.component';

export const routes: Routes = [
  {
    path: '',
    component: SecurityLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'signin' },
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'signout', component: SignoutComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'confirm-email', component: ConfirmEmailComponent },
      {
        path: 'onboarding',
        canActivate: [authGuard],
        component: OnboardingComponent,
      },
      {
        path: 'select-corporation',
        canActivate: [authGuard],
        component: SelectCorporationComponent,
      },
    ],
  },
];
