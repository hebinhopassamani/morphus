import { Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Auth } from '@core/mpx-auth';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { MorphusContextService } from '@morphus/services/morphus-context.service';

@Component({
  selector: 'mpx-morphus-dashboard',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    MatButton,
    MatIconButton,
    MatIcon,
    RouterLink,
  ],
  host: {
    class: 'mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8 text-neutral-12',
  },
  templateUrl: './morphus-dashboard.component.html',
})
export class MorphusDashboardComponent {
  protected readonly auth = inject(Auth);
  protected readonly context = inject(MorphusContextService);

  protected readonly pendingOfferApp = signal<MorphusApplication | null>(null);
  protected readonly selectedTargetWorkspaceId = signal<string>('');
  protected readonly offerInstanceMode = signal<'isolated' | 'shared'>('isolated');
  protected readonly selectedSharedSourceWorkspaceId = signal<string>('');
  protected readonly provisioningApp = signal<boolean>(false);

  protected readonly otherWorkspacesForOfferApp = computed<Workspace[]>(() => {
    const app = this.pendingOfferApp();
    const targetWsId = this.selectedTargetWorkspaceId();
    if (!app?.id) {
      return [];
    }
    return this.context.getWorkspacesWithApplication(app.id, targetWsId || null);
  });

  protected readonly availableTargetWorkspacesForOffer = computed<Workspace[]>(() => {
    const app = this.pendingOfferApp();
    const allWorkspaces = this.context.workspaces();
    if (!app?.id) {
      return allWorkspaces;
    }
    const alreadyInWsIds = new Set(
      this.context
        .getWorkspacesWithApplication(app.id, null)
        .map((w) => w.id)
        .filter((id): id is string => !!id),
    );
    const filtered = allWorkspaces.filter((w) => w.id && !alreadyInWsIds.has(w.id));
    return filtered.length > 0 ? filtered : allWorkspaces;
  });

  protected canStartFreeTrial(app: MorphusApplication): boolean {
    return !this.context.getApplicationTrialInfo(app).trialUsed;
  }

  protected openOfferProvisionModal(app: MorphusApplication): void {
    this.pendingOfferApp.set(app);
    const activeWsId = this.context.activeWorkspace()?.id;
    const candidates = this.availableTargetWorkspacesForOffer();
    const defaultTargetWsId =
      (activeWsId && candidates.some((w) => w.id === activeWsId)
        ? activeWsId
        : candidates[0]?.id) ||
      activeWsId ||
      '';

    this.selectedTargetWorkspaceId.set(defaultTargetWsId);
    this.offerInstanceMode.set('isolated');

    const others = this.context.getWorkspacesWithApplication(app.id, defaultTargetWsId || null);
    this.selectedSharedSourceWorkspaceId.set(others[0]?.id || '');
  }

  protected selectTargetWorkspaceForOffer(wsId: string): void {
    this.selectedTargetWorkspaceId.set(wsId);
    const app = this.pendingOfferApp();
    if (!app?.id) {
      return;
    }
    const others = this.context.getWorkspacesWithApplication(app.id, wsId);
    if (others.length === 0) {
      this.offerInstanceMode.set('isolated');
      this.selectedSharedSourceWorkspaceId.set('');
    } else if (!others.some((w) => w.id === this.selectedSharedSourceWorkspaceId())) {
      this.selectedSharedSourceWorkspaceId.set(others[0]?.id || '');
    }
  }

  protected closeOfferProvisionModal(): void {
    if (this.provisioningApp()) {
      return;
    }
    this.pendingOfferApp.set(null);
  }

  protected confirmOfferProvision(): void {
    const app = this.pendingOfferApp();
    const targetWsId = this.selectedTargetWorkspaceId() || this.context.activeWorkspace()?.id;
    if (!app?.id || !targetWsId || this.provisioningApp()) {
      return;
    }

    const sharedWsId =
      this.offerInstanceMode() === 'shared'
        ? this.selectedSharedSourceWorkspaceId() || null
        : null;

    this.provisioningApp.set(true);
    this.context
      .provisionApplicationInWorkspace({
        applicationId: app.id,
        workspaceId: targetWsId,
        sharedWithWorkspaceId: sharedWsId,
      })
      .subscribe({
        next: () => {
          this.provisioningApp.set(false);
          this.pendingOfferApp.set(null);
          const targetWs = this.context.workspaces().find((w) => w.id === targetWsId);
          if (targetWs && targetWs.id !== this.context.activeWorkspace()?.id) {
            this.context.selectWorkspace(targetWs);
          }
        },
        error: () => {
          this.provisioningApp.set(false);
        },
      });
  }

