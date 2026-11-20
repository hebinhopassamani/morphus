import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MpxSecurity } from '@core/morphus';
import { MpxContextService } from '@morphus/services/morphus-context.service';

@Component({
  selector: 'mpx-flow-dashboard',
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
            src="/logos/morphus_flow_logo.png?v=5"
            alt="Morphus Flow"
            class="size-full object-contain drop-shadow-sm"
          />
        </div>
        <div class="flex flex-col gap-y-1">
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight">Morphus Flow</h1>
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
              Workflow Engine Ready
            </span>
          </div>
          <p class="text-sm text-neutral-a11">
            Estúdio visual de Workflows fronteira-a-fronteira, Estações de
            Trabalho, Plenário com Quórum & Relator, Condições e SLAs
            progressivos.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <a
          matButton
          class="secondary border border-neutral-a6"
          [routerLink]="['/morphus']"
        >
          <mat-icon svgIcon="building-2" />
          Morphus Cloud
        </a>
        <a matButton class="primary filled" [routerLink]="['/flow']">
          <mat-icon svgIcon="workflow" />
          Novo Workflow
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
            <mat-icon class="size-6!" svgIcon="workflow" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-semibold">
                Orquestração Fronteira-a-Fronteira, Sacola Multi-Entidade &
                Plenário com Quórum
              </h2>
              <span
                class="rounded-md bg-primary-a3 px-2 py-0.5 font-mono text-xs font-semibold text-primary-a11"
              >
                16 Entidades wkf_*
              </span>
            </div>
            <p class="text-sm text-neutral-a11">
              Carregue qualquer entidade ou coleção do ecossistema dentro do
              envelope do fluxo, aplique as 6 Condições (If, Switch,
              ForEach/While, WaitUntil, TryCatch e Split/Join), delibere em
              Plenário com Relator e dispare notificações ricas via Morphus
              Send.
            </p>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2.5 text-xs">
          <span
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a5 bg-neutral-a2 px-3 py-1.5 font-medium"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="git-branch" />
            6 Condições & Split/Join
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a5 bg-neutral-a2 px-3 py-1.5 font-medium"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="users" />
            Plenário & Relator
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a5 bg-neutral-a2 px-3 py-1.5 font-medium"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="clock" />
            SLAs Progressivos
          </span>
        </div>
      </div>
    </mat-card>

    <!-- Flow Modules Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
      @for (mod of flowModules; track mod.title) {
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
export class FlowDashboardComponent {
  protected readonly auth = inject(MpxSecurity);
  protected readonly context = inject(MpxContextService);

  protected readonly stats = computed(() => [
    {
      title: 'Modelos de Fluxo',
      icon: 'workflow' as const,
      value: '16 Tabelas',
      subtitle: 'Motor wkf_* implantado no PostgreSQL',
      badge: 'WorkflowType',
    },
    {
      title: 'Estações & Plenário',
      icon: 'git-branch' as const,
      value: 'Quórum + Relator',
      subtitle: 'SingleOwner, SharedQueue e Deliberative',
      badge: 'Stations',
    },
    {
      title: 'Condições Nativas',
      icon: 'list-filter' as const,
      value: '6 Tipos',
      subtitle: 'If, Switch, Loop, WaitUntil, TryCatch, Split/Join',
      badge: 'Fantasminha',
    },
    {
      title: 'SLAs & Alertas',
      icon: 'clock' as const,
      value: 'Progressivo',
      subtitle: 'Escalonamento automático e notificações',
      badge: '100% No Prazo',
    },
  ]);

  protected readonly flowModules = [
    {
      title: 'Estúdio Visual de Fluxos (Canvas)',
      icon: 'workflow' as const,
      badge: 'WorkflowType & Configs',
      description:
        'Desenhe modelos de workflow com estações encadeadas, coordenadas X/Y no canvas visual, ações de transição e permissões granulares.',
      route: '/flow',
      queryParams: { view: 'studio' },
      actionLabel: 'Abrir Estúdio',
      footerHint: 'Canvas drag-and-drop',
    },
    {
      title: 'Catálogo de Estações (Stations)',
      icon: 'boxes' as const,
      badge: 'Estações Reutilizáveis',
      description:
        'Cadastre estações de trabalho da corporação ou do workspace (Triagem, Fiscal, Jurídico, Diretoria, Contas a Pagar) com ícone e cor.',
      route: '/flow',
      queryParams: { view: 'stations' },
      actionLabel: 'Gerenciar Estações',
      footerHint: 'wkf_stations',
    },
    {
      title: 'Plenário, Quórum & Relator',
      icon: 'users' as const,
      badge: 'Deliberação Colegiada',
      description:
        'Configure comitês com percentual de quórum, mínimo de votos, voto do Relator primeiro, voto de minerva e botão "Acompanhar Relator".',
      route: '/flow',
      queryParams: { view: 'committee' },
      actionLabel: 'Configurar Plenário',
      footerHint: 'Quorum & Rapporteur',
    },
    {
      title: 'Condições & Fantasminha (6 Tipos)',
      icon: 'git-branch' as const,
      badge: 'Roteamento Inteligente',
      description:
        'Configure desvios If, Switch, ForEach/While, WaitUntil (worker assíncrono sem travar thread), TryCatch e Split/Join em sub-workflows.',
      route: '/flow',
      queryParams: { view: 'conditions' },
      actionLabel: 'Ver Condições',
      footerHint: 'wkf_workflow_type_config_conditions',
    },
    {
      title: 'Formulários, Validações & Sacola',
      icon: 'sliders-horizontal' as const,
      badge: 'Multi-Entidade & <mpx-filter>',
      description:
        'Monte campos dinâmicos ou vinculados às propriedades das entidades da sacola, com validações visuais via <mpx-filter> e anexos tipados.',
      route: '/flow',
      queryParams: { view: 'fields' },
      actionLabel: 'Campos & Regras',
      footerHint: 'Fields, Validations & Items',
    },
    {
      title: 'SLAs Progressivos & Notificações',
      icon: 'clock' as const,
      badge: 'Monitoramento & E-mail',
      description:
        'Defina múltiplos alertas de SLA (75%, 100%, +24h), destinatários dinâmicos (iniciador, executor anterior, cliente na entidade) e anexos.',
      route: '/flow',
      queryParams: { view: 'sla' },
      actionLabel: 'SLAs & Alertas',
      footerHint: 'Integrado ao Morphus Send',
    },
  ];
}
