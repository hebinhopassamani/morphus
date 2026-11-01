import { inject, Service, signal } from '@angular/core';
import { CanMatchFn } from '@angular/router';

// Stand-in that starts signed in so the template opens on the dashboard;
// a real session replaces the signal
@Service()
export class AuthService {
  // State
  private readonly state = signal(true);
  readonly signedIn = this.state.asReadonly();

  signIn(): void {
    this.state.set(true);
  }

  signOut(): void {
    this.state.set(false);
  }
}

export const signedIn: CanMatchFn = () => inject(AuthService).signedIn();
