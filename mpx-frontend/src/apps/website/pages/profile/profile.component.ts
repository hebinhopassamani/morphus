import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';

@Component({
  selector: 'web-profile',
  standalone: true,
  imports: [MatButton, MatCard, MatIcon, RouterLink],
  host: {
    class: 'mx-auto flex w-full max-w-5xl flex-auto flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8',
  },
  templateUrl: './profile.component.html',
})
export class WebProfileComponent {
  protected readonly auth = inject(Auth);

  protected readonly savingNickName = signal(false);
  protected readonly nickNameSaved = signal(false);

  protected readonly userInitials = computed(() => {
    const name = this.auth.user()?.name?.trim() || this.auth.user()?.email?.trim();
    if (!name) {
      return 'MP';
    }
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected saveNickName(rawValue: string): void {
    const nickName = rawValue.trim();
    this.savingNickName.set(true);
    this.nickNameSaved.set(false);

    this.auth.updateProfile({ nickName }).subscribe({
      next: () => {
        this.savingNickName.set(false);
        this.nickNameSaved.set(true);
        setTimeout(() => this.nickNameSaved.set(false), 3000);
      },
      error: () => {
        this.savingNickName.set(false);
      },
    });
  }
}
