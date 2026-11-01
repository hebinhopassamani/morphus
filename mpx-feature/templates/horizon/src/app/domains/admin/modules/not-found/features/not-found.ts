import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'not-found',
  imports: [MatButton, MatIcon, RouterLink],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="flex flex-auto flex-col items-center justify-center p-6">
      <div class="flex w-full max-w-90 flex-col items-center text-center">
        <div class="text-lg font-semibold text-primary-a11">404</div>
        <div class="mt-2 text-5xl font-semibold">Page not found</div>
        <div class="mt-2 text-lg text-pretty text-neutral-a11">
          The page you were looking for doesn't exist, or it has moved somewhere
          else.
        </div>

        <a
          matButton
          routerLink="/tickets"
          class="primary large mt-8 px-4"
        >
          <mat-icon svgIcon="inbox" />
          Back to tickets
        </a>

        <button
          matButton
          class="link mt-4 text-primary-a11 decoration-primary-a11"
          (click)="location.back()"
        >
          Go back
        </button>
      </div>
    </div>
  `,
})
export default class NotFound {
  // Dependencies
  private readonly location = inject(Location);
}