  protected readonly activeCorporationSummary = computed(() => {
    const activeId = this.auth.corporation()?.id;
    return (
      this.auth.availableCorporations().find((c) => c.id === activeId) ?? null
    );
  });

  protected readonly activeRolesLabel = computed(() => {
    const roles = this.activeCorporationSummary()?.roles?.filter(Boolean) ?? [];
    if (roles.length > 0) {
      return roles.join(', ');
    }
    return this.activeCorporationSummary()?.isOwner ? 'Owner' : 'Administrador';
  });

  protected readonly stats = computed(() => [
    {
      title: 'Corporações',
      icon: 'building-2' as const,
      value: this.auth.availableCorporations().length || 1,
      subtitle: 'Matriz e filiais com acesso',
      badge: 'Ativas',
    },
    {
      title: 'Workspaces',
      icon: 'layers' as const,
      value: this.context.workspaces().length || 1,
      subtitle: `Ativo: ${this.context.activeWorkspace()?.name || 'Principal'}`,
      badge: 'Sincronizado',
    },
    {
      title: 'Aplicações',
      icon: 'boxes' as const,
      value: this.context.availableApplications().length || 1,
      subtitle: `Foco: ${this.context.activeApplication()?.name || 'Morphus'}`,
      badge: 'Prontas',
    },
    {
      title: 'Navegação',
      icon: 'list-tree' as const,
      value: this.context.menus().length || 2,
      subtitle: 'Módulos e submódulos',
      badge: 'RBAC',
    },
  ]);

  protected readonly managementModules = [
    {
      title: 'Organization (Corporações)',
      icon: 'building-2' as const,
      badge: 'Estrutura',
      description:
        'Gerencie matriz, filiais, documentos fiscais (CNPJ) e unidades vinculadas à sua conta corporativa.',
      route: '/morphus/corporation',
      actionLabel: 'Acessar Corporações',
      footerHint: 'Multi-tenant isolado por CorporationId',
    },
    {
      title: 'Workspaces',
      icon: 'layers' as const,
      badge: 'Ambientes',
      description:
        'Organize ambientes de trabalho, vincule aplicações do catálogo e distribua equipes por departamento.',
      route: '/morphus/workspace',
      actionLabel: 'Acessar Workspaces',
      footerHint: 'Hierarquia Corporation → Workspace',
    },
    {
      title: 'Applications & Templates',
      icon: 'boxes' as const,
      badge: 'Catálogo',
      description:
        'Gerencie aplicações contratadas, modelos prontos de aplicação (Templates), formulários e páginas.',
      route: '/website/home',
      actionLabel: 'Ver Aplicações',
      footerHint: 'My Apps, Forms, Pages & Profiles',
    },
    {
      title: 'Agents (IA) & Workflows',
      icon: 'sparkles' as const,
      badge: 'Automação',
      description:
        'Orquestre agentes de inteligência artificial, fluxos configuráveis (Morphus Flow), plugins e integrações.',
      route: '/morphus',
      actionLabel: 'Explorar IA & Fluxos',
      footerHint: 'Agents · Workflows · Plugins',
    },
    {
      title: 'Domains, Emails & Templates',
      icon: 'mail' as const,
      badge: 'Comunicação',
      description:
        'Configure domínios verificados, templates HTML transacionais, configurações de envio e WebHooks.',
      route: '/morphus',
      actionLabel: 'Configurar E-mails',
      footerHint: 'Motor transacional Morphus Mail',
    },
    {
      title: 'Morphus Security (Auth0)',
      icon: 'shield-check' as const,
      badge: 'Segurança',
      description:
        'Acesse o hub de Identidade, Módulos, Submódulos, Usuários, Perfis (Roles), Permissões (Claims) e API Keys.',
      route: '/security',
      actionLabel: 'Abrir Security',
      footerHint: 'Protegido por Security.Api',
    },
  ];
}
