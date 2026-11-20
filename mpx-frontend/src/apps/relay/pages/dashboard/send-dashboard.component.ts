import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MpxSecurity } from '@core/morphus';
import { MpxContextService } from '@morphus/services/morphus-context.service';

@Component({
  selector: 'mpx-send-dashboard',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    MatButton,
    MatIcon,
    RouterLink,
  ],
  host: {
    class:
      'mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8 text-neutral-12',
  },
  template: `
    <!-- Header -->
    <div
      class="flex flex-col justify-between gap-4 border-b border-neutral-a6 pb-6 sm:flex-row sm:items-center"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        >
          <img
            src="/logos/morphus_send_logo.png?v=5"
            alt="Morphus Send"
            class="size-full object-contain drop-shadow-sm"
          />
        </div>
        <div class="flex flex-col gap-y-1">
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight">Morphus Send</h1>
            @if (auth.corporation(); as corp) {
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11"
              >
                <mat-icon class="size-3.5!" svgIcon="building-2" />
                {{ corp.name }}
              </span>
            }
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <span class="size-1.5 rounded-full bg-emerald-500"></span>
              SMTP & DKIM Engine Online
            </span>
          </div>
          <p class="text-sm text-neutral-a11">
            Plataforma SaaS e API transacional de envio de e-mails, verificação
            de domínios (SPF, DKIM & DMARC), templates HTML e SDKs
            multi-linguagem.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          matButton
          class="secondary border border-neutral-a6"
          (click)="goToCloud()"
        >
          <mat-icon svgIcon="building-2" />
          Morphus Cloud
        </button>
        <a
          matButton
          class="primary filled"
          [routerLink]="['.']"
          [queryParams]="{ view: 'playground' }"
        >
          <mat-icon svgIcon="send" />
          Playground de Envio
        </a>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      @for (stat of stats(); track stat.title) {
        <mat-card class="flex flex-col justify-between p-5">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-neutral-a11">
              {{ stat.title }}
            </span>
            <div
              class="flex size-9 items-center justify-center rounded-lg bg-primary-a3 text-primary-a11"
            >
              <mat-icon class="size-5!" [svgIcon]="stat.icon" />
            </div>
          </div>

          <div class="my-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold tracking-tight">
              {{ stat.value }}
            </span>
            <span
              class="rounded-md bg-neutral-a3 px-2 py-0.5 text-xs font-medium text-neutral-a11"
            >
              {{ stat.badge }}
            </span>
          </div>

          <div class="text-xs text-neutral-a10">
            {{ stat.subtitle }}
          </div>
        </mat-card>
      }
    </div>

    <!-- Architecture Banner -->
    <mat-card class="p-6">
      <div
        class="flex flex-col justify-between gap-6 lg:flex-row lg:items-center"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-a3 text-primary-a11"
          >
            <mat-icon class="size-6!" svgIcon="send" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-semibold">
                Disparo Autenticado de Alta Entregabilidade & Governança via
                Security.Api
              </h2>
              <span
                class="rounded-md bg-primary-a3 px-2 py-0.5 font-mono text-xs font-semibold text-primary-a11"
              >
                send.morphus.one
              </span>
            </div>
            <p class="text-sm text-neutral-a11">
              Cada disparo recebido pela API ou pelo SDK oficial valida a Secret
              Key junto à Security.Api, injeta variáveis dinâmicas no Template
              HTML da corporação e assina a mensagem com chaves RSA 2048-bit
              DKIM.
            </p>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2.5 text-xs">
          <span
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a5 bg-neutral-a2 px-3 py-1.5 font-medium"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="globe" />
            SPF + DKIM + DMARC
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a5 bg-neutral-a2 px-3 py-1.5 font-medium"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="code" />
            SDKs Multi-Linguagem
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a5 bg-neutral-a2 px-3 py-1.5 font-medium"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="shield-check" />
            Secret Keys M2M
          </span>
        </div>
      </div>
    </mat-card>

    <!-- Send Modules Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      @for (mod of sendModules; track mod.title) {
        <mat-card class="flex flex-col justify-between">
          <mat-card-header class="flex items-start justify-between gap-3 pb-2">
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-a3 text-primary-a11"
              >
                <mat-icon class="size-5!" [svgIcon]="mod.icon" />
              </div>
              <div class="flex flex-col">
                <span class="text-base font-semibold leading-snug">
                  {{ mod.title }}
                </span>
                <span class="text-xs text-neutral-a10">
                  {{ mod.badge }}
                </span>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content class="py-3">
            <p class="text-sm leading-relaxed text-neutral-a11">
              {{ mod.description }}
            </p>
          </mat-card-content>

          <mat-card-footer
            class="mt-auto flex items-center justify-between border-t border-neutral-a4 px-4 py-3"
          >
            <span class="text-xs text-neutral-a10">
              {{ mod.footerHint }}
            </span>
            <a
              matButton
              class="primary small"
              [routerLink]="mod.route"
              [queryParams]="mod.queryParams"
            >
              {{ mod.actionLabel }}
              <mat-icon class="size-4!" svgIcon="arrow-right" />
            </a>
          </mat-card-footer>
        </mat-card>
      }
    </div>
  `,
})
export class SendDashboardComponent {
  protected readonly auth = inject(MpxSecurity);
  protected readonly context = inject(MpxContextService);
  private readonly router = inject(Router);

