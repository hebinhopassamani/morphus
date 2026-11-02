import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { CorporationSummary } from '@security/entities/session';

type CardAccent = {
  bannerClass: string;
  iconBoxClass: string;
  badgeClass: string;
  pattern: 'ripples' | 'arches' | 'tiles' | 'grid';
};

const CARD_ACCENTS: CardAccent[] = [
  {
    bannerClass: 'from-violet-a4 via-violet-a2 to-transparent',
    iconBoxClass: 'bg-violet-a3 text-violet-a11 ring-1 ring-violet-a5',
    badgeClass: 'bg-violet-a3 text-violet-a11',
    pattern: 'ripples',
  },
  {
    bannerClass: 'from-indigo-a4 via-indigo-a2 to-transparent',
    iconBoxClass: 'bg-indigo-a3 text-indigo-a11 ring-1 ring-indigo-a5',
    badgeClass: 'bg-indigo-a3 text-indigo-a11',
    pattern: 'arches',
  },
  {
    bannerClass: 'from-jade-a4 via-jade-a2 to-transparent',
    iconBoxClass: 'bg-jade-a3 text-jade-a11 ring-1 ring-jade-a5',
    badgeClass: 'bg-jade-a3 text-jade-a11',
    pattern: 'tiles',
  },
  {
    bannerClass: 'from-amber-a4 via-amber-a2 to-transparent',
    iconBoxClass: 'bg-amber-a3 text-amber-a11 ring-1 ring-amber-a5',
    badgeClass: 'bg-amber-a3 text-amber-a11',
    pattern: 'grid',
  },
];

@Component({
  selector: 'mpx-select-corporation',
  templateUrl: './select-corporation.component.html',
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-4 sm:p-6' },
  imports: [
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatButton,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    MatTooltip,
  ],
  standalone: true,
})
export class SelectCorporationComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly selectingId = signal<string | null>(null);
  protected readonly starredIds = signal<Record<string, boolean>>({});
  protected readonly corporations = computed(() => this.auth.availableCorporations());
  protected readonly activeCorporationId = computed(() => this.auth.corporation()?.id ?? null);

  ngOnInit(): void {
    this.auth.clearError();

    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/security/signin');
      return;
    }

    const available = this.corporations();
    if (available.length === 1) {
      this.navigateToTarget();
    }
  }

  protected accentFor(index: number): CardAccent {
    return CARD_ACCENTS[index % CARD_ACCENTS.length];
  }

  protected isStarred(corpId: string): boolean {
    return !!this.starredIds()[corpId];
  }

  protected toggleStar(corp: CorporationSummary, event?: Event): void {
    event?.stopPropagation();
    this.starredIds.update((prev) => ({
      ...prev,
      [corp.id]: !prev[corp.id],
    }));
  }

  protected selectCorporation(corp: CorporationSummary): void {
    if (this.auth.isLoading() || this.selectingId() !== null) {
      return;
    }

    this.selectingId.set(corp.id);

    this.auth.switchCorporation(corp.id).subscribe({
      next: () => {
        this.selectingId.set(null);
        this.navigateToTarget();
      },
      error: () => {
        this.selectingId.set(null);
      },
    });
  }

  protected backToLogin(): void {
    if (this.auth.isLoading() || this.selectingId() !== null) {
      return;
    }
    this.auth.logout('/security/signin');
  }

  private navigateToTarget(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin';
    this.router.navigateByUrl(returnUrl);
  }
}
