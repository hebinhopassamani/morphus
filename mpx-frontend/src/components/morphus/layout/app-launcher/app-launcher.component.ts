import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MpxSecurity } from '@core/morphus';
import { MpxApplication } from '@morphus/entities/application';
import { MpxContextService } from '@morphus/services/morphus-context.service';

export interface EcosystemAppItem {
  id: string;
  name: string;
  subtitle: string;
  subdomain: string;
  localRoute: string;
  icon: string;
  imageUrl?: string;
}

@Component({
  selector: 'mpx-app-launcher',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatMenu, MatMenuTrigger, MatDivider, MatTooltip],
  template: `
    <button
      type="button"
      matIconButton
      [matMenuTriggerFor]="launcherMenu"
      matTooltip="Aplicações Morphus"
      aria-label="Aplicações Morphus"
      class="relative z-10 flex items-center justify-center text-neutral-11 hover:bg-neutral-a3 hover:text-neutral-12"
    >
      <svg class="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="5" cy="5" r="2" />
        <circle cx="12" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="12" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
      </svg>
    </button>

    <mat-menu
      #launcherMenu="matMenu"
      xPosition="before"
      class="min-w-80 max-w-88 rounded-3xl! p-2!"
    >
      <div
        class="not-mat-menu-wrapper flex flex-col gap-y-3 p-3 select-none"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold tracking-wider uppercase text-neutral-a10">
            Ecossistema Morphus
          </span>
          <span class="text-[11px] font-medium text-primary-a11">morphus.one</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          @for (item of ecosystemApps; track item.id) {
            <button
              type="button"
              (click)="openEcosystemApp(item)"
              class="group flex cursor-pointer flex-col items-center gap-y-1.5 rounded-2xl p-2.5 text-center transition hover:bg-neutral-a3"
            >
              <div
                class="flex size-12 items-center justify-center transition-transform group-hover:scale-110"
              >
                @if (item.imageUrl) {
                  <img
                    [src]="item.imageUrl"
                    [alt]="item.name"
                    class="size-full object-contain drop-shadow-sm"
                  />
                } @else {
                  <mat-icon [svgIcon]="item.icon" class="size-8! text-primary-a11" />
                }
              </div>
              <span class="w-full truncate text-xs font-semibold text-neutral-12">
                {{ item.name }}
              </span>
              <span class="w-full truncate text-[10px] text-neutral-a10">
                {{ item.subtitle }}
              </span>
            </button>
          }
        </div>

        @if (auth.isAuthenticated() && workspaceApps().length > 0) {
          <mat-divider class="my-1" />

          <div class="flex items-center justify-between px-1">
            <span class="text-xs font-bold tracking-wider uppercase text-neutral-a10">
              {{ context.activeWorkspace()?.name || 'Workspace' }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2">
            @for (app of workspaceApps(); track app.id) {
              <button
                type="button"
                (click)="openWorkspaceApp(app)"
                class="group flex cursor-pointer flex-col items-center gap-y-1.5 rounded-2xl p-2.5 text-center transition hover:bg-neutral-a3"
              >
                <div
                  class="flex size-12 items-center justify-center transition-transform group-hover:scale-110"
                >
                  @if (context.isImageIcon(app.icon)) {
                    <img
                      [src]="app.icon"
                      [alt]="app.name"
                      class="size-full object-contain drop-shadow-sm"
                    />
                  } @else {
                    <mat-icon [svgIcon]="app.icon || 'boxes'" class="size-8! text-primary-a11" />
                  }
                </div>
                <span class="w-full truncate text-xs font-semibold text-neutral-12">
                  {{ app.name }}
                </span>
              </button>
            }
          </div>
        }
      </div>
    </mat-menu>
  `,
})
export class MpxAppLauncherComponent {
  protected readonly auth = inject(MpxSecurity);
  protected readonly context = inject(MpxContextService);
  private readonly router = inject(Router);

  protected readonly ecosystemApps: EcosystemAppItem[] = [
    {
      id: 'portal',
      name: 'Morphus',
      subtitle: 'morphus.one',
      subdomain: '',
      localRoute: '/',
      icon: 'globe',
      imageUrl: '/logos/morphus_one_logo.png?v=5',
    },
    {
      id: 'morphus',
      name: 'Morphus',
      subtitle: 'morphus.morphus.one',
      subdomain: 'morphus',
      localRoute: '/morphus',
      icon: 'layers',
      imageUrl: '/logos/morphus_cloud_logo.png?v=5',
    },
    {
      id: 'security',
      name: 'Security',
      subtitle: 'security.morphus.one',
      subdomain: 'security',
      localRoute: '/security',
      icon: 'shield-check',
      imageUrl: '/logos/morphus_security_logo.png?v=5',
    },
    {
      id: 'workflow',
      name: 'Workflow',
      subtitle: 'workflow.morphus.one',
      subdomain: 'workflow',
      localRoute: '/workflow',
      icon: 'workflow',
      imageUrl: '/logos/morphus_flow_logo.png?v=5',
    },
    {
      id: 'kalupa',
      name: 'Kalupa',
      subtitle: 'kalupa.morphus.one',
      subdomain: 'kalupa',
      localRoute: '/kalupa',
      icon: 'sparkles',
      imageUrl: '/logos/morphus_kalupa_logo.png?v=5',
    },
    {
      id: 'relay',
      name: 'Relay',
      subtitle: 'relay.morphus.one',
      subdomain: 'relay',
      localRoute: '/relay',
      icon: 'send',
      imageUrl: '/logos/morphus_send_logo.png?v=5',
    },
  ];

  protected readonly workspaceApps = computed(() =>
    this.context.operationalApplications(),
  );

  protected openEcosystemApp(item: EcosystemAppItem): void {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.one' || host.endsWith('.morphus.one')) {
        const targetHost = item.subdomain
          ? `${item.subdomain}.morphus.one`
          : 'morphus.one';
        const targetUrl = `${window.location.protocol}//${targetHost}`;
        if (item.id !== 'portal' && !this.auth.isAuthenticated()) {
          this.auth.redirectToLogin(targetUrl, 'signin');
          return;
        }
        window.location.href = targetUrl;
        return;
      }
    }
    if (item.id !== 'portal' && !this.auth.isAuthenticated()) {
      this.auth.redirectToLogin(item.localRoute, 'signin');
      return;
    }
    void this.router.navigateByUrl(item.localRoute);
  }

  protected openWorkspaceApp(app: MpxApplication): void {
    this.context.selectApplication(app);
  }
}
