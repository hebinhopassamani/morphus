import { Component, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Auth } from '@core/mpx-auth';

type SettingsNavItem = {
  route: string;
  label: string;
  icon: string;
};

type SettingsNavSection = {
  title?: string;
  items: SettingsNavItem[];
};

@Component({
  selector: 'settings-layout',
  imports: [
    MatDivider,
    MatFormField,
    MatIcon,
    MatOption,
    MatSelect,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-6xl flex-auto flex-col gap-6 p-6 lg:p-8"
    >
      <!-- Cabeçalho estilo GitHub Settings (Foto + Nome + Contexto da Conta) -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-a4 pb-5">
        <div class="flex items-center gap-x-4">
          @if (auth.user()?.picture; as picture) {
            <img
              [src]="picture"
              alt="Avatar do usuário"
              class="size-12 shrink-0 rounded-full object-cover ring-2 ring-neutral-a4"
            />
          } @else {
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-base font-bold text-primary-a11"
            >
              {{ (auth.displayName()[0] || 'M').toUpperCase() }}
            </div>
          }
          <div class="flex flex-col">
            <div class="flex items-center gap-x-2">
              <span class="text-xl font-bold tracking-tight text-neutral-12">
                {{ auth.user()?.name || auth.displayName() }}
              </span>
              <span class="text-sm text-neutral-a10">
                ({{ auth.displayName() }})
              </span>
            </div>
            <span class="text-sm text-neutral-a11">
              Sua conta pessoal · {{ auth.corporation()?.name || 'Morphus Cloud' }}
            </span>
          </div>
        </div>

        <a
          routerLink="/website/profile"
          class="inline-flex items-center gap-x-1.5 rounded-lg border border-neutral-a5 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-12 shadow-2xs transition hover:bg-neutral-a3 dark:bg-neutral-2"
        >
          <mat-icon svgIcon="user-round" class="size-3.5!" />
          Ir para meu perfil pessoal
        </a>
      </div>

      <!-- Mobile navigation -->
      <mat-form-field class="w-full md:hidden">
        <mat-select
          [value]="router.url"
          (selectionChange)="router.navigateByUrl($event.value)"
        >
          @for (section of sections; track $index) {
            @for (link of section.items; track link.route) {
              <mat-option [value]="link.route">{{ link.label }}</mat-option>
            }
          }
        </mat-select>
      </mat-form-field>

      <!-- Layout 2 Colunas estilo GitHub Settings (Menu Lateral Esquerdo + Conteúdo Direito) -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-12">
        <!-- Coluna Esquerda: Submenu Vertical GitHub Settings -->
        <aside class="hidden md:col-span-3 md:flex md:flex-col md:gap-y-4">
          @for (section of sections; track $index; let first = $first) {
            @if (!first) {
              <mat-divider />
            }
            <div class="flex flex-col gap-y-0.5">
              @if (section.title) {
                <div class="px-3 pb-1.5 text-xs font-semibold tracking-wider text-neutral-a10">
                  {{ section.title }}
                </div>
              }
              @for (item of section.items; track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive #rla="routerLinkActive"
                  class="group relative flex items-center gap-x-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
                  [class]="
                    rla.isActive
                      ? 'bg-neutral-a3 font-semibold text-neutral-12'
                      : 'text-neutral-11 hover:bg-neutral-a2 hover:text-neutral-12'
                  "
                >
                  @if (rla.isActive) {
                    <span class="absolute inset-y-1.5 start-0 w-1 rounded-full bg-primary-9"></span>
                  }
                  <mat-icon
                    [svgIcon]="item.icon"
                    class="size-4! shrink-0"
                    [class.text-primary-a11]="rla.isActive"
                    [class.text-neutral-a10]="!rla.isActive"
                  />
                  <span class="truncate">{{ item.label }}</span>
                </a>
              }
            </div>
          }
        </aside>

        <!-- Coluna Direita: Conteúdo da Seção Selecionada -->
        <div class="flex min-w-0 flex-col md:col-span-9">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export default class SettingsLayout {
  protected readonly router = inject(Router);
  protected readonly auth = inject(Auth);

  protected readonly sections: SettingsNavSection[] = [
    {
      items: [
        {
          route: '/morphus/settings/profile',
          label: 'Perfil público (Profile)',
          icon: 'user-round',
        },
        {
          route: '/morphus/settings/preferences',
          label: 'Aparência e Preferências',
          icon: 'paintbrush',
        },
        {
          route: '/morphus/settings/notifications',
          label: 'Notificações',
          icon: 'bell',
        },
      ],
    },
    {
      title: 'Acesso & Segurança',
      items: [
        {
          route: '/morphus/settings/security',
          label: 'Senha e Autenticação',
          icon: 'shield-check',
        },
        {
          route: '/morphus/settings/billing',
          label: 'Plano e Faturamento',
          icon: 'receipt-text',
        },
        {
          route: '/morphus/settings/workspace',
          label: 'Workspace e Corporação',
          icon: 'building-2',
        },
      ],
    },
    {
      title: 'Ecossistema & Governança',
      items: [
        {
          route: '/morphus/corporation',
          label: 'Minhas Corporações',
          icon: 'building',
        },
        {
          route: '/security/user-role',
          label: 'Perfis e Permissões (RBAC)',
          icon: 'key-round',
        },
      ],
    },
  ];
}
