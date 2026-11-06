import { computed, Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { IMorphusEditComponent, MorphusEditComponent } from '@core/mpx-base';
import { formatHtmlPretty, MpxCodeEditorComponent } from '@src/components/morphus/code-editor';
import { MpxIconSelectorComponent } from '@src/components/morphus/icon-selector';
import {
  MorphusApplication,
  MorphusApplicationModuleRef,
  MorphusApplicationSubModuleRef,
  MorphusCategoryRef,
} from '@morphus/entities/application';
import { ApplicationUser } from '@morphus/entities/application-user';
import { ApplicationUserService } from '@morphus/services/application-user.service';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { AppBuilderSanitizerService } from '@app-builder/services';
import { User } from '@security/entities/user';
import { ApplicationValidator } from '../validators/application.validator';

@Component({
  selector: 'mpx-application-edit',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatError,
    MatSelect,
    MatOption,
    MatTabGroup,
    MatTab,
    MatTooltip,
    MpxCodeEditorComponent,
    MpxIconSelectorComponent,
  ],
  styleUrl: './application-edit.component.css',
  templateUrl: './application-edit.component.html',
})
export class ApplicationEditComponent
  extends MorphusEditComponent<MorphusApplication, ApplicationValidator>
  implements IMorphusEditComponent, OnInit, OnDestroy
{
  private readonly applicationService = inject(ApplicationService);
  private readonly applicationUserService = inject(ApplicationUserService);
  private readonly context = inject(MorphusContextService);
  private readonly sanitizer = inject(AppBuilderSanitizerService);

  protected readonly selectedTabIndex = signal<number>(0);
  protected readonly existingApplications = signal<MorphusApplication[]>([]);
  protected readonly categories = signal<MorphusCategoryRef[]>([]);
  protected readonly appModules = signal<MorphusApplicationModuleRef[]>([]);
  protected readonly expandedModuleIds = signal<Set<string>>(new Set());
  protected readonly selectedModuleId = signal<string>('');
  protected readonly newModuleName = signal<string>('');
  protected readonly newModuleIcon = signal<string>('layers');
  protected readonly editingModule = signal<Partial<MorphusApplicationModuleRef> | null>(null);
  protected readonly savingModule = signal<boolean>(false);
  protected readonly inlineEditPage = signal<
    (Partial<MorphusApplicationSubModuleRef> & { moduleId: string }) | null
  >(null);
  protected readonly inlineRouteManuallyEdited = signal<boolean>(false);
  protected readonly selectedPage = signal<Partial<MorphusApplicationSubModuleRef> | null>(null);

  protected readonly inlinePageNameConflict = computed(() => {
    const row = this.inlineEditPage();
    const candidateName = (row?.name ?? '').trim().toLowerCase();
    if (!candidateName) {
      return '';
    }
    for (const mod of this.appModules()) {
      for (const sub of mod.applicationSubModules ?? []) {
        if (sub.id && sub.id === row?.id) {
          continue;
        }
        const existingName = (sub.label || sub.name || '').trim().toLowerCase();
        if (existingName === candidateName) {
          return `Já existe uma página chamada "${sub.label || sub.name}".`;
        }
      }
    }
    return '';
  });

  protected readonly inlinePageRouteConflict = computed(() => {
    const row = this.inlineEditPage();
    const candidateRoute = (row?.routePattern ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!candidateRoute) {
      return '';
    }
    for (const mod of this.appModules()) {
      for (const sub of mod.applicationSubModules ?? []) {
        if (sub.id && sub.id === row?.id) {
          continue;
        }
        const existingRoute = (sub.routePattern ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
        if (existingRoute === candidateRoute) {
          return `A rota "${row?.routePattern}" já está em uso na página "${sub.label || sub.name}".`;
        }
      }
    }
    return '';
  });

  protected readonly canSaveInlinePage = computed(() => {
    const row = this.inlineEditPage();
    if (!row) {
      return false;
    }
    const hasName = !!(row.name ?? '').trim();
    const hasRoute = !!(row.routePattern ?? '').trim();
    return (
      hasName &&
      hasRoute &&
      !this.inlinePageNameConflict() &&
      !this.inlinePageRouteConflict() &&
      !this.savingPage()
    );
  });
  protected readonly menusPanelOpen = signal<boolean>(false);
  protected readonly pageConfigOpen = signal<boolean>(false);
  protected readonly studioViewMode = signal<'code' | 'split' | 'preview'>('code');
  protected readonly htmlUndoStack = signal<string[]>([]);
  protected readonly htmlRedoStack = signal<string[]>([]);
  protected readonly initialPageHtml = signal<string>('');
  protected readonly savingPage = signal<boolean>(false);
  protected readonly prefixManuallyEdited = signal<boolean>(false);

  protected readonly dynamicHeaderTitle = computed(() => {
    if (this.isNew) {
      return this.title1();
    }
    const tabIdx = this.selectedTabIndex();
    const appName = this.entity().name || 'Aplicação';
    if (tabIdx === 2) {
      return 'Monte o menu de sua aplicação';
    }
    if (tabIdx === 3) {
      const pageName = this.selectedPage()?.label || this.selectedPage()?.name || 'Página';
      return `Você está editando a página ${pageName} da aplicação ${appName}`;
    }
    return `Editar Aplicação: ${appName}`;
  });

  protected readonly selectedModule = computed(() => {
    const modId = this.selectedModuleId();
    return this.appModules().find((m) => m.id === modId) ?? this.appModules()[0] ?? null;
  });

  protected readonly selectedModulePages = computed(() => {
    return this.selectedModule()?.applicationSubModules ?? [];
  });

  protected readonly selectedModuleName = computed(() => {
    const mod = this.selectedModule();
    return mod?.label || mod?.name || 'Módulo';
  });

  protected readonly livePreviewHtml = computed<SafeHtml>(() => {
    const raw = this.selectedPage()?.htmlContent || '';
    return this.sanitizer.toTrustedHtml(raw);
  });

  protected readonly layoutOptions = [
    {
      key: 'sidebar-default',
      label: 'Menu Lateral + Topbar (ERP Padrão)',
      description: 'Sidebar retrátil à esquerda com seções de módulos e barra superior.',
    },
    {
      key: 'topbar-modern',
      label: 'Menu Horizontal Superior (Portal / CRM)',
      description: 'Navegação horizontal no topo com área central ampla sem sidebar.',
    },
    {
      key: 'minimal-clean',
      label: 'Minimalista Focado (Clean)',
      description: 'Cabeçalho compacto e foco total no conteúdo da página.',
    },
    {
      key: 'canvas-full',
      label: 'Tela Cheia Livre (Canvas / Kiosk)',
      description: 'Página ocupa 100% da tela com controle flutuante discreto.',
    },
    {
      key: 'custom-html',
      label: 'Layout HTML Criado pelo Usuário',
      description: 'Permite definir seu próprio cabeçalho/container HTML personalizado.',
    },
  ];

  protected readonly usedPrefixes = computed(() => {
    const currentId = this.entity().id;
    return new Set(
      this.existingApplications()
        .filter((a) => a.id !== currentId && !!a.prefix)
        .map((a) => (a.prefix ?? '').trim().toUpperCase()),
    );
  });

  protected readonly prefixCollisionError = computed(() => {
    const currentPrefix = (this.entity().prefix ?? '').trim().toUpperCase();
    if (!currentPrefix) {
      return '';
    }
    if (currentPrefix.length !== 3) {
      return 'A sigla deve conter exatamente 3 caracteres alfanuméricos.';
    }
    if (this.usedPrefixes().has(currentPrefix)) {
      return `A sigla "${currentPrefix}" já está em uso por outra aplicação desta corporação.`;
    }
    return '';
  });

  // Estado N:N de Usuários da Aplicação (Com Multi-Seleção)
  protected readonly usersToRelate = signal<User[]>([]);
  protected readonly relatedUsers = signal<ApplicationUser[]>([]);
  protected readonly searchToRelate = signal<string>('');
  protected readonly searchRelated = signal<string>('');
  protected readonly selectedToRelateIds = signal<Set<string>>(new Set());
  protected readonly selectedRelatedIds = signal<Set<string>>(new Set());

  protected readonly filteredUsersToRelate = computed(() => {
    const term = this.searchToRelate().toLowerCase().trim();
    const relatedSet = new Set(this.relatedUsers().map((r) => r.userId));
    const list = this.usersToRelate().filter((u) => !!u.id && !relatedSet.has(u.id));
    if (!term) {
      return list;
    }
    return list.filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term),
    );
  });

  protected readonly filteredRelatedUsers = computed(() => {
    const term = this.searchRelated().toLowerCase().trim();
    const list = this.relatedUsers();
    if (!term) {
      return list;
    }
    return list.filter(
      (r) =>
        (r.user?.name ?? '').toLowerCase().includes(term) ||
        (r.user?.email ?? '').toLowerCase().includes(term),
    );
  });

  constructor() {
    super(ApplicationValidator);
  }

  ngOnInit(): void {
    this.context.setSidebarForceCollapsed(true);
    this.loadPrimaryKey();
    const tab = this.activatedRoute.snapshot.queryParamMap.get('tab');
    if (tab === 'users') {
      this.selectedTabIndex.set(1);
    } else if (tab === 'pages') {
      this.selectedTabIndex.set(2);
    } else if (tab === 'editor') {
      this.selectedTabIndex.set(3);
    }
    void this.loadEntity();
  }

  ngOnDestroy(): void {
    this.context.setSidebarForceCollapsed(false);
    this.destroySubscriptions();
  }

  override loadPrimaryKey(): void {
    this.addPrimaryKey('id').loadPrimariKey(this.entity);
  }

  async loadEntity(): Promise<void> {
    try {
      const [allApps, cats] = await Promise.all([
        firstValueFrom(this.applicationService.getList()),
        firstValueFrom(this.applicationService.getCategories()),
      ]);
      this.existingApplications.set(allApps ?? []);
      this.categories.set(cats ?? []);
    } catch {
      this.existingApplications.set([]);
    }

    if (this.isNew) {
      this.newEntity();
      const firstCat = this.categories()[0];
      if (firstCat?.id && !this.entity().categoryId) {
        this.updateField('categoryId', firstCat.id);
      }
    } else {
      const currentId = this.entity().id;
      if (currentId) {
        let loaded = await firstValueFrom(this.applicationService.getById(currentId));
        loaded = await this.ensureFinanceiroDefaultMenusRestoredOnceAsync(loaded);
        this.setEntity({
          ...loaded,
          prefix: (loaded.prefix ?? '').toUpperCase(),
          icon: loaded.icon || 'boxes',
          layoutKey: loaded.layoutKey || 'sidebar-default',
        });
        this.syncModulesAndDefaultPage(loaded.applicationModules ?? []);
        this.prefixManuallyEdited.set(true);
        await this.loadApplicationUsers(currentId);
      }
      this.editEntity();
    }
  }

  private async ensureFinanceiroDefaultMenusRestoredOnceAsync(
    loaded: MorphusApplication,
  ): Promise<MorphusApplication> {
    const isFinanceiro =
      (loaded.prefix ?? '').toUpperCase() === 'FIN' ||
      (loaded.name ?? '').toLowerCase().includes('financeiro');
    if (!isFinanceiro || !loaded.id) {
      return loaded;
    }
    const restoreKey = 'morphus_fin_menus_restored_v1';
    if (typeof localStorage !== 'undefined' && localStorage.getItem(restoreKey) === 'true') {
      return loaded;
    }

    const expectedStructure: {
      name: string;
      label: string;
      icon: string;
      order: number;
      description: string;
      pages: {
        name: string;
        label: string;
        icon: string;
        routePattern: string;
        default: boolean;
        order: number;
        description: string;
      }[];
    }[] = [
      {
        name: 'Visão Geral',
        label: 'Visão Geral',
        icon: 'chart-no-axes-combined',
        order: 0,
        description: 'Painel inicial do Morphus Financeiro',
        pages: [
          {
            name: 'Dashboard',
            label: 'Dashboard',
            icon: 'chart-no-axes-combined',
            routePattern: 'dashboard',
            default: true,
            order: 1,
            description: 'Visão geral financeira',
          },
        ],
      },
      {
        name: 'Contas a Pagar',
        label: 'Contas a Pagar',
        icon: 'wallet',
        order: 1,
        description: 'Controle completo de compromissos financeiros, parcelas e aprovações de pagamento',
        pages: [
          {
            name: 'Títulos e Parcelas',
            label: 'Títulos e Parcelas',
            icon: 'receipt-text',
            routePattern: 'titulos-e-parcelas',
            default: false,
            order: 1,
            description: 'Lançamento e acompanhamento de títulos e vencimentos',
          },
          {
            name: 'Aprovação de Pagamentos',
            label: 'Aprovação de Pagamentos',
            icon: 'circle-check',
            routePattern: 'aprovacao-de-pagamentos',
            default: false,
            order: 2,
            description: 'Alçadas e liberação de pagamentos da empresa',
          },
          {
            name: 'Baixas, Juros e Multas',
            label: 'Baixas, Juros e Multas',
            icon: 'wallet',
            routePattern: 'baixas-juros-e-multas',
            default: false,
            order: 3,
            description: 'Liquidação parcial ou integral com cálculo automático de encargos',
          },
        ],
      },
      {
        name: 'Contas a Receber',
        label: 'Contas a Receber',
        icon: 'landmark',
        order: 2,
        description: 'Gestão de recebíveis, cobranças e previsibilidade de entradas',
        pages: [
          {
            name: 'Faturamento e Cobranças',
            label: 'Faturamento e Cobranças',
            icon: 'file-text',
            routePattern: 'faturamento-e-cobrancas',
            default: false,
            order: 1,
            description: 'Emissão e controle de títulos a receber',
          },
          {
            name: 'Recebimentos e Baixas',
            label: 'Recebimentos e Baixas',
            icon: 'landmark',
            routePattern: 'recebimentos-e-baixas',
            default: false,
            order: 2,
            description: 'Confirmação de entradas e quitação de clientes',
          },
        ],
      },
      {
        name: 'Entrada de Notas Fiscais',
        label: 'Entrada de Notas',
        icon: 'file-text',
        order: 3,
        description: 'Recebimento automatizado de XML e validação fiscal de compras',
        pages: [
          {
            name: 'Importação de XML',
            label: 'Importação de XML',
            icon: 'upload',
            routePattern: 'importacao-de-xml',
            default: false,
            order: 1,
            description: 'Leitura automática de notas fiscais eletrônicas',
          },
          {
            name: 'Natureza de Operação e Tributos',
            label: 'Natureza e Tributos',
            icon: 'shield-check',
            routePattern: 'natureza-e-tributos',
            default: false,
            order: 2,
            description: 'Regras fiscais e integração direta com o Contas a Pagar',
          },
        ],
      },
      {
        name: 'Conciliação Bancária',
        label: 'Conciliação Bancária',
        icon: 'chart-no-axes-combined',
        order: 4,
        description: 'Integração de contas bancárias, extratos e fluxo de caixa em tempo real',
        pages: [
          {
            name: 'Remessa e Retorno CNAB',
            label: 'Remessa e Retorno CNAB',
            icon: 'repeat',
            routePattern: 'remessa-e-retorno-cnab',
            default: false,
            order: 1,
            description: 'Processamento automatizado de arquivos bancários',
          },
          {
            name: 'Fluxo de Caixa',
            label: 'Fluxo de Caixa',
            icon: 'chart-no-axes-combined',
            routePattern: 'fluxo-de-caixa',
            default: false,
            order: 2,
            description: 'Visão consolidada do previsto vs. realizado por unidade',
          },
        ],
      },
    ];

    let changed = false;
    const existingMods = loaded.applicationModules ?? [];

    for (const spec of expectedStructure) {
      let mod = existingMods.find(
        (m) =>
          (m.label || m.name || '').toLowerCase() === spec.label.toLowerCase() ||
          (m.name || '').toLowerCase() === spec.name.toLowerCase(),
      );
      if (!mod) {
        mod = await firstValueFrom(
          this.applicationService.saveModule(loaded.id, {
            name: spec.name,
            label: spec.label,
            icon: spec.icon,
            order: spec.order,
            description: spec.description,
          }),
        );
        changed = true;
      }

      const existingPages = mod.applicationSubModules ?? [];
      for (const pageSpec of spec.pages) {
        const hasPage = existingPages.some(
          (p) =>
            (p.label || p.name || '').toLowerCase() === pageSpec.label.toLowerCase() ||
            (p.routePattern || '').toLowerCase() === pageSpec.routePattern.toLowerCase(),
        );
        if (!hasPage && mod.id) {
          await firstValueFrom(
            this.applicationService.savePage(mod.id, {
              name: pageSpec.name,
              label: pageSpec.label,
              icon: pageSpec.icon,
              routePattern: pageSpec.routePattern,
              default: pageSpec.default,
              order: pageSpec.order,
              description: pageSpec.description,
              htmlContent: '',
            }),
          );
          changed = true;
        }
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(restoreKey, 'true');
    }

    if (changed) {
      this.context.loadWorkspaces();
      await new Promise((r) => setTimeout(r, 350));
      return await firstValueFrom(this.applicationService.getById(loaded.id));
    }

    return loaded;
  }

  onNameChange(name: string): void {
    this.updateField('name', name);
    if (this.isNew && !this.prefixManuallyEdited()) {
      const autoPrefix = this.generateUniquePrefix(name);
      this.updateField('prefix', autoPrefix);
    }
  }

  onPrefixChange(rawPrefix: string): void {
    const normalized = this.normalizeAlphanumeric(rawPrefix).slice(0, 3);
    this.prefixManuallyEdited.set(normalized.length > 0);
    this.updateField('prefix', normalized);
  }

  private generateUniquePrefix(name: string): string {
    const clean = this.normalizeAlphanumeric(name);
    if (!clean) {
      return '';
    }
    const padded = clean.padEnd(3, 'X');
    const used = this.usedPrefixes();
    const candidates: string[] = [padded.slice(0, 3)];

    const words = (name ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .split(/[\s\-_]+/)
      .map((w) => w.replace(/[^A-Z0-9]/g, ''))
      .filter((w) => w.length > 0);

    if (words.length >= 3) {
      candidates.push(`${words[0][0]}${words[1][0]}${words[2][0]}`);
    }
    if (words.length >= 2 && words[1].length >= 2) {
      candidates.push(`${words[0][0]}${words[1][0]}${words[1][1]}`);
    }
    if (words.length >= 2 && words[0].length >= 2) {
      candidates.push(`${words[0][0]}${words[0][1]}${words[1][0]}`);
    }

    const consonants = clean.replace(/[AEIOU]/g, '');
    if (consonants.length >= 3) {
      candidates.push(consonants.slice(0, 3));
    }

    for (let i = 2; i < clean.length; i++) {
      candidates.push(`${clean[0]}${clean[1]}${clean[i]}`);
    }

    const prefix2 = padded.slice(0, 2);
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
      candidates.push(`${prefix2}${ch}`);
    }

    for (const candidate of candidates) {
      if (candidate.length === 3 && !used.has(candidate)) {
        return candidate;
      }
    }

    return padded.slice(0, 3);
  }

  private normalizeAlphanumeric(value: string): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  async loadApplicationUsers(applicationId?: string): Promise<void> {
    const appId = applicationId ?? this.entity().id;
    if (!appId) {
      return;
    }
    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.applicationUserService.getEntitiesToRelate({ applicationId: appId })),
      firstValueFrom(this.applicationUserService.getRelatedEntities({ applicationId: appId })),
    ]);
    const relatedIds = new Set((related ?? []).map((r) => r.userId));
    this.usersToRelate.set((toRelate ?? []).filter((u) => !!u.id && !relatedIds.has(u.id)));
    this.relatedUsers.set(related ?? []);
    this.selectedToRelateIds.set(new Set());
    this.selectedRelatedIds.set(new Set());
  }

  canRemoveUser(rel: ApplicationUser): boolean {
    return !rel.system && !rel.isOwner;
  }

  isToRelateSelected(userId?: string): boolean {
    return !!userId && this.selectedToRelateIds().has(userId);
  }

  toggleToRelate(userId?: string): void {
    if (!userId) {
      return;
    }
    this.selectedToRelateIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  areAllToRelateSelected(): boolean {
    const visible = this.filteredUsersToRelate();
    return visible.length > 0 && visible.every((u) => !!u.id && this.selectedToRelateIds().has(u.id));
  }

  toggleSelectAllToRelate(): void {
    const visible = this.filteredUsersToRelate();
    const allSelected = this.areAllToRelateSelected();
    this.selectedToRelateIds.update((curr) => {
      const next = new Set(curr);
      for (const u of visible) {
        if (!u.id) {
          continue;
        }
        if (allSelected) {
          next.delete(u.id);
        } else {
          next.add(u.id);
        }
      }
      return next;
    });
  }

  isRelatedSelected(userId?: string): boolean {
    return !!userId && this.selectedRelatedIds().has(userId);
  }

  toggleRelated(rel: ApplicationUser): void {
    if (!this.canRemoveUser(rel) || !rel.userId) {
      return;
    }
    this.selectedRelatedIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(rel.userId)) {
        next.delete(rel.userId);
      } else {
        next.add(rel.userId);
      }
      return next;
    });
  }

  areAllRelatedSelected(): boolean {
    const removable = this.filteredRelatedUsers().filter((r) => this.canRemoveUser(r));
    return removable.length > 0 && removable.every((r) => this.selectedRelatedIds().has(r.userId));
  }

  toggleSelectAllRelated(): void {
    const removable = this.filteredRelatedUsers().filter((r) => this.canRemoveUser(r));
    const allSelected = this.areAllRelatedSelected();
    this.selectedRelatedIds.update((curr) => {
      const next = new Set(curr);
      for (const r of removable) {
        if (allSelected) {
          next.delete(r.userId);
        } else {
          next.add(r.userId);
        }
      }
      return next;
    });
  }

  async addSingleUser(user: User): Promise<void> {
    const applicationId = this.entity().id;
    if (!applicationId || !user.id) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.addRelationship({
        applicationId,
        userId: user.id,
        isOwner: false,
      }),
    );
    await this.loadApplicationUsers(applicationId);
  }

  async addSelectedUsers(): Promise<void> {
    const applicationId = this.entity().id;
    const ids = Array.from(this.selectedToRelateIds());
    if (!applicationId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.addRelationships(
        ids.map((userId) => ({ applicationId, userId, isOwner: false })),
      ),
    );
    await this.loadApplicationUsers(applicationId);
  }

  async removeSingleUser(rel: ApplicationUser): Promise<void> {
    if (!this.canRemoveUser(rel)) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.removeRelationship({
        applicationId: rel.applicationId,
        userId: rel.userId,
      }),
    );
    await this.loadApplicationUsers(rel.applicationId);
  }

  async removeSelectedUsers(): Promise<void> {
    const applicationId = this.entity().id;
    const ids = Array.from(this.selectedRelatedIds());
    if (!applicationId || !ids.length) {
      return;
    }
    await firstValueFrom(
      this.applicationUserService.removeRelationships(
        ids.map((userId) => ({ applicationId, userId })),
      ),
    );
    await this.loadApplicationUsers(applicationId);
  }

  async toggleUserActive(rel: ApplicationUser): Promise<void> {
    if (rel.inactive) {
      await firstValueFrom(
        this.applicationUserService.activate({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.applicationUserService.deactivate({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadApplicationUsers(rel.applicationId);
  }

  async toggleUserOwner(rel: ApplicationUser): Promise<void> {
    if (rel.isOwner) {
      await firstValueFrom(
        this.applicationUserService.removeOwner({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    } else {
      await firstValueFrom(
        this.applicationUserService.setOwner({
          applicationId: rel.applicationId,
          userId: rel.userId,
        }),
      );
    }
    await this.loadApplicationUsers(rel.applicationId);
  }

  newEntity(): void {
    this.title1.set('Nova Aplicação');
    this.title2.set('Cadastre uma nova aplicação na corporação.');
    this.prefixManuallyEdited.set(false);
    this.setEntity({
      name: '',
      prefix: '',
      key: this.generateKey(),
      icon: 'boxes',
      layoutKey: 'sidebar-default',
      customLayoutHtml: '',
      description: '',
    });
  }

  editEntity(): void {
    this.title1.set(`Editar Aplicação: ${this.entity().name ?? ''}`);
    this.title2.set('Atualize os dados da aplicação ou gerencie seus usuários autorizados.');
  }

  async submitForm(): Promise<void> {
    if (this.isNew) {
      await this.create();
    } else {
      await this.update();
    }
  }

  async create(): Promise<void> {
    const created = await firstValueFrom(
      this.applicationService.create(this.entity() as MorphusApplication),
    );
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `A aplicação "${created.name}" foi criada! Agora estruture suas páginas e HTML.`,
    );
    if (created.id) {
      void this.router.navigate(['/morphus/application', created.id], {
        queryParams: { tab: 'pages' },
      });
      return;
    }
    this.back();
  }

  private syncModulesAndDefaultPage(modules: MorphusApplicationModuleRef[]): void {
    const sorted = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.appModules.set(sorted);
    // Garante que todos os menus apareçam expandidos por padrão na tabela
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      for (const m of sorted) {
        if (m.id) {
          next.add(m.id);
        }
      }
      return next;
    });

    const currentPageId = this.selectedPage()?.id;
    const allSubs: { modId: string; sub: MorphusApplicationSubModuleRef }[] = [];
    for (const mod of sorted) {
      for (const sub of mod.applicationSubModules ?? []) {
        allSubs.push({ modId: mod.id, sub });
      }
    }

    const match =
      (currentPageId && allSubs.find((x) => x.sub.id === currentPageId)) ||
      allSubs.find((x) => x.sub.default) ||
      allSubs[0];

    if (match) {
      const prettyHtml = formatHtmlPretty(match.sub.htmlContent || '');
      this.selectedModuleId.set(match.modId);
      this.selectedPage.set({
        ...match.sub,
        name: match.sub.label || match.sub.name,
        icon: match.sub.icon || 'file-text',
        htmlContent: prettyHtml,
      });
      this.htmlUndoStack.set([]);
      this.htmlRedoStack.set([]);
      this.initialPageHtml.set(prettyHtml);
    } else if (sorted[0]?.id) {
      this.selectedModuleId.set(sorted[0].id);
      this.selectedPage.set(null);
      this.htmlUndoStack.set([]);
      this.htmlRedoStack.set([]);
      this.initialPageHtml.set('');
    }
  }

  protected isModuleExpanded(modId: string): boolean {
    return this.expandedModuleIds().has(modId);
  }

  protected toggleModuleExpand(modId: string): void {
    this.expandedModuleIds.update((curr) => {
      const next = new Set(curr);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
      }
      return next;
    });
  }

  protected selectModuleForEdit(mod: MorphusApplicationModuleRef): void {
    this.inlineEditPage.set(null);
    this.selectedModuleId.set(mod.id);
    this.editingModule.set({
      ...mod,
      name: mod.label || mod.name,
      icon: mod.icon || 'layers',
    });
  }

  protected cancelModuleEdit(): void {
    this.editingModule.set(null);
  }

  protected startInlinePageEdit(modId: string, sub: MorphusApplicationSubModuleRef): void {
    this.editingModule.set(null);
    this.inlineRouteManuallyEdited.set(true);
    this.expandedModuleIds.update((s) => new Set(s).add(modId));
    this.inlineEditPage.set({
      ...sub,
      moduleId: modId,
      name: sub.label || sub.name,
      icon: sub.icon || 'file-text',
    });
  }

  protected startInlineNewPage(modId: string): void {
    this.editingModule.set(null);
    this.inlineRouteManuallyEdited.set(false);
    this.expandedModuleIds.update((s) => new Set(s).add(modId));
    const defaultHtml =
      '<div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-8 shadow-sm">\n  <h1 class="text-2xl font-bold text-neutral-12">Título da Página</h1>\n  <p class="mt-2 text-sm text-neutral-a11">Conteúdo HTML carregado diretamente do banco de dados.</p>\n</div>';
    this.inlineEditPage.set({
      id: '',
      moduleId: modId,
      name: '',
      label: '',
      icon: 'file-text',
      routePattern: '',
      default: false,
      description: 'Página da aplicação carregada do banco de dados',
      htmlContent: defaultHtml,
    });
  }

  protected cancelInlinePageEdit(): void {
    this.inlineEditPage.set(null);
    this.inlineRouteManuallyEdited.set(false);
  }

  protected updateInlinePageField(field: 'name' | 'routePattern' | 'icon', value: string): void {
    if (field === 'routePattern') {
      this.inlineRouteManuallyEdited.set(value.trim().length > 0);
    }
    this.inlineEditPage.update((curr) => {
      if (!curr) {
        return curr;
      }
      const next = { ...curr, [field]: value };
      if (field === 'name') {
        next.label = value;
        if (!this.inlineRouteManuallyEdited()) {
          const slug = (value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9/:_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          next.routePattern = slug;
        }
      }
      return next;
    });
  }

  protected async saveInlinePageRow(): Promise<void> {
    const appId = this.entity().id;
    const row = this.inlineEditPage();
    if (!appId || !row || !row.moduleId || !this.canSaveInlinePage()) {
      return;
    }
    this.savingPage.set(true);
    try {
      const saved = await firstValueFrom(
        this.applicationService.savePage(row.moduleId, {
          ...row,
          label: row.name,
        }),
      );
      this.inlineEditPage.set(null);
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
      this.selectPageForEdit(row.moduleId, saved);
      this.context.loadWorkspaces();
      this.messageService.showSuccess(`Página "${saved.label || saved.name}" salva com sucesso!`);
    } finally {
      this.savingPage.set(false);
    }
  }

  protected openPageInHtmlEditor(modId: string, sub: MorphusApplicationSubModuleRef): void {
    this.selectPageForEdit(modId, sub);
    this.selectedTabIndex.set(3);
  }

  protected updateEditingModuleField<K extends keyof MorphusApplicationModuleRef>(
    field: K,
    value: MorphusApplicationModuleRef[K],
  ): void {
    this.editingModule.update((curr) => {
      if (!curr) {
        return curr;
      }
      const next = { ...curr, [field]: value };
      if (field === 'name') {
        next.label = String(value || '');
      }
      return next;
    });
  }

  protected async saveCurrentModule(): Promise<void> {
    const appId = this.entity().id;
    const mod = this.editingModule();
    if (!appId || !mod?.name?.trim()) {
      return;
    }
    this.savingModule.set(true);
    try {
      const saved = await firstValueFrom(
        this.applicationService.saveModule(appId, {
          ...mod,
          label: mod.name,
        }),
      );
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.appModules.set(
        [...(reloaded.applicationModules ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      this.editingModule.set(null);
      this.context.loadWorkspaces();
      this.messageService.showSuccess(`Menu "${saved.label || saved.name}" salvo com sucesso!`);
    } finally {
      this.savingModule.set(false);
    }
  }

  protected removeModule(mod: MorphusApplicationModuleRef): void {
    const appId = this.entity().id;
    if (!appId || !mod?.id) {
      return;
    }
    const menuName = mod.label || mod.name || 'Menu';
    this.messageService.confirmDelete(
      `o menu "${menuName}" e todas as suas páginas`,
      async () => {
        await firstValueFrom(this.applicationService.deleteModule(mod.id));
        this.editingModule.set(null);
        const reloaded = await firstValueFrom(this.applicationService.getById(appId));
        this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
        this.context.loadWorkspaces();
        setTimeout(() => {
          this.messageService.showSuccess(`O menu "${menuName}" foi excluído com sucesso!`);
        }, 150);
      },
    );
  }

  protected selectModuleFromTopBar(modId: string): void {
    this.editingModule.set(null);
    this.selectedModuleId.set(modId);
    const mod = this.appModules().find((m) => m.id === modId);
    const firstSub = mod?.applicationSubModules?.[0];
    if (firstSub) {
      this.selectPageForEdit(modId, firstSub);
    } else {
      this.selectedPage.set(null);
    }
  }

  protected selectPageForEdit(modId: string, page: MorphusApplicationSubModuleRef): void {
    const prettyHtml = formatHtmlPretty(page.htmlContent || '');
    this.editingModule.set(null);
    this.menusPanelOpen.set(false);
    this.pageConfigOpen.set(false);
    this.selectedModuleId.set(modId);
    this.selectedPage.set({
      ...page,
      name: page.label || page.name,
      icon: page.icon || 'file-text',
      htmlContent: prettyHtml,
    });
    this.htmlUndoStack.set([]);
    this.htmlRedoStack.set([]);
    this.initialPageHtml.set(prettyHtml);
  }

  protected onSelectPageById(pageId: string): void {
    for (const mod of this.appModules()) {
      const found = (mod.applicationSubModules ?? []).find((s) => s.id === pageId);
      if (found) {
        this.selectPageForEdit(mod.id, found);
        return;
      }
    }
  }

  protected formatCurrentPageHtml(): void {
    const currPage = this.selectedPage();
    if (!currPage) {
      return;
    }
    const raw = currPage.htmlContent || '';
    const pretty = formatHtmlPretty(raw);
    if (pretty && pretty !== raw) {
      this.pushHtmlHistory(raw);
      this.selectedPage.set({
        ...currPage,
        htmlContent: pretty,
      });
    }
  }

  protected startNewPage(modId: string): void {
    this.editingModule.set(null);
    this.menusPanelOpen.set(false);
    this.pageConfigOpen.set(true);
    this.selectedModuleId.set(modId);
    const defaultHtml =
      '<div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-8 shadow-sm">\n  <h1 class="text-2xl font-bold text-neutral-12">Nova Página</h1>\n  <p class="mt-2 text-sm text-neutral-a11">Conteúdo HTML carregado diretamente do banco de dados.</p>\n</div>';
    this.selectedPage.set({
      id: '',
      name: 'Nova Página',
      label: 'Nova Página',
      icon: 'file-text',
      routePattern: 'nova-pagina',
      default: false,
      description: 'Página da aplicação carregada do banco de dados',
      htmlContent: defaultHtml,
    });
    this.htmlUndoStack.set([]);
    this.htmlRedoStack.set([]);
    this.initialPageHtml.set(defaultHtml);
  }

  private pushHtmlHistory(previousHtml: string): void {
    this.htmlUndoStack.update((stack) => {
      if (stack.length > 0 && stack[stack.length - 1] === previousHtml) {
        return stack;
      }
      return [...stack.slice(-99), previousHtml];
    });
    this.htmlRedoStack.set([]);
  }

  protected undoHtml(): void {
    const stack = this.htmlUndoStack();
    const currPage = this.selectedPage();
    if (!currPage || stack.length === 0) {
      return;
    }
    const previous = stack[stack.length - 1];
    const currentHtml = currPage.htmlContent || '';
    this.htmlUndoStack.set(stack.slice(0, -1));
    this.htmlRedoStack.update((redo) => [...redo, currentHtml]);
    this.selectedPage.set({
      ...currPage,
      htmlContent: previous,
    });
  }

  protected redoHtml(): void {
    const redo = this.htmlRedoStack();
    const currPage = this.selectedPage();
    if (!currPage || redo.length === 0) {
      return;
    }
    const nextHtml = redo[redo.length - 1];
    const currentHtml = currPage.htmlContent || '';
    this.htmlRedoStack.set(redo.slice(0, -1));
    this.htmlUndoStack.update((stack) => [...stack, currentHtml]);
    this.selectedPage.set({
      ...currPage,
      htmlContent: nextHtml,
    });
  }

  protected resetPageHtmlToSaved(): void {
    const currPage = this.selectedPage();
    const initial = this.initialPageHtml();
    if (!currPage || (currPage.htmlContent || '') === initial) {
      return;
    }
    this.pushHtmlHistory(currPage.htmlContent || '');
    this.selectedPage.set({
      ...currPage,
      htmlContent: initial,
    });
  }

  @HostListener('window:keydown', ['$event'])
  protected onGlobalKeydown(event: KeyboardEvent): void {
    if (this.selectedTabIndex() !== 3 || !this.selectedPage()) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target && target.tagName === 'INPUT') {
      return;
    }
    this.onHtmlEditorKeydown(event);
  }

  protected onHtmlEditorKeydown(event: KeyboardEvent): void {
    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
    if (!isCtrlOrMeta) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'z') {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        this.redoHtml();
      } else {
        this.undoHtml();
      }
    } else if (key === 'y') {
      event.preventDefault();
      event.stopPropagation();
      this.redoHtml();
    }
  }

  protected updateSelectedPageField<K extends keyof MorphusApplicationSubModuleRef>(
    field: K,
    value: MorphusApplicationSubModuleRef[K],
  ): void {
    this.selectedPage.update((curr) => {
      if (!curr) {
        return curr;
      }
      if (field === 'htmlContent' && String(value ?? '') !== (curr.htmlContent ?? '')) {
        this.pushHtmlHistory(curr.htmlContent || '');
      }
      const next = { ...curr, [field]: value };
      if (field === 'name') {
        next.label = String(value || '');
        if (!curr.id || !curr.routePattern || curr.routePattern === 'nova-pagina') {
          const slug = String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9/:_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          if (slug) {
            next.routePattern = slug;
          }
        }
      }
      return next;
    });
  }

  protected insertHtmlBlock(blockType: 'hero' | 'kpi' | 'table' | 'form'): void {
    const blocks: Record<'hero' | 'kpi' | 'table' | 'form', string> = {
      hero: `\n<div class="rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm">\n  <div class="inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Módulo Ativo</div>\n  <h1 class="mt-3 text-2xl font-bold text-neutral-12">Título Principal da Página</h1>\n  <p class="mt-1 text-sm text-neutral-a11">Subtítulo explicativo desta área da aplicação.</p>\n</div>\n`,
      kpi: `\n<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">\n  <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Indicador 1</span>\n    <div class="mt-2 text-2xl font-bold text-neutral-12">R$ 128.450,00</div>\n  </div>\n  <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Indicador 2</span>\n    <div class="mt-2 text-2xl font-bold text-jade-a11">42 concluídos</div>\n  </div>\n  <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Indicador 3</span>\n    <div class="mt-2 text-2xl font-bold text-amber-a11">5 pendentes</div>\n  </div>\n</div>\n`,
      table: `\n<div class="mt-6 overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">\n  <table class="w-full text-left text-sm">\n    <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">\n      <tr>\n        <th class="px-4 py-3">Código</th>\n        <th class="px-4 py-3">Descrição</th>\n        <th class="px-4 py-3">Status</th>\n      </tr>\n    </thead>\n    <tbody class="divide-y divide-neutral-a3">\n      <tr>\n        <td class="px-4 py-3 font-mono text-xs">#001</td>\n        <td class="px-4 py-3 font-medium text-neutral-12">Registro Exemplo</td>\n        <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Ativo</span></td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n`,
      form: `\n<form class="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6">\n  <h3 class="text-lg font-bold text-neutral-12">Novo Registro</h3>\n  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">\n    <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Título\n      <input type="text" placeholder="Digite aqui..." class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n    <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Valor\n      <input type="text" placeholder="R$ 0,00" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n  </div>\n  <div class="flex justify-end">\n    <button type="button" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Salvar</button>\n  </div>\n</form>\n`,
    };

    this.selectedPage.update((curr) => {
      if (!curr) {
        return curr;
      }
      const prevHtml = curr.htmlContent || '';
      this.pushHtmlHistory(prevHtml);
      const base = prevHtml.trimEnd();
      const blockClean = blocks[blockType].trim();
      return {
        ...curr,
        htmlContent: base ? `${base}\n\n${blockClean}\n` : `${blockClean}\n`,
      };
    });
  }

  protected async createModule(): Promise<void> {
    const appId = this.entity().id;
    const name = this.newModuleName().trim();
    if (!appId || !name) {
      return;
    }
    await firstValueFrom(
      this.applicationService.saveModule(appId, {
        name,
        label: name,
        icon: this.newModuleIcon() || 'layers',
      }),
    );
    this.newModuleName.set('');
    this.newModuleIcon.set('layers');
    const reloaded = await firstValueFrom(this.applicationService.getById(appId));
    this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
    this.context.loadWorkspaces();
    this.messageService.showSuccess(`Menu "${name}" adicionado!`);
  }

  protected async saveCurrentPage(): Promise<void> {
    const appId = this.entity().id;
    const modId = this.selectedModuleId();
    const page = this.selectedPage();
    if (!appId || !modId || !page?.name?.trim()) {
      return;
    }
    this.savingPage.set(true);
    try {
      const saved = await firstValueFrom(this.applicationService.savePage(modId, page));
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
      this.selectedPage.set({ ...saved });
      this.context.loadWorkspaces();
      this.messageService.showSuccess(`Página "${saved.label || saved.name}" salva no banco!`);
    } finally {
      this.savingPage.set(false);
    }
  }

  protected removePage(sub: MorphusApplicationSubModuleRef): void {
    const appId = this.entity().id;
    if (!appId || !sub?.id) {
      return;
    }
    const pageName = sub.label || sub.name || 'Página';
    this.messageService.confirmDelete(
      `a página "${pageName}"`,
      async () => {
        await firstValueFrom(this.applicationService.deletePage(sub.id));
        const reloaded = await firstValueFrom(this.applicationService.getById(appId));
        this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
        this.context.loadWorkspaces();
        setTimeout(() => {
          this.messageService.showSuccess(`A página "${pageName}" foi excluída com sucesso!`);
        }, 150);
      },
    );
  }

  protected openLivePage(): void {
    const appKey = this.entity().key || this.entity().prefix;
    const slug = this.selectedPage()?.routePattern || 'dashboard';
    if (!appKey) {
      return;
    }
    void this.router.navigateByUrl(`/app/${appKey}/${slug}`);
  }

  protected applyDefaultCustomLayoutHtml(): void {
    this.updateField(
      'customLayoutHtml',
      `<div class="bg-gradient-to-r from-violet-9 to-indigo-9 px-6 py-4 text-white shadow-sm">\n  <div class="mx-auto flex max-w-7xl items-center justify-between">\n    <div>\n      <span class="text-xs font-semibold uppercase tracking-wider opacity-80">Layout Personalizado</span>\n      <h2 class="text-lg font-bold">${this.entity().name || 'Minha Aplicação'}</h2>\n    </div>\n    <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">Ambiente Corporativo</span>\n  </div>\n</div>`,
    );
  }

  async update(): Promise<void> {
    await firstValueFrom(
      this.applicationService.update(this.entity() as MorphusApplication),
    );
    this.context.loadWorkspaces();
    this.messageService.showSuccess(
      `Os dados da aplicação "${this.entity().name}" foram atualizados com sucesso!`,
    );
    this.back();
  }

  back(): void {
    void this.router.navigate(['/morphus/application']);
  }

  async onSave(): Promise<void> {
    await this.submitForm();
  }

  onCancel(): void {
    this.back();
  }
}
