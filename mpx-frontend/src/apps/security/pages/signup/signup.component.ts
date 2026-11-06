import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';
import { Auth } from '@core/mpx-auth';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'sec-signup',
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
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-3 sm:p-4' },
  templateUrl: './signup.component.html',
  standalone: true,
})
export class SignupComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly hidePassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);

  protected readonly form = this.fb.nonNullable.group(
    {
      adminEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      termsConfirmed: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    this.auth.clearError();

    if (this.auth.isAuthenticated()) {
      if (this.auth.needsOnboarding()) {
        this.router.navigateByUrl('/security/onboarding');
      } else {
        this.router.navigateByUrl('/website/home');
      }
    }
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { adminEmail, password } = this.form.getRawValue();
    const cleanEmail = adminEmail.trim().toLowerCase();

    this.auth
      .createAccount({
        adminEmail: cleanEmail,
        adminPassword: password,
      })
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/security/onboarding');
        },
      });
  }

  protected onGoogleSignup(): void {
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
                if (this.auth.needsOnboarding()) {
                  this.router.navigateByUrl('/security/onboarding');
                  return;
                }
                if (this.auth.needsCorporationSelection()) {
                  this.router.navigateByUrl('/security/select-corporation');
                  return;
                }
                this.router.navigateByUrl('/website/home');
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
}
