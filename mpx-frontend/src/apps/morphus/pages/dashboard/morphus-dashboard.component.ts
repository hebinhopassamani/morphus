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
import { Auth } from '@core/mpx-auth';
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
