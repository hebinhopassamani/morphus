import {
  computed,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
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
import { AppBuilderRuntimeStoreService } from '@app-builder/services';
import { User } from '@security/entities/user';
import { ApplicationValidator } from '../validators/application.validator';
import { PageEditorComponent } from '../page-editor';

@Component({
  selector: 'mpx-application-edit',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
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
    PageEditorComponent,
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
  private readonly runtimeStore = inject(AppBuilderRuntimeStoreService);

  protected readonly selectedTabIndex = signal<number>(0);
  protected readonly existingApplications = signal<MorphusApplication[]>([]);
  protected readonly categories = signal<MorphusCategoryRef[]>([]);
  protected readonly appModules = signal<MorphusApplicationModuleRef[]>([]);
  protected readonly expandedModuleIds = signal<Set<string>>(new Set());
  protected readonly selectedModuleId = signal<string>('');
  protected readonly newModuleName = signal<string>('');
  protected readonly newModuleIcon = signal<string>('');
  protected readonly editingModule = signal<Partial<MorphusApplicationModuleRef> | null>(null);
  protected readonly savingModule = signal<boolean>(false);
  protected readonly inlineEditPage = signal<
    (Partial<MorphusApplicationSubModuleRef> & { moduleId: string }) | null
  >(null);
  protected readonly inlineRouteManuallyEdited = signal<boolean>(false);
  protected readonly selectedPage = signal<Partial<MorphusApplicationSubModuleRef> | null>(null);

  // Estado de Drag & Drop e Histórico (Ctrl+Z / Ctrl+Y) da árvore de Menus
  protected readonly draggingMenuItem = signal<{
    type: 'module' | 'submodule';
    id: string;
    parentModuleId?: string;
  } | null>(null);
  protected readonly dragOverMenuTarget = signal<{
    type: 'module' | 'submodule';
    id: string;
    parentModuleId?: string;
    position: 'before' | 'after';
  } | null>(null);
  protected readonly menuUndoStack = signal<MorphusApplicationModuleRef[][]>([]);
  protected readonly menuRedoStack = signal<MorphusApplicationModuleRef[][]>([]);
  private dragAutoScrollTimer: any = null;
  private lastDragClientY = 0;

  protected readonly canCreateModule = computed(() => {
    const icon = (this.newModuleIcon() ?? '').trim();
    const name = (this.newModuleName() ?? '').trim();
    return icon.length > 0 && name.length > 0 && name.length <= 20 && !this.savingModule();
  });

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
  protected readonly initialPageHtml = signal<string>('');
  protected readonly savingPage = signal<boolean>(false);
  protected readonly prefixManuallyEdited = signal<boolean>(false);

  protected readonly dynamicHeaderTitle = computed(() => {
    if (this.isNew) {
      return this.title1();
    }
    const tabIdx = this.selectedTabIndex();
    const appName = this.entity().name || 'Aplicação';
    if (tabIdx === 1) {
      return 'Gerenciar usuários da aplicação';
    }
    if (tabIdx === 2) {
      return 'Monte o menu de sua aplicação';
    }
    if (tabIdx === 3) {
      const pageName = this.selectedPage()?.label || this.selectedPage()?.name || 'Página';
      return `Você está editando a página ${pageName} da aplicação ${appName}`;
    }
    return `Editar Aplicação: ${appName}`;
  });

  protected readonly dynamicHeaderSubtitle = computed(() => {
    if (this.isNew) {
      return this.title2();
    }
    const tabIdx = this.selectedTabIndex();
    if (tabIdx === 1) {
      return 'Defina aqui quais usuários podem acessar esta aplicação.';
    }
    if (tabIdx === 2) {
      return 'E vincule-o a uma pagina.';
    }
    return this.title2();
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
    this.stopDragAutoScroll();
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
        const queryPageId = this.activatedRoute.snapshot.queryParamMap.get('pageId');
        if (queryPageId) {
          this.onSelectPageById(queryPageId);
        }
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
      if (rel.isOwner || rel.system) {
        this.messageService.showWarn(
          'O proprietário ou usuário de sistema da aplicação não pode ter o acesso removido.',
        );
      }
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
    if (removable.length === 0 && this.filteredRelatedUsers().length > 0) {
      this.messageService.showWarn(
        'Apenas usuários não proprietários podem ser selecionados para remoção de acesso.',
      );
      return;
    }
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
      this.messageService.showWarn(
        'O proprietário ou usuário de sistema da aplicação não pode ter o acesso removido.',
      );
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
      const prettyDbHtml = formatHtmlPretty(match.sub.htmlContent || '');
      const pendingDraft =
        this.runtimeStore.getPageDraftHtml(match.sub.id || '') ??
        this.runtimeStore.getPageDraftHtml(match.sub.routePattern || '');
      const effectiveHtml = pendingDraft !== null ? formatHtmlPretty(pendingDraft) : prettyDbHtml;
      this.selectedModuleId.set(match.modId);
      this.selectedPage.set({
        ...match.sub,
        name: match.sub.label || match.sub.name,
        icon: match.sub.icon || 'file-text',
        htmlContent: effectiveHtml,
      });
      this.initialPageHtml.set(prettyDbHtml);
    } else if (sorted[0]?.id) {
      this.selectedModuleId.set(sorted[0].id);
      this.selectedPage.set(null);
      this.initialPageHtml.set('');
    }
  }

  private syncDraftHtmlToRuntimeStore(page: Partial<MorphusApplicationSubModuleRef> | null): void {
    if (!page) {
      return;
    }
    const html = page.isCustomHtml
      ? (page.customHtmlContent ?? page.htmlContent ?? '')
      : (page.htmlContent ?? '');
    if (page.id) {
      this.runtimeStore.setPageDraftHtml(page.id, html);
    }
    if (page.routePattern) {
      this.runtimeStore.setPageDraftHtml(page.routePattern, html);
    }
  }

  private clearDraftHtmlFromRuntimeStore(page: Partial<MorphusApplicationSubModuleRef> | null): void {
    if (!page) {
      return;
    }
    if (page.id) {
      this.runtimeStore.clearPageDraftHtml(page.id);
    }
    if (page.routePattern) {
      this.runtimeStore.clearPageDraftHtml(page.routePattern);
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
    this.focusInlineMenuInput();
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
    this.focusInlineMenuInput();
  }

  protected startInlineNewPage(modId: string): void {
    this.editingModule.set(null);
    this.inlineRouteManuallyEdited.set(false);
    this.expandedModuleIds.update((s) => new Set(s).add(modId));
    this.inlineEditPage.set({
      id: '',
      moduleId: modId,
      name: '',
      label: '',
      icon: 'file-text',
      routePattern: '',
      default: false,
      isCustomHtml: false,
      description: 'Página da aplicação carregada do banco de dados',
      htmlContent: '',
    });
    this.focusInlineMenuInput(true);
  }

  private focusInlineMenuInput(scrollIntoView = false): void {
    setTimeout(() => {
      const inputEl = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Nome do menu"], input[placeholder*="Nome do submenu"], input[placeholder*="Nome do novo submenu"]',
      );
      if (inputEl) {
        if (scrollIntoView) {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        inputEl.focus();
        inputEl.select();
      }
    }, 30);
  }

  protected cancelInlinePageEdit(): void {
    this.inlineEditPage.set(null);
    this.inlineRouteManuallyEdited.set(false);
  }

  protected updateInlinePageField(field: 'name' | 'routePattern' | 'icon', value: string): void {
    if (field === 'routePattern') {
      this.inlineRouteManuallyEdited.set(value.trim().length > 0);
    }
    const cleanVal = field === 'name' ? (value ?? '').slice(0, 20) : value;
    this.inlineEditPage.update((curr) => {
      if (!curr) {
        return curr;
      }
      const next = { ...curr, [field]: cleanVal };
      if (field === 'name') {
        next.label = cleanVal;
        if (!this.inlineRouteManuallyEdited()) {
          const slug = (cleanVal || '')
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
      const cleanName = (row.name ?? '').trim().slice(0, 20);
      const saved = await firstValueFrom(
        this.applicationService.savePage(row.moduleId, {
          ...row,
          name: cleanName,
          label: cleanName,
        }),
      );
      this.inlineEditPage.set(null);
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
      this.selectPageForEdit(row.moduleId, saved);
      this.context.loadWorkspaces();
    } finally {
      this.savingPage.set(false);
    }
  }

  protected onPageEditorChange(updated: Partial<MorphusApplicationSubModuleRef>): void {
    this.selectedPage.set(updated);
    this.syncDraftHtmlToRuntimeStore(updated);
  }

  protected openPageInHtmlEditor(modId: string, sub: MorphusApplicationSubModuleRef): void {
    this.selectPageForEdit(modId, sub);
    this.selectedTabIndex.set(3);
  }

  protected updateEditingModuleField<K extends keyof MorphusApplicationModuleRef>(
    field: K,
    value: MorphusApplicationModuleRef[K],
  ): void {
    const cleanVal =
      field === 'name' ? (String(value ?? '').slice(0, 20) as MorphusApplicationModuleRef[K]) : value;
    this.editingModule.update((curr) => {
      if (!curr) {
        return curr;
      }
      const next = { ...curr, [field]: cleanVal };
      if (field === 'name') {
        next.label = String(cleanVal || '');
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
      const cleanName = mod.name.trim().slice(0, 20);
      await firstValueFrom(
        this.applicationService.saveModule(appId, {
          ...mod,
          name: cleanName,
          label: cleanName,
        }),
      );
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.appModules.set(
        [...(reloaded.applicationModules ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      this.editingModule.set(null);
      this.context.loadWorkspaces();
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
    this.messageService.confirm(
      {
        severity: 'error',
        icon: 'trash',
        title: 'Confirma a exclusão?',
        detail: `Tem certeza que deseja excluir o menu ${menuName} e todas os seus sub menus? As paginas vinculadas a eles NÃO serão excluídas`,
        confirmButtonText: 'Excluir',
        confirmButtonIcon: 'trash',
        cancelButtonText: 'Cancelar',
        cancelButtonIcon: 'arrow-left',
      },
      async () => {
        await firstValueFrom(this.applicationService.deleteModule(mod.id));
        this.editingModule.set(null);
        const reloaded = await firstValueFrom(this.applicationService.getById(appId));
        this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
        this.context.loadWorkspaces();
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
    const prettyDbHtml = formatHtmlPretty(page.htmlContent || '');
    const pendingDraft =
      this.runtimeStore.getPageDraftHtml(page.id || '') ??
      this.runtimeStore.getPageDraftHtml(page.routePattern || '');
    const effectiveHtml = pendingDraft !== null ? formatHtmlPretty(pendingDraft) : prettyDbHtml;
    this.editingModule.set(null);
    this.selectedModuleId.set(modId);
    this.selectedPage.set({
      ...page,
      name: page.label || page.name,
      icon: page.icon || 'file-text',
      htmlContent: effectiveHtml,
    });
    this.initialPageHtml.set(prettyDbHtml);
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

  protected resetPageHtmlToSaved(): void {
    const currPage = this.selectedPage();
    const initial = this.initialPageHtml();
    if (!currPage || (currPage.htmlContent || '') === initial) {
      return;
    }
    const updated = {
      ...currPage,
      htmlContent: initial,
    };
    this.selectedPage.set(updated);
    this.clearDraftHtmlFromRuntimeStore(currPage);
    void this.autoSaveCurrentPage(updated);
  }

  protected confirmResetPageHtmlToSaved(): void {
    const currPage = this.selectedPage();
    const initial = this.initialPageHtml();
    if (!currPage || (currPage.htmlContent || '') === initial) {
      return;
    }
    this.messageService.confirm(
      {
        severity: 'warn',
        icon: 'repeat',
        title: 'Resetar Página?',
        detail:
          'Ao resetar a página você perderá todas as alterações desde a última vez que a salvou. Deseja continuar?',
        doubleCheckText: 'RESETAR',
        doubleCheckPlaceholder: 'Digite RESETAR para confirmar',
        confirmButtonText: 'Sim, Resetar Página',
        confirmButtonIcon: 'check',
        cancelButtonText: 'Não, Continuar Editando',
        cancelButtonIcon: 'arrow-left',
      },
      () => {
        this.resetPageHtmlToSaved();
      },
    );
  }

  protected confirmCancelPageEditor(): void {
    this.messageService.confirm(
      {
        severity: 'error',
        icon: 'x',
        title: 'Cancelar Edição?',
        detail:
          'Ao cancelar você perderá todas as alterações desde a última vez que a salvou. Deseja continuar?',
        doubleCheckText: 'CANCELAR',
        doubleCheckPlaceholder: 'Digite CANCELAR para confirmar',
        confirmButtonText: 'Sim, Cancelar e Sair',
        confirmButtonIcon: 'check',
        cancelButtonText: 'Voltar ao Editor',
        cancelButtonIcon: 'arrow-left',
      },
      async () => {
        const currPage = this.selectedPage();
        this.clearDraftHtmlFromRuntimeStore(currPage);
        if (currPage) {
          const restored = {
            ...currPage,
            htmlContent: this.initialPageHtml(),
          };
          this.selectedPage.set(restored);
          await this.autoSaveCurrentPage(restored);
        }
        this.back();
      },
    );
  }

  @HostListener('window:keydown', ['$event'])
  protected onGlobalKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
    ) {
      return;
    }
    if (this.selectedTabIndex() === 2) {
      this.onMenusKeydown(event);
    }
  }

  protected onMenusKeydown(event: KeyboardEvent): void {
    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
    if (!isCtrlOrMeta) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'z') {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        void this.redoMenuStructure();
      } else {
        void this.undoMenuStructure();
      }
    } else if (key === 'y') {
      event.preventDefault();
      event.stopPropagation();
      void this.redoMenuStructure();
    }
  }

  protected async createModule(): Promise<void> {
    const appId = this.entity().id;
    const rawName = this.newModuleName().trim();
    const icon = this.newModuleIcon().trim();
    if (!appId || !rawName || !icon) {
      if (!icon) {
        this.messageService.showWarn('Selecione um ícone antes de adicionar o menu.');
      }
      return;
    }
    const name = rawName.slice(0, 20);
    this.savingModule.set(true);
    try {
      this.pushMenuHistorySnapshot();
      const existingMods = [...this.appModules()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const created = await firstValueFrom(
        this.applicationService.saveModule(appId, {
          name,
          label: name,
          icon,
          order: 0,
        }),
      );
      // Garante que o novo Menu Pai fique na primeira posição (topo) deslocando os demais
      for (let i = 0; i < existingMods.length; i++) {
        const m = existingMods[i];
        await firstValueFrom(
          this.applicationService.saveModule(appId, {
            ...m,
            order: i + 1,
          }),
        );
      }
      if (created?.id) {
        await firstValueFrom(
          this.applicationService.saveModule(appId, {
            ...created,
            name,
            label: name,
            icon,
            order: 0,
          }),
        );
      }
      this.newModuleName.set('');
      this.newModuleIcon.set('');
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
      this.context.loadWorkspaces();
    } finally {
      this.savingModule.set(false);
    }
  }

  private cloneModulesSnapshot(
    mods: MorphusApplicationModuleRef[],
  ): MorphusApplicationModuleRef[] {
    return mods.map((m) => ({
      ...m,
      applicationSubModules: (m.applicationSubModules ?? []).map((s) => ({ ...s })),
    }));
  }

  private pushMenuHistorySnapshot(): void {
    const snap = this.cloneModulesSnapshot(this.appModules());
    this.menuUndoStack.update((stack) => [...stack.slice(-30), snap]);
    this.menuRedoStack.set([]);
  }

  protected async undoMenuStructure(): Promise<void> {
    const stack = this.menuUndoStack();
    if (stack.length === 0) {
      return;
    }
    const prevSnap = stack[stack.length - 1];
    const currentSnap = this.cloneModulesSnapshot(this.appModules());
    this.menuUndoStack.set(stack.slice(0, -1));
    this.menuRedoStack.update((r) => [...r, currentSnap]);
    this.appModules.set(prevSnap);
    await this.persistFullMenuHierarchy(prevSnap);
  }

  protected async redoMenuStructure(): Promise<void> {
    const redo = this.menuRedoStack();
    if (redo.length === 0) {
      return;
    }
    const nextSnap = redo[redo.length - 1];
    const currentSnap = this.cloneModulesSnapshot(this.appModules());
    this.menuRedoStack.set(redo.slice(0, -1));
    this.menuUndoStack.update((s) => [...s, currentSnap]);
    this.appModules.set(nextSnap);
    await this.persistFullMenuHierarchy(nextSnap);
  }

  private async persistFullMenuHierarchy(
    modules: MorphusApplicationModuleRef[],
  ): Promise<void> {
    const appId = this.entity().id;
    if (!appId) {
      return;
    }
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const mod = modules[mIdx];
      await firstValueFrom(
        this.applicationService.saveModule(appId, {
          ...mod,
          order: mIdx + 1,
        }),
      );
      const subs = mod.applicationSubModules ?? [];
      for (let sIdx = 0; sIdx < subs.length; sIdx++) {
        const sub = subs[sIdx];
        await firstValueFrom(
          this.applicationService.savePage(mod.id, {
            ...sub,
            applicationModuleId: mod.id,
            order: sIdx + 1,
          }),
        );
      }
    }
    this.context.loadWorkspaces();
  }

  @HostListener('window:dragover', ['$event'])
  protected onWindowDragOver(event: DragEvent): void {
    if (!this.draggingMenuItem()) {
      return;
    }
    this.lastDragClientY = event.clientY;
  }

  private startDragAutoScroll(): void {
    this.stopDragAutoScroll();
    this.dragAutoScrollTimer = setInterval(() => {
      if (!this.draggingMenuItem() || this.lastDragClientY <= 0) {
        return;
      }

      const edgeThreshold = 140;
      const vh = window.innerHeight;
      let delta = 0;
      if (this.lastDragClientY < edgeThreshold) {
        delta = -Math.max(4, Math.ceil((edgeThreshold - this.lastDragClientY) / 5));
      } else if (vh - this.lastDragClientY < edgeThreshold) {
        delta = Math.max(4, Math.ceil((edgeThreshold - (vh - this.lastDragClientY)) / 5));
      }
      if (delta !== 0) {
        window.scrollBy({ top: delta, behavior: 'auto' });
        document.scrollingElement?.scrollBy({ top: delta, behavior: 'auto' });
        const scrollContainers = document.querySelectorAll(
          '.mat-drawer-content, .mat-sidenav-content, main, [class*="overflow-y-auto"]',
        );
        scrollContainers.forEach((el) => {
          (el as HTMLElement).scrollTop += delta;
        });
      }
    }, 16);
  }

  private stopDragAutoScroll(): void {
    if (this.dragAutoScrollTimer) {
      clearInterval(this.dragAutoScrollTimer);
      this.dragAutoScrollTimer = null;
    }
    this.lastDragClientY = 0;
  }

  protected isDropLineTopForModule(mod: MorphusApplicationModuleRef): boolean {
    const target = this.dragOverMenuTarget();
    return (
      this.draggingMenuItem()?.type === 'module' &&
      target?.type === 'module' &&
      target.id === mod.id &&
      target.position === 'before'
    );
  }

  protected isDropLineBottomForModule(mod: MorphusApplicationModuleRef): boolean {
    const dragging = this.draggingMenuItem();
    const target = this.dragOverMenuTarget();
    if (!dragging || !target) {
      return false;
    }
    if (dragging.type === 'submodule') {
      return target.type === 'module' && target.id === mod.id;
    }
    const hasVisibleSubs =
      this.isModuleExpanded(mod.id) && (mod.applicationSubModules ?? []).length > 0;
    return (
      !hasVisibleSubs &&
      target.type === 'module' &&
      target.id === mod.id &&
      target.position === 'after'
    );
  }

  protected isDropLineTopForSubModule(sub: MorphusApplicationSubModuleRef): boolean {
    const target = this.dragOverMenuTarget();
    return (
      this.draggingMenuItem()?.type === 'submodule' &&
      target?.type === 'submodule' &&
      target.id === sub.id &&
      target.position === 'before'
    );
  }

  protected isDropLineBottomForSubModule(
    mod: MorphusApplicationModuleRef,
    sub: MorphusApplicationSubModuleRef,
    isLastSub: boolean,
  ): boolean {
    const dragging = this.draggingMenuItem();
    const target = this.dragOverMenuTarget();
    if (!dragging || !target) {
      return false;
    }
    if (dragging.type === 'submodule') {
      return target.type === 'submodule' && target.id === sub.id && target.position === 'after';
    }
    return (
      dragging.type === 'module' &&
      isLastSub &&
      target.type === 'module' &&
      target.id === mod.id &&
      target.position === 'after'
    );
  }

  protected onModuleDragStart(event: DragEvent, mod: MorphusApplicationModuleRef): void {
    this.draggingMenuItem.set({ type: 'module', id: mod.id });
    this.lastDragClientY = event.clientY;
    this.startDragAutoScroll();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', mod.id);
    }
  }

  protected onSubModuleDragStart(
    event: DragEvent,
    parentModuleId: string,
    sub: MorphusApplicationSubModuleRef,
  ): void {
    event.stopPropagation();
    this.draggingMenuItem.set({ type: 'submodule', id: sub.id, parentModuleId });
    this.lastDragClientY = event.clientY;
    this.startDragAutoScroll();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', sub.id);
    }
  }

  protected onMenuDragOver(
    event: DragEvent,
    targetType: 'module' | 'submodule',
    targetId: string,
    parentModuleId?: string,
  ): void {
    const dragging = this.draggingMenuItem();
    if (!dragging) {
      return;
    }
    this.lastDragClientY = event.clientY;

    const rowEl = event.currentTarget as HTMLElement | null;
    const rect = rowEl?.getBoundingClientRect();
    const isTopHalf = rect ? event.clientY < rect.top + rect.height / 2 : true;

    if (dragging.type === 'module') {
      const effectiveModId = targetType === 'module' ? targetId : parentModuleId;
      if (!effectiveModId || effectiveModId === dragging.id) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      // Se passar o mouse na linha do Menu Pai (ou se estiver subindo sobre os filhos), decide 'before' (linha no topo do Menu Pai) ou 'after' (linha após o bloco do Menu Pai)
      const mods = this.appModules();
      const fromIdx = mods.findIndex((m) => m.id === dragging.id);
      const toIdx = mods.findIndex((m) => m.id === effectiveModId);
      let position: 'before' | 'after';
      if (targetType === 'module') {
        position = isTopHalf || fromIdx > toIdx ? 'before' : 'after';
      } else {
        position = fromIdx > toIdx && isTopHalf ? 'before' : 'after';
      }

      const curr = this.dragOverMenuTarget();
      if (
        !curr ||
        curr.type !== 'module' ||
        curr.id !== effectiveModId ||
        curr.position !== position
      ) {
        this.dragOverMenuTarget.set({
          type: 'module',
          id: effectiveModId,
          position,
        });
      }
      return;
    }

    if (dragging.type === 'submodule') {
      if (targetType === 'submodule' && targetId === dragging.id) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      const position: 'before' | 'after' =
        targetType === 'module' ? 'after' : isTopHalf ? 'before' : 'after';
      const curr = this.dragOverMenuTarget();
      if (
        !curr ||
        curr.type !== targetType ||
        curr.id !== targetId ||
        curr.position !== position
      ) {
        this.dragOverMenuTarget.set({
          type: targetType,
          id: targetId,
          parentModuleId,
          position,
        });
      }
    }
  }

  protected onMenuDragEnd(): void {
    this.stopDragAutoScroll();
    this.draggingMenuItem.set(null);
    this.dragOverMenuTarget.set(null);
  }

  protected async onMenuDrop(
    event: DragEvent,
    targetType: 'module' | 'submodule',
    targetId: string,
    targetParentModuleId?: string,
  ): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const dragging = this.draggingMenuItem();
    const dropTarget = this.dragOverMenuTarget();
    this.stopDragAutoScroll();
    this.draggingMenuItem.set(null);
    this.dragOverMenuTarget.set(null);

    if (!dragging) {
      return;
    }

    const appId = this.entity().id;
    if (!appId) {
      return;
    }

    if (dragging.type === 'module') {
      const effectiveModId =
        dropTarget?.type === 'module'
          ? dropTarget.id
          : targetType === 'module'
            ? targetId
            : targetParentModuleId;
      const position = dropTarget?.position ?? 'before';
      if (!effectiveModId || effectiveModId === dragging.id) {
        return;
      }

      const currentMods = this.cloneModulesSnapshot(this.appModules());
      const fromIdx = currentMods.findIndex((m) => m.id === dragging.id);
      const origToIdx = currentMods.findIndex((m) => m.id === effectiveModId);
      if (fromIdx === -1 || origToIdx === -1 || fromIdx === origToIdx) {
        return;
      }

      const prevOrderById = new Map(currentMods.map((m) => [m.id, m.order]));
      this.pushMenuHistorySnapshot();
      const [movedMod] = currentMods.splice(fromIdx, 1);
      const newTargetIdx = currentMods.findIndex((m) => m.id === effectiveModId);
      const insertIdx = position === 'after' ? newTargetIdx + 1 : newTargetIdx;
      currentMods.splice(insertIdx, 0, movedMod);

      currentMods.forEach((m, idx) => {
        m.order = idx + 1;
      });
      this.appModules.set(currentMods);

      for (let i = 0; i < currentMods.length; i++) {
        const modItem = currentMods[i];
        if (prevOrderById.get(modItem.id) !== modItem.order || modItem.id === movedMod.id) {
          await firstValueFrom(
            this.applicationService.saveModule(appId, {
              ...modItem,
              order: i + 1,
            }),
          );
        }
      }
      this.context.loadWorkspaces();
      return;
    }

    if (dragging.type === 'submodule') {
      const sourceModId = dragging.parentModuleId;
      const destModId = targetType === 'module' ? targetId : targetParentModuleId;
      const position = dropTarget?.position ?? 'after';
      if (!sourceModId || !destModId) {
        return;
      }

      const currentMods = this.cloneModulesSnapshot(this.appModules());
      const sourceMod = currentMods.find((m) => m.id === sourceModId);
      const destMod = currentMods.find((m) => m.id === destModId);
      if (!sourceMod || !destMod) {
        return;
      }

      const sourceSubs = sourceMod.applicationSubModules ?? [];
      const fromSubIdx = sourceSubs.findIndex((s) => s.id === dragging.id);
      if (fromSubIdx === -1) {
        return;
      }

      const prevSubState = new Map<string, { order?: number; modId: string }>();
      for (const s of sourceSubs) {
        prevSubState.set(s.id, { order: s.order, modId: sourceModId });
      }
      for (const s of destMod.applicationSubModules ?? []) {
        prevSubState.set(s.id, { order: s.order, modId: destModId });
      }

      this.pushMenuHistorySnapshot();
      const [movedSub] = sourceSubs.splice(fromSubIdx, 1);
      movedSub.applicationModuleId = destModId;

      const destSubs = destMod.applicationSubModules ?? [];
      if (targetType === 'submodule') {
        const newTargetSubIdx = destSubs.findIndex((s) => s.id === targetId);
        if (newTargetSubIdx !== -1) {
          const insertSubIdx = position === 'after' ? newTargetSubIdx + 1 : newTargetSubIdx;
          destSubs.splice(insertSubIdx, 0, movedSub);
        } else {
          destSubs.push(movedSub);
        }
      } else {
        // Soltou diretamente na linha do Menu Pai: entra logo abaixo da linha do Menu Pai (1º filho)
        destSubs.unshift(movedSub);
      }

      sourceMod.applicationSubModules = sourceSubs.map((s, idx) => ({ ...s, order: idx + 1 }));
      destMod.applicationSubModules = destSubs.map((s, idx) => ({
        ...s,
        applicationModuleId: destModId,
        order: idx + 1,
      }));

      this.expandedModuleIds.update((set) => new Set(set).add(destModId));
      this.appModules.set(currentMods);

      // Persiste apenas os itens cujo order ou Menu Pai mudou (suporta 50+ menus sem gargalo!)
      for (const s of destMod.applicationSubModules) {
        const prev = prevSubState.get(s.id);
        if (!prev || prev.order !== s.order || prev.modId !== destModId || s.id === movedSub.id) {
          await firstValueFrom(
            this.applicationService.savePage(destModId, {
              ...s,
              applicationModuleId: destModId,
            }),
          );
        }
      }
      if (sourceModId !== destModId) {
        for (const s of sourceMod.applicationSubModules) {
          const prev = prevSubState.get(s.id);
          if (!prev || prev.order !== s.order) {
            await firstValueFrom(
              this.applicationService.savePage(sourceModId, {
                ...s,
                applicationModuleId: sourceModId,
              }),
            );
          }
        }
      }
      this.context.loadWorkspaces();
    }
  }

  protected async autoSaveCurrentPage(
    updated?: Partial<MorphusApplicationSubModuleRef>,
  ): Promise<void> {
    const appId = this.entity().id;
    const modId = this.selectedModuleId();
    const page = updated || this.selectedPage();
    if (!appId || !modId || !page?.name?.trim()) {
      return;
    }
    const saved = await firstValueFrom(this.applicationService.savePage(modId, page));
    this.clearDraftHtmlFromRuntimeStore(page);
    this.clearDraftHtmlFromRuntimeStore(saved);
    this.appModules.update((mods) =>
      mods.map((m) =>
        m.id === modId
          ? {
              ...m,
              applicationSubModules: (m.applicationSubModules ?? []).map((s) =>
                s.id === saved.id ? { ...s, ...saved } : s,
              ),
            }
          : m,
      ),
    );
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
      this.clearDraftHtmlFromRuntimeStore(page);
      this.clearDraftHtmlFromRuntimeStore(saved);
      const reloaded = await firstValueFrom(this.applicationService.getById(appId));
      this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
      const prettySaved = formatHtmlPretty(saved.htmlContent || page.htmlContent || '');
      this.selectedPage.set({
        ...saved,
        name: saved.label || saved.name,
        icon: saved.icon || 'file-text',
        htmlContent: prettySaved,
      });
      this.initialPageHtml.set(prettySaved);
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
    this.messageService.confirm(
      {
        severity: 'error',
        icon: 'trash',
        title: 'Confirma a exclusão?',
        detail: `Tem certeza que deseja excluir o sub menu ${pageName}? As paginas vinculadas a ele NÃO serão excluídas.`,
        confirmButtonText: 'Excluir',
        confirmButtonIcon: 'trash',
        cancelButtonText: 'Cancelar',
        cancelButtonIcon: 'arrow-left',
      },
      async () => {
        await firstValueFrom(this.applicationService.deletePage(sub.id));
        const reloaded = await firstValueFrom(this.applicationService.getById(appId));
        this.syncModulesAndDefaultPage(reloaded.applicationModules ?? []);
        this.context.loadWorkspaces();
      },
    );
  }

  protected openLivePage(): void {
    const appKey = this.entity().key || this.entity().prefix;
    const currPage = this.selectedPage();
    const slug = currPage?.routePattern || 'dashboard';
    if (!appKey) {
      return;
    }
    this.syncDraftHtmlToRuntimeStore(currPage);
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
