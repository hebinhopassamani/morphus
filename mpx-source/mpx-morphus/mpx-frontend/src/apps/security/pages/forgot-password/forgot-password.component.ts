import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/auth';

@Component({
  selector: 'sec-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardContent,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
  ],
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-3 sm:p-4' },
  templateUrl: './forgot-password.component.html',
  standalone: true,
})
export class ForgotPasswordComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.auth.clearError();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value.trim().toLowerCase();

    this.auth.forgotPassword({ email }).subscribe({
      next: () => {
        this.submitted.set(true);
      },
    });
  }
}
