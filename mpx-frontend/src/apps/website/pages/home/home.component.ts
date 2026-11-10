import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';
import { Auth } from '@core/mpx-auth';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import {
  CorporationSummary,
  PortalPreferenceItem,
  SavePortalPreferenceRequest,
} from '@security/entities/session';
import {
  MpxPortalCardComponent,
  PortalCardBadge,
} from './portal-card.component';

export type CardColorKey = 'violet' | 'indigo' | 'jade' | 'amber';

type CardAccent = {
  key: CardColorKey;
  label: string;
  dotClass: string;
  bannerClass: string;
  iconBoxClass: string;
  badgeClass: string;
};

type PortalSectionTab = 'all' | 'apps' | 'workspaces' | 'corporations' | 'profile';

export type PortalSubModuleItem = {
  name: string;
  description: string;
};

export type PortalModuleItem = {
  name: string;
  description: string;
  subModules: PortalSubModuleItem[];
};

export type PortalAppCard = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: CardColorKey;
  badgeLabel: string;
  trialBadgeLabel?: string;
  trialTooltip?: string;
  isInTrial?: boolean;
  trialUsed?: boolean;
  canStartFreeTrial?: boolean;
  instanceBadgeLabel?: string;
  otherWorkspacesCount?: number;
  statusName: string;
  statusLabel: string;
  footerLabel: string;
  route: string;
  isActiveApp: boolean;
  isInstalled: boolean;
  modules: PortalModuleItem[];
  rawApp?: MorphusApplication;
};

export type ShowcaseHighlightItem = {
  id?: string;
  featureId?: string;
  title: string;
  titleIcon?: string;
  highlight: string;
  highlightIcon?: string;
  order: number;
};

export type ShowcaseFeatureItem = {
  id?: string;
  title: string;
  highlightPhrase: string;
  description: string;
  order: number;
  highlights: ShowcaseHighlightItem[];
};

export type ShowcaseModuleItem = {
  id?: string;
  categoryId?: string;
  categoryName: string;
  categoryColor?: string;
  icon?: string;
  title: string;
  description: string;
  actionText: string;
  order: number;
};

const CARD_ACCENTS: CardAccent[] = [
  {
    key: 'violet',
    label: 'Roxo',
    dotClass: 'bg-violet-9',
    bannerClass: 'from-violet-a4 via-violet-a2 to-transparent',
    iconBoxClass: 'bg-violet-a3 text-violet-a11 ring-1 ring-violet-a5',
    badgeClass: 'bg-violet-a3 text-violet-a11',
  },
  {
    key: 'indigo',
    label: 'Azul',
    dotClass: 'bg-indigo-9',
    bannerClass: 'from-indigo-a4 via-indigo-a2 to-transparent',
    iconBoxClass: 'bg-indigo-a3 text-indigo-a11 ring-1 ring-indigo-a5',
    badgeClass: 'bg-indigo-a3 text-indigo-a11',
  },
  {
    key: 'jade',
    label: 'Verde',
    dotClass: 'bg-jade-9',
    bannerClass: 'from-jade-a4 via-jade-a2 to-transparent',
    iconBoxClass: 'bg-jade-a3 text-jade-a11 ring-1 ring-jade-a5',
    badgeClass: 'bg-jade-a3 text-jade-a11',
  },
  {
    key: 'amber',
    label: 'Âmbar',
    dotClass: 'bg-amber-9',
    bannerClass: 'from-amber-a4 via-amber-a2 to-transparent',
    iconBoxClass: 'bg-amber-a3 text-amber-a11 ring-1 ring-amber-a5',
    badgeClass: 'bg-amber-a3 text-amber-a11',
  },
];

const CARD_ACCENT_MAP: Record<CardColorKey, CardAccent> = {
  violet: CARD_ACCENTS[0],
  indigo: CARD_ACCENTS[1],
  jade: CARD_ACCENTS[2],
  amber: CARD_ACCENTS[3],
};

