import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';
import { Auth } from '@core/mpx-auth';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
  }
}

@Component({
  selector: 'mpx-signin',
  templateUrl: './signin.component.html',
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-3 sm:p-4' },
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatDivider,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSuffix,
    MatCheckbox,
    MatIcon,
  ],
  standalone: true,
})
export class SigninComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly hidePassword = signal(true);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true],
  });

  ngOnInit(): void {
    this.auth.clearError();

    if (this.auth.isAuthenticated()) {
      this.navigateAfterAuth();
    }
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.auth.loginWithCredentials({ email: email.trim(), password }).subscribe({
      next: () => {
        this.navigateAfterAuth();
      },
    });
  }

  protected onGoogleLogin(): void {
    if (!this.isBrowser) {
      return;
    }

    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      this.auth.setError('Configure o Google Client ID em environment.ts para habilitar o login com o Google.');
      return;
    }

    this.loadGoogleScript()
      .then(() => {
        const oauth2 = window.google?.accounts?.oauth2;
        if (!oauth2) {
          this.auth.setError('Não foi possível inicializar o cliente OAuth do Google.');
          return;
        }

        const tokenClient = oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: (response) => {
            if (!response.access_token) {
              return;
            }

            this.auth.loginWithGoogle({ accessToken: response.access_token }).subscribe({
              next: () => {
                this.navigateAfterAuth();
              },
            });
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      })
      .catch(() => {
        this.auth.setError('Falha ao carregar o script de autenticação do Google.');
      });
  }

  private loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.oauth2) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-gsi-client') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private navigateAfterAuth(): void {
    if (this.auth.needsOnboarding()) {
      this.router.navigateByUrl('/security/onboarding');
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const availableCorporations = this.auth.availableCorporations();

    if (availableCorporations.length > 1) {
      this.router.navigate(['/security/select-corporation'], {
        queryParams: returnUrl ? { returnUrl } : undefined,
      });
      return;
    }

    this.router.navigateByUrl(returnUrl || '/admin');
  }
}
