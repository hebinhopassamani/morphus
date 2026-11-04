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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';
import { Auth } from '@core/mpx-auth';
import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { CorporationSummary } from '@security/entities/session';

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
  statusName: string;
  statusLabel: string;
  footerLabel: string;
  route: string;
  isActiveApp: boolean;
  isInstalled: boolean;
  modules: PortalModuleItem[];
  rawApp?: MorphusApplication;
};

type FeatureCard = {
  title: string;
  description: string;
  icon: string;
  category: string;
  footerLabel: string;
};

type StoryStep = {
  step: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  highlights: string[];
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
    MatIconButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    MatTooltip,
    RouterLink,
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
  protected readonly showMarketingPreview = signal<boolean>(false);
  protected readonly starredIds = signal<Record<string, boolean>>({});
  protected readonly cardColorOverrides = signal<Record<string, CardColorKey>>({});
  protected readonly selectedAppForModules = signal<PortalAppCard | null>(null);
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

  /**
   * Monta os Cards de Aplicações do Usuário com seus 3 Pais:
   * 1. Categoria (`category.label` -> 2º badge no topo direito: Finanças, Gestão, Segurança, Automação, Comercial, Portal)
   * 2. Status (`applicationStatus.label` -> 1º badge com "Palavra Google": Disponível, Sendo preparada, Experimentando, Aguardando você, Pausada)
   * 3. Módulos e Submódulos (`modules` -> vitrine do produto para o usuário + árvore de Claims para segurança)
   */
  protected readonly portalAppCards = computed<PortalAppCard[]>(() => {
    const activeAppId = this.context.activeApplication()?.id;
    const workspaceApps = this.context.availableApplications();
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
      const footerLabel =
        app.applicationStatus?.description ||
        (statusName === 'Em preparação'
          ? 'Estamos preparando tudo para você'
          : 'Tudo pronto para você usar');
      const rawColor = (colorOverrides[app.id] || app.color || app.category?.color || '') as string;
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

      cards.push({
        id: app.id,
        key: app.key || 'MORPHUS',
        name: app.name || 'Morphus',
        description:
          app.description ||
          'Tudo o que você precisa para cuidar das suas empresas, notas fiscais e contas a pagar.',
        icon: app.icon || 'boxes',
        color,
        badgeLabel: categoryLabel,
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

    const fallbackEcosystemApps: PortalAppCard[] = [
      {
        id: 'eco-morphus-erp',
        key: 'MORPHUS',
        name: 'Morphus',
        description:
          'Aplicação principal de gestão empresarial, governança, workspaces e estrutura corporativa.',
        icon: 'boxes',
        color: colorOverrides['eco-morphus-erp'] || 'violet',
        badgeLabel: 'Gestão',
        statusName: 'Ativa',
        statusLabel: 'Disponível',
        footerLabel: 'Tudo pronto para você usar',
        route: '/morphus',
        isActiveApp: cards.length === 0,
        isInstalled: true,
        modules: this.inferModulesForApp('Morphus'),
      },
      {
        id: 'eco-morphus-security',
        key: 'SECURITY',
        name: 'Segurança',
        description:
          'Convide pessoas da sua equipe e escolha o que cada uma pode ver ou fazer.',
        icon: 'shield',
        color: colorOverrides['eco-morphus-security'] || 'indigo',
        badgeLabel: 'Segurança',
        statusName: 'Ativa',
        statusLabel: 'Disponível',
        footerLabel: 'Tudo pronto para você usar',
        route: '/security',
        isActiveApp: false,
        isInstalled: true,
        modules: this.inferModulesForApp('Segurança'),
      },
      {
        id: 'eco-morphus-finance',
        key: 'FINANCE',
        name: 'Morphus Financeiro',
        description:
          'Contas a pagar e receber, entrada de notas fiscais, conciliação bancária e fluxo de caixa.',
        icon: 'wallet',
        color: colorOverrides['eco-morphus-finance'] || 'jade',
        badgeLabel: 'Finanças',
        statusName: 'Ativa',
        statusLabel: 'Disponível',
        footerLabel: 'Tudo pronto para você usar',
        route: '/morphus',
        isActiveApp: false,
        isInstalled: true,
        modules: this.inferModulesForApp('Morphus Financeiro'),
      },
      {
        id: 'eco-morphus-kalupa',
        key: 'KALUPA',
        name: 'Kalupa Automação',
        description:
          'Organize documentos e tarefas da sua empresa automaticamente em segundo plano.',
        icon: 'workflow',
        color: colorOverrides['eco-morphus-kalupa'] || 'amber',
        badgeLabel: 'Automação',
        statusName: 'Em preparação',
        statusLabel: 'Sendo preparada',
        footerLabel: 'Estamos preparando tudo para você',
        route: '/morphus',
        isActiveApp: false,
        isInstalled: false,
        modules: this.inferModulesForApp('Kalupa Automação'),
      },
    ];

    for (const fallback of fallbackEcosystemApps) {
      if (cards.length >= 4) {
        break;
      }
      const alreadyExists = cards.some(
        (c) => c.name.trim().toUpperCase() === fallback.name.trim().toUpperCase(),
      );
      if (!alreadyExists) {
        cards.push(fallback);
      }
    }

    return cards;
  });

  protected readonly features: FeatureCard[] = [
    {
      title: 'Acessos e Permissões',
      description:
        'Gestão granular de usuários, perfis (roles) e permissões (claims) isolados por corporação, filial, workspace e aplicação.',
      icon: 'shield-check',
      category: 'Segurança',
      footerLabel: 'Multi-Tenant · RBAC & Claims',
    },
    {
      title: 'Corporações e Filiais',
      description:
        'Estrutura hierárquica com auto-relacionamento entre matriz e múltiplas filiais, permitindo alternar de ambiente em um clique.',
      icon: 'building-2',
      category: 'Corporativo',
      footerLabel: 'Matriz & Filiais · Morphus Cloud',
    },
    {
      title: 'Entrada de Notas Fiscais',
      description:
        'Importação automática de XML e lançamento de notas fiscais de compra com validação de natureza de operação e tributação.',
      icon: 'file-text',
      category: 'Fiscal',
      footerLabel: 'Automação XML · Tributação',
    },
    {
      title: 'Cadastros Inteligentes',
      description:
        'Produtos, categorias, fornecedores, contas bancárias, contas caixa e naturezas de operação centralizados e padronizados.',
      icon: 'boxes',
      category: 'Core ERP',
      footerLabel: 'Catálogo Unificado · Cadastros',
    },
    {
      title: 'Contas a Pagar e Receber',
      description:
        'Controle completo de títulos, vencimentos, baixas parciais ou integrais, juros, multas e previsibilidade financeira.',
      icon: 'wallet',
      category: 'Financeiro',
      footerLabel: 'Gestão de Títulos · Tesouraria',
    },
    {
      title: 'Conciliação e CNAB',
      description:
        'Integração bancária com processamento de arquivos CNAB de remessa e retorno e conciliação automatizada de extratos.',
      icon: 'landmark',
      category: 'Bancário',
      footerLabel: 'Remessa & Retorno · CNAB',
    },
    {
      title: 'Fluxo de Caixa em Tempo Real',
      description:
        'Visão consolidada por filial ou grupo econômico das entradas e saídas realizadas e projetadas por centro de custo.',
      icon: 'chart-no-axes-combined',
      category: 'Analytics',
      footerLabel: 'Previsto vs. Realizado · DRE',
    },
    {
      title: 'Frotas e Patrimônio',
      description:
        'Controle do imobilizado, veículos da corporação, manutenções e cálculo automatizado de depreciação mensal.',
      icon: 'truck',
      category: 'Ativos',
      footerLabel: 'Controle de Bens · Depreciação',
    },
  ];

  protected readonly storySteps: StoryStep[] = [
    {
      step: '01',
      badge: 'Arquitetura Multi-Tenant',
      title: 'Uma única conta. Múltiplas corporações, filiais e workspaces.',
      description:
        'O Morphus foi desenhado para grupos empresariais reais. Um mesmo usuário pode atuar em diferentes organizações e filiais mantendo cada base de dados 100% isolada e segura.',
      icon: 'layers',
      highlights: [
        'Hierarquia ilimitada entre Matriz e Filiais com auto-relacionamento nativo',
        'Workspaces e aplicações sob medida para cada departamento',
        'Menus dinâmicos montados automaticamente conforme o perfil de acesso',
      ],
    },
    {
      step: '02',
      badge: 'Operação Fiscal & Financeira',
      title: 'Da importação da nota fiscal até a conciliação bancária.',
      description:
        'Elimine retrabalho manual. Ao dar entrada em uma nota fiscal, o Morphus já alimenta o estoque, aplica as regras de tributação e gera as provisões no contas a pagar.',
      icon: 'sparkles',
      highlights: [
        'Importação automática de notas fiscais e vínculo com natureza de operação',
        'Geração de remessas e leitura de retornos bancários (CNAB)',
        'Motor próprio de disparo de e-mails transacionais com templates HTML',
      ],
    },
    {
      step: '03',
      badge: 'Flexibilidade de Infraestrutura',
      title: 'Na nuvem compartilhada ou dedicado no seu próprio servidor.',
      description:
        'Comece imediatamente no Morphus Cloud com isolamento lógico por tenant ou publique toda a stack containerizada na infraestrutura privada da sua corporação.',
      icon: 'server',
      highlights: [
        'Arquitetura limpa (.NET Clean Architecture + Angular) pronta para containers',
        'Autenticação blindada com JWT, OAuth 2.0 e Login com Google',
        'Alta performance e zero dependência de renderização bloqueante',
      ],
    },
  ];

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

  protected setCardColor(card: PortalAppCard, color: CardColorKey, event?: Event): void {
    event?.stopPropagation();
    this.cardColorOverrides.update((prev) => ({
      ...prev,
      [card.id]: color,
    }));

    if (this.selectedAppForModules()?.id === card.id) {
      this.selectedAppForModules.update((curr) => (curr ? { ...curr, color } : null));
    }

    if (card.rawApp?.id) {
      this.http
        .put(`${environment.apiUrl}/application`, {
          id: card.rawApp.id,
          name: card.rawApp.name,
          icon: card.rawApp.icon,
          description: card.rawApp.description,
          color,
        })
        .subscribe({ error: () => {} });
    }
  }

  protected openAppModulesModal(card: PortalAppCard, event?: Event): void {
    event?.stopPropagation();
    this.selectedAppForModules.set(card);
  }

  protected closeAppModulesModal(): void {
    this.selectedAppForModules.set(null);
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
    if (ws.id && ws.id !== this.context.activeWorkspace()?.id) {
      this.context.selectWorkspace(ws);
      return;
    }
    void this.router.navigateByUrl('/morphus');
  }

  protected selectCorporation(corp: CorporationSummary): void {
    if (this.auth.isLoading() || this.switchingCorpId() !== null) {
      return;
    }
    if (this.auth.corporation()?.id === corp.id) {
      void this.router.navigateByUrl('/morphus');
      return;
    }
    this.switchingCorpId.set(corp.id);
    this.auth.switchCorporation(corp.id).subscribe({
      next: () => {
        this.switchingCorpId.set(null);
      },
      error: () => {
        this.switchingCorpId.set(null);
      },
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.initRevealObserver();
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
