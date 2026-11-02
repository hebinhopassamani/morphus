import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';

@Component({
  selector: 'sec-confirm-email',
  templateUrl: './confirm-email.component.html',
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-4 sm:p-8' },
  imports: [RouterLink, MatCard, MatCardContent, MatButton, MatIcon],
  standalone: true,
})
export class ConfirmEmailComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly status = signal<'validating' | 'success' | 'error'>('validating');

  ngOnInit(): void {
    this.auth.clearError();
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    const token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!email || !token) {
      this.status.set('error');
      this.auth.setError('Link de confirmação incompleto ou inválido.');
      return;
    }

    this.auth.confirmEmail({ email, token }).subscribe({
      next: () => {
        this.status.set('success');
        if (this.auth.isAuthenticated()) {
          setTimeout(() => {
            this.router.navigateByUrl('/security/onboarding');
          }, 2200);
        }
      },
      error: () => {
        this.status.set('error');
      },
    });
  }
}
