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
  selector: 'mpx-security-dashboard',
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
  templateUrl: './security-dashboard.component.html',
})
export class SecurityDashboardComponent {
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
      title: 'Tenants',
      icon: 'building-2' as const,
      value: this.auth.availableCorporations().length || 1,
      subtitle: 'Corporações isoladas',
      badge: 'Multi-Tenant',
    },
    {
      title: 'Módulos & Keys',
      icon: 'boxes' as const,
      value: 7,
      subtitle: 'Módulos e submódulos ativos',
      badge: 'Protegidos',
    },
    {
      title: 'Perfis & Claims',
      icon: 'shield-check' as const,
      value: this.activeCorporationSummary()?.roles?.length || 1,
      subtitle: `Ativo: ${this.activeRolesLabel()}`,
      badge: 'RBAC',
    },
    {
      title: 'Autenticação',
      icon: 'fingerprint-pattern' as const,
      value: 'JWT + OAuth',
      subtitle: 'Google & Credenciais nativas',
      badge: 'Online',
    },
  ]);

  protected readonly securityModules = [
    {
      title: 'Users (Usuários)',
      icon: 'users' as const,
      badge: 'Identidade',
      description:
        'Cadastre usuários da corporação e acesse pelo menu da linha a configuração de Perfis (Roles) ou Permissões (Claims).',
      route: '/security/user',
      actionLabel: 'Gerenciar Usuários',
      footerHint: 'Cadastro e vínculos por usuário',
    },
    {
      title: 'Roles (Perfis de Acesso)',
      icon: 'shield' as const,
      badge: 'RBAC',
      description:
        'Crie perfis por módulo/submódulo e vincule dezenas de permissões (Claims) de uma só vez.',
      route: '/security/role',
      actionLabel: 'Gerenciar Perfis',
      footerHint: 'Perfis e permissões em lote',
    },
    {
      title: 'Claims (Catálogo de Permissões)',
      icon: 'key-round' as const,
      badge: 'Políticas',
      description:
        'Cadastre e organize permissões granulares (ClaimType / ClaimValue) vinculadas a módulos e submódulos.',
      route: '/security/claim',
      actionLabel: 'Gerenciar Permissões',
      footerHint: 'Controle fino de operações',
    },
    {
      title: 'Modules & SubModules',
      icon: 'boxes' as const,
      badge: 'Recursos',
      description:
        'Cadastre módulos, gerencie seus submódulos (1:N) e copie chaves únicas (Key) de 12 caracteres.',
      route: '/security/module',
      actionLabel: 'Acessar Módulos',
      footerHint: 'Identificação única via Key',
    },
    {
      title: 'Social Auth, SSO & MFA',
      icon: 'fingerprint-pattern' as const,
      badge: 'Autenticação',
      description:
        'Configure provedores sociais (Google, GitHub), Single Sign-On corporativo (SAML/OIDC) e múltiplos fatores (MFA).',
      route: '/security',
      actionLabel: 'Configurar Auth',
      footerHint: 'How to Authenticate & Provedores',
    },
    {
      title: 'Monitoring, Security Logs & APIs',
      icon: 'file-text' as const,
      badge: 'Auditoria',
      description:
        'Rastreie eventos de login, troca de permissão, chaves M2M (Secret Keys) e disparos de webhooks.',
      route: '/security',
      actionLabel: 'Ver Security Logs',
      footerHint: 'Trilha de auditoria imutável',
    },
  ];
}
