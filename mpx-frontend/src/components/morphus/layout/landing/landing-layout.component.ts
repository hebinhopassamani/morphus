import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MpxLandingContentComponent } from './content/landing-content.component';
import { MpxLandingTopBarComponent } from './topbar/landing-topbar.component';

@Component({
  imports: [MpxLandingContentComponent, MpxLandingTopBarComponent],
  selector: 'mpx-landing-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col bg-[#F7F5FC] dark:bg-[#140A2E]' },
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.css',
})
export class MpxLandingLayout {
  private readonly router = inject(Router);

  public readonly showTopBar = input(true, {
    transform: (value: boolean | undefined) => value ?? true,
  });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects || e.url),
      startWith(this.router.url || ''),
    ),
    { initialValue: this.router.url || '' },
  );

  protected readonly isSecurityFlow = computed(() =>
    (this.currentUrl() || '').startsWith('/security'),
  );
}
