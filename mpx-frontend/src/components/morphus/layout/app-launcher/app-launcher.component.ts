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
  iconBgClass: string;
  iconTextClass: string;
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
      class="relative z-10 text-neutral-11 hover:bg-neutral-a3 hover:text-neutral-12"
    >
      <mat-icon svgIcon="grip" class="size-5!" />
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
          <span class="text-[11px] font-medium text-primary-a11">*.morphus.me</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          @for (item of ecosystemApps; track item.id) {
            <button
              type="button"
              (click)="openEcosystemApp(item)"
              class="group flex cursor-pointer flex-col items-center gap-y-1.5 rounded-2xl p-2.5 text-center transition hover:bg-neutral-a3"
            >
              <div
                class="flex size-12 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105"
                [class]="item.iconBgClass + ' ' + item.iconTextClass"
              >
                <mat-icon [svgIcon]="item.icon" class="size-6!" />
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
                  class="flex size-12 items-center justify-center rounded-2xl bg-primary-a3 text-primary-a11 ring-1 ring-primary-a5 shadow-2xs transition-transform group-hover:scale-105"
                >
                  <mat-icon [svgIcon]="app.icon || 'boxes'" class="size-6!" />
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
      subtitle: 'morphus.me',
      subdomain: '',
      localRoute: '/website/home',
      icon: 'globe',
      iconBgClass: 'bg-cyan-500/15 ring-1 ring-cyan-500/30',
      iconTextClass: 'text-cyan-500 dark:text-cyan-300',
    },
    {
      id: 'cloud',
      name: 'Cloud',
      subtitle: 'cloud.morphus.me',
      subdomain: 'cloud',
      localRoute: '/morphus',
      icon: 'cloud',
      iconBgClass: 'bg-indigo-a3 ring-1 ring-indigo-a5',
      iconTextClass: 'text-indigo-a11',
    },
    {
      id: 'security',
      name: 'Security',
      subtitle: 'security.morphus.me',
      subdomain: 'security',
      localRoute: '/security',
      icon: 'shield-check',
      iconBgClass: 'bg-violet-a3 ring-1 ring-violet-a5',
      iconTextClass: 'text-violet-a11',
    },
    {
      id: 'flow',
      name: 'Flow',
      subtitle: 'flow.morphus.me',
      subdomain: 'flow',
      localRoute: '/flow',
      icon: 'workflow',
      iconBgClass: 'bg-amber-a3 ring-1 ring-amber-a5',
      iconTextClass: 'text-amber-a11',
    },
    {
      id: 'kalupa',
      name: 'Kalupa',
      subtitle: 'kalupa.morphus.me',
      subdomain: 'kalupa',
      localRoute: '/kalupa',
      icon: 'sparkles',
      iconBgClass: 'bg-jade-a3 ring-1 ring-jade-a5',
      iconTextClass: 'text-jade-a11',
    },
    {
      id: 'send',
      name: 'Send',
      subtitle: 'send.morphus.me',
      subdomain: 'send',
      localRoute: '/send',
      icon: 'send',
      iconBgClass: 'bg-sky-500/15 ring-1 ring-sky-500/30',
      iconTextClass: 'text-sky-500 dark:text-sky-300',
    },
  ];

  protected readonly workspaceApps = computed(() =>
    this.context.operationalApplications(),
  );

  protected openEcosystemApp(item: EcosystemAppItem): void {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.me' || host.endsWith('.morphus.me')) {
        const targetHost = item.subdomain
          ? `${item.subdomain}.morphus.me`
          : 'morphus.me';
        window.location.href = `${window.location.protocol}//${targetHost}`;
        return;
      }
    }
    void this.router.navigateByUrl(item.localRoute);
  }

  protected openWorkspaceApp(app: MpxApplication): void {
    this.context.selectApplication(app);
  }
}
