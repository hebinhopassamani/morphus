import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { MpxMessageComponent } from '@/components/morphus/message';
import { MpxToastComponent } from '@/components/morphus/toast';

@Component({
  imports: [RouterOutlet, MpxMessageComponent, MpxToastComponent],
  selector: 'mpx-root',
  host: {
    class: 'flex min-h-full w-full flex-auto flex-col',
  },
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly isNavigating = signal(false);
  protected readonly holdOverlay = signal(false);

  private overlayHoldTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly showTopBar = computed(
    () => this.auth.isLoading() || this.holdOverlay() || this.isNavigating(),
  );

  protected readonly showFullOverlay = computed(
    () => this.auth.isLoading() || this.holdOverlay(),
  );

  constructor() {
    effect(() => {
      if (this.auth.isLoading()) {
        this.holdOverlay.set(true);
        if (this.overlayHoldTimer) {
          clearTimeout(this.overlayHoldTimer);
        }
        this.overlayHoldTimer = setTimeout(() => {
          this.holdOverlay.set(false);
          this.overlayHoldTimer = null;
        }, 1200);
      }
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isNavigating.set(false);
      }
    });
  }
}
