import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '@core/auth';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'sec-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatSuffix,
    MatIcon,
  ],
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-3 sm:p-4' },
  templateUrl: './reset-password.component.html',
  standalone: true,
})
export class ResetPasswordComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly hidePassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);
  protected readonly success = signal(false);

  private email = '';
  private token = '';

  protected readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    this.auth.clearError();
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
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

    const { newPassword } = this.form.getRawValue();

    this.auth
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword,
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          setTimeout(() => {
            this.router.navigateByUrl('/security/signin');
          }, 2000);
        },
      });
  }
}