@Component({
  selector: 'web-home',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
    MpxPortalCardComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col gap-y-12 py-6 text-neutral-12 lg:gap-y-16 lg:py-8',
  },
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  protected readonly auth = inject(Auth);
  protected readonly context = inject(MorphusContextService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | null = null;

  protected readonly colorOptions = CARD_ACCENTS;
  protected readonly activeTab = signal<PortalSectionTab>('all');
  protected readonly selectedAppFilterId = signal<string>('all');
  protected readonly selectedWorkspaceFilterId = signal<string>('all');
  protected readonly selectedCorporationFilterId = signal<string>('all');
  protected readonly showMarketingPreview = signal<boolean>(false);
  protected readonly starredIds = signal<Record<string, boolean>>({});
  protected readonly cardColorOverrides = signal<Record<string, CardColorKey>>({});
  protected readonly selectedAppForModules = signal<PortalAppCard | null>(null);
  protected readonly pendingOfferApp = signal<PortalAppCard | null>(null);
  protected readonly selectedTargetWorkspaceId = signal<string>('');
  protected readonly offerInstanceMode = signal<'isolated' | 'shared'>('isolated');
  protected readonly selectedSharedSourceWorkspaceId = signal<string>('');
  protected readonly provisioningApp = signal<boolean>(false);
  protected readonly switchingCorpId = signal<string | null>(null);
  protected readonly nickNameInput = signal<string>(this.auth.user()?.nickName || '');
  protected readonly savingNickName = signal<boolean>(false);
  protected readonly nickNameSaved = signal<boolean>(false);

  protected saveNickName(value: string): void {
    const clean = value.trim();
    this.nickNameInput.set(clean);
    this.savingNickName.set(true);
    this.nickNameSaved.set(false);

    this.auth.updateProfile({ nickName: clean }).subscribe({
      next: () => {
        this.savingNickName.set(false);
        this.nickNameSaved.set(true);
        setTimeout(() => this.nickNameSaved.set(false), 3000);
      },
      error: () => {
        this.savingNickName.set(false);
      },
    });
  }

  protected readonly userInitials = computed(() => {
    const name = this.auth.user()?.name?.trim() || this.auth.user()?.email?.trim();
    if (!name) {
      return 'MP';
    }
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected readonly appFilterLabel = computed(() => {
    const filterId = this.selectedAppFilterId();
    if (filterId === 'all') {
      return 'Ver tudo';
    }
    return (
      this.portalAppCards().find((a) => a.id === filterId)?.name || 'Ver tudo'
    );
  });

  protected readonly workspaceFilterLabel = computed(() => {
    const filterId = this.selectedWorkspaceFilterId();
    if (filterId === 'all') {
      return 'Ver tudo';
    }
    return (
      this.context.workspaces().find((w) => w.id === filterId)?.name || 'Ver tudo'
    );
  });

  protected readonly corporationFilterLabel = computed(() => {
    const filterId = this.selectedCorporationFilterId();
    if (filterId === 'all') {
      return 'Ver tudo';
    }
    return (
      this.auth.availableCorporations().find((c) => c.id === filterId)?.name || 'Ver tudo'
    );
  });

  protected clearFilters(): void {
    this.selectedAppFilterId.set('all');
    this.selectedWorkspaceFilterId.set('all');
    this.selectedCorporationFilterId.set('all');
    this.activeTab.set('all');
  }

  protected selectAppFilter(appId: string): void {
    this.selectedAppFilterId.set(appId);
  }

  protected selectWorkspaceFilter(wsId: string): void {
    this.selectedWorkspaceFilterId.set(wsId);
    this.selectedAppFilterId.set('all');
    if (wsId !== 'all') {
      const ws = this.context.workspaces().find((w) => w.id === wsId);
      if (ws && ws.id !== this.context.activeWorkspace()?.id) {
        this.context.selectWorkspace(ws, false);
      }
    }
  }

  protected selectCorporationFilter(corpId: string): void {
    this.selectedCorporationFilterId.set(corpId);
    if (corpId !== 'all' && corpId !== this.auth.corporation()?.id) {
      const corp = this.auth.availableCorporations().find((c) => c.id === corpId);
      if (corp && !corp.inactive) {
        this.selectCorporation(corp, false);
      }
    }
  }

  /**
   * Monta os Cards de Aplicações Operacionais do Usuário no Workspace selecionado:
   * Nunca exibe Morphus, Segurança ou Website para nenhum perfil.
   */
  protected readonly portalAppCards = computed<PortalAppCard[]>(() => {
    const activeAppId = this.context.activeOperationalApplication()?.id;
    const activeCorpId = this.auth.corporation()?.id || '';
    const activeWsId = this.context.activeWorkspace()?.id || '';
    const workspaceApps = this.context.operationalApplications();
    const colorOverrides = this.cardColorOverrides();
    const cards: PortalAppCard[] = [];

    for (let i = 0; i < workspaceApps.length; i++) {
      const app = workspaceApps[i];
      if (!app.id) {
        continue;
      }

      const categoryLabel =
        app.category?.label ||
        app.category?.name ||
        this.inferCategoryLabel(app.name);
      const statusName = app.applicationStatus?.name || (app.inactive ? 'Inativa' : 'Ativa');
      const statusLabel =
        app.applicationStatus?.label ||
        (app.inactive ? 'Pausada' : statusName === 'Em preparação' ? 'Sendo preparada' : 'Disponível');
      const footerLabel = 'Veja mais opções';
      const scopedKey = `app:${activeCorpId}:${activeWsId}:${app.id}`;
      const fallbackAppKey = `app:${activeCorpId}:${app.id}`;
      const rawColor = (
        colorOverrides[scopedKey] ||
        colorOverrides[fallbackAppKey] ||
        colorOverrides[app.id] ||
        app.color ||
        app.category?.color ||
        ''
      ) as string;
      const color = this.normalizeColor(rawColor, app.name, i);

      const dbModules: PortalModuleItem[] =
        app.applicationModules && app.applicationModules.length > 0
          ? app.applicationModules.map((m) => ({
              name: m.label || m.name || 'Módulo',
              description: m.description || 'Funcionalidade integrada à aplicação.',
              subModules: (m.applicationSubModules || []).map((sm) => ({
                name: sm.label || sm.name || 'Submódulo',
                description: sm.description || 'Controle específico e permissão de acesso.',
              })),
            }))
          : [];

      const trialInfo = this.context.getApplicationTrialInfo(app);
      const sharedWsName = this.context.getSharedWorkspaceName(app.sharedWithWorkspaceId);
      const instanceBadgeLabel = sharedWsName
        ? `Compartilhada com ${sharedWsName}`
        : !app.system
          ? 'Instância isolada'
          : undefined;

      cards.push({
        id: app.id,
        key: app.key || 'APP',
        name: app.name || 'Aplicação',
        description: (
          app.description ||
          'Aplicação integrada ao seu workspace respeitando suas permissões de acesso.'
        ).slice(0, 120),
        icon: app.icon || 'boxes',
        color,
        badgeLabel: categoryLabel,
        trialBadgeLabel: trialInfo.badgeLabel,
        trialTooltip: trialInfo.detailLabel,
        isInTrial: trialInfo.isInTrial,
        trialUsed: trialInfo.trialUsed,
        instanceBadgeLabel,
        statusName,
        statusLabel,
        footerLabel,
        route: '/morphus',
        isActiveApp: activeAppId === app.id,
        isInstalled: statusName === 'Ativa',
        modules: dbModules.length > 0 ? dbModules : this.inferModulesForApp(app.name || 'Morphus'),
        rawApp: app,
      });
    }

    return cards;
  });

  protected readonly filteredPortalAppCards = computed<PortalAppCard[]>(() => {
    const all = this.portalAppCards();
    const filterId = this.selectedAppFilterId();
    if (filterId === 'all') {
      return all;
    }
    return all.filter((a) => a.id === filterId);
  });

  protected readonly filteredWorkspaces = computed<Workspace[]>(() => {
    const all = this.context.workspaces();
    const filterId = this.selectedWorkspaceFilterId();
    if (filterId === 'all') {
      return all;
    }
    return all.filter((w) => w.id === filterId);
  });

  protected readonly filteredCorporations = computed<CorporationSummary[]>(() => {
    const all = this.auth.availableCorporations();
    const filterId = this.selectedCorporationFilterId();
    if (filterId === 'all') {
      return all;
    }
    return all.filter((c) => c.id === filterId);
  });

  /**
   * "Veja o que mais o Morphus tem para te oferecer":
   * Lista APENAS as aplicações do catálogo que o usuário ainda NÃO tem no Workspace ativo.
   */
  protected readonly offerAppCards = computed<PortalAppCard[]>(() => {
    const unlinked = this.context.unlinkedApplications();
    const activeWsId = this.context.activeWorkspace()?.id;
    const colorOverrides = this.cardColorOverrides();
    const cards: PortalAppCard[] = [];

    for (let i = 0; i < unlinked.length; i++) {
      const app = unlinked[i];
      if (!app.id) {
        continue;
      }

      const categoryLabel =
        app.category?.label ||
        app.category?.name ||
        this.inferCategoryLabel(app.name);
      const rawColor = (colorOverrides[app.id] || app.color || app.category?.color || '') as string;
      const color = this.normalizeColor(rawColor, app.name, i + 2);

      const dbModules: PortalModuleItem[] =
        app.applicationModules && app.applicationModules.length > 0
          ? app.applicationModules.map((m) => ({
              name: m.label || m.name || 'Módulo',
              description: m.description || 'Funcionalidade integrada à aplicação.',
              subModules: (m.applicationSubModules || []).map((sm) => ({
                name: sm.label || sm.name || 'Submódulo',
                description: sm.description || 'Controle específico e permissão de acesso.',
              })),
            }))
          : [];

      const trialInfo = this.context.getApplicationTrialInfo(app);
      const otherWorkspaces = this.context.getWorkspacesWithApplication(app.id, activeWsId);
      const canStartFreeTrial = !trialInfo.trialUsed;

      cards.push({
        id: app.id,
        key: app.key || 'APP',
        name: app.name || 'Aplicação Morphus',
        description:
          app.description ||
          'Expanda o poder do seu workspace com esta aplicação do ecossistema Morphus.',
        icon: app.icon || 'sparkles',
        color,
        badgeLabel: categoryLabel,
        trialBadgeLabel: canStartFreeTrial
          ? 'Teste grátis disponível'
          : otherWorkspaces.length > 0
            ? `Ativa em ${otherWorkspaces.length} workspace(s)`
            : 'Teste já utilizado',
        trialTooltip: canStartFreeTrial
          ? 'Comece seu período de teste grátis desta aplicação'
          : otherWorkspaces.length > 0
            ? 'Você já possui esta aplicação em outro workspace e pode puxá-la para cá (isolada ou compartilhada)'
            : 'Sua corporação já utilizou o período de teste grátis desta aplicação',
        isInTrial: false,
        trialUsed: trialInfo.trialUsed,
        canStartFreeTrial,
        otherWorkspacesCount: otherWorkspaces.length,
        statusName: 'Catálogo',
        statusLabel: canStartFreeTrial ? 'Experimentar' : 'Distribuir',
        footerLabel: canStartFreeTrial
          ? 'Liberação imediata no workspace escolhido'
          : otherWorkspaces.length > 0
            ? 'Instância isolada ou compartilhada'
            : 'Disponível para ativação no workspace',
        route: '/morphus',
        isActiveApp: false,
        isInstalled: false,
        modules: dbModules.length > 0 ? dbModules : this.inferModulesForApp(app.name || 'Morphus'),
        rawApp: app,
      });
    }

    return cards;
  });

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

  protected readonly showcaseModules = signal<ShowcaseModuleItem[]>([
    {
      title: 'Acessos e Permissões',
      description:
        'Gestão granular de usuários, perfis (roles) e permissões (claims) isolados por corporação, filial, espaço de trabalho e aplicação.',
      icon: 'shield-check',
      categoryName: 'Segurança',
      categoryColor: 'violet',
      actionText: 'Experimentar',
      order: 1,
    },
    {
      title: 'Corporações e Filiais',
      description:
        'Estrutura hierárquica com auto-relacionamento entre matriz e múltiplas filiais, permitindo alternar de ambiente em um clique.',
      icon: 'building-2',
      categoryName: 'Corporativo',
      categoryColor: 'indigo',
      actionText: 'Experimentar',
      order: 2,
    },
    {
      title: 'Entrada de Notas Fiscais',
      description:
        'Importação automática de XML e lançamento de notas fiscais de compra com validação de natureza de operação e tributação.',
      icon: 'file-text',
      categoryName: 'Fiscal',
      categoryColor: 'jade',
      actionText: 'Experimentar',
      order: 3,
    },
    {
      title: 'Cadastros Inteligentes',
      description:
        'Produtos, categorias, fornecedores, contas bancárias, contas caixa e naturezas de operação centralizados e padronizados.',
      icon: 'boxes',
      categoryName: 'Core ERP',
      categoryColor: 'amber',
      actionText: 'Experimentar',
      order: 4,
    },
    {
      title: 'Contas a Pagar e Receber',
      description:
        'Controle completo de títulos, vencimentos, baixas parciais ou integrais, juros, multas e previsibilidade financeira.',
      icon: 'wallet',
      categoryName: 'Financeiro',
      categoryColor: 'violet',
      actionText: 'Experimentar',
      order: 5,
    },
    {
      title: 'Conciliação e CNAB',
      description:
        'Integração bancária com processamento de arquivos CNAB de remessa e retorno e conciliação automatizada de extratos.',
      icon: 'landmark',
      categoryName: 'Bancário',
      categoryColor: 'indigo',
      actionText: 'Experimentar',
      order: 6,
    },
    {
      title: 'Fluxo de Caixa em Tempo Real',
      description:
        'Visão consolidada por filial ou grupo econômico das entradas e saídas realizadas e projetadas por centro de custo.',
      icon: 'chart-no-axes-combined',
      categoryName: 'Analytics',
      categoryColor: 'jade',
      actionText: 'Experimentar',
      order: 7,
    },
    {
      title: 'Frotas e Patrimônio',
      description:
        'Controle do imobilizado, veículos da corporação, manutenções e cálculo automatizado de depreciação mensal.',
      icon: 'truck',
      categoryName: 'Ativos',
      categoryColor: 'amber',
      actionText: 'Experimentar',
      order: 8,
    },
  ]);

  protected readonly showcaseFeatures = signal<ShowcaseFeatureItem[]>([
    {
      order: 1,
      highlightPhrase: 'Arquitetura Multi - Corporação',
      title: 'Uma única conta. Múltiplas corporações, filiais e espaços de trabalho.',
      description:
        'O Morphus foi desenhado para grupos empresariais reais. Um mesmo usuário pode atuar em diferentes organizações e filiais mantendo cada base de dados 100% isolada e segura.',
      highlights: [
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'layers',
          highlight: 'Hierarquia ilimitada entre Matriz e Filiais com auto-relacionamento nativo',
          highlightIcon: 'check',
          order: 1,
        },
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'layers',
          highlight: 'Espaços de trabalho e aplicações sob medida para cada departamento',
          highlightIcon: 'check',
          order: 2,
        },
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'layers',
          highlight: 'Menus dinâmicos montados automaticamente conforme o perfil de acesso',
          highlightIcon: 'check',
          order: 3,
        },
      ],
    },
    {
      order: 2,
      highlightPhrase: 'Operação Fiscal & Financeira',
      title: 'Da importação da nota fiscal até a conciliação bancária.',
      description:
        'Elimine retrabalho manual. Ao dar entrada em uma nota fiscal, o Morphus já alimenta o estoque, aplica as regras de tributação e gera as provisões no contas a pagar.',
      highlights: [
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'sparkles',
          highlight: 'Importação automática de notas fiscais e vínculo com natureza de operação',
          highlightIcon: 'check',
          order: 1,
        },
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'sparkles',
          highlight: 'Geração de remessas e leitura de retornos bancários (CNAB)',
          highlightIcon: 'check',
          order: 2,
        },
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'sparkles',
          highlight: 'Motor próprio de disparo de e-mails transacionais com templates HTML',
          highlightIcon: 'check',
          order: 3,
        },
      ],
    },
    {
      order: 3,
      highlightPhrase: 'Flexibilidade de Infraestrutura',
      title: 'Na nuvem compartilhada ou dedicado no seu próprio servidor.',
      description:
        'Comece imediatamente no Morphus Cloud com isolamento total por corporação ou publique toda a stack containerizada na infraestrutura privada da sua empresa.',
      highlights: [
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'server',
          highlight: 'Arquitetura limpa (.NET Clean Architecture + Angular) pronta para containers',
          highlightIcon: 'check',
          order: 1,
        },
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'server',
          highlight: 'Autenticação blindada com JWT, OAuth 2.0 e Login com Google',
          highlightIcon: 'check',
          order: 2,
        },
        {
          title: 'Destaques da arquitetura',
          titleIcon: 'server',
          highlight: 'Alta performance e zero dependência de renderização bloqueante',
          highlightIcon: 'check',
          order: 3,
        },
      ],
    },
  ]);

  protected accentFor(index: number, color?: string | null, icon?: string | null): CardAccent {
    if (color && (color in CARD_ACCENT_MAP)) {
      return CARD_ACCENT_MAP[color as CardColorKey];
    }
    if (icon && icon.includes('#')) {
      const hex = icon.substring(icon.indexOf('#')).toUpperCase();
      if (hex === '#29A383') return CARD_ACCENT_MAP.jade;
      if (hex === '#FFC53D' || hex === '#AD7F58') return CARD_ACCENT_MAP.amber;
      if (hex === '#3E63DD' || hex === '#00A2C7') return CARD_ACCENT_MAP.indigo;
      if (hex === '#6E56CF' || hex === '#AB4ABA' || hex === '#E93D82') return CARD_ACCENT_MAP.violet;
    }
    return CARD_ACCENTS[index % CARD_ACCENTS.length];
  }

  protected getAppCardBadges(app: PortalAppCard, accent: CardAccent): PortalCardBadge[] {
    const badges: PortalCardBadge[] = [];

    if (app.trialBadgeLabel) {
      badges.push({
        label: app.trialBadgeLabel,
        classes: 'bg-primary-a3 text-primary-a11',
        icon: 'sparkles',
        tooltip: [app.statusLabel, app.trialTooltip, app.instanceBadgeLabel]
          .filter(Boolean)
          .join(' · '),
      });
    } else {
      badges.push({
        label: app.statusLabel,
        classes: app.isInstalled ? 'bg-jade-a3 text-jade-a11' : 'bg-amber-a3 text-amber-a11',
        dotClass: app.isInstalled ? 'bg-jade-9' : 'bg-amber-9',
        tooltip: app.instanceBadgeLabel || '',
      });
    }

    if (app.badgeLabel) {
      badges.push({
        label: app.badgeLabel,
        classes: accent.badgeClass,
        tooltip: app.rawApp?.default ? 'Aplicação padrão deste workspace' : '',
      });
    }

    return badges;
  }

  protected getAppCardMetaLabel(app: PortalAppCard): string {
    const parts: string[] = [];
    if (app.rawApp?.default) {
      parts.push('Padrão');
    }
    if (app.instanceBadgeLabel) {
      parts.push(app.instanceBadgeLabel);
    }
    return parts.join(' · ');
  }

  protected getWorkspaceColor(ws: Workspace, index: number): CardColorKey {
    const activeCorpId = this.auth.corporation()?.id || '';
    const overrides = this.cardColorOverrides();
    const raw =
      overrides[`ws:${activeCorpId}:${ws.id}`] ||
      overrides[ws.id || ''] ||
      ws.color ||
      '';
    return this.normalizeColor(raw, ws.name, index + 1);
  }

  protected getWorkspaceCardBadges(ws: Workspace, accent: CardAccent): PortalCardBadge[] {
    const badges: PortalCardBadge[] = [];
    if (this.context.activeWorkspace()?.id === ws.id) {
      badges.push({
        label: 'Ativo',
        classes: 'bg-jade-a3 text-jade-a11',
        dotClass: 'bg-jade-9',
      });
    }
    badges.push({
      label: ws.default ? 'Padrão' : 'Workspace',
      classes: accent.badgeClass,
    });
    return badges;
  }

  protected getWorkspaceOperationalAppLabel(ws: Workspace): string {
    const count = this.context.getOperationalApplicationsForWorkspace(ws).length;
    return `${count} ${count === 1 ? 'aplicação' : 'aplicações'}`;
  }

  protected getCorporationColor(corp: CorporationSummary, index: number): CardColorKey {
    const overrides = this.cardColorOverrides();
    const raw = overrides[`corp:${corp.id}`] || overrides[corp.id] || corp.color || '';
    return this.normalizeColor(raw, corp.name, index);
  }

  protected getCorporationCardBadges(
    corp: CorporationSummary,
    accent: CardAccent,
  ): PortalCardBadge[] {
    const badges: PortalCardBadge[] = [];
    if (this.auth.corporation()?.id === corp.id) {
      badges.push({
        label: 'Selecionada',
        classes: 'bg-jade-a3 text-jade-a11',
        dotClass: 'bg-jade-9',
      });
    }
    badges.push({
      label: corp.parentCorporationId ? 'Filial' : 'Matriz',
      classes: corp.parentCorporationId ? 'bg-neutral-a4 text-neutral-a11' : accent.badgeClass,
    });
    if (corp.isOwner) {
      badges.push({
        label: 'Owner',
        classes: 'bg-amber-a3 text-amber-a11',
        icon: 'crown',
      });
    }
    return badges;
  }

  protected setCardColor(card: PortalAppCard, color: CardColorKey, event?: Event): void {
    event?.stopPropagation();
    const activeCorpId = this.auth.corporation()?.id || '';
    const activeWsId = this.context.activeWorkspace()?.id || '';
    const scopedKey = `app:${activeCorpId}:${activeWsId}:${card.id}`;

    this.cardColorOverrides.update((prev) => ({
      ...prev,
      [scopedKey]: color,
      [`app:${activeCorpId}:${card.id}`]: color,
      [card.id]: color,
    }));

    this.savePortalPreference({
      targetType: 'application',
      targetId: card.id,
      corporationId: activeCorpId || null,
      workspaceId: activeWsId || null,
      color,
    });
  }

  protected setWorkspaceCardColor(ws: Workspace, color: CardColorKey): void {
    if (!ws.id) {
      return;
    }
    const activeCorpId = this.auth.corporation()?.id || '';
    this.cardColorOverrides.update((prev) => ({
      ...prev,
      [`ws:${activeCorpId}:${ws.id}`]: color,
      [ws.id!]: color,
    }));

    this.savePortalPreference({
      targetType: 'workspace',
      targetId: ws.id,
      corporationId: activeCorpId || null,
      workspaceId: ws.id,
      color,
    });
  }

  protected setCorporationCardColor(corp: CorporationSummary, color: CardColorKey): void {
    this.cardColorOverrides.update((prev) => ({
      ...prev,
      [`corp:${corp.id}`]: color,
      [corp.id]: color,
    }));

    this.savePortalPreference({
      targetType: 'corporation',
      targetId: corp.id,
      corporationId: corp.id,
      color,
    });
  }

  protected toggleAppFavorite(card: PortalAppCard): void {
    const activeCorpId = this.auth.corporation()?.id || '';
    const activeWsId = this.context.activeWorkspace()?.id || '';
    const key = `app:${activeCorpId}:${activeWsId}:${card.id}`;
    const nextVal = !this.isStarred(key) && !this.isStarred(card.id);

    this.starredIds.update((prev) => ({
      ...prev,
      [key]: nextVal,
      [card.id]: nextVal,
    }));

    this.savePortalPreference({
      targetType: 'application',
      targetId: card.id,
      corporationId: activeCorpId || null,
      workspaceId: activeWsId || null,
      favorite: nextVal,
    });
  }

  protected toggleWorkspaceFavorite(ws: Workspace): void {
    if (!ws.id) {
      return;
    }
    const activeCorpId = this.auth.corporation()?.id || '';
    const key = `ws:${activeCorpId}:${ws.id}`;
    const nextVal = !this.isStarred(key) && !this.isStarred(ws.id);

    this.starredIds.update((prev) => ({
      ...prev,
      [key]: nextVal,
      [ws.id!]: nextVal,
    }));

    this.savePortalPreference({
      targetType: 'workspace',
      targetId: ws.id,
      corporationId: activeCorpId || null,
      workspaceId: ws.id,
      favorite: nextVal,
    });
  }

  protected toggleCorporationFavorite(corp: CorporationSummary): void {
    const key = `corp:${corp.id}`;
    const nextVal = !this.isStarred(key) && !this.isStarred(corp.id);

    this.starredIds.update((prev) => ({
      ...prev,
      [key]: nextVal,
      [corp.id]: nextVal,
    }));

    this.savePortalPreference({
      targetType: 'corporation',
      targetId: corp.id,
      corporationId: corp.id,
      favorite: nextVal,
    });
  }

  protected isAppFavorite(card: PortalAppCard): boolean {
    const activeCorpId = this.auth.corporation()?.id || '';
    const activeWsId = this.context.activeWorkspace()?.id || '';
    return (
      this.isStarred(`app:${activeCorpId}:${activeWsId}:${card.id}`) ||
      this.isStarred(`app:${activeCorpId}:${card.id}`) ||
      this.isStarred(card.id)
    );
  }

  protected isWorkspaceFavorite(ws: Workspace): boolean {
    const activeCorpId = this.auth.corporation()?.id || '';
    return this.isStarred(`ws:${activeCorpId}:${ws.id}`) || this.isStarred(ws.id);
  }

  protected isCorporationFavorite(corp: CorporationSummary): boolean {
    return this.isStarred(`corp:${corp.id}`) || this.isStarred(corp.id) || Boolean(corp.favorite);
  }

  private savePortalPreference(payload: SavePortalPreferenceRequest): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.http
      .post(`${environment.apiUrl}/security/portal-preferences`, payload)
      .subscribe({ error: () => {} });
  }

  private loadUserPortalPreferences(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.http
      .get<PortalPreferenceItem[]>(`${environment.apiUrl}/security/portal-preferences`)
      .subscribe({
        next: (items) => {
          if (!items?.length) {
            return;
          }
          const nextColors: Record<string, CardColorKey> = { ...this.cardColorOverrides() };
          const nextStars: Record<string, boolean> = { ...this.starredIds() };

          for (const item of items) {
            const cleanColor = (item.color || '').trim().toLowerCase();
            const isValidColor =
              cleanColor === 'violet' ||
              cleanColor === 'indigo' ||
              cleanColor === 'jade' ||
              cleanColor === 'amber';

            if (item.targetType === 'application') {
              const scopedKey = `app:${item.corporationId}:${item.workspaceId || ''}:${item.targetId}`;
              const corpAppKey = `app:${item.corporationId}:${item.targetId}`;
              if (isValidColor) {
                nextColors[scopedKey] = cleanColor as CardColorKey;
                nextColors[corpAppKey] = cleanColor as CardColorKey;
              }
              nextStars[scopedKey] = Boolean(item.favorite);
              nextStars[corpAppKey] = Boolean(item.favorite);
            } else if (item.targetType === 'workspace') {
              const wsKey = `ws:${item.corporationId}:${item.targetId}`;
              if (isValidColor) {
                nextColors[wsKey] = cleanColor as CardColorKey;
              }
              nextStars[wsKey] = Boolean(item.favorite);
            } else if (item.targetType === 'corporation') {
              const corpKey = `corp:${item.targetId}`;
              if (isValidColor) {
                nextColors[corpKey] = cleanColor as CardColorKey;
              }
              nextStars[corpKey] = Boolean(item.favorite);
            }
          }

          this.cardColorOverrides.set(nextColors);
          this.starredIds.set(nextStars);
        },
        error: () => {},
      });
  }

  protected openAppModulesModal(card: PortalAppCard, event?: Event): void {
    event?.stopPropagation();
    this.selectedAppForModules.set(card);
  }

  protected closeAppModulesModal(): void {
    this.selectedAppForModules.set(null);
  }

  protected openOfferProvisionModal(card: PortalAppCard, event?: Event): void {
    event?.stopPropagation();
    this.pendingOfferApp.set(card);

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

    const others = this.context.getWorkspacesWithApplication(card.id, defaultTargetWsId || null);
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

  private inferCategoryLabel(appName?: string | null): string {
    const lower = (appName || '').toLowerCase();
    if (lower.includes('financ')) return 'Finanças';
    if (lower.includes('segur') || lower.includes('security')) return 'Segurança';
    if (lower.includes('kalupa') || lower.includes('automa') || lower.includes('flow')) return 'Automação';
    if (lower.includes('crm') || lower.includes('comerc') || lower.includes('venda')) return 'Comercial';
    if (lower.includes('web') || lower.includes('site') || lower.includes('portal')) return 'Portal';
    return 'Gestão';
  }

  private normalizeColor(rawColor: string | null | undefined, appName?: string | null, index = 0): CardColorKey {
    const clean = (rawColor || '').trim().toLowerCase();
    if (clean === 'violet' || clean === 'indigo' || clean === 'jade' || clean === 'amber') {
      return clean;
    }
    const lower = (appName || '').toLowerCase();
    if (lower.includes('financ')) return 'jade';
    if (lower.includes('segur') || lower.includes('crm')) return 'indigo';
    if (lower.includes('kalupa') || lower.includes('automa')) return 'amber';
    if (lower.includes('web') || lower.includes('site')) return 'jade';
    return CARD_ACCENTS[index % CARD_ACCENTS.length].key;
  }

  private inferModulesForApp(appName: string): PortalModuleItem[] {
    const lower = appName.toLowerCase();
    if (lower.includes('financ')) {
      return [
        {
          name: 'Contas a Pagar',
          description: 'Controle completo de compromissos financeiros, parcelas e aprovações de pagamento.',
          subModules: [
            { name: 'Títulos e Parcelas', description: 'Lançamento e acompanhamento de títulos e vencimentos' },
            { name: 'Aprovação de Pagamentos', description: 'Alçadas e liberação de pagamentos da empresa' },
            { name: 'Baixas, Juros e Multas', description: 'Liquidação parcial ou integral com cálculo automático de encargos' },
          ],
        },
        {
          name: 'Contas a Receber',
          description: 'Gestão de recebíveis, cobranças e previsibilidade de entradas.',
          subModules: [
            { name: 'Faturamento e Cobranças', description: 'Emissão e controle de títulos a receber' },
            { name: 'Recebimentos e Baixas', description: 'Confirmação de entradas e quitação de clientes' },
          ],
        },
        {
          name: 'Entrada de Notas Fiscais',
          description: 'Recebimento automatizado de XML e validação fiscal de compras.',
          subModules: [
            { name: 'Importação de XML', description: 'Leitura automática de notas fiscais eletrônicas' },
            { name: 'Natureza de Operação e Tributos', description: 'Regras fiscais e integração direta com o Contas a Pagar' },
          ],
        },
        {
          name: 'Conciliação Bancária',
          description: 'Integração de contas bancárias, extratos e fluxo de caixa em tempo real.',
          subModules: [
            { name: 'Remessa e Retorno CNAB', description: 'Processamento automatizado de arquivos bancários' },
            { name: 'Fluxo de Caixa', description: 'Visão consolidada do previsto vs. realizado por unidade' },
          ],
        },
      ];
    }

    if (lower.includes('segur') || lower.includes('security')) {
      return [
        {
          name: 'Usuários e Equipe',
          description: 'Gestão das pessoas que atuam nas suas empresas e filiais.',
          subModules: [
            { name: 'Cadastro de Pessoas', description: 'Dados cadastrais e convites da equipe' },
            { name: 'Status do Usuário', description: 'Controle de acesso liberado ou pausado' },
            { name: 'Perfis e Permissões do Usuário', description: 'Vínculo direto de papéis e permissões' },
          ],
        },
        {
          name: 'Perfis de Acesso',
          description: 'Agrupamento inteligente de permissões por função ou departamento.',
          subModules: [
            { name: 'Papéis da Equipe', description: 'Criação de perfis como Financeiro, Fiscal ou Diretoria' },
            { name: 'Permissões do Perfil', description: 'Definição exata de quais módulos e submódulos cada perfil acessa' },
          ],
        },
        {
          name: 'Corporações e Filiais',
          description: 'Estrutura societária e vínculo de pessoas por unidade.',
          subModules: [
            { name: 'Matriz e Filiais', description: 'Cadastro de unidades de negócio' },
            { name: 'Equipe da Corporação', description: 'Quem pode acessar cada empresa' },
          ],
        },
      ];
    }

    if (lower.includes('crm') || lower.includes('comerc')) {
      return [
        {
          name: 'Clientes e Relacionamento',
          description: 'Base unificada de clientes, contatos e histórico comercial.',
          subModules: [
            { name: 'Carteira de Clientes', description: 'Gestão de contas e contatos comerciais' },
            { name: 'Histórico de Atendimentos', description: 'Registro de reuniões, chamadas e acompanhamentos' },
          ],
        },
        {
          name: 'Funil de Vendas',
          description: 'Acompanhamento de oportunidades e propostas comerciais.',
          subModules: [
            { name: 'Oportunidades', description: 'Etapas do funil e previsão de fechamento' },
            { name: 'Propostas e Orçamentos', description: 'Elaboração e envio de propostas comerciais' },
          ],
        },
      ];
    }

    if (lower.includes('kalupa') || lower.includes('automa')) {
      return [
        {
          name: 'Estruturação de Conhecimento',
          description: 'Organização inteligente de documentos e entrega na pasta local.',
          subModules: [
            { name: 'Captura e Formatação IA', description: 'Estruturação automática de conteúdos e resumos' },
            { name: 'Templates Inteligentes', description: 'Modelos personalizados da empresa' },
            { name: 'Sincronização na Pasta Local', description: 'Entrega invisível dos documentos aprovados no computador' },
          ],
        },
      ];
    }

    return [
      {
        name: 'Espaços de Trabalho (Workspaces)',
        description: 'Organização departamental e distribuição de aplicações.',
        subModules: [
          { name: 'Ambientes de Trabalho', description: 'Configuração de workspaces por área' },
          { name: 'Aplicações do Workspace', description: 'Quais produtos ficam disponíveis em cada espaço' },
          { name: 'Pessoas do Workspace', description: 'Equipe vinculada ao ambiente' },
        ],
      },
      {
        name: 'Catálogo de Aplicações e Menus',
        description: 'Governança das aplicações, módulos e navegação da plataforma.',
        subModules: [
          { name: 'Aplicações da Empresa', description: 'Produtos ativos e configurações visuais' },
          { name: 'Módulos e Submódulos', description: 'Estrutura funcional de cada aplicação' },
          { name: 'Menus de Navegação', description: 'Árvore dinâmica de acesso' },
        ],
      },
    ];
  }

  protected setTab(tab: PortalSectionTab): void {
    this.activeTab.set(tab);
  }

  protected toggleMarketingPreview(): void {
    this.showMarketingPreview.update((v) => !v);
    if (this.isBrowser) {
      setTimeout(() => this.initRevealObserver(), 50);
    }
  }

  protected isStarred(id?: string | null): boolean {
    if (!id) {
      return false;
    }
    return !!this.starredIds()[id];
  }

  protected toggleStar(id?: string | null, event?: Event): void {
    event?.stopPropagation();
    if (!id) {
      return;
    }
    this.starredIds.update((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  protected openApplication(card: PortalAppCard): void {
    if (card.rawApp?.id) {
      this.context.selectApplication(card.rawApp);
      return;
    }
    void this.router.navigateByUrl(card.route || '/morphus');
  }

  protected openWorkspace(ws: Workspace): void {
    if (ws.id) {
      this.context.selectWorkspace(ws, false);
      this.selectedWorkspaceFilterId.set(ws.id);
      this.selectedAppFilterId.set('all');
      this.scrollToSection('minhas-apps');
    }
  }

  protected viewWorkspaceApplications(ws: Workspace): void {
    if (ws.id && ws.id !== this.context.activeWorkspace()?.id) {
      this.context.selectWorkspace(ws, false);
    }
    this.selectedAppFilterId.set('all');
    this.scrollToSection('minhas-apps');
  }

  protected viewCorporationWorkspaces(corp: CorporationSummary): void {
    if (corp.inactive) {
      return;
    }
    if (this.auth.corporation()?.id !== corp.id) {
      this.selectCorporation(corp, false, () => {
        this.selectedWorkspaceFilterId.set('all');
        this.scrollToSection('meus-workspaces');
      });
      return;
    }
    this.selectedWorkspaceFilterId.set('all');
    this.scrollToSection('meus-workspaces');
  }

  protected viewCorporationApplications(corp: CorporationSummary): void {
    if (corp.inactive) {
      return;
    }
    if (this.auth.corporation()?.id !== corp.id) {
      this.selectCorporation(corp, false, () => {
        this.selectedAppFilterId.set('all');
        this.scrollToSection('minhas-apps');
      });
      return;
    }
    this.selectedAppFilterId.set('all');
    this.scrollToSection('minhas-apps');
  }

  protected selectCorporation(
    corp: CorporationSummary,
    scrollToApps = true,
    onDone?: () => void,
  ): void {
    if (corp.inactive || this.auth.isLoading() || this.switchingCorpId() !== null) {
      return;
    }
    if (this.auth.corporation()?.id === corp.id) {
      onDone?.();
      if (scrollToApps) {
        this.scrollToSection('minhas-apps');
      }
      return;
    }
    this.switchingCorpId.set(corp.id);
    this.auth.switchCorporation(corp.id).subscribe({
      next: () => {
        this.switchingCorpId.set(null);
        this.loadUserPortalPreferences();
        onDone?.();
        if (scrollToApps) {
          this.scrollToSection('minhas-apps');
        }
      },
      error: () => {
        this.switchingCorpId.set(null);
      },
    });
  }

  private scrollToSection(sectionId: string): void {
    if (!this.isBrowser) {
      return;
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.initRevealObserver();
    this.loadShowcaseFromDatabase();
    this.loadUserPortalPreferences();
  }

  private loadShowcaseFromDatabase(): void {
    this.http
      .get<{
        features?: ShowcaseFeatureItem[];
        modules?: ShowcaseModuleItem[];
      }>(`${environment.apiUrl}/website/showcase`)
      .subscribe({
        next: (res) => {
          if (res?.features && res.features.length > 0) {
            const sortedFeatures = [...res.features]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((f) => ({
                ...f,
                highlights: [...(f.highlights ?? [])].sort(
                  (a, b) => (a.order ?? 0) - (b.order ?? 0),
                ),
              }));
            this.showcaseFeatures.set(sortedFeatures);
          }

          if (res?.modules && res.modules.length > 0) {
            const sortedModules = [...res.modules].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0),
            );
            this.showcaseModules.set(sortedModules);
          }

          if (this.isBrowser) {
            setTimeout(() => this.initRevealObserver(), 30);
          }
        },
        error: () => {
          // Mantém os cards padrão em caso de indisponibilidade temporária da API
        },
      });
  }

  private initRevealObserver(): void {
    this.observer?.disconnect();

    const elements = Array.from(
      this.hostRef.nativeElement.querySelectorAll('[data-reveal]'),
    ) as HTMLElement[];

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el: HTMLElement) => this.revealElement(el));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.revealElement(entry.target as HTMLElement);
            this.observer?.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    elements.forEach((el: HTMLElement) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private revealElement(el: HTMLElement): void {
    el.classList.remove('opacity-0', 'translate-y-8');
    el.classList.add('opacity-100', 'translate-y-0');
  }
}
