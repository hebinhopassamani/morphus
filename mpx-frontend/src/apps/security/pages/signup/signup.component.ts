import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
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
}