  protected goToCloud(): void {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.one' || host.endsWith('.morphus.one')) {
        window.location.href = `${window.location.protocol}//morphus.morphus.one`;
        return;
      }
    }
    void this.router.navigateByUrl('/morphus');
  }

  protected readonly stats = computed(() => [
    {
      title: 'Domínio Oficial',
      icon: 'globe' as const,
      value: 'morphus.one',
      subtitle: 'contact@morphus.one + 10 aliases ativos',
      badge: 'Verified',
    },
    {
      title: 'Motor de Disparo',
      icon: 'send' as const,
      value: 'EmailHandler',
      subtitle: 'Fila transacional com To, Cc, Bcc e Anexos',
      badge: 'MimeKit',
    },
    {
      title: 'Templates HTML',
      icon: 'file-text' as const,
      value: 'Multi-Tenant',
      subtitle: 'Boas-vindas, confirmação, reset e workflows',
      badge: 'Dinâmicos',
    },
    {
      title: 'Segurança M2M',
      icon: 'key-round' as const,
      value: 'Security.Api',
      subtitle: 'Validação server-to-server de Secret Keys',
      badge: 'Zero-Trust',
    },
  ]);

  protected readonly sendModules = [
    {
      title: 'Domínios Verificados (SPF & DKIM)',
      icon: 'globe' as const,
      badge: 'DNS & Criptografia RSA',
      description:
        'Cadastre o domínio da corporação, gere chaves RSA 2048 bits para assinatura DKIM e verifique registros TXT/CNAME em tempo real.',
      route: '/relay',
      queryParams: { view: 'domains' },
      actionLabel: 'Gerenciar Domínios',
      footerHint: 'Verificação automática DNS',
    },
    {
      title: 'Templates HTML & Variáveis',
      icon: 'file-text' as const,
      badge: 'Editor Visual Multi-Tenant',
      description:
        'Personalize templates transacionais no banco de dados com injeção de variáveis de contexto em 1 clique e suporte a anexos do Morphus Flow.',
      route: '/relay',
      queryParams: { view: 'templates' },
      actionLabel: 'Editar Templates',
      footerHint: '100% no banco por Corporação',
    },
    {
      title: 'Playground de Disparo Instantâneo',
      icon: 'send' as const,
      badge: 'Teste em Tempo Real',
      description:
        'Simule e dispare e-mails transacionais na hora escolhendo remetente, destinatários (To/Cc/Bcc), template ou corpo HTML livre.',
      route: '/relay',
      queryParams: { view: 'playground' },
      actionLabel: 'Abrir Playground',
      footerHint: 'Teste imediato de entrega',
    },
    {
      title: 'SDKs Multi-Linguagem & Snippets',
      icon: 'code' as const,
      badge: 'Node, .NET, Python, Go, cURL',
      description:
        'Copie snippets prontos com interface fluente (addMailFrom, addMailTo, sendMail) e sua Secret Key já injetada para qualquer linguagem.',
      route: '/relay',
      queryParams: { view: 'sdks' },
      actionLabel: 'Ver Snippets SDK',
      footerHint: 'npm install morphus-mail',
    },
    {
      title: 'API Keys & Escopos (Security.Api)',
      icon: 'key-round' as const,
      badge: 'Autenticação Server-to-Server',
      description:
        'Gere e revogue Secret Keys vinculadas à sua corporação, validadas pela Security.Api antes de cada disparo transacional.',
      route: '/relay',
      queryParams: { view: 'api-keys' },
      actionLabel: 'Gerenciar Chaves',
      footerHint: 'Governado pela Security.Api',
    },
    {
      title: 'Logs de Entrega & Webhooks',
      icon: 'list-filter' as const,
      badge: 'Rastreabilidade & Auditoria',
      description:
        'Acompanhe o histórico completo de envios, status SMTP (Queued, Sent, Delivered, Bounced) e configure webhooks de eventos.',
      route: '/relay',
      queryParams: { view: 'logs' },
      actionLabel: 'Consultar Logs',
      footerHint: 'Tabelas de auditoria de e-mail',
    },
  ];
}
