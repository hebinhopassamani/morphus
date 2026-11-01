import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { FavoritesService } from '@/app/domains/admin/layout/data/favorites';

@Component({
  selector: 'favorite-toggle',
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <button
      matIconButton
      class="tiny"
      [matTooltip]="
        favorites.isFavorite(url())
          ? 'Remove from favorites'
          : 'Add to favorites'
      "
      (click)="
        favorites.toggleFavorite({
          url: url(),
          label: label(),
          icon: icon(),
        })
      "
    >
      <mat-icon
        [class]="
          favorites.isFavorite(url()) ? 'text-amber-a10' : 'text-neutral-a8'
        "
        svgIcon="star"
      />
    </button>
  `,
})
export class FavoriteToggle {
  // Dependencies
  private readonly router = inject(Router);
  private readonly favorites = inject(FavoritesService);

  // Inputs / Outputs
  readonly label = input.required<string>();
  readonly icon = input<string>();

  // State
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );
}
