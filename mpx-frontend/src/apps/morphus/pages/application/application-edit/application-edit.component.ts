import {
  computed,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
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
import { AppBuilderRuntimeStoreService, AppBuilderSanitizerService } from '@app-builder/services';
import { User } from '@security/entities/user';
import { ApplicationValidator } from '../validators/application.validator';

export type VisualInspectorTargetType =
  | 'field'
  | 'form'
  | 'table'
  | 'kpi'
  | 'hero'
  | 'section'
  | 'object'
  | 'grid';
export type VisualInspectorTab = 'properties' | 'blocks' | 'objects';
export type VisualObjectType =
  | 'heading'
  | 'button'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'badge'
  | 'link'
  | 'image';
export type VisualFieldType =
  | 'text'
  | 'currency'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea';

export interface VisualObjectConfigSnapshot {
  label?: string;
  placeholder?: string;
  colSpan?: number;
  required?: boolean;
  options?: string[];
  inputKind?: VisualFieldType;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  actionKind?: 'submit' | 'navigate' | 'modal' | 'reset';
  href?: string;
  openNewTab?: boolean;
  textSize?: 'h1' | 'h2' | 'h3' | 'p';
  align?: 'left' | 'center' | 'right';
  colorTone?: 'neutral' | 'jade' | 'amber' | 'violet' | 'red';
  imageUrl?: string;
  imageWidth?: string;
  defaultChecked?: boolean;
  switchStyle?: boolean;
}



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
  private readonly runtimeStore = inject(AppBuilderRuntimeStoreService);

  @ViewChild('visualPreviewCanvas') private visualPreviewCanvasRef?: ElementRef<HTMLElement>;

  // Estado do Construtor Visual para Leigos (Inspector no Preview)
  protected readonly visualInspectorOpen = signal<boolean>(true);
  protected readonly visualInspectorTab = signal<VisualInspectorTab>('properties');
  protected readonly visualTargetType = signal<VisualInspectorTargetType | null>(null);
  protected readonly visualFormIndex = signal<number>(0);
  protected readonly visualFieldIndex = signal<number>(0);
  protected readonly visualTableIndex = signal<number>(0);
  protected readonly visualKpiIndex = signal<number>(0);
  protected readonly visualHeroIndex = signal<number>(0);
  protected readonly visualSectionIndex = signal<number>(0);
  protected readonly visualSelectedBlockIndex = signal<number>(0);
  protected readonly visualSelectedObjectId = signal<string>('');
  protected readonly visualObjectType = signal<VisualObjectType>('button');

  // Propriedades editáveis do Objeto genérico selecionado (8 tipos universais + memória por tipo)
  protected readonly vObjLabel = signal<string>('Texto do Objeto');
  protected readonly vObjPlaceholder = signal<string>('Digite aqui...');
  protected readonly vObjInputKind = signal<VisualFieldType>('text');
  protected readonly vObjColSpan = signal<number>(6);
  protected readonly vObjRequired = signal<boolean>(false);
  protected readonly vObjOptions = signal<string[]>(['Opção 1', 'Opção 2']);
  protected readonly vObjNewOption = signal<string>('');
  protected readonly vObjVariant = signal<'primary' | 'secondary' | 'outline' | 'danger' | 'success'>('primary');
  protected readonly vObjActionKind = signal<'submit' | 'navigate' | 'modal' | 'reset'>('submit');
  protected readonly vObjHref = signal<string>('/website/home');
  protected readonly vObjOpenNewTab = signal<boolean>(false);
  protected readonly vObjTextSize = signal<'h1' | 'h2' | 'h3' | 'p'>('h2');
  protected readonly vObjAlign = signal<'left' | 'center' | 'right'>('left');
  protected readonly vObjColorTone = signal<'neutral' | 'jade' | 'amber' | 'violet' | 'red'>('violet');
  protected readonly vObjImageUrl = signal<string>('https://placehold.co/600x240/ede9fe/6d28d9?text=Morphus+Visual');
  protected readonly vObjImageWidth = signal<string>('100%');
  protected readonly vObjDefaultChecked = signal<boolean>(false);
  protected readonly vObjSwitchStyle = signal<boolean>(false);
  protected readonly vSectionTitle = signal<string>('Seção da Página');
  protected readonly vSectionSubtitle = signal<string>('Agrupe objetos e componentes nesta seção.');

  // Memória em tempo real por Objeto + Tipo (preserva propriedades ao alternar Botão -> Combo -> Link -> Botão)
  private readonly objectConfigMemory = new Map<
    string,
    Partial<Record<VisualObjectType, VisualObjectConfigSnapshot>>
  >();

  protected readonly visualObjectChoices: {
    type: VisualObjectType;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    {
      type: 'heading',
      label: 'Título / Texto',
      desc: 'Títulos, subtítulos ou parágrafos explicativos',
      icon: 'file-text',
    },
    {
      type: 'button',
      label: 'Botão de Ação',
      desc: 'Botão para salvar, confirmar ou executar uma ação',
      icon: 'sparkles',
    },
    {
      type: 'input',
      label: 'Campo de Digitação',
      desc: 'Texto, moeda (R$), número, data ou observações',
      icon: 'square-pen',
    },
    {
      type: 'select',
      label: 'Lista de Seleção (Combo)',
      desc: 'Lista de opções com botão [+] para cadastrar na hora',
      icon: 'layers',
    },
    {
      type: 'checkbox',
      label: 'Caixa de Marcação (Sim / Não)',
      desc: 'Marcação booleana ou chave Liga / Desliga',
      icon: 'circle-check',
    },
    {
      type: 'badge',
      label: 'Etiqueta de Status (Badge)',
      desc: 'Selo colorido de status (Pago, Pendente, Ativo)',
      icon: 'shield-check',
    },
    {
      type: 'link',
      label: 'Link de Navegação',
      desc: 'Atalho clicável para outra página ou endereço externo',
      icon: 'arrow-right',
    },
    {
      type: 'image',
      label: 'Imagem / Banner',
      desc: 'Logotipo, ilustração ou imagem ilustrativa',
      icon: 'boxes',
    },
  ];

  // Propriedades editáveis do Campo selecionado no Formulário
  protected readonly vFieldLabel = signal<string>('Título');
  protected readonly vFieldPlaceholder = signal<string>('Digite aqui...');
  protected readonly vFieldType = signal<VisualFieldType>('text');
  protected readonly vFieldColSpan = signal<number>(6);
  protected readonly vFieldRequired = signal<boolean>(false);
  protected readonly vFieldOptions = signal<string[]>([]);
  protected readonly vFieldNewOption = signal<string>('');
  protected readonly vFieldKey = signal<string>('titulo');

  // Propriedades editáveis do Formulário selecionado
  protected readonly vFormTitle = signal<string>('Novo Registro');
  protected readonly vFormCollection = signal<string>('contas-pagar');
  protected readonly vFormButtonText = signal<string>('Salvar Registro');

  // Propriedades editáveis da Tabela selecionada
  protected readonly vTableCollection = signal<string>('contas-pagar');
  protected readonly vTableColumns = signal<{ header: string; fieldKey: string }[]>([]);
  protected readonly vTableNewColHeader = signal<string>('');

  // Propriedades editáveis do Card KPI selecionado
  protected readonly vKpiTitle = signal<string>('Indicador');
  protected readonly vKpiBadge = signal<string>('');
  protected readonly vKpiValue = signal<string>('R$ 0,00');
  protected readonly vKpiSubtitle = signal<string>('');
  protected readonly vKpiMode = signal<'sum' | 'count' | 'pending' | 'static'>('static');
  protected readonly vKpiColor = signal<'neutral' | 'jade' | 'amber' | 'violet' | 'red'>('neutral');
  private readonly KPI_GRID_SELECTOR =
    '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4, .xl\\:grid-cols-4';
  private readonly MULTI_BLOCK_GRID_SELECTOR =
    '[data-mpx-grid], [data-mpx-block="kpi"], .grid-cols-12:not([data-mpx-form-grid]), .sm\\:grid-cols-2, .sm\\:grid-cols-3, .sm\\:grid-cols-4, .lg\\:grid-cols-2, .lg\\:grid-cols-3, .lg\\:grid-cols-4, .xl\\:grid-cols-4';

  // Propriedades editáveis do Grid (Conjunto de Linhas × Colunas) e Largura do Bloco selecionado
  protected readonly visualGridBlockIndex = signal<number>(0);
  protected readonly visualGridCellIndex = signal<number>(0);
  protected readonly vGridRows = signal<number>(2);
  protected readonly vGridCols = signal<number>(2);
  protected readonly vBlockColSpan = signal<number>(12);

  // Propriedades editáveis do Cabeçalho (Hero) selecionado
  protected readonly vHeroBadge = signal<string>('Módulo Ativo');
  protected readonly vHeroTitle = signal<string>('Título Principal da Página');
  protected readonly vHeroSubtitle = signal<string>(
    'Subtítulo explicativo desta área da aplicação.',
  );

  protected readonly availableCollections = computed(() => this.runtimeStore.defaultCollections);
  protected readonly colSpanChoices: { span: number; label: string; desc: string }[] = [
    { span: 3, label: '25%', desc: '4 por linha' },
    { span: 4, label: '33%', desc: '3 por linha' },
    { span: 6, label: '50%', desc: '2 por linha' },
    { span: 8, label: '67%', desc: '2/3 da linha' },
    { span: 9, label: '75%', desc: '3/4 da linha' },
    { span: 12, label: '100%', desc: 'Linha inteira' },
  ];
  protected readonly fieldTypeChoices: { type: VisualFieldType; label: string }[] = [
    { type: 'text', label: 'Texto Curto' },
    { type: 'currency', label: 'Moeda (R$)' },
    { type: 'number', label: 'Número' },
    { type: 'date', label: 'Data' },
    { type: 'select', label: 'Combo (Lista com botão +)' },
    { type: 'checkbox', label: 'Checkbox (Sim / Não)' },
    { type: 'radio', label: 'Radio (Escolha Única)' },
    { type: 'textarea', label: 'Texto Longo (Observações)' },
  ];

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
  protected readonly menusPanelOpen = signal<boolean>(false);
  protected readonly pageConfigOpen = signal<boolean>(false);
  protected readonly studioViewMode = signal<'code' | 'split' | 'preview'>('preview');
  protected readonly visualDragSource = signal<{
    kind: 'block' | 'cell' | 'object' | 'field' | 'kpi' | 'palette-block' | 'palette-object';
    formIdx?: number;
    kpiIdx?: number;
    cellIdx?: number;
    objId?: string;
    index: number;
    paletteBlockType?:
      | 'grid'
      | 'hero'
      | 'kpi'
      | 'table'
      | 'form'
      | 'section'
      | 'alert'
      | 'quick-actions'
      | 'contas-pagar'
      | 'notas-fiscais';
    paletteObjectType?: VisualObjectType;
  } | null>(null);
  protected readonly htmlUndoStack = signal<string[]>([]);
  protected readonly htmlRedoStack = signal<string[]>([]);
  protected readonly initialPageHtml = signal<string>('');
  protected readonly savingPage = signal<boolean>(false);
  protected readonly prefixManuallyEdited = signal<boolean>(false);

  protected toggleVisualInspector(forceState?: boolean): void {
    this.visualInspectorOpen.update((curr) => (forceState !== undefined ? forceState : !curr));
  }

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
    if (!raw.trim() || typeof DOMParser === 'undefined') {
      return this.sanitizer.toTrustedHtml(raw);
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'text/html');
      this.repairSquishedObjectContainersInDom(doc);
      this.ensureTopLevelGridsInDom(doc);
      this.ensureVisualObjectIdsInDom(doc);

      // Impede que links <a> e imagens <img> interceptem o arraste (drag) nativo do navegador
      doc.body.querySelectorAll('a, img').forEach((el) => {
        el.setAttribute('draggable', 'false');
      });

      // 1. Nível de Página (Grids / Linhas Principais): Marca todos os Grids da página com borda e etiqueta própria
      const blocksContainer = this.getTopLevelBlocksContainer(doc.body);
      Array.from(blocksContainer.children).forEach((child, idx) => {
        const el = child as HTMLElement;
        el.setAttribute('draggable', 'true');
        el.setAttribute('data-mpx-drag-block', String(idx));
        el.setAttribute('data-mpx-grid-label', `Grid #${idx + 1}`);

        // 2. Nível de Grid (Blocos internos / Células): Marca cada bloco filho dentro do Grid
        Array.from(el.children).forEach((cell, cIdx) => {
          const cellEl = cell as HTMLElement;
          cellEl.setAttribute('draggable', 'true');
          cellEl.setAttribute('data-mpx-drag-cell', String(cIdx));
          cellEl.setAttribute('data-mpx-parent-grid', String(idx));
          if (el.matches(this.KPI_GRID_SELECTOR)) {
            cellEl.setAttribute('data-mpx-drag-kpi', String(cIdx));
          }
        });
      });

      // 3. Nível de Bloco (Objetos internos: Campos <label> do <form> e Objetos dentro de [data-mpx-objects-grid])
      doc.body.querySelectorAll('form').forEach((formEl, fIdx) => {
        formEl.querySelectorAll('label').forEach((lbl, lIdx) => {
          lbl.setAttribute('draggable', 'true');
          lbl.setAttribute('data-mpx-drag-field', String(lIdx));
          lbl.setAttribute('data-mpx-parent-form', String(fIdx));
        });
      });

      doc.body
        .querySelectorAll('[data-mpx-objects-grid] [data-mpx-obj-id]:not(label)')
        .forEach((objEl) => {
          const parent = objEl.parentElement;
          if (parent && parent.children.length > 1) {
            objEl.setAttribute('draggable', 'true');
          }
        });

      return this.sanitizer.toTrustedHtml(doc.body.innerHTML);
    } catch {
      return this.sanitizer.toTrustedHtml(raw);
    }
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
    effect(() => {
      const _tab = this.selectedTabIndex();
      const _html = this.livePreviewHtml();
      const _mode = this.studioViewMode();
      const _type = this.visualTargetType();
      const _fIdx = this.visualFieldIndex();
      const _kIdx = this.visualKpiIndex();
      const _objId = this.visualSelectedObjectId();
      const _secIdx = this.visualSectionIndex();
      setTimeout(() => {
        this.applyVisualPreviewHighlight();
      }, 30);
    });
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
      this.htmlUndoStack.set([]);
      this.htmlRedoStack.set([]);
      this.initialPageHtml.set(prettyDbHtml);
    } else if (sorted[0]?.id) {
      this.selectedModuleId.set(sorted[0].id);
      this.selectedPage.set(null);
      this.htmlUndoStack.set([]);
      this.htmlRedoStack.set([]);
      this.initialPageHtml.set('');
    }
  }

  private syncDraftHtmlToRuntimeStore(page: Partial<MorphusApplicationSubModuleRef> | null): void {
    if (!page) {
      return;
    }
    const html = page.htmlContent ?? '';
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
    this.menusPanelOpen.set(false);
    this.pageConfigOpen.set(false);
    this.selectedModuleId.set(modId);
    this.selectedPage.set({
      ...page,
      name: page.label || page.name,
      icon: page.icon || 'file-text',
      htmlContent: effectiveHtml,
    });
    this.htmlUndoStack.set([]);
    this.htmlRedoStack.set([]);
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

  protected formatCurrentPageHtml(): void {
    const currPage = this.selectedPage();
    if (!currPage) {
      return;
    }
    const raw = currPage.htmlContent || '';
    const pretty = formatHtmlPretty(raw);
    if (pretty && pretty !== raw) {
      this.pushHtmlHistory(raw);
      const updated = {
        ...currPage,
        htmlContent: pretty,
      };
      this.selectedPage.set(updated);
      this.syncDraftHtmlToRuntimeStore(updated);
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
    const updated = {
      ...currPage,
      htmlContent: previous,
    };
    this.selectedPage.set(updated);
    this.syncDraftHtmlToRuntimeStore(updated);
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
    const updated = {
      ...currPage,
      htmlContent: nextHtml,
    };
    this.selectedPage.set(updated);
    this.syncDraftHtmlToRuntimeStore(updated);
  }

  protected resetPageHtmlToSaved(): void {
    const currPage = this.selectedPage();
    const initial = this.initialPageHtml();
    if (!currPage || (currPage.htmlContent || '') === initial) {
      return;
    }
    this.pushHtmlHistory(currPage.htmlContent || '');
    const updated = {
      ...currPage,
      htmlContent: initial,
    };
    this.selectedPage.set(updated);
    this.clearDraftHtmlFromRuntimeStore(currPage);
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
      () => {
        const currPage = this.selectedPage();
        this.clearDraftHtmlFromRuntimeStore(currPage);
        if (currPage) {
          this.selectedPage.set({
            ...currPage,
            htmlContent: this.initialPageHtml(),
          });
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
      return;
    }
    if (this.selectedTabIndex() !== 3 || !this.selectedPage()) {
      return;
    }
    if (event.key === 'Delete' && this.visualTargetType()) {
      event.preventDefault();
      event.stopPropagation();
      this.removeSelectedVisualBlock();
      return;
    }
    this.onHtmlEditorKeydown(event);
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
      if (field === 'htmlContent') {
        this.syncDraftHtmlToRuntimeStore(next);
      }
      return next;
    });
  }

  private isOuterPageWrapperElement(el: HTMLElement | null): boolean {
    if (!el || el.tagName.toLowerCase() !== 'div') {
      return false;
    }
    const cls = el.className || '';
    // Se for um stack vertical de página (<div class="flex flex-col gap-6"> ou <div class="space-y-6">) que não é um Card com borda
    if (
      (cls.includes('flex-col') || cls.includes('space-y-')) &&
      !el.classList.contains('rounded-3xl') &&
      !el.classList.contains('rounded-2xl') &&
      !el.classList.contains('border')
    ) {
      return true;
    }
    // Se for um wrapper que contém múltiplos grids/seções lá dentro (ex.: Grid de 1 coluna abraçando a página inteira)
    const hasNestedMultiColGrid =
      el.querySelector(
        '.sm\\:grid-cols-2, .sm\\:grid-cols-3, .sm\\:grid-cols-4, .xl\\:grid-cols-4, .lg\\:grid-cols-12, [data-mpx-grid]',
      ) !== null;
    if (hasNestedMultiColGrid) {
      return true;
    }
    return false;
  }

  private getTopLevelBlocksContainer(root: HTMLElement): HTMLElement {
    let curr = root;
    let safety = 0;
    while (curr.children.length === 1 && safety < 6) {
      const only = curr.firstElementChild as HTMLElement | null;
      if (only && this.isOuterPageWrapperElement(only)) {
        curr = only;
        safety++;
      } else {
        break;
      }
    }
    return curr;
  }

  private ensureTopLevelGridsInDom(doc: Document): void {
    // 1. Desempacota recursivamente qualquer wrapper externo (<div class="flex flex-col gap-6"> ou Grid que abraçou a página inteira)
    let safety = 0;
    while (doc.body.children.length === 1 && safety < 6) {
      const only = doc.body.firstElementChild as HTMLElement | null;
      if (only && this.isOuterPageWrapperElement(only)) {
        while (only.firstChild) {
          doc.body.insertBefore(only.firstChild, only);
        }
        only.remove();
        safety++;
      } else {
        break;
      }
    }

    const blocksContainer = doc.body;
    const children = Array.from(blocksContainer.children) as HTMLElement[];

    for (const child of children) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style') {
        continue;
      }

      const isStandaloneBlock =
        tag === 'form' ||
        tag === 'table' ||
        (child.hasAttribute('data-mpx-block') && child.getAttribute('data-mpx-block') !== 'kpi') ||
        child.classList.contains('rounded-3xl');

      const isAlreadyGrid =
        !isStandaloneBlock &&
        (child.hasAttribute('data-mpx-grid') || child.matches(this.MULTI_BLOCK_GRID_SELECTOR));

      if (isAlreadyGrid) {
        child.setAttribute('data-mpx-grid', 'true');
        if (!child.matches(this.KPI_GRID_SELECTOR)) {
          Array.from(child.children).forEach((cell) => {
            const cellEl = cell as HTMLElement;
            if (
              !cellEl.hasAttribute('data-mpx-grid-empty-cell') &&
              !cellEl.hasAttribute('data-mpx-block') &&
              cellEl.tagName.toLowerCase() !== 'form' &&
              cellEl.tagName.toLowerCase() !== 'table' &&
              !cellEl.querySelector('table, form')
            ) {
              cellEl.setAttribute('data-mpx-block', 'section');
            }
          });
        }
      } else {
        const gridWrapper = doc.createElement('div');
        gridWrapper.setAttribute('data-mpx-grid', 'true');
        gridWrapper.setAttribute('data-mpx-grid-rows', '1');
        gridWrapper.setAttribute('data-mpx-grid-cols', '1');
        gridWrapper.className = 'mt-6 grid grid-cols-1 gap-4';
        child.classList.remove('mt-6');
        blocksContainer.insertBefore(gridWrapper, child);
        gridWrapper.appendChild(child);
      }
    }
  }

  protected insertHtmlBlock(
    blockType:
      | 'grid'
      | 'hero'
      | 'kpi'
      | 'table'
      | 'form'
      | 'section'
      | 'alert'
      | 'quick-actions',
    insertAtIndex?: number,
    targetEmptyCellInfo?: { gridIdx: number; cellIdx: number },
  ): void {
    const defaultCol = this.inferPageDefaultCollection();
    const blocks: Record<
      | 'grid'
      | 'hero'
      | 'kpi'
      | 'table'
      | 'form'
      | 'section'
      | 'alert'
      | 'quick-actions',
      string
    > = {
      grid: `\n<div data-mpx-grid="true" data-mpx-grid-rows="2" data-mpx-grid-cols="2" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">\n  <div data-mpx-grid-empty-cell="true" class="rounded-2xl p-5"></div>\n  <div data-mpx-grid-empty-cell="true" class="rounded-2xl p-5"></div>\n  <div data-mpx-grid-empty-cell="true" class="rounded-2xl p-5"></div>\n  <div data-mpx-grid-empty-cell="true" class="rounded-2xl p-5"></div>\n</div>\n`,
      hero: `\n<div data-mpx-block="hero" class="rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm">\n  <div class="inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Módulo Ativo</div>\n  <h1 class="mt-3 text-2xl font-bold text-neutral-12">Título Principal da Página</h1>\n  <p class="mt-1 text-sm text-neutral-a11">Subtítulo explicativo desta área da aplicação.</p>\n</div>\n`,
      kpi: `\n<div data-mpx-block="kpi" data-mpx-grid="true" data-mpx-grid-rows="1" data-mpx-grid-cols="3" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">\n  <div data-mpx-kpi-mode="sum" data-mpx-kpi-field="valor" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Total Financeiro</span>\n    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-neutral-12">R$ 24.670,00</div>\n  </div>\n  <div data-mpx-kpi-mode="count" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Total de Registros</span>\n    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-jade-a11">3 registro(s)</div>\n  </div>\n  <div data-mpx-kpi-mode="pending" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Pendentes de Aprovação</span>\n    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-amber-a11">1 pendente(s)</div>\n  </div>\n</div>\n`,
      table: `\n<div data-mpx-block="table" data-mpx-collection="${defaultCol}" class="mt-6 overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">\n  <table data-mpx-collection="${defaultCol}" class="w-full text-left text-sm">\n    <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">\n      <tr>\n        <th data-mpx-field="codigo" class="px-4 py-3">Código</th>\n        <th data-mpx-field="titulo" class="px-4 py-3">Título</th>\n        <th data-mpx-field="categoria" class="px-4 py-3">Categoria</th>\n        <th data-mpx-field="vencimento" class="px-4 py-3">Vencimento</th>\n        <th data-mpx-field="valor" class="px-4 py-3">Valor</th>\n        <th data-mpx-field="status" class="px-4 py-3">Status</th>\n      </tr>\n    </thead>\n    <tbody class="divide-y divide-neutral-a3">\n      <tr>\n        <td class="px-4 py-3 font-mono text-xs">#001</td>\n        <td class="px-4 py-3 font-medium text-neutral-12">Fatura Servidores Cloud AWS</td>\n        <td class="px-4 py-3 text-neutral-11">Infraestrutura Cloud</td>\n        <td class="px-4 py-3 text-neutral-11">2026-11-15</td>\n        <td class="px-4 py-3 font-semibold text-neutral-12">R$ 14.850,00</td>\n        <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Pago</span></td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n`,
      form: `\n<form data-mpx-block="form" data-mpx-collection="${defaultCol}" class="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6">\n  <h3 class="text-lg font-bold text-neutral-12">Novo Registro</h3>\n  <div data-mpx-form-grid class="grid grid-cols-12 gap-4">\n    <label data-mpx-col-span="6" class="col-span-12 sm:col-span-6 w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Título *\n      <input type="text" name="titulo" data-mpx-field="titulo" data-mpx-type="text" required placeholder="Ex: Fatura Servidores Cloud..." class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Categoria\n      <select name="categoria" data-mpx-field="categoria" data-mpx-combo-key="categoria" data-mpx-type="select" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">\n        <option value="Infraestrutura Cloud">Infraestrutura Cloud</option>\n        <option value="Licenças de Software">Licenças de Software</option>\n        <option value="Serviços Contábeis">Serviços Contábeis</option>\n      </select>\n    </label>\n    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Valor (R$) *\n      <input type="text" name="valor" data-mpx-field="valor" data-mpx-type="currency" required placeholder="R$ 0,00" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n    <label data-mpx-col-span="4" class="col-span-12 sm:col-span-4 w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Vencimento\n      <input type="date" name="vencimento" data-mpx-field="vencimento" data-mpx-type="date" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n    <label data-mpx-col-span="4" class="col-span-12 sm:col-span-4 w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Forma de Pagamento\n      <select name="forma_pagamento" data-mpx-field="forma_pagamento" data-mpx-combo-key="forma_pagamento" data-mpx-type="select" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">\n        <option value="PIX Corporativo">PIX Corporativo</option>\n        <option value="Boleto Bancário">Boleto Bancário</option>\n        <option value="Transferência TED">Transferência TED</option>\n      </select>\n    </label>\n    <label data-mpx-col-span="4" class="col-span-12 sm:col-span-4 w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Status\n      <select name="status" data-mpx-field="status" data-mpx-combo-key="status" data-mpx-type="select" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">\n        <option value="Pendente">Pendente</option>\n        <option value="Aprovado">Aprovado</option>\n        <option value="Pago">Pago</option>\n      </select>\n    </label>\n  </div>\n  <div class="flex justify-end">\n    <button type="submit" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Salvar Registro</button>\n  </div>\n</form>\n`,
      section: `\n<div data-mpx-block="section" class="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6 shadow-sm">\n  <div>\n    <h3 class="text-lg font-bold text-neutral-12">Seção Personalizada</h3>\n    <p class="mt-1 text-xs text-neutral-a11">Arraste objetos da aba Objetos para dentro desta seção.</p>\n  </div>\n  <div data-mpx-objects-grid class="flex flex-wrap items-end gap-3 w-full"></div>\n</div>\n`,
      alert: `\n<div data-mpx-block="section" class="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-a6 bg-amber-a2 p-5">\n  <div>\n    <h3 class="text-sm font-bold text-amber-a11">Aviso Operacional Importante</h3>\n    <p class="mt-0.5 text-xs text-neutral-11">Confira os lançamentos pendentes de aprovação antes do fechamento diário.</p>\n  </div>\n  <span data-mpx-obj-type="badge" class="rounded-full bg-amber-a4 px-3 py-1 text-xs font-bold text-amber-a11">Atenção</span>\n</div>\n`,
      'quick-actions': `\n<div data-mpx-block="section" class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n  <div>\n    <h3 class="text-base font-bold text-neutral-12">Ações Rápidas da Página</h3>\n    <p class="text-xs text-neutral-a11">Clique em qualquer botão para configurar seu texto, estilo e ação.</p>\n  </div>\n  <div data-mpx-objects-grid class="flex flex-wrap items-center gap-2.5">\n    <button type="button" data-mpx-obj-type="button" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Nova Ação Principal</button>\n    <button type="button" data-mpx-obj-type="button" class="rounded-xl border border-neutral-a5 bg-neutral-2 px-4 py-2 text-xs font-semibold text-neutral-12">Exportar Dados</button>\n  </div>\n</div>\n`,
    };

    const doc = this.parseCurrentPageDom();
    const temp = doc.createElement('div');
    temp.innerHTML = blocks[blockType].trim();
    let newBlockEl = temp.firstElementChild as HTMLElement | null;
    if (!newBlockEl) {
      return;
    }

    const container = this.getTopLevelBlocksContainer(doc.body);
    const children = Array.from(container.children) as HTMLElement[];

    // Se o usuário soltou um bloco diretamente sobre uma Célula Vazia de um Grid existente (ex.: 3ª linha, 5ª coluna): preenche exatamente aquela célula!
    const markedEmptyCell = doc.body.querySelector(
      '[data-mpx-drop-target-cell="true"]',
    ) as HTMLElement | null;
    const activeGridEl =
      this.visualTargetType() === 'grid' ? children[this.visualGridBlockIndex()] : null;
    const fallbackEmptyCell =
      targetEmptyCellInfo && blockType !== 'grid'
        ? (children[targetEmptyCellInfo.gridIdx]?.children[
            targetEmptyCellInfo.cellIdx
          ] as HTMLElement | undefined)
        : (activeGridEl?.querySelector('[data-mpx-grid-empty-cell]') as HTMLElement | null);
    const cellToReplace = markedEmptyCell || fallbackEmptyCell;

    if (cellToReplace && cellToReplace.hasAttribute('data-mpx-grid-empty-cell') && blockType !== 'grid') {
      if (blockType === 'kpi') {
        const firstKpiCard = newBlockEl.firstElementChild as HTMLElement | null;
        if (firstKpiCard) {
          newBlockEl = firstKpiCard;
        }
      }
      const existingSpan = cellToReplace.getAttribute('data-mpx-col-span');
      if (existingSpan) {
        newBlockEl.setAttribute('data-mpx-col-span', existingSpan);
        newBlockEl.className = `${newBlockEl.className} ${this.getColSpanClassString(Number(existingSpan))}`.trim();
      }
      newBlockEl.classList.remove('mt-6');
      cellToReplace.replaceWith(newBlockEl);
      doc.body
        .querySelectorAll('[data-mpx-drop-target-cell]')
        .forEach((el) => el.removeAttribute('data-mpx-drop-target-cell'));
      this.commitVisualHtmlMutation(doc.body.innerHTML);
      this.visualInspectorTab.set('properties');
      return;
    }

    if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex < children.length) {
      container.insertBefore(newBlockEl, children[insertAtIndex]);
    } else {
      container.appendChild(newBlockEl);
    }

    const finalIdx = Array.from(container.children).indexOf(newBlockEl);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
    this.visualInspectorTab.set('properties');

    setTimeout(() => {
      if (blockType === 'grid') {
        this.selectVisualGrid(Math.max(0, finalIdx));
      } else if (blockType === 'form') {
        this.selectVisualForm(0);
      } else if (blockType === 'table') {
        this.selectVisualTable(0);
      } else if (blockType === 'kpi') {
        this.selectVisualKpi(0);
      } else if (blockType === 'hero') {
        this.selectVisualHero(0);
      } else {
        this.selectVisualSection(0);
      }
    }, 50);
  }

  // ============================================================================
  // MOTOR DO CONSTRUTOR VISUAL PARA LEIGOS (EDIÇÃO DIRETA NO PREVIEW SEM HTML)
  // ============================================================================

  private inferPageDefaultCollection(): string {
    const slug = (
      this.selectedPage()?.routePattern ||
      this.selectedPage()?.name ||
      ''
    ).toLowerCase();
    if (slug.includes('nota') || slug.includes('nf')) {
      return 'notas-fiscais';
    }
    if (slug.includes('fornecedor')) {
      return 'fornecedores';
    }
    return 'contas-pagar';
  }

  protected generateCompleteStarterTemplate(templateKind: 'contas-pagar' | 'notas-fiscais'): void {
    const isNF = templateKind === 'notas-fiscais';
    const colKey = isNF ? 'notas-fiscais' : 'contas-pagar';
    const badge = isNF ? 'Módulo Fiscal & Entrada' : 'Módulo Financeiro';
    const title = isNF ? 'Gestão de Notas Fiscais' : 'Contas a Pagar';
    const subtitle = isNF
      ? 'Cadastre notas fiscais, gerencie fornecedores e acompanhe os valores aprovados.'
      : 'Controle vencimentos, categorias, formas de pagamento e baixas financeiras.';

    const html = `
<div data-mpx-block="hero" class="rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm">
  <div class="inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">${badge}</div>
  <h1 class="mt-3 text-2xl font-bold text-neutral-12">${title}</h1>
  <p class="mt-1 text-sm text-neutral-a11">${subtitle}</p>
</div>

<div data-mpx-block="kpi" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
  <div data-mpx-kpi-mode="sum" data-mpx-kpi-field="valor" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
    <span class="text-xs font-medium text-neutral-a10">Volume Financeiro Total</span>
    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-neutral-12">R$ 24.670,00</div>
  </div>
  <div data-mpx-kpi-mode="count" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
    <span class="text-xs font-medium text-neutral-a10">${isNF ? 'Notas Lançadas' : 'Títulos Cadastrados'}</span>
    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-jade-a11">3 registro(s)</div>
  </div>
  <div data-mpx-kpi-mode="pending" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
    <span class="text-xs font-medium text-neutral-a10">Pendentes</span>
    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-amber-a11">1 pendente(s)</div>
  </div>
</div>

<form data-mpx-block="form" data-mpx-collection="${colKey}" class="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6">
  <h3 class="text-lg font-bold text-neutral-12">${isNF ? 'Lançar Nova Nota Fiscal' : 'Novo Lançamento no Contas a Pagar'}</h3>
  <div data-mpx-form-grid class="grid grid-cols-12 gap-4">
    <label data-mpx-col-span="4" class="col-span-12 sm:col-span-4 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      ${isNF ? 'Número da NF *' : 'Título / Descrição *'}
      <input type="text" name="${isNF ? 'numero_nf' : 'titulo'}" data-mpx-field="${isNF ? 'numero_nf' : 'titulo'}" data-mpx-type="text" required placeholder="${isNF ? 'Ex: NF-2026/00485' : 'Ex: Fatura Cloud AWS'}" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />
    </label>
    <label data-mpx-col-span="4" class="col-span-12 sm:col-span-4 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      Fornecedor *
      <select name="fornecedor" data-mpx-field="fornecedor" data-mpx-combo-key="fornecedor" data-mpx-type="select" required class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">
        <option value="Amazon AWS Brasil">Amazon AWS Brasil</option>
        <option value="Microsoft Cloud">Microsoft Cloud</option>
        <option value="Contabilidade Prime">Contabilidade Prime</option>
      </select>
    </label>
    <label data-mpx-col-span="4" class="col-span-12 sm:col-span-4 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      Categoria
      <select name="categoria" data-mpx-field="categoria" data-mpx-combo-key="categoria" data-mpx-type="select" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">
        <option value="Infraestrutura Cloud">Infraestrutura Cloud</option>
        <option value="Licenças de Software">Licenças de Software</option>
        <option value="Serviços Contábeis">Serviços Contábeis</option>
      </select>
    </label>
    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      ${isNF ? 'CNPJ do Emitente' : 'Forma de Pagamento'}
      ${
        isNF
          ? '<input type="text" name="cnpj" data-mpx-field="cnpj" data-mpx-type="text" placeholder="00.000.000/0001-00" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />'
          : '<select name="forma_pagamento" data-mpx-field="forma_pagamento" data-mpx-combo-key="forma_pagamento" data-mpx-type="select" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12"><option value="PIX Corporativo">PIX Corporativo</option><option value="Boleto Bancário">Boleto Bancário</option><option value="Transferência TED">Transferência TED</option></select>'
      }
    </label>
    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      ${isNF ? 'Data de Emissão' : 'Vencimento'}
      <input type="date" name="${isNF ? 'data_emissao' : 'vencimento'}" data-mpx-field="${isNF ? 'data_emissao' : 'vencimento'}" data-mpx-type="date" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />
    </label>
    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      Valor (R$) *
      <input type="text" name="valor" data-mpx-field="valor" data-mpx-type="currency" required placeholder="R$ 0,00" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />
    </label>
    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
      Status
      <select name="status" data-mpx-field="status" data-mpx-combo-key="status" data-mpx-type="select" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">
        <option value="Pendente">Pendente</option>
        <option value="Aprovado">Aprovado</option>
        <option value="Pago">Pago</option>
      </select>
    </label>
  </div>
  <div class="flex justify-end">
    <button type="submit" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Salvar Registro</button>
  </div>
</form>

<div data-mpx-block="table" data-mpx-collection="${colKey}" class="mt-6 overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">
  <table data-mpx-collection="${colKey}" class="w-full text-left text-sm">
    <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">
      <tr>
        <th data-mpx-field="codigo" class="px-4 py-3">Código</th>
        <th data-mpx-field="${isNF ? 'numero_nf' : 'titulo'}" class="px-4 py-3">${isNF ? 'Número da NF' : 'Título'}</th>
        <th data-mpx-field="fornecedor" class="px-4 py-3">Fornecedor</th>
        <th data-mpx-field="categoria" class="px-4 py-3">Categoria</th>
        <th data-mpx-field="${isNF ? 'data_emissao' : 'vencimento'}" class="px-4 py-3">${isNF ? 'Emissão' : 'Vencimento'}</th>
        <th data-mpx-field="valor" class="px-4 py-3">Valor</th>
        <th data-mpx-field="status" class="px-4 py-3">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-neutral-a3">
      <tr>
        <td class="px-4 py-3 font-mono text-xs">#001</td>
        <td class="px-4 py-3 font-medium text-neutral-12">${isNF ? 'NF-2026/00481' : 'Fatura Servidores Cloud AWS'}</td>
        <td class="px-4 py-3 text-neutral-11">Amazon AWS Brasil</td>
        <td class="px-4 py-3 text-neutral-11">Infraestrutura Cloud</td>
        <td class="px-4 py-3 text-neutral-11">${isNF ? '2026-11-02' : '2026-11-15'}</td>
        <td class="px-4 py-3 font-semibold text-neutral-12">R$ 14.850,00</td>
        <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Aprovado</span></td>
      </tr>
    </tbody>
  </table>
</div>
`;
    this.commitVisualHtmlMutation(formatHtmlPretty(html.trim()));
    if (this.studioViewMode() === 'code') {
      this.studioViewMode.set('preview');
    }
    setTimeout(() => {
      this.selectVisualField(0, 0);
    }, 50);
  }

  protected onVisualPreviewSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  protected onVisualPreviewClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!target || !canvas) {
      return;
    }

    // Bloqueia 100% qualquer redirecionamento por link <a> ou submit de <button> dentro do Preview
    const anchorOrButton = target.closest('a, button');
    if (anchorOrButton) {
      event.preventDefault();
    }

    this.visualInspectorTab.set('properties');

    // 0. Clicou diretamente na Moldura / Barra Superior de um Grid ([data-mpx-drag-block]) ou em um Espaço Vazio ([data-mpx-grid-empty-cell])?
    const emptyCellEl = target.closest('[data-mpx-grid-empty-cell]') as HTMLElement | null;
    if (target.hasAttribute('data-mpx-drag-block') || emptyCellEl) {
      const gridEl = (
        target.hasAttribute('data-mpx-drag-block')
          ? target
          : emptyCellEl?.closest('[data-mpx-drag-block]')
      ) as HTMLElement | null;
      if (gridEl) {
        event.stopPropagation();
        const blocksContainer = this.getTopLevelBlocksContainer(canvas);
        const gridIdx = Math.max(0, Array.from(blocksContainer.children).indexOf(gridEl));
        this.selectVisualGrid(gridIdx);
        return;
      }
    }

    // 1. Clicou em um Objeto explícito [data-mpx-obj-type] ou elemento de ação individual (button, a, img, badge)?
    const explicitObj = target.closest('[data-mpx-obj-type]') as HTMLElement | null;
    if (explicitObj) {
      event.stopPropagation();
      this.selectVisualObjectElement(explicitObj, canvas);
      return;
    }

    const standaloneBtnOrLinkOrImg = target.closest('button, a, img') as HTMLElement | null;
    if (standaloneBtnOrLinkOrImg && !standaloneBtnOrLinkOrImg.hasAttribute('data-mpx-combo-manage')) {
      event.stopPropagation();
      this.selectVisualObjectElement(standaloneBtnOrLinkOrImg, canvas);
      return;
    }

    // Se clicou diretamente em uma Etiqueta/Badge (ex: "Prioridade", "28 títulos", "DFe Online") fora do selo principal do Hero
    const badgeEl = target.closest('span.rounded-md, span.rounded-lg, span.rounded-full') as HTMLElement | null;
    const isHeroTopBadge = badgeEl && !!badgeEl.closest('[data-mpx-block="hero"], .rounded-3xl');
    if (badgeEl && !isHeroTopBadge) {
      event.stopPropagation();
      this.selectVisualObjectElement(badgeEl, canvas);
      return;
    }

    // 2. Clicou em um Campo (<label>) dentro de um <form>?
    const labelEl = target.closest('form label') as HTMLLabelElement | null;
    if (labelEl) {
      event.stopPropagation();
      const formEl = labelEl.closest('form')!;
      const allForms = Array.from(canvas.querySelectorAll('form'));
      const formIdx = Math.max(0, allForms.indexOf(formEl));
      const allLabels = Array.from(formEl.querySelectorAll('label'));
      const fieldIdx = Math.max(0, allLabels.indexOf(labelEl));
      this.selectVisualField(formIdx, fieldIdx);
      return;
    }

    // 3. Clicou em um <form> (fora de um label)?
    const formEl = target.closest('form') as HTMLFormElement | null;
    if (formEl) {
      event.stopPropagation();
      const allForms = Array.from(canvas.querySelectorAll('form'));
      const formIdx = Math.max(0, allForms.indexOf(formEl));
      this.selectVisualForm(formIdx);
      return;
    }

    // 4. Clicou em uma <table>?
    const tableEl = target.closest('table') as HTMLTableElement | null;
    if (tableEl) {
      event.stopPropagation();
      const allTables = Array.from(canvas.querySelectorAll('table'));
      const tableIdx = Math.max(0, allTables.indexOf(tableEl));
      this.selectVisualTable(tableIdx);
      return;
    }

    // 5. Clicou em um Card KPI (ou em seu Título, Valor ou Texto de rodapé)?
    const kpiGrid = target.closest(this.KPI_GRID_SELECTOR) as HTMLElement | null;
    if (kpiGrid) {
      event.stopPropagation();
      const cards = Array.from(kpiGrid.children) as HTMLElement[];
      const clickedCard = cards.find((c) => c.contains(target));
      const kpiIdx = clickedCard ? cards.indexOf(clickedCard) : 0;
      this.selectVisualKpi(Math.max(0, kpiIdx));
      return;
    }

    // 6. Clicou no Cabeçalho (Hero)?
    const heroEl = target.closest(
      '[data-mpx-block="hero"], .rounded-3xl',
    ) as HTMLElement | null;
    if (heroEl && heroEl.querySelector('h1')) {
      event.stopPropagation();
      this.selectVisualHero(0);
      return;
    }

    // 7. Clicou em uma Seção Personalizada?
    const sectionEl = target.closest('[data-mpx-block="section"]') as HTMLElement | null;
    if (sectionEl) {
      event.stopPropagation();
      const allSecs = Array.from(canvas.querySelectorAll('[data-mpx-block="section"]'));
      const secIdx = Math.max(0, allSecs.indexOf(sectionEl));
      this.selectVisualSection(secIdx);
      return;
    }

    // 8. Clicou em qualquer outro Título ou Texto (<h1..h4>, <p>) com borda de seleção?
    const textObjEl = target.closest('h1, h2, h3, h4, p') as HTMLElement | null;
    if (textObjEl) {
      event.stopPropagation();
      this.selectVisualObjectElement(textObjEl, canvas);
      return;
    }
  }

  protected selectVisualGrid(gridBlockIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const container = this.getTopLevelBlocksContainer(doc.body);
    const gridEl = container.children[gridBlockIdx] as HTMLElement | undefined;
    if (!gridEl) {
      return;
    }
    this.visualTargetType.set('grid');
    this.visualGridBlockIndex.set(gridBlockIdx);
    const cols = this.detectGridColumnsCount(gridEl);
    const totalCells = Math.max(1, gridEl.children.length);
    const rows =
      Number(gridEl.getAttribute('data-mpx-grid-rows')) || Math.max(1, Math.ceil(totalCells / cols));
    this.vGridCols.set(cols);
    this.vGridRows.set(rows);
  }

  protected selectParentGridOfCurrentBlock(): void {
    this.selectVisualGrid(this.visualGridBlockIndex());
  }

  private syncParentGridStateForBlock(doc: Document, blockEl: Element | null): void {
    if (!blockEl) return;
    const container = this.getTopLevelBlocksContainer(doc.body);
    let curr: HTMLElement | null = blockEl as HTMLElement;
    while (curr && curr.parentElement && curr.parentElement !== container) {
      curr = curr.parentElement;
    }
    if (curr && curr.parentElement === container) {
      const gIdx = Array.from(container.children).indexOf(curr);
      if (gIdx >= 0) {
        this.visualGridBlockIndex.set(gIdx);
        const cols = this.detectGridColumnsCount(curr);
        const rows =
          Number(curr.getAttribute('data-mpx-grid-rows')) ||
          Math.max(1, Math.ceil(curr.children.length / cols));
        this.vGridCols.set(cols);
        this.vGridRows.set(rows);
      }
    }
  }

  private detectGridColumnsCount(gridEl: HTMLElement): number {
    const attrCols = Number(gridEl.getAttribute('data-mpx-grid-cols'));
    if (attrCols >= 1 && attrCols <= 6) {
      return attrCols;
    }
    const cls = gridEl.className || '';
    if (cls.includes('grid-cols-6')) return 6;
    if (cls.includes('grid-cols-5')) return 5;
    if (cls.includes('grid-cols-4')) return 4;
    if (cls.includes('grid-cols-3')) return 3;
    if (cls.includes('grid-cols-2')) return 2;
    return 2;
  }

  protected applyVisualGridDimensions(deltaRows: number, deltaCols: number): void {
    const doc = this.parseCurrentPageDom();
    const container = this.getTopLevelBlocksContainer(doc.body);
    let gridEl = container.children[this.visualGridBlockIndex()] as HTMLElement | undefined;
    if (!gridEl || !gridEl.matches(this.MULTI_BLOCK_GRID_SELECTOR)) {
      gridEl = (doc.body.querySelector('[data-mpx-grid]') ||
        doc.body.querySelector(this.KPI_GRID_SELECTOR)) as HTMLElement | undefined;
    }
    if (!gridEl) {
      return;
    }

    const oldCols = this.detectGridColumnsCount(gridEl);
    const oldTotal = gridEl.children.length;
    const oldRows =
      Number(gridEl.getAttribute('data-mpx-grid-rows')) ||
      Math.max(1, Math.ceil(oldTotal / oldCols));

    const newRows = Math.max(1, Math.min(12, oldRows + deltaRows));
    const newCols = Math.max(1, Math.min(6, oldCols + deltaCols));

    // Constrói matriz antiga [r][c] preservando cada bloco em sua coordenada (Linha, Coluna)
    const oldChildren = Array.from(gridEl.children) as HTMLElement[];
    const matrix: (HTMLElement | null)[][] = [];
    for (let r = 0; r < oldRows; r++) {
      const rowArr: (HTMLElement | null)[] = [];
      for (let c = 0; c < oldCols; c++) {
        rowArr.push(oldChildren[r * oldCols + c] ?? null);
      }
      matrix.push(rowArr);
    }

    // Reconstrói o Grid com (newRows × newCols), gerando automaticamente os blocos vazios até a linha/coluna desejada
    const newElements: HTMLElement[] = [];
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const existing = matrix[r]?.[c] ?? null;
        if (existing) {
          newElements.push(existing);
        } else {
          const emptyCell = doc.createElement('div');
          emptyCell.setAttribute('data-mpx-grid-empty-cell', 'true');
          emptyCell.className = 'rounded-2xl p-5';
          newElements.push(emptyCell);
        }
      }
    }

    gridEl.innerHTML = '';
    newElements.forEach((el) => gridEl.appendChild(el));
    gridEl.setAttribute('data-mpx-grid', 'true');
    gridEl.setAttribute('data-mpx-grid-rows', String(newRows));
    gridEl.setAttribute('data-mpx-grid-cols', String(newCols));

    const colClassMap: Record<number, string> = {
      1: 'mt-6 grid grid-cols-1 gap-4',
      2: 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2',
      3: 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3',
      4: 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
      5: 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5',
      6: 'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-6',
    };
    gridEl.className = colClassMap[newCols] || colClassMap[2];
    gridEl.style.gridTemplateColumns = `repeat(${newCols}, minmax(0, 1fr))`;

    this.vGridRows.set(newRows);
    this.vGridCols.set(newCols);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected addEmptySlotToCurrentBlock(): void {
    const doc = this.parseCurrentPageDom();
    const type = this.visualTargetType();
    if (type === 'field' || type === 'form') {
      const forms = Array.from(doc.body.querySelectorAll('form'));
      const form = forms[this.visualFormIndex()] ?? forms[0];
      if (!form) return;
      const grid = this.upgradeFormGridTo12Cols(form);
      const span = type === 'field' ? this.vFieldColSpan() : 3;
      const emptySlot = doc.createElement('div');
      emptySlot.setAttribute('data-mpx-grid-empty-cell', 'true');
      emptySlot.setAttribute('data-mpx-col-span', String(span));
      emptySlot.className = `${this.getColSpanClassString(span)} rounded-xl p-3`;
      grid.appendChild(emptySlot);
      this.commitVisualHtmlMutation(doc.body.innerHTML);
      return;
    }
    if (type === 'grid' || type === 'kpi') {
      this.applyVisualGridDimensions(1, 0);
    }
  }

  protected selectVisualField(formIdx: number, fieldIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[formIdx] ?? forms[0];
    if (!form) {
      return;
    }
    const labels = Array.from(form.querySelectorAll('label'));
    const label = labels[fieldIdx] ?? labels[0];
    if (!label) {
      this.selectVisualForm(formIdx);
      return;
    }

    this.visualTargetType.set('field');
    this.visualFormIndex.set(formIdx);
    this.visualFieldIndex.set(labels.indexOf(label));

    const rawTitle = this.extractCleanLabelText(label);
    this.vFieldLabel.set(rawTitle || 'Campo');

    const ctrl = label.querySelector('input, select, textarea') as HTMLElement | null;
    const colSpan = this.detectElementColSpan(label);
    this.vFieldColSpan.set(colSpan);

    const isReq =
      ctrl?.hasAttribute('required') ||
      ctrl?.getAttribute('data-mpx-required') === 'true' ||
      rawTitle.endsWith('*');
    this.vFieldRequired.set(!!isReq);

    const fType = this.detectVisualFieldType(label, ctrl);
    this.vFieldType.set(fType);

    const key =
      ctrl?.getAttribute('data-mpx-field') ||
      ctrl?.getAttribute('name') ||
      this.runtimeStore.normalizeFieldKey(rawTitle);
    this.vFieldKey.set(key);

    this.vFieldPlaceholder.set(ctrl?.getAttribute('placeholder') || '');

    if (fType === 'select') {
      const domOpts = Array.from(label.querySelectorAll('select option'))
        .map((o) => (o.getAttribute('value') || o.textContent || '').trim())
        .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('selecione'));
      const opts = this.runtimeStore.getComboOptions(key, domOpts);
      this.vFieldOptions.set(opts);
    } else if (fType === 'radio') {
      const radios = Array.from(label.querySelectorAll('input[type="radio"]'));
      const opts = radios
        .map((r) => (r.getAttribute('value') || '').trim())
        .filter(Boolean);
      this.vFieldOptions.set(opts.length > 0 ? opts : ['Opção A', 'Opção B']);
    } else {
      this.vFieldOptions.set([]);
    }
  }

  protected selectVisualForm(formIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[formIdx] ?? forms[0];
    if (!form) {
      return;
    }

    this.visualTargetType.set('form');
    this.visualFormIndex.set(forms.indexOf(form));
    this.vBlockColSpan.set(this.detectElementColSpan(form as HTMLElement));
    this.syncParentGridStateForBlock(doc, form);

    const h3 = form.querySelector('h3, h2, h4');
    this.vFormTitle.set((h3?.textContent || 'Novo Registro').trim());

    const col = form.getAttribute('data-mpx-collection') || this.inferPageDefaultCollection();
    this.vFormCollection.set(col);

    const btn = Array.from(form.querySelectorAll('button')).find(
      (b) => !b.hasAttribute('data-mpx-combo-manage'),
    );
    this.vFormButtonText.set((btn?.textContent || 'Salvar Registro').trim());
  }

  protected selectVisualTable(tableIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const tables = Array.from(doc.body.querySelectorAll('table'));
    const table = tables[tableIdx] ?? tables[0];
    if (!table) {
      return;
    }

    this.visualTargetType.set('table');
    this.visualTableIndex.set(tables.indexOf(table));
    const tableBlockEl = (table.closest('[data-mpx-block="table"]') ||
      table.parentElement ||
      table) as HTMLElement;
    this.vBlockColSpan.set(this.detectElementColSpan(tableBlockEl));
    this.syncParentGridStateForBlock(doc, tableBlockEl);

    const wrapper = table.closest('[data-mpx-collection]');
    const col =
      table.getAttribute('data-mpx-collection') ||
      wrapper?.getAttribute('data-mpx-collection') ||
      this.inferPageDefaultCollection();
    this.vTableCollection.set(col);

    const ths = Array.from(table.querySelectorAll('thead th')).filter(
      (th) => !th.hasAttribute('data-mpx-actions-col'),
    );
    this.vTableColumns.set(
      ths.map((th) => {
        const header = (th.textContent || '').trim();
        const fieldKey =
          th.getAttribute('data-mpx-field') || this.runtimeStore.normalizeFieldKey(header);
        return { header, fieldKey };
      }),
    );
  }

  protected selectVisualKpi(kpiIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const grid = doc.body.querySelector(this.KPI_GRID_SELECTOR);
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.children) as HTMLElement[];
    const card = cards[kpiIdx] ?? cards[0];
    if (!card) {
      return;
    }

    this.visualTargetType.set('kpi');
    this.visualKpiIndex.set(cards.indexOf(card));
    this.vBlockColSpan.set(this.detectElementColSpan(card));

    const container = this.getTopLevelBlocksContainer(doc.body);
    const parentGridIdx = Array.from(container.children).indexOf(grid);
    if (parentGridIdx >= 0) {
      this.visualGridBlockIndex.set(parentGridIdx);
      const cols = this.detectGridColumnsCount(grid as HTMLElement);
      const rows =
        Number(grid.getAttribute('data-mpx-grid-rows')) ||
        Math.max(1, Math.ceil(cards.length / cols));
      this.vGridCols.set(cols);
      this.vGridRows.set(rows);
    }

    const span = card.querySelector('span');
    const badgeSpan = Array.from(
      card.querySelectorAll('span.rounded-md, span.rounded-full, span.rounded-lg, [data-mpx-kpi-badge]'),
    ).find((el) => el !== span) as HTMLElement | undefined;
    const valDiv = (card.querySelector('[data-mpx-kpi-value]') ||
      card.querySelector('.text-2xl, .text-xl')) as HTMLElement | null;
    const subEl =
      (card.querySelector('p, [data-mpx-kpi-subtitle]') as HTMLElement | null) ||
      (valDiv?.nextElementSibling?.tagName.toLowerCase() === 'span'
        ? (valDiv.nextElementSibling as HTMLElement)
        : null);

    this.vKpiTitle.set((span?.textContent || 'Indicador').trim());
    this.vKpiBadge.set((badgeSpan?.textContent || '').trim());
    this.vKpiValue.set((valDiv?.textContent || 'R$ 0,00').trim());
    this.vKpiSubtitle.set((subEl?.textContent || '').trim());

    const modeAttr = card.getAttribute('data-mpx-kpi-mode') as
      | 'sum'
      | 'count'
      | 'pending'
      | 'static'
      | null;
    this.vKpiMode.set(modeAttr || 'static');

    const cls = `${card.className || ''} ${valDiv?.className || ''} ${span?.className || ''}`;
    if (cls.includes('red')) {
      this.vKpiColor.set('red');
    } else if (cls.includes('jade')) {
      this.vKpiColor.set('jade');
    } else if (cls.includes('amber')) {
      this.vKpiColor.set('amber');
    } else if (cls.includes('primary') || cls.includes('violet')) {
      this.vKpiColor.set('violet');
    } else {
      this.vKpiColor.set('neutral');
    }
  }

  protected selectVisualHero(heroIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const hero =
      doc.body.querySelector('[data-mpx-block="hero"]') || doc.body.querySelector('.rounded-3xl');
    if (!hero) {
      return;
    }

    this.visualTargetType.set('hero');
    this.visualHeroIndex.set(heroIdx);
    this.vBlockColSpan.set(this.detectElementColSpan(hero as HTMLElement));
    this.syncParentGridStateForBlock(doc, hero);

    const badge = hero.querySelector('.rounded-full');
    const h1 = hero.querySelector('h1');
    const p = hero.querySelector('p');

    this.vHeroBadge.set((badge?.textContent || 'Módulo Ativo').trim());
    this.vHeroTitle.set((h1?.textContent || 'Título Principal').trim());
    this.vHeroSubtitle.set((p?.textContent || '').trim());
  }

  protected selectVisualSection(secIdx: number): void {
    const doc = this.parseCurrentPageDom();
    const secs = Array.from(doc.body.querySelectorAll('[data-mpx-block="section"]'));
    const sec = secs[secIdx] ?? secs[0];
    if (!sec) {
      return;
    }
    this.visualTargetType.set('section');
    this.visualSectionIndex.set(secs.indexOf(sec));
    this.vBlockColSpan.set(this.detectElementColSpan(sec as HTMLElement));
    this.syncParentGridStateForBlock(doc, sec);

    const h3 = sec.querySelector('h3, h2, h4');
    const p = sec.querySelector('p');
    this.vSectionTitle.set((h3?.textContent || 'Seção Personalizada').trim());
    this.vSectionSubtitle.set((p?.textContent || '').trim());
  }

  protected applyVisualSectionChanges(overrides?: { title?: string; subtitle?: string }): void {
    if (overrides?.title !== undefined) this.vSectionTitle.set(overrides.title);
    if (overrides?.subtitle !== undefined) this.vSectionSubtitle.set(overrides.subtitle);

    const doc = this.parseCurrentPageDom();
    const secs = Array.from(doc.body.querySelectorAll('[data-mpx-block="section"]'));
    const sec = secs[this.visualSectionIndex()] ?? secs[0];
    if (!sec) {
      return;
    }
    const h3 = sec.querySelector('h3, h2, h4');
    if (h3) h3.textContent = this.vSectionTitle();
    const p = sec.querySelector('p');
    if (p) p.textContent = this.vSectionSubtitle();
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  private readonly OBJECT_CANDIDATES_SELECTOR =
    '[data-mpx-obj-type], button:not([data-mpx-combo-manage]), a, img, span.rounded-md, span.rounded-full, span.rounded-lg, h1, h2, h3, h4, p';

  private ensureVisualObjectIdsInDom(doc: Document): void {
    let counter = 1;
    const candidates = doc.body.querySelectorAll(this.OBJECT_CANDIDATES_SELECTOR);
    candidates.forEach((el) => {
      if (!el.getAttribute('data-mpx-obj-id')) {
        el.setAttribute('data-mpx-obj-id', `obj-${counter}`);
      }
      counter++;
    });
  }

  private inferVisualObjectType(el: HTMLElement): VisualObjectType {
    const explicit = el.getAttribute('data-mpx-obj-type') as VisualObjectType | null;
    if (explicit) {
      return explicit;
    }
    const tag = el.tagName.toLowerCase();
    if (tag === 'button') return 'button';
    if (tag === 'a') return 'link';
    if (tag === 'img') return 'image';
    if (tag === 'select') return 'select';
    if (tag === 'input') {
      const t = (el.getAttribute('type') || 'text').toLowerCase();
      return t === 'checkbox' ? 'checkbox' : 'input';
    }
    if (tag === 'span') return 'badge';
    return 'heading';
  }

  protected selectVisualObjectElement(clickedInCanvas: HTMLElement, canvas: HTMLElement): void {
    const directId = clickedInCanvas.getAttribute('data-mpx-obj-id');
    const allObjsInCanvas = Array.from(
      canvas.querySelectorAll(this.OBJECT_CANDIDATES_SELECTOR),
    ) as HTMLElement[];
    const objIdx = Math.max(0, allObjsInCanvas.indexOf(clickedInCanvas));

    const doc = this.parseCurrentPageDom();
    this.ensureVisualObjectIdsInDom(doc);
    const allObjsInDoc = Array.from(
      doc.body.querySelectorAll(this.OBJECT_CANDIDATES_SELECTOR),
    ) as HTMLElement[];
    const docEl =
      (directId ? (doc.body.querySelector(`[data-mpx-obj-id="${directId}"]`) as HTMLElement | null) : null) ??
      allObjsInDoc[objIdx] ??
      allObjsInDoc[0];
    if (!docEl) {
      return;
    }

    const objId = docEl.getAttribute('data-mpx-obj-id') || `obj-${objIdx + 1}`;
    docEl.setAttribute('data-mpx-obj-id', objId);
    const objType = this.inferVisualObjectType(docEl);
    docEl.setAttribute('data-mpx-obj-type', objType);

    this.visualTargetType.set('object');
    this.visualSelectedObjectId.set(objId);
    this.visualObjectType.set(objType);

    this.readObjectPropertiesIntoSignals(docEl, objType);
  }

  private readObjectPropertiesIntoSignals(el: HTMLElement, objType: VisualObjectType): void {
    const span = this.detectElementColSpan(el);
    this.vObjColSpan.set(span);

    if (objType === 'image') {
      const img = (el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img')) as HTMLImageElement | null;
      this.vObjImageUrl.set(
        img?.getAttribute('src') ||
          'https://placehold.co/600x240/ede9fe/6d28d9?text=Morphus+Visual',
      );
      this.vObjLabel.set(img?.getAttribute('alt') || 'Imagem Ilustrativa');
      this.vObjImageWidth.set(img?.getAttribute('data-mpx-img-width') || '100%');
      return;
    }

    if (objType === 'input' || objType === 'select' || objType === 'checkbox') {
      const rawTitle = el.tagName.toLowerCase() === 'label' ? this.extractCleanLabelText(el) : (el.textContent || 'Campo').trim();
      this.vObjLabel.set(rawTitle || 'Campo');
      const ctrl = (el.querySelector('input, select, textarea') || el) as HTMLElement;
      this.vObjPlaceholder.set(ctrl.getAttribute('placeholder') || 'Digite aqui...');
      this.vObjRequired.set(ctrl.hasAttribute('required') || rawTitle.endsWith('*'));
      this.vObjInputKind.set((ctrl.getAttribute('data-mpx-type') as VisualFieldType) || 'text');
      this.vObjDefaultChecked.set(ctrl.hasAttribute('checked'));
      this.vObjSwitchStyle.set(el.getAttribute('data-mpx-switch') === 'true');
      if (objType === 'select') {
        const opts = Array.from(el.querySelectorAll('option'))
          .map((o) => (o.textContent || '').trim())
          .filter(Boolean);
        this.vObjOptions.set(opts.length > 0 ? opts : ['Opção 1', 'Opção 2']);
      }
      return;
    }

    this.vObjLabel.set((el.textContent || 'Texto').trim());

    if (objType === 'button') {
      const cls = el.className || '';
      if (cls.includes('bg-red')) this.vObjVariant.set('danger');
      else if (cls.includes('bg-jade')) this.vObjVariant.set('success');
      else if (cls.includes('border')) this.vObjVariant.set('outline');
      else if (cls.includes('bg-neutral')) this.vObjVariant.set('secondary');
      else this.vObjVariant.set('primary');

      const act = (el.getAttribute('data-mpx-action') as 'submit' | 'navigate' | 'modal' | 'reset') ||
        (el.getAttribute('type') === 'submit' ? 'submit' : 'navigate');
      this.vObjActionKind.set(act);
      this.vObjHref.set(el.getAttribute('data-mpx-href') || '/website/home');
      return;
    }

    if (objType === 'link') {
      this.vObjHref.set(el.getAttribute('href') || '/website/home');
      this.vObjOpenNewTab.set(el.getAttribute('target') === '_blank');
      return;
    }

    if (objType === 'badge') {
      const cls = el.className || '';
      if (cls.includes('jade')) this.vObjColorTone.set('jade');
      else if (cls.includes('amber')) this.vObjColorTone.set('amber');
      else if (cls.includes('red')) this.vObjColorTone.set('red');
      else if (cls.includes('neutral')) this.vObjColorTone.set('neutral');
      else this.vObjColorTone.set('violet');
      return;
    }

    if (objType === 'heading') {
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'p') {
        this.vObjTextSize.set(tag);
      } else {
        this.vObjTextSize.set('h2');
      }
      const cls = el.className || '';
      if (cls.includes('text-center')) this.vObjAlign.set('center');
      else if (cls.includes('text-right') || cls.includes('text-end')) this.vObjAlign.set('right');
      else this.vObjAlign.set('left');
    }
  }

  private saveCurrentObjectSnapshotToMemory(): void {
    const objId = this.visualSelectedObjectId();
    const objType = this.visualObjectType();
    if (!objId) return;

    const mapForObj = this.objectConfigMemory.get(objId) ?? {};
    mapForObj[objType] = {
      label: this.vObjLabel(),
      placeholder: this.vObjPlaceholder(),
      colSpan: this.vObjColSpan(),
      required: this.vObjRequired(),
      options: [...this.vObjOptions()],
      inputKind: this.vObjInputKind(),
      variant: this.vObjVariant(),
      actionKind: this.vObjActionKind(),
      href: this.vObjHref(),
      openNewTab: this.vObjOpenNewTab(),
      textSize: this.vObjTextSize(),
      align: this.vObjAlign(),
      colorTone: this.vObjColorTone(),
      imageUrl: this.vObjImageUrl(),
      imageWidth: this.vObjImageWidth(),
      defaultChecked: this.vObjDefaultChecked(),
      switchStyle: this.vObjSwitchStyle(),
    };
    this.objectConfigMemory.set(objId, mapForObj);
  }

  protected onChangeVisualObjectType(newType: VisualObjectType): void {
    const objId = this.visualSelectedObjectId();
    if (!objId) return;

    // 1. Salva a configuração atual na memória do tipo antigo antes de trocar
    this.saveCurrentObjectSnapshotToMemory();

    // 2. Verifica se o usuário já havia configurado este novo tipo antes para este mesmo objeto
    const savedSnap = this.objectConfigMemory.get(objId)?.[newType];
    this.visualObjectType.set(newType);

    if (savedSnap) {
      if (savedSnap.label !== undefined) this.vObjLabel.set(savedSnap.label);
      if (savedSnap.placeholder !== undefined) this.vObjPlaceholder.set(savedSnap.placeholder);
      if (savedSnap.colSpan !== undefined) this.vObjColSpan.set(savedSnap.colSpan);
      if (savedSnap.required !== undefined) this.vObjRequired.set(savedSnap.required);
      if (savedSnap.options !== undefined) this.vObjOptions.set([...savedSnap.options]);
      if (savedSnap.inputKind !== undefined) this.vObjInputKind.set(savedSnap.inputKind);
      if (savedSnap.variant !== undefined) this.vObjVariant.set(savedSnap.variant);
      if (savedSnap.actionKind !== undefined) this.vObjActionKind.set(savedSnap.actionKind);
      if (savedSnap.href !== undefined) this.vObjHref.set(savedSnap.href);
      if (savedSnap.openNewTab !== undefined) this.vObjOpenNewTab.set(savedSnap.openNewTab);
      if (savedSnap.textSize !== undefined) this.vObjTextSize.set(savedSnap.textSize);
      if (savedSnap.align !== undefined) this.vObjAlign.set(savedSnap.align);
      if (savedSnap.colorTone !== undefined) this.vObjColorTone.set(savedSnap.colorTone);
      if (savedSnap.imageUrl !== undefined) this.vObjImageUrl.set(savedSnap.imageUrl);
      if (savedSnap.imageWidth !== undefined) this.vObjImageWidth.set(savedSnap.imageWidth);
      if (savedSnap.defaultChecked !== undefined) this.vObjDefaultChecked.set(savedSnap.defaultChecked);
      if (savedSnap.switchStyle !== undefined) this.vObjSwitchStyle.set(savedSnap.switchStyle);
    } else if (newType === 'select') {
      if (this.vObjOptions().length === 0) {
        this.vObjOptions.set(['Opção 1', 'Opção 2', 'Opção 3']);
      }
      this.vObjColSpan.set(4);
    }

    this.applyVisualObjectChanges();
  }

  private applyFlexSpanWidthStyle(el: HTMLElement, span: number): void {
    el.classList.remove('w-full');
    el.classList.add('shrink-0');
    if (span === 3) {
      el.style.width = 'calc(25% - 0.75rem)';
      el.style.minWidth = '160px';
      el.style.maxWidth = '100%';
      el.style.flex = '0 0 auto';
    } else if (span === 4) {
      el.style.width = 'calc(33.333% - 0.75rem)';
      el.style.minWidth = '180px';
      el.style.maxWidth = '100%';
      el.style.flex = '0 0 auto';
    } else if (span === 6) {
      el.style.width = 'calc(50% - 0.75rem)';
      el.style.minWidth = '200px';
      el.style.maxWidth = '100%';
      el.style.flex = '0 0 auto';
    } else if (span === 8) {
      el.style.width = 'calc(66.666% - 0.75rem)';
      el.style.minWidth = '220px';
      el.style.maxWidth = '100%';
      el.style.flex = '0 0 auto';
    } else if (span === 9) {
      el.style.width = 'calc(75% - 0.75rem)';
      el.style.minWidth = '230px';
      el.style.maxWidth = '100%';
      el.style.flex = '0 0 auto';
    } else if (span === 12) {
      el.style.width = '100%';
      el.style.minWidth = '100%';
      el.style.flex = '0 0 100%';
    }
  }

  private repairSquishedObjectContainersInDom(doc: Document): void {
    doc.body
      .querySelectorAll('.grid-cols-12:not([data-mpx-form-grid]):not([data-mpx-grid])')
      .forEach((gridEl) => {
        const el = gridEl as HTMLElement;
        if (el.className.includes('lg:grid-cols-12')) {
          return;
        }
        el.className = 'flex flex-wrap items-end gap-3 w-full';
        Array.from(el.children).forEach((child) => {
          const c = child as HTMLElement;
          c.classList.add('shrink-0');
          const span = Number(c.getAttribute('data-mpx-col-span') || 0);
          if (span > 0) {
            this.applyFlexSpanWidthStyle(c, span);
          }
        });
      });
  }

  protected applyVisualBlockColSpan(span: number): void {
    this.vBlockColSpan.set(span);
    const doc = this.parseCurrentPageDom();
    const type = this.visualTargetType();
    let targetBlock: HTMLElement | null = null;

    if (type === 'kpi') {
      const grid = doc.body.querySelector(this.KPI_GRID_SELECTOR) as HTMLElement | null;
      targetBlock = (grid?.children[this.visualKpiIndex()] as HTMLElement) ?? null;
    } else if (type === 'table') {
      const table = doc.body.querySelectorAll('table')[this.visualTableIndex()];
      targetBlock = (table?.closest('[data-mpx-block="table"]') ||
        table?.parentElement ||
        table) as HTMLElement | null;
    } else if (type === 'form') {
      targetBlock = (doc.body.querySelectorAll('form')[this.visualFormIndex()] as HTMLElement) ?? null;
    } else if (type === 'section') {
      targetBlock =
        (doc.body.querySelectorAll('[data-mpx-block="section"]')[
          this.visualSectionIndex()
        ] as HTMLElement) ?? null;
    } else if (type === 'grid') {
      const container = this.getTopLevelBlocksContainer(doc.body);
      const gridEl = container.children[this.visualGridBlockIndex()] as HTMLElement | undefined;
      targetBlock = (gridEl?.children[this.visualGridCellIndex()] as HTMLElement) ?? null;
    }

    if (!targetBlock) {
      return;
    }

    const parent = targetBlock.parentElement as HTMLElement | null;
    if (!parent) {
      return;
    }

    // Se o bloco já está dentro de um Grid multi-bloco, converte o Grid para 12 colunas (Flex Row %) para respeitar 25%, 33%, 50%, 67%, 75%, 100%
    if (parent.matches(this.MULTI_BLOCK_GRID_SELECTOR)) {
      const defaultChildSpan = parent.className.includes('grid-cols-4')
        ? 3
        : parent.className.includes('grid-cols-3')
          ? 4
          : 6;
      Array.from(parent.children).forEach((child) => {
        const c = child as HTMLElement;
        const cSpan =
          Number(c.getAttribute('data-mpx-col-span')) ||
          (c.className.includes('col-span-2') ? 8 : defaultChildSpan);
        c.setAttribute('data-mpx-col-span', String(cSpan));
        c.className = c.className
          .replace(/\bcol-span-\d+\b/g, '')
          .replace(/\bsm:col-span-\d+\b/g, '')
          .replace(/\blg:col-span-\d+\b/g, '')
          .trim();
        c.className = `${c.className} ${this.getColSpanClassString(cSpan)}`.trim();
      });
      parent.setAttribute('data-mpx-grid', 'true');
      parent.style.removeProperty('grid-template-columns');
      parent.className = 'mt-6 grid grid-cols-12 gap-4';
    } else if (span < 12) {
      // Se era um bloco de linha inteira (100%) e o usuário reduziu para 25%..75%, envolve em um Grid 12-colunas com um Espaço Vazio complementar ao lado
      const wrapperGrid = doc.createElement('div');
      wrapperGrid.setAttribute('data-mpx-grid', 'true');
      wrapperGrid.className = 'mt-6 grid grid-cols-12 gap-4';
      parent.insertBefore(wrapperGrid, targetBlock);
      wrapperGrid.appendChild(targetBlock);

      const complementSpan = Math.max(3, 12 - span);
      const emptyCell = doc.createElement('div');
      emptyCell.setAttribute('data-mpx-grid-empty-cell', 'true');
      emptyCell.setAttribute('data-mpx-col-span', String(complementSpan));
      emptyCell.className = `${this.getColSpanClassString(complementSpan)} rounded-2xl p-5`;
      wrapperGrid.appendChild(emptyCell);
    }

    targetBlock.setAttribute('data-mpx-col-span', String(span));
    targetBlock.className = targetBlock.className
      .replace(/\bcol-span-\d+\b/g, '')
      .replace(/\bsm:col-span-\d+\b/g, '')
      .replace(/\blg:col-span-\d+\b/g, '')
      .trim();
    targetBlock.className = `${targetBlock.className} ${this.getColSpanClassString(span)}`.trim();

    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected applyVisualObjectChanges(overrides?: Partial<VisualObjectConfigSnapshot>): void {
    if (overrides?.label !== undefined) this.vObjLabel.set(overrides.label);
    if (overrides?.placeholder !== undefined) this.vObjPlaceholder.set(overrides.placeholder);
    if (overrides?.colSpan !== undefined) this.vObjColSpan.set(overrides.colSpan);
    if (overrides?.required !== undefined) this.vObjRequired.set(overrides.required);
    if (overrides?.options !== undefined) this.vObjOptions.set(overrides.options);
    if (overrides?.inputKind !== undefined) this.vObjInputKind.set(overrides.inputKind);
    if (overrides?.variant !== undefined) this.vObjVariant.set(overrides.variant);
    if (overrides?.actionKind !== undefined) this.vObjActionKind.set(overrides.actionKind);
    if (overrides?.href !== undefined) this.vObjHref.set(overrides.href);
    if (overrides?.openNewTab !== undefined) this.vObjOpenNewTab.set(overrides.openNewTab);
    if (overrides?.textSize !== undefined) this.vObjTextSize.set(overrides.textSize);
    if (overrides?.align !== undefined) this.vObjAlign.set(overrides.align);
    if (overrides?.colorTone !== undefined) this.vObjColorTone.set(overrides.colorTone);
    if (overrides?.imageUrl !== undefined) this.vObjImageUrl.set(overrides.imageUrl);
    if (overrides?.imageWidth !== undefined) this.vObjImageWidth.set(overrides.imageWidth);
    if (overrides?.defaultChecked !== undefined) this.vObjDefaultChecked.set(overrides.defaultChecked);
    if (overrides?.switchStyle !== undefined) this.vObjSwitchStyle.set(overrides.switchStyle);

    this.saveCurrentObjectSnapshotToMemory();

    const objId = this.visualSelectedObjectId();
    if (!objId) return;

    const doc = this.parseCurrentPageDom();
    this.ensureVisualObjectIdsInDom(doc);
    const targetEl = doc.body.querySelector(`[data-mpx-obj-id="${objId}"]`) as HTMLElement | null;
    if (!targetEl) return;

    const parentEl = targetEl.parentElement;
    const isInsideFormGrid = !!parentEl?.hasAttribute('data-mpx-form-grid');

    // Mantém o container pai como linha flexível (flex-wrap + w-full) sem jamais espremer os irmãos ao lado!
    if (
      parentEl &&
      parentEl !== doc.body &&
      !isInsideFormGrid &&
      (parentEl.className.includes('flex') ||
        parentEl.className.includes('grid-cols-12') ||
        parentEl.hasAttribute('data-mpx-objects-grid'))
    ) {
      parentEl.className = 'flex flex-wrap items-end gap-3 w-full';
      Array.from(parentEl.children).forEach((sib) => {
        (sib as HTMLElement).classList.add('shrink-0');
      });
    }

    const newEl = this.buildVisualObjectElement(doc, objId, this.visualObjectType());
    if (!isInsideFormGrid) {
      this.applyFlexSpanWidthStyle(newEl, this.vObjColSpan() || 4);
    }
    targetEl.replaceWith(newEl);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected addVisualObjectComboOption(): void {
    const val = this.vObjNewOption().trim();
    if (!val) return;
    const next = Array.from(new Set([...this.vObjOptions(), val]));
    this.vObjNewOption.set('');
    this.applyVisualObjectChanges({ options: next });
  }

  protected removeVisualObjectComboOption(opt: string): void {
    const next = this.vObjOptions().filter((o) => o !== opt);
    this.applyVisualObjectChanges({ options: next });
  }

  protected removeSelectedVisualObject(): void {
    const objId = this.visualSelectedObjectId();
    if (!objId) return;
    this.messageService.confirm(
      {
        severity: 'error',
        icon: 'trash',
        title: 'Excluir o Bloco?',
        detail: 'Deseja excluir este objeto? (Você pode usar Ctrl + Z para desfazer).',
        doubleCheck: true,
        doubleCheckLabel: 'Confirmo',
        confirmButtonText: 'Excluir',
        confirmButtonIcon: 'trash',
        cancelButtonText: 'Cancelar',
        cancelButtonIcon: 'arrow-left',
      },
      () => {
        const doc = this.parseCurrentPageDom();
        this.ensureVisualObjectIdsInDom(doc);
        doc.body.querySelector(`[data-mpx-obj-id="${objId}"]`)?.remove();
        this.visualTargetType.set(null);
        this.visualSelectedObjectId.set('');
        this.commitVisualHtmlMutation(doc.body.innerHTML);
      },
    );
  }

  protected insertVisualObjectFromPalette(objType: VisualObjectType, targetContainer?: HTMLElement): void {
    const doc = this.parseCurrentPageDom();
    this.ensureVisualObjectIdsInDom(doc);
    const objId = `obj-${Date.now().toString(36).slice(-5)}`;

    // Define defaults amigáveis para o novo objeto inserido
    const defaultLabels: Record<VisualObjectType, string> = {
      heading: 'Novo Título ou Texto',
      button: 'Confirmar Ação',
      input: 'Novo Campo',
      select: 'Selecione uma Opção',
      checkbox: 'Ativar Opção',
      badge: 'Ativo',
      link: 'Acessar Detalhes →',
      image: 'Banner Ilustrativo',
    };
    this.visualSelectedObjectId.set(objId);
    this.visualObjectType.set(objType);
    this.vObjLabel.set(defaultLabels[objType]);
    this.vObjColSpan.set(objType === 'heading' || objType === 'image' ? 12 : 6);

    const newEl = this.buildVisualObjectElement(doc, objId, objType);

    // Encontra o melhor bloco/container para inserir o objeto
    let container =
      (doc.body.querySelector('[data-mpx-objects-grid]') as HTMLElement | null) ||
      (doc.body.querySelector('[data-mpx-form-grid]') as HTMLElement | null) ||
      (doc.body.querySelector('[data-mpx-block="section"]') as HTMLElement | null) ||
      (doc.body.querySelector('form') as HTMLElement | null);

    if (!container) {
      const sec = doc.createElement('div');
      sec.setAttribute('data-mpx-block', 'section');
      sec.className =
        'mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6 shadow-sm';
      const grid = doc.createElement('div');
      grid.setAttribute('data-mpx-objects-grid', '');
      grid.className = 'grid grid-cols-12 items-center gap-4';
      sec.appendChild(grid);
      doc.body.appendChild(sec);
      container = grid;
    }

    container.appendChild(newEl);
    this.visualTargetType.set('object');
    this.visualInspectorTab.set('properties');
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  private buildVisualObjectElement(
    doc: Document,
    objId: string,
    objType: VisualObjectType,
  ): HTMLElement {
    const label = this.vObjLabel() || 'Objeto';
    const span = this.vObjColSpan() || 6;
    const spanCls = this.getColSpanClassString(span);
    const i18nKey = `${(this.entity().prefix || 'app').toLowerCase()}.obj.${this.runtimeStore.normalizeFieldKey(label)}`;

    if (objType === 'button') {
      const btn = doc.createElement('button');
      btn.setAttribute('type', this.vObjActionKind() === 'submit' ? 'submit' : 'button');
      btn.setAttribute('data-mpx-obj-id', objId);
      btn.setAttribute('data-mpx-obj-type', 'button');
      btn.setAttribute('data-mpx-col-span', String(span));
      btn.setAttribute('data-mpx-action', this.vObjActionKind());
      btn.setAttribute('data-mpx-href', this.vObjHref());
      btn.setAttribute('data-mpx-i18n', i18nKey);

      const variantMap: Record<string, string> = {
        primary: 'bg-primary-9 text-white hover:bg-primary-10',
        secondary: 'bg-neutral-3 text-neutral-12 hover:bg-neutral-4',
        outline: 'border border-primary-8 bg-transparent text-primary-11 hover:bg-primary-a2',
        danger: 'bg-red-9 text-white hover:bg-red-10',
        success: 'bg-jade-9 text-white hover:bg-jade-10',
      };
      btn.className = `${spanCls} inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold transition ${variantMap[this.vObjVariant()] || variantMap['primary']}`;
      btn.textContent = label;
      return btn;
    }

    if (objType === 'link') {
      const a = doc.createElement('a');
      a.setAttribute('href', this.vObjHref() || '/website/home');
      if (this.vObjOpenNewTab()) {
        a.setAttribute('target', '_blank');
      }
      a.setAttribute('data-mpx-obj-id', objId);
      a.setAttribute('data-mpx-obj-type', 'link');
      a.setAttribute('data-mpx-col-span', String(span));
      a.setAttribute('data-mpx-i18n', i18nKey);
      a.className = `${spanCls} inline-flex items-center gap-1.5 text-xs font-semibold text-primary-11 underline-offset-4 hover:underline`;
      a.textContent = label;
      return a;
    }

    if (objType === 'badge') {
      const badge = doc.createElement('span');
      badge.setAttribute('data-mpx-obj-id', objId);
      badge.setAttribute('data-mpx-obj-type', 'badge');
      badge.setAttribute('data-mpx-col-span', String(span));
      badge.setAttribute('data-mpx-i18n', i18nKey);
      const toneMap: Record<string, string> = {
        violet: 'bg-primary-a3 text-primary-11 border-primary-a5',
        jade: 'bg-jade-a3 text-jade-a11 border-jade-a5',
        amber: 'bg-amber-a3 text-amber-a11 border-amber-a5',
        red: 'bg-red-a3 text-red-a11 border-red-a5',
        neutral: 'bg-neutral-a3 text-neutral-11 border-neutral-a5',
      };
      badge.className = `inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${toneMap[this.vObjColorTone()] || toneMap['violet']}`;
      badge.textContent = label;
      return badge;
    }

    if (objType === 'image') {
      const wrap = doc.createElement('div');
      wrap.setAttribute('data-mpx-obj-id', objId);
      wrap.setAttribute('data-mpx-obj-type', 'image');
      wrap.setAttribute('data-mpx-col-span', String(span));
      wrap.className = `${spanCls} overflow-hidden rounded-2xl border border-neutral-a4`;
      const img = doc.createElement('img');
      img.setAttribute(
        'src',
        this.vObjImageUrl() || 'https://placehold.co/600x240/ede9fe/6d28d9?text=Morphus+Visual',
      );
      img.setAttribute('alt', label);
      img.setAttribute('data-mpx-img-width', this.vObjImageWidth() || '100%');
      img.style.width = this.vObjImageWidth() || '100%';
      img.className = 'h-auto rounded-2xl object-cover';
      wrap.appendChild(img);
      return wrap;
    }

    if (objType === 'input' || objType === 'select' || objType === 'checkbox') {
      const fieldKey = this.runtimeStore.normalizeFieldKey(label);
      const fieldType: VisualFieldType =
        objType === 'select'
          ? 'select'
          : objType === 'checkbox'
            ? 'checkbox'
            : this.vObjInputKind();
      const built = this.buildFormFieldElement(doc, {
        label,
        fieldKey,
        type: fieldType,
        colSpan: span,
        required: this.vObjRequired(),
        placeholder: this.vObjPlaceholder() || 'Digite aqui...',
        options: this.vObjOptions().length > 0 ? this.vObjOptions() : ['Opção 1', 'Opção 2'],
      });
      built.setAttribute('data-mpx-obj-id', objId);
      built.setAttribute('data-mpx-obj-type', objType);
      built.setAttribute('data-mpx-i18n', i18nKey);
      if (objType === 'checkbox' && this.vObjSwitchStyle()) {
        built.setAttribute('data-mpx-switch', 'true');
      }
      return built;
    }

    // heading / text
    const tag = this.vObjTextSize() || 'h2';
    const h = doc.createElement(tag);
    h.setAttribute('data-mpx-obj-id', objId);
    h.setAttribute('data-mpx-obj-type', 'heading');
    h.setAttribute('data-mpx-col-span', String(span));
    h.setAttribute('data-mpx-i18n', i18nKey);
    const sizeClsMap: Record<string, string> = {
      h1: 'text-2xl font-bold text-neutral-12',
      h2: 'text-lg font-bold text-neutral-12',
      h3: 'text-base font-semibold text-neutral-12',
      p: 'text-sm font-normal text-neutral-11',
    };
    const alignCls =
      this.vObjAlign() === 'center'
        ? 'text-center'
        : this.vObjAlign() === 'right'
          ? 'text-right'
          : 'text-left';
    h.className = `${spanCls} ${sizeClsMap[tag] || sizeClsMap['h2']} ${alignCls}`;
    h.textContent = label;
    return h;
  }

  protected applyVisualFieldChanges(overrides?: {
    label?: string;
    placeholder?: string;
    type?: VisualFieldType;
    colSpan?: number;
    required?: boolean;
    options?: string[];
  }): void {
    if (overrides?.label !== undefined) this.vFieldLabel.set(overrides.label);
    if (overrides?.placeholder !== undefined) this.vFieldPlaceholder.set(overrides.placeholder);
    if (overrides?.type !== undefined) this.vFieldType.set(overrides.type);
    if (overrides?.colSpan !== undefined) this.vFieldColSpan.set(overrides.colSpan);
    if (overrides?.required !== undefined) this.vFieldRequired.set(overrides.required);
    if (overrides?.options !== undefined) this.vFieldOptions.set(overrides.options);

    const doc = this.parseCurrentPageDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[this.visualFormIndex()] ?? forms[0];
    if (!form) {
      return;
    }

    // Garante que o container dos campos use grid de 12 colunas (para 25%, 33%, 50%, 75%, 100%)
    this.upgradeFormGridTo12Cols(form);

    const labels = Array.from(form.querySelectorAll('label'));
    const label = labels[this.visualFieldIndex()];
    if (!label) {
      return;
    }

    const cleanLabel = this.vFieldLabel().replace(/\*/g, '').trim() || 'Campo';
    const fieldKey = this.runtimeStore.normalizeFieldKey(cleanLabel);
    this.vFieldKey.set(fieldKey);

    const fType = this.vFieldType();
    const span = this.vFieldColSpan();
    const isReq = this.vFieldRequired();
    const placeholder =
      this.vFieldPlaceholder() ||
      (fType === 'currency' ? 'R$ 0,00' : 'Digite aqui...');

    let options = this.vFieldOptions();
    if ((fType === 'select' || fType === 'radio') && options.length === 0) {
      options = this.runtimeStore.getComboOptions(fieldKey, ['Opção 1', 'Opção 2', 'Opção 3']);
      this.vFieldOptions.set(options);
    }
    if (fType === 'select') {
      this.runtimeStore.saveComboOptions(fieldKey, options);
    }

    const newLabelEl = this.buildFormFieldElement(doc, {
      label: cleanLabel,
      fieldKey,
      type: fType,
      colSpan: span,
      required: isReq,
      placeholder,
      options,
    });

    label.replaceWith(newLabelEl);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected addComboOptionInInspector(): void {
    const val = this.vFieldNewOption().trim();
    if (!val) {
      return;
    }
    const next = Array.from(new Set([...this.vFieldOptions(), val]));
    this.vFieldNewOption.set('');
    this.applyVisualFieldChanges({ options: next });
  }

  protected removeComboOptionInInspector(opt: string): void {
    const next = this.vFieldOptions().filter((o) => o !== opt);
    this.applyVisualFieldChanges({ options: next });
  }

  protected addNewFieldToForm(): void {
    const doc = this.parseCurrentPageDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[this.visualFormIndex()] ?? forms[0];
    if (!form) {
      this.insertHtmlBlock('form');
      return;
    }

    const grid = this.upgradeFormGridTo12Cols(form);
    const count = grid.querySelectorAll('label').length + 1;
    const labelName = `Novo Campo ${count}`;
    const fieldKey = this.runtimeStore.normalizeFieldKey(labelName);

    const newField = this.buildFormFieldElement(doc, {
      label: labelName,
      fieldKey,
      type: 'text',
      colSpan: 6,
      required: false,
      placeholder: 'Digite aqui...',
      options: [],
    });

    grid.appendChild(newField);
    this.commitVisualHtmlMutation(doc.body.innerHTML);

    const newIdx = grid.querySelectorAll('label').length - 1;
    setTimeout(() => {
      this.selectVisualField(this.visualFormIndex(), newIdx);
    }, 30);
  }

  protected moveSelectedField(direction: -1 | 1): void {
    const doc = this.parseCurrentPageDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[this.visualFormIndex()] ?? forms[0];
    if (!form) {
      return;
    }
    const labels = Array.from(form.querySelectorAll('label'));
    const idx = this.visualFieldIndex();
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= labels.length) {
      return;
    }

    const currentEl = labels[idx];
    const targetEl = labels[targetIdx];
    const parent = currentEl.parentElement;
    if (!parent) {
      return;
    }

    if (direction === -1) {
      parent.insertBefore(currentEl, targetEl);
    } else {
      parent.insertBefore(targetEl, currentEl);
    }

    this.visualFieldIndex.set(targetIdx);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected removeSelectedField(): void {
    this.messageService.confirm(
      {
        severity: 'error',
        icon: 'trash',
        title: 'Excluir o Bloco?',
        detail: 'Deseja excluir este campo do formulário? (Você pode usar Ctrl + Z para desfazer).',
        doubleCheck: true,
        doubleCheckLabel: 'Confirmo',
        confirmButtonText: 'Excluir',
        confirmButtonIcon: 'trash',
        cancelButtonText: 'Cancelar',
        cancelButtonIcon: 'arrow-left',
      },
      () => {
        const doc = this.parseCurrentPageDom();
        const forms = Array.from(doc.body.querySelectorAll('form'));
        const form = forms[this.visualFormIndex()] ?? forms[0];
        if (!form) {
          return;
        }
        const labels = Array.from(form.querySelectorAll('label'));
        const label = labels[this.visualFieldIndex()];
        if (!label) {
          return;
        }
        label.remove();
        this.commitVisualHtmlMutation(doc.body.innerHTML);

        const remaining = form.querySelectorAll('label').length;
        if (remaining > 0) {
          this.selectVisualField(this.visualFormIndex(), Math.max(0, this.visualFieldIndex() - 1));
        } else {
          this.selectVisualForm(this.visualFormIndex());
        }
      },
    );
  }

  protected applyVisualFormChanges(overrides?: {
    title?: string;
    collection?: string;
    buttonText?: string;
  }): void {
    if (overrides?.title !== undefined) this.vFormTitle.set(overrides.title);
    if (overrides?.collection !== undefined) this.vFormCollection.set(overrides.collection);
    if (overrides?.buttonText !== undefined) this.vFormButtonText.set(overrides.buttonText);

    const doc = this.parseCurrentPageDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[this.visualFormIndex()] ?? forms[0];
    if (!form) {
      return;
    }

    form.setAttribute('data-mpx-collection', this.vFormCollection());
    const h3 = form.querySelector('h3, h2, h4');
    if (h3) {
      h3.textContent = this.vFormTitle();
    }
    const btn = Array.from(form.querySelectorAll('button')).find(
      (b) => !b.hasAttribute('data-mpx-combo-manage'),
    );
    if (btn) {
      btn.textContent = this.vFormButtonText();
    }

    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected syncTableWithFormFields(): void {
    const doc = this.parseCurrentPageDom();
    const form = doc.body.querySelector('form');
    const table = doc.body.querySelectorAll('table')[this.visualTableIndex()] ?? doc.body.querySelector('table');
    if (!form || !table) {
      this.messageService.showWarn(
        'Certifique-se de que a página possui um Formulário e uma Tabela para espelhar as colunas.',
      );
      return;
    }

    const formCol = form.getAttribute('data-mpx-collection') || this.inferPageDefaultCollection();
    table.setAttribute('data-mpx-collection', formCol);
    const wrapper = table.closest('[data-mpx-block="table"]');
    wrapper?.setAttribute('data-mpx-collection', formCol);

    const labels = Array.from(form.querySelectorAll('label'));
    const cols: { header: string; key: string }[] = [{ header: 'Código', key: 'codigo' }];
    for (const label of labels) {
      const cleanTitle = this.extractCleanLabelText(label);
      const ctrl = label.querySelector('input, select, textarea');
      const key =
        ctrl?.getAttribute('data-mpx-field') ||
        ctrl?.getAttribute('name') ||
        this.runtimeStore.normalizeFieldKey(cleanTitle);
      if (cleanTitle) {
        cols.push({ header: cleanTitle, key });
      }
    }

    this.rebuildTableColumnsInDom(doc, table, cols);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
    this.selectVisualTable(this.visualTableIndex());
  }

  protected applyVisualTableCollection(collection: string): void {
    this.vTableCollection.set(collection);
    const doc = this.parseCurrentPageDom();
    const table =
      doc.body.querySelectorAll('table')[this.visualTableIndex()] ??
      doc.body.querySelector('table');
    if (!table) {
      return;
    }
    table.setAttribute('data-mpx-collection', collection);
    table.closest('[data-mpx-block="table"]')?.setAttribute('data-mpx-collection', collection);
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected addTableColumnInInspector(): void {
    const header = this.vTableNewColHeader().trim();
    if (!header) {
      return;
    }
    const key = this.runtimeStore.normalizeFieldKey(header);
    const nextCols = [...this.vTableColumns(), { header, fieldKey: key }];
    this.vTableNewColHeader.set('');
    this.updateTableColumnsList(nextCols);
  }

  protected removeTableColumnInInspector(idx: number): void {
    const nextCols = this.vTableColumns().filter((_, i) => i !== idx);
    this.updateTableColumnsList(nextCols);
  }

  protected moveTableColumnInInspector(idx: number, direction: -1 | 1): void {
    const cols = [...this.vTableColumns()];
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= cols.length) {
      return;
    }
    const [moved] = cols.splice(idx, 1);
    cols.splice(target, 0, moved);
    this.updateTableColumnsList(cols);
  }

  private updateTableColumnsList(cols: { header: string; fieldKey: string }[]): void {
    const doc = this.parseCurrentPageDom();
    const table =
      doc.body.querySelectorAll('table')[this.visualTableIndex()] ??
      doc.body.querySelector('table');
    if (!table) {
      return;
    }
    this.vTableColumns.set(cols);
    this.rebuildTableColumnsInDom(
      doc,
      table,
      cols.map((c) => ({ header: c.header, key: c.fieldKey })),
    );
    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected applyVisualKpiChanges(overrides?: {
    title?: string;
    badge?: string;
    value?: string;
    subtitle?: string;
    mode?: 'sum' | 'count' | 'pending' | 'static';
    color?: 'neutral' | 'jade' | 'amber' | 'violet' | 'red';
  }): void {
    if (overrides?.title !== undefined) this.vKpiTitle.set(overrides.title);
    if (overrides?.badge !== undefined) this.vKpiBadge.set(overrides.badge);
    if (overrides?.value !== undefined) this.vKpiValue.set(overrides.value);
    if (overrides?.subtitle !== undefined) this.vKpiSubtitle.set(overrides.subtitle);
    if (overrides?.mode !== undefined) this.vKpiMode.set(overrides.mode);
    if (overrides?.color !== undefined) this.vKpiColor.set(overrides.color);

    const doc = this.parseCurrentPageDom();
    const grid = doc.body.querySelector(this.KPI_GRID_SELECTOR);
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.children) as HTMLElement[];
    const card = cards[this.visualKpiIndex()] ?? cards[0];
    if (!card) {
      return;
    }

    card.setAttribute('data-mpx-kpi-mode', this.vKpiMode());
    const spans = Array.from(card.querySelectorAll('span')) as HTMLElement[];
    const titleSpan = spans[0];
    const badgeSpan = spans[1];
    if (titleSpan) {
      titleSpan.textContent = this.vKpiTitle();
    }
    if (badgeSpan && overrides?.badge !== undefined) {
      badgeSpan.textContent = this.vKpiBadge();
    }

    const valDiv = (card.querySelector('[data-mpx-kpi-value]') ||
      card.querySelector('.text-2xl, .text-xl')) as HTMLElement | null;
    if (valDiv) {
      valDiv.setAttribute('data-mpx-kpi-value', '');
      const colorMap: Record<string, string> = {
        neutral: 'text-neutral-12',
        jade: 'text-jade-a11',
        amber: 'text-amber-a11',
        violet: 'text-primary-11',
        red: 'text-red-a11',
      };
      const sizeClass = valDiv.className.includes('text-xl') ? 'text-xl' : 'text-2xl';
      valDiv.className = `mt-3 ${sizeClass} font-bold tracking-tight ${colorMap[this.vKpiColor()] || 'text-neutral-12'}`;
      if (this.vKpiMode() === 'static') {
        valDiv.textContent = this.vKpiValue();
      } else if (this.vKpiMode() === 'sum') {
        valDiv.textContent = 'R$ 24.670,00 (Soma Automática)';
      } else if (this.vKpiMode() === 'count') {
        valDiv.textContent = '3 registro(s)';
      } else {
        valDiv.textContent = '1 pendente(s)';
      }
    }

    const subEl = card.querySelector('p') as HTMLElement | null;
    if (subEl && overrides?.subtitle !== undefined) {
      subEl.textContent = this.vKpiSubtitle();
    } else if (!subEl && overrides?.subtitle) {
      const p = doc.createElement('p');
      p.className = 'mt-1.5 text-xs text-neutral-a11';
      p.textContent = this.vKpiSubtitle();
      card.appendChild(p);
    }

    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected applyVisualHeroChanges(overrides?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  }): void {
    if (overrides?.badge !== undefined) this.vHeroBadge.set(overrides.badge);
    if (overrides?.title !== undefined) this.vHeroTitle.set(overrides.title);
    if (overrides?.subtitle !== undefined) this.vHeroSubtitle.set(overrides.subtitle);

    const doc = this.parseCurrentPageDom();
    const hero =
      doc.body.querySelector('[data-mpx-block="hero"]') || doc.body.querySelector('.rounded-3xl');
    if (!hero) {
      return;
    }

    const badge = hero.querySelector('.rounded-full');
    if (badge) badge.textContent = this.vHeroBadge();
    const h1 = hero.querySelector('h1');
    if (h1) h1.textContent = this.vHeroTitle();
    const p = hero.querySelector('p');
    if (p) p.textContent = this.vHeroSubtitle();

    this.commitVisualHtmlMutation(doc.body.innerHTML);
  }

  protected removeSelectedVisualBlock(deleteWholeGrid = false): void {
    const type = this.visualTargetType();
    if (!type) return;
    if (type === 'object') {
      this.removeSelectedVisualObject();
      return;
    }
    if (type === 'field') {
      this.removeSelectedField();
      return;
    }

    const isSetDeletion = type === 'grid' || deleteWholeGrid;
    const confirmTitle = isSetDeletion ? 'Excluir o conjunto de blocos?' : 'Excluir o Bloco?';
    const confirmDetail = isSetDeletion
      ? 'Deseja excluir este conjunto inteiro de blocos da página? (Use Ctrl + Z para desfazer).'
      : 'Deseja excluir este bloco? (Use Ctrl + Z para desfazer).';

    this.messageService.confirm(
      {
        severity: 'error',
        icon: 'trash',
        title: confirmTitle,
        detail: confirmDetail,
        doubleCheck: true,
        doubleCheckLabel: 'Confirmo',
        confirmButtonText: 'Excluir',
        confirmButtonIcon: 'trash',
        cancelButtonText: 'Cancelar',
        cancelButtonIcon: 'arrow-left',
      },
      () => {
        const doc = this.parseCurrentPageDom();
        if (type === 'grid') {
          const container = this.getTopLevelBlocksContainer(doc.body);
          container.children[this.visualGridBlockIndex()]?.remove();
        } else if (type === 'form') {
          doc.body.querySelectorAll('form')[this.visualFormIndex()]?.remove();
        } else if (type === 'table') {
          const table = doc.body.querySelectorAll('table')[this.visualTableIndex()];
          const tableCard =
            (table?.closest('[data-mpx-block="table"]') as HTMLElement | null) ||
            (table?.closest('.rounded-2xl') as HTMLElement | null) ||
            (table?.parentElement as HTMLElement | null) ||
            (table as HTMLElement | null);
          if (tableCard) {
            const parentGrid = tableCard.parentElement;
            if (parentGrid && parentGrid.matches(this.MULTI_BLOCK_GRID_SELECTOR)) {
              const emptyCell = doc.createElement('div');
              emptyCell.setAttribute('data-mpx-grid-empty-cell', 'true');
              emptyCell.className = 'rounded-2xl p-5';
              tableCard.replaceWith(emptyCell);
            } else {
              tableCard.remove();
            }
          }
        } else if (type === 'kpi') {
          const grid = doc.body.querySelector(this.KPI_GRID_SELECTOR);
          if (deleteWholeGrid) {
            grid?.remove();
          } else {
            const card = grid?.children[this.visualKpiIndex()] as HTMLElement | undefined;
            if (card && grid) {
              const emptyCell = doc.createElement('div');
              emptyCell.setAttribute('data-mpx-grid-empty-cell', 'true');
              emptyCell.className = 'rounded-2xl p-5';
              card.replaceWith(emptyCell);
            }
          }
        } else if (type === 'hero') {
          const hero =
            doc.body.querySelector('[data-mpx-block="hero"]') ||
            doc.body.querySelector('.rounded-3xl');
          hero?.remove();
        } else if (type === 'section') {
          doc.body.querySelectorAll('[data-mpx-block="section"]')[this.visualSectionIndex()]?.remove();
        }
        this.visualTargetType.set(null);
        this.commitVisualHtmlMutation(doc.body.innerHTML);
      },
    );
  }

  private parseCurrentPageDom(): Document {
    const parser = new DOMParser();
    const raw = this.selectedPage()?.htmlContent || '';
    const doc = parser.parseFromString(raw, 'text/html');
    this.repairSquishedObjectContainersInDom(doc);
    this.ensureTopLevelGridsInDom(doc);
    return doc;
  }

  private commitVisualHtmlMutation(rawHtml: string): void {
    const parser = new DOMParser();
    const cleanDoc = parser.parseFromString(rawHtml, 'text/html');
    cleanDoc.body
      .querySelectorAll(
        '[data-mpx-drag-block], [data-mpx-grid-label], [data-mpx-block-label], [data-mpx-drag-kpi], [data-mpx-drag-cell], [data-mpx-parent-grid], [data-mpx-drag-field], [data-mpx-parent-form], [draggable]',
      )
      .forEach((el) => {
        el.removeAttribute('data-mpx-drag-block');
        el.removeAttribute('data-mpx-grid-label');
        el.removeAttribute('data-mpx-block-label');
        el.removeAttribute('data-mpx-drag-kpi');
        el.removeAttribute('data-mpx-drag-cell');
        el.removeAttribute('data-mpx-parent-grid');
        el.removeAttribute('data-mpx-drag-field');
        el.removeAttribute('data-mpx-parent-form');
        if (el.tagName.toLowerCase() !== 'a' && el.tagName.toLowerCase() !== 'img') {
          el.removeAttribute('draggable');
        }
      });
    const pretty = formatHtmlPretty(cleanDoc.body.innerHTML);
    this.updateSelectedPageField('htmlContent', pretty);
  }

  private upgradeFormGridTo12Cols(form: HTMLElement): HTMLElement {
    let grid =
      (form.querySelector('[data-mpx-form-grid]') as HTMLElement | null) ||
      (form.querySelector('.grid') as HTMLElement | null);
    if (!grid) {
      grid = form.ownerDocument.createElement('div');
      form.insertBefore(grid, form.lastElementChild);
    }
    grid.setAttribute('data-mpx-form-grid', '');
    grid.className = 'grid grid-cols-12 gap-4';

    const labels = Array.from(grid.querySelectorAll('label'));
    for (const lbl of labels) {
      const span = this.detectElementColSpan(lbl);
      lbl.setAttribute('data-mpx-col-span', String(span));
      if (!lbl.className.includes('sm:col-span-')) {
        lbl.className = `${this.getColSpanClassString(span)} flex flex-col gap-1 text-xs font-semibold text-neutral-a11`;
      }
    }
    return grid;
  }

  private detectElementColSpan(el: HTMLElement): number {
    const attr = Number(el.getAttribute('data-mpx-col-span'));
    if ([3, 4, 6, 8, 9, 12].includes(attr)) {
      return attr;
    }
    const cls = el.className || '';
    if (cls.includes('sm:col-span-3')) return 3;
    if (cls.includes('sm:col-span-4')) return 4;
    if (cls.includes('sm:col-span-6')) return 6;
    if (cls.includes('sm:col-span-8') || cls.includes('lg:col-span-2')) return 8;
    if (cls.includes('sm:col-span-9')) return 9;
    if (cls.includes('sm:col-span-12')) return 12;
    const parentCls = el.parentElement?.className || '';
    if (parentCls.includes('grid-cols-4')) return 3;
    if (parentCls.includes('grid-cols-3')) return 4;
    if (parentCls.includes('grid-cols-2')) return 6;
    return 6;
  }

  private getColSpanClassString(span: number): string {
    if (span === 3) return 'col-span-12 sm:col-span-3';
    if (span === 4) return 'col-span-12 sm:col-span-4';
    if (span === 8) return 'col-span-12 sm:col-span-8';
    if (span === 9) return 'col-span-12 sm:col-span-9';
    if (span === 12) return 'col-span-12 sm:col-span-12';
    return 'col-span-12 sm:col-span-6';
  }

  private detectVisualFieldType(
    label: HTMLElement,
    ctrl: HTMLElement | null,
  ): VisualFieldType {
    if (!ctrl) return 'text';
    const explicit = ctrl.getAttribute('data-mpx-type') as VisualFieldType | null;
    if (explicit) return explicit;
    const tag = ctrl.tagName.toLowerCase();
    if (tag === 'select') return 'select';
    if (tag === 'textarea') return 'textarea';
    const typeAttr = (ctrl.getAttribute('type') || 'text').toLowerCase();
    if (typeAttr === 'date') return 'date';
    if (typeAttr === 'number') return 'number';
    if (typeAttr === 'checkbox') return 'checkbox';
    if (typeAttr === 'radio') return 'radio';
    if ((ctrl.getAttribute('placeholder') || '').includes('R$')) return 'currency';
    return 'text';
  }

  private extractCleanLabelText(label: HTMLElement): string {
    const clone = label.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, select, textarea, button, div, span').forEach((e) => e.remove());
    return (clone.textContent || '').replace(/\*/g, '').trim();
  }

  private buildFormFieldElement(
    doc: Document,
    cfg: {
      label: string;
      fieldKey: string;
      type: VisualFieldType;
      colSpan: number;
      required: boolean;
      placeholder: string;
      options: string[];
    },
  ): HTMLElement {
    const labelEl = doc.createElement('label');
    labelEl.setAttribute('data-mpx-col-span', String(cfg.colSpan));
    labelEl.className = `${this.getColSpanClassString(cfg.colSpan)} w-full flex flex-col gap-1 text-xs font-semibold text-neutral-a11`;

    const displayTitle = cfg.required ? `${cfg.label} *` : cfg.label;
    labelEl.appendChild(doc.createTextNode(`\n      ${displayTitle}\n      `));

    const inputClasses =
      'w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12';

    if (cfg.type === 'select') {
      const select = doc.createElement('select');
      select.setAttribute('name', cfg.fieldKey);
      select.setAttribute('data-mpx-field', cfg.fieldKey);
      select.setAttribute('data-mpx-combo-key', cfg.fieldKey);
      select.setAttribute('data-mpx-type', 'select');
      if (cfg.required) select.setAttribute('required', '');
      select.className = inputClasses;

      for (const optVal of cfg.options) {
        const opt = doc.createElement('option');
        opt.setAttribute('value', optVal);
        opt.textContent = optVal;
        select.appendChild(opt);
      }
      labelEl.appendChild(select);
    } else if (cfg.type === 'textarea') {
      const area = doc.createElement('textarea');
      area.setAttribute('name', cfg.fieldKey);
      area.setAttribute('data-mpx-field', cfg.fieldKey);
      area.setAttribute('data-mpx-type', 'textarea');
      area.setAttribute('rows', '3');
      area.setAttribute('placeholder', cfg.placeholder);
      if (cfg.required) area.setAttribute('required', '');
      area.className = inputClasses;
      labelEl.appendChild(area);
    } else if (cfg.type === 'checkbox') {
      const wrap = doc.createElement('div');
      wrap.className =
        'mt-1 flex h-10 items-center gap-2.5 rounded-xl border border-neutral-a5 px-3.5';
      const chk = doc.createElement('input');
      chk.setAttribute('type', 'checkbox');
      chk.setAttribute('name', cfg.fieldKey);
      chk.setAttribute('data-mpx-field', cfg.fieldKey);
      chk.setAttribute('data-mpx-type', 'checkbox');
      chk.className = 'size-4 accent-violet-600';
      const txt = doc.createElement('span');
      txt.className = 'text-sm font-medium text-neutral-12';
      txt.textContent = cfg.placeholder || 'Sim / Ativo';
      wrap.appendChild(chk);
      wrap.appendChild(txt);
      labelEl.appendChild(wrap);
    } else if (cfg.type === 'radio') {
      const wrap = doc.createElement('div');
      wrap.className =
        'mt-1 flex flex-wrap items-center gap-4 rounded-xl border border-neutral-a5 px-3.5 py-2';
      const radioOpts = cfg.options.length > 0 ? cfg.options : ['Sim', 'Não'];
      radioOpts.forEach((optText, i) => {
        const itemSpan = doc.createElement('span');
        itemSpan.className = 'inline-flex items-center gap-1.5 text-sm font-normal text-neutral-12';
        const rad = doc.createElement('input');
        rad.setAttribute('type', 'radio');
        rad.setAttribute('name', cfg.fieldKey);
        rad.setAttribute('data-mpx-field', cfg.fieldKey);
        rad.setAttribute('data-mpx-type', 'radio');
        rad.setAttribute('value', optText);
        if (i === 0) rad.setAttribute('checked', '');
        if (cfg.required) rad.setAttribute('required', '');
        rad.className = 'size-4 accent-violet-600';
        itemSpan.appendChild(rad);
        itemSpan.appendChild(doc.createTextNode(optText));
        wrap.appendChild(itemSpan);
      });
      labelEl.appendChild(wrap);
    } else {
      const inp = doc.createElement('input');
      const htmlInputType =
        cfg.type === 'date' ? 'date' : cfg.type === 'number' ? 'number' : 'text';
      inp.setAttribute('type', htmlInputType);
      inp.setAttribute('name', cfg.fieldKey);
      inp.setAttribute('data-mpx-field', cfg.fieldKey);
      inp.setAttribute('data-mpx-type', cfg.type);
      inp.setAttribute(
        'placeholder',
        cfg.type === 'currency' && !cfg.placeholder.includes('R$') ? 'R$ 0,00' : cfg.placeholder,
      );
      if (cfg.required) inp.setAttribute('required', '');
      inp.className = inputClasses;
      labelEl.appendChild(inp);
    }

    return labelEl;
  }

  private rebuildTableColumnsInDom(
    doc: Document,
    table: Element,
    cols: { header: string; key: string }[],
  ): void {
    let theadRow = table.querySelector('thead tr');
    if (!theadRow) {
      const thead = doc.createElement('thead');
      thead.className = 'border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11';
      theadRow = doc.createElement('tr');
      thead.appendChild(theadRow);
      table.prepend(thead);
    }
    theadRow.innerHTML = '';

    let tbodyRow = table.querySelector('tbody tr');
    if (!tbodyRow) {
      const tbody = table.querySelector('tbody') || doc.createElement('tbody');
      tbody.className = 'divide-y divide-neutral-a3';
      tbodyRow = doc.createElement('tr');
      tbody.appendChild(tbodyRow);
      table.appendChild(tbody);
    }
    tbodyRow.innerHTML = '';

    for (const col of cols) {
      const th = doc.createElement('th');
      th.setAttribute('data-mpx-field', col.key);
      th.className = 'px-4 py-3';
      th.textContent = col.header;
      theadRow.appendChild(th);

      const td = doc.createElement('td');
      td.className = 'px-4 py-3 text-sm text-neutral-12';
      if (col.key === 'codigo') {
        td.className = 'px-4 py-3 font-mono text-xs';
        td.textContent = '#001';
      } else if (col.key.includes('valor')) {
        td.className = 'px-4 py-3 font-semibold text-neutral-12';
        td.textContent = 'R$ 1.500,00';
      } else if (col.key.includes('status')) {
        td.innerHTML =
          '<span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Ativo</span>';
      } else {
        td.textContent = `Exemplo ${col.header}`;
      }
      tbodyRow.appendChild(td);
    }
  }

  private canvasDropTarget: {
    blockIdx: number;
    kpiIdx?: number;
    cellIdx?: number;
    fieldIdx?: number;
    objId?: string;
    emptyCellGridIdx?: number;
    emptyCellIdx?: number;
    position: 'before' | 'after' | 'swap';
  } | null = null;

  private swapDomElements(a: Element, b: Element): void {
    if (a === b || !a.parentNode || !b.parentNode) {
      return;
    }
    const placeholder = a.ownerDocument.createComment('mpx-swap');
    a.parentNode.insertBefore(placeholder, a);
    b.parentNode.insertBefore(a, b);
    placeholder.parentNode?.insertBefore(b, placeholder);
    placeholder.remove();
  }

  private areElementsOrthogonalInContainer(
    sourceEl: HTMLElement,
    candidateEl: HTMLElement,
    containerEl: HTMLElement,
  ): boolean {
    if (sourceEl === candidateEl) {
      return false;
    }
    const children = Array.from(containerEl.children) as HTMLElement[];
    const sIdx = children.indexOf(sourceEl);
    const cIdx = children.indexOf(candidateEl);

    // 1. Se o container possui número fixo de colunas (Matriz N×M), verifica Mesma Linha (sRow === cRow) ou Mesma Coluna (sCol === cCol)
    const explicitCols = Number(containerEl.getAttribute('data-mpx-grid-cols') || 0);
    if (explicitCols >= 1 && sIdx >= 0 && cIdx >= 0) {
      const sRow = Math.floor(sIdx / explicitCols);
      const sCol = sIdx % explicitCols;
      const cRow = Math.floor(cIdx / explicitCols);
      const cCol = cIdx % explicitCols;
      if (sRow === cRow || sCol === cCol) {
        return true;
      }
    }

    // 2. Verificação visual (Flex Row % com tamanhos variados: 25%, 33%, 50%, 67%, 75%, 100%)
    const sRect = sourceEl.getBoundingClientRect();
    const cRect = candidateEl.getBoundingClientRect();
    const sCenterY = sRect.top + sRect.height / 2;
    const cCenterY = cRect.top + cRect.height / 2;
    const minH = Math.max(24, Math.min(sRect.height, cRect.height));

    // Mesma Linha (↔): centros verticais alinhados na mesma faixa horizontal
    const sameRow = Math.abs(sCenterY - cCenterY) < minH * 0.55;
    if (sameRow) {
      return true;
    }

    // Mesma Coluna (↕): faixas horizontais [left, right] se sobrepõem verticalmente
    const overlapX = Math.min(sRect.right, cRect.right) - Math.max(sRect.left, cRect.left);
    const minW = Math.max(40, Math.min(sRect.width, cRect.width));
    return overlapX > Math.min(36, minW * 0.25);
  }

  protected onVisualPreviewMouseEnter(): void {
    this.applyVisualPreviewHighlight();
  }

  private clearCanvasDropIndicators(): void {
    this.canvasDropTarget = null;
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    canvas
      .querySelectorAll(
        '.mpx-canvas-drop-before, .mpx-canvas-drop-after, .mpx-canvas-drop-left, .mpx-canvas-drop-right, .mpx-canvas-dragging, .mpx-grid-allowed-target, .mpx-grid-forbidden-target, .mpx-grid-swap-hover',
      )
      .forEach((el) => {
        el.classList.remove(
          'mpx-canvas-drop-before',
          'mpx-canvas-drop-after',
          'mpx-canvas-drop-left',
          'mpx-canvas-drop-right',
          'mpx-canvas-dragging',
          'mpx-grid-allowed-target',
          'mpx-grid-forbidden-target',
          'mpx-grid-swap-hover',
        );
      });
  }

  private applyVisualPreviewHighlight(): void {
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    canvas.querySelectorAll('.mpx-visual-selected').forEach((el) => {
      el.classList.remove('mpx-visual-selected');
    });

    canvas.querySelectorAll('a, img').forEach((el) => {
      el.setAttribute('draggable', 'false');
    });
    const blocksContainer = this.getTopLevelBlocksContainer(canvas);
    Array.from(blocksContainer.children).forEach((child, idx) => {
      const el = child as HTMLElement;
      el.setAttribute('draggable', 'true');
      el.setAttribute('data-mpx-drag-block', String(idx));
      el.setAttribute('data-mpx-grid-label', `Grid #${idx + 1}`);
      el.style.cursor = 'grab';

      Array.from(el.children).forEach((cell, cIdx) => {
        const cellEl = cell as HTMLElement;
        cellEl.setAttribute('draggable', 'true');
        cellEl.setAttribute('data-mpx-drag-cell', String(cIdx));
        cellEl.setAttribute('data-mpx-parent-grid', String(idx));
        cellEl.style.cursor = 'grab';
        if (el.matches(this.KPI_GRID_SELECTOR)) {
          cellEl.setAttribute('data-mpx-drag-kpi', String(cIdx));
        }
      });
    });

    canvas.querySelectorAll('form').forEach((formEl, fIdx) => {
      const formGrid =
        (formEl.querySelector('[data-mpx-form-grid]') as HTMLElement | null) ||
        (formEl.querySelector('.grid') as HTMLElement | null);
      if (formGrid) {
        Array.from(formGrid.children).forEach((item, lIdx) => {
          const itemEl = item as HTMLElement;
          itemEl.setAttribute('draggable', 'true');
          itemEl.setAttribute('data-mpx-drag-field', String(lIdx));
          itemEl.setAttribute('data-mpx-parent-form', String(fIdx));
          itemEl.style.cursor = 'grab';
        });
      }
    });

    const type = this.visualTargetType();
    if (!type) {
      return;
    }

    if (type === 'field') {
      const form = canvas.querySelectorAll('form')[this.visualFormIndex()];
      const label = form?.querySelectorAll('label')[this.visualFieldIndex()];
      label?.classList.add('mpx-visual-selected');
    } else if (type === 'form') {
      const form = canvas.querySelectorAll('form')[this.visualFormIndex()];
      form?.classList.add('mpx-visual-selected');
    } else if (type === 'table') {
      const table = canvas.querySelectorAll('table')[this.visualTableIndex()];
      (table?.closest('[data-mpx-block="table"]') || table)?.classList.add('mpx-visual-selected');
    } else if (type === 'kpi') {
      const grid = canvas.querySelector(this.KPI_GRID_SELECTOR);
      const card = grid?.children[this.visualKpiIndex()];
      card?.classList.add('mpx-visual-selected');
    } else if (type === 'grid') {
      const gridEl = blocksContainer.children[this.visualGridBlockIndex()];
      gridEl?.classList.add('mpx-visual-selected');
    } else if (type === 'hero') {
      const hero =
        canvas.querySelector('[data-mpx-block="hero"]') || canvas.querySelector('.rounded-3xl');
      hero?.classList.add('mpx-visual-selected');
    } else if (type === 'section') {
      const sec = canvas.querySelectorAll('[data-mpx-block="section"]')[this.visualSectionIndex()];
      sec?.classList.add('mpx-visual-selected');
    } else if (type === 'object') {
      const objId = this.visualSelectedObjectId();
      if (objId) {
        const objEl = canvas.querySelector(`[data-mpx-obj-id="${objId}"]`);
        objEl?.classList.add('mpx-visual-selected');
      }
    }
  }

  protected onPaletteBlockDragStart(
    event: DragEvent,
    blockType:
      | 'grid'
      | 'hero'
      | 'kpi'
      | 'table'
      | 'form'
      | 'section'
      | 'alert'
      | 'quick-actions'
      | 'contas-pagar'
      | 'notas-fiscais',
  ): void {
    this.visualDragSource.set({
      kind: 'palette-block',
      index: -1,
      paletteBlockType: blockType,
    });
    this.lastDragClientY = event.clientY;
    this.startDragAutoScroll();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('text/plain', `block:${blockType}`);
      const btnEl = event.currentTarget as HTMLElement | null;
      if (btnEl) {
        event.dataTransfer.setDragImage(btnEl, 24, 24);
      }
    }
  }

  protected onPaletteObjectDragStart(event: DragEvent, objType: VisualObjectType): void {
    this.visualDragSource.set({
      kind: 'palette-object',
      index: -1,
      paletteObjectType: objType,
    });
    this.lastDragClientY = event.clientY;
    this.startDragAutoScroll();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('text/plain', `object:${objType}`);
      const btnEl = event.currentTarget as HTMLElement | null;
      if (btnEl) {
        event.dataTransfer.setDragImage(btnEl, 24, 24);
      }
    }
  }

  protected onPaletteDragEnd(): void {
    this.stopDragAutoScroll();
    this.clearCanvasDropIndicators();
    this.visualDragSource.set(null);
  }

  protected onVisualPreviewDragStart(event: DragEvent): void {
    const rawTarget = event.target as Node | null;
    const target = (
      rawTarget?.nodeType === 3 ? rawTarget.parentElement : rawTarget
    ) as HTMLElement | null;
    if (!target) {
      return;
    }

    const canvas = this.visualPreviewCanvasRef?.nativeElement;

    // Nível 3A: Campo <label> ou Espaço Vazio dentro de um <form> (move-se ortogonalmente ↔ / ↕ dentro do Bloco do Formulário)
    const fieldEl = target.closest('[data-mpx-drag-field]') as HTMLElement | null;
    if (fieldEl && fieldEl.parentElement) {
      const formGrid = fieldEl.parentElement as HTMLElement;
      const fIdx = Number(fieldEl.getAttribute('data-mpx-parent-form') || 0);
      const lIdx = Number(
        fieldEl.getAttribute('data-mpx-drag-field') ||
          Array.from(formGrid.children).indexOf(fieldEl),
      );
      this.visualDragSource.set({
        kind: 'field',
        formIdx: Math.max(0, fIdx),
        index: Math.max(0, lIdx),
      });
      this.lastDragClientY = event.clientY;
      this.startDragAutoScroll();
      fieldEl.classList.add('mpx-canvas-dragging');
      Array.from(formGrid.children).forEach((sib) => {
        const sibEl = sib as HTMLElement;
        if (sibEl === fieldEl) return;
        if (this.areElementsOrthogonalInContainer(fieldEl, sibEl, formGrid)) {
          sibEl.classList.add('mpx-grid-allowed-target');
        } else {
          sibEl.classList.add('mpx-grid-forbidden-target');
        }
      });
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `canvas-field:${fIdx}:${lIdx}`);
      }
      return;
    }

    // Nível 3B: Objeto individual [data-mpx-obj-id] dentro de uma Seção de Objetos ([data-mpx-objects-grid])
    const objEl = target.closest('[data-mpx-obj-id]:not(label)') as HTMLElement | null;
    if (
      objEl &&
      objEl.closest('[data-mpx-objects-grid]') &&
      objEl.parentElement &&
      objEl.parentElement.children.length > 1 &&
      !objEl.hasAttribute('data-mpx-drag-cell') &&
      !objEl.hasAttribute('data-mpx-drag-block')
    ) {
      const parentBox = objEl.parentElement as HTMLElement;
      const objId = objEl.getAttribute('data-mpx-obj-id') || '';
      const oIdx = Array.from(parentBox.children).indexOf(objEl);
      this.visualDragSource.set({
        kind: 'object',
        objId,
        index: Math.max(0, oIdx),
      });
      this.lastDragClientY = event.clientY;
      this.startDragAutoScroll();
      objEl.classList.add('mpx-canvas-dragging');
      Array.from(parentBox.children).forEach((sib) => {
        const sibEl = sib as HTMLElement;
        if (sibEl === objEl) return;
        if (this.areElementsOrthogonalInContainer(objEl, sibEl, parentBox)) {
          sibEl.classList.add('mpx-grid-allowed-target');
        } else {
          sibEl.classList.add('mpx-grid-forbidden-target');
        }
      });
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `canvas-obj:${objId}`);
      }
      return;
    }

    // Nível 2: Bloco / Célula dentro de um Grid (KPIs, Tabelas intermediárias lado a lado, ou Grid customizado)
    const cellEl = target.closest('[data-mpx-drag-cell]') as HTMLElement | null;
    if (cellEl && cellEl.parentElement) {
      const parentGrid = cellEl.parentElement as HTMLElement;
      const cIdx = Number(
        cellEl.getAttribute('data-mpx-drag-cell') ||
          Array.from(parentGrid.children).indexOf(cellEl),
      );
      const bIdx = Number(cellEl.getAttribute('data-mpx-parent-grid') || 0);
      this.visualDragSource.set({
        kind: 'cell',
        cellIdx: Math.max(0, cIdx),
        kpiIdx: Math.max(0, cIdx),
        index: Math.max(0, bIdx),
      });
      this.lastDragClientY = event.clientY;
      this.startDragAutoScroll();
      cellEl.classList.add('mpx-canvas-dragging');
      Array.from(parentGrid.children).forEach((sib) => {
        const sibEl = sib as HTMLElement;
        if (sibEl === cellEl) return;
        if (this.areElementsOrthogonalInContainer(cellEl, sibEl, parentGrid)) {
          sibEl.classList.add('mpx-grid-allowed-target');
        } else {
          sibEl.classList.add('mpx-grid-forbidden-target');
        }
      });
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `canvas-cell:${bIdx}:${cIdx}`);
      }
      return;
    }

    // Nível 1: Grid / Linha Principal de Página (100% da largura, move-se verticalmente ↑ / ↓ levando os filhos junto)
    let blockEl = target.closest('[data-mpx-drag-block]') as HTMLElement | null;
    if (!blockEl && canvas) {
      const container = this.getTopLevelBlocksContainer(canvas);
      let curr: HTMLElement | null = target;
      while (curr && curr !== container && curr !== canvas) {
        if (curr.parentElement === container) {
          blockEl = curr;
          break;
        }
        curr = curr.parentElement;
      }
    }

    if (blockEl) {
      const container = canvas ? this.getTopLevelBlocksContainer(canvas) : blockEl.parentElement;
      const idx = blockEl.hasAttribute('data-mpx-drag-block')
        ? Number(blockEl.getAttribute('data-mpx-drag-block') || 0)
        : container
          ? Array.from(container.children).indexOf(blockEl)
          : 0;
      this.visualDragSource.set({
        kind: 'block',
        index: Math.max(0, idx),
      });
      this.lastDragClientY = event.clientY;
      this.startDragAutoScroll();
      blockEl.classList.add('mpx-canvas-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `canvas-block:${idx}`);
      }
    }
  }

  protected onVisualPreviewDragOver(event: DragEvent): void {
    const src = this.visualDragSource();
    if (!src) {
      return;
    }
    this.lastDragClientY = event.clientY;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect =
        src.kind === 'palette-block' || src.kind === 'palette-object' ? 'copy' : 'move';
    }

    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const rawTarget = event.target as Node | null;
    const targetEl = (
      rawTarget?.nodeType === 3 ? rawTarget.parentElement : rawTarget
    ) as HTMLElement | null;

    // Caso 0: Arrastando Bloco da Paleta sobre uma Célula Vazia [data-mpx-grid-empty-cell] de um Grid
    if (src.kind === 'palette-block') {
      const emptyCell = targetEl?.closest('[data-mpx-grid-empty-cell]') as HTMLElement | null;
      const parentGrid = emptyCell?.parentElement as HTMLElement | null;
      if (emptyCell && parentGrid && parentGrid.matches(this.MULTI_BLOCK_GRID_SELECTOR)) {
        const container = this.getTopLevelBlocksContainer(canvas);
        const gIdx = Array.from(container.children).indexOf(parentGrid);
        const cIdx = Array.from(parentGrid.children).indexOf(emptyCell);
        if (gIdx >= 0 && cIdx >= 0) {
          canvas
            .querySelectorAll('.mpx-grid-swap-hover, .mpx-canvas-drop-before, .mpx-canvas-drop-after')
            .forEach((el) =>
              el.classList.remove(
                'mpx-grid-swap-hover',
                'mpx-canvas-drop-before',
                'mpx-canvas-drop-after',
              ),
            );
          emptyCell.classList.add('mpx-grid-swap-hover');
          this.canvasDropTarget = {
            blockIdx: gIdx,
            emptyCellGridIdx: gIdx,
            emptyCellIdx: cIdx,
            position: 'swap',
          };
          return;
        }
      }
    }

    // Caso 1: Arraste Ortogonal (Mesma Linha ↔ ou Mesma Coluna ↕) de Campo dentro de um Formulário
    if (src.kind === 'field') {
      const form = canvas.querySelectorAll('form')[src.formIdx ?? 0];
      const formGrid =
        (form?.querySelector('[data-mpx-form-grid]') as HTMLElement | null) ||
        (form?.querySelector('.grid') as HTMLElement | null);
      if (formGrid) {
        const fields = Array.from(formGrid.children) as HTMLElement[];
        const sourceField = fields[src.index];
        const hoveredField = targetEl?.closest('[data-mpx-drag-field]') as HTMLElement | null;
        canvas
          .querySelectorAll('.mpx-grid-swap-hover')
          .forEach((el) => el.classList.remove('mpx-grid-swap-hover'));
        if (
          sourceField &&
          hoveredField &&
          hoveredField !== sourceField &&
          formGrid.contains(hoveredField) &&
          this.areElementsOrthogonalInContainer(sourceField, hoveredField, formGrid)
        ) {
          const targetFieldIdx = fields.indexOf(hoveredField);
          hoveredField.classList.add('mpx-grid-swap-hover');
          this.canvasDropTarget = {
            blockIdx: src.formIdx ?? 0,
            fieldIdx: targetFieldIdx,
            position: 'swap',
          };
        } else {
          this.canvasDropTarget = null;
        }
        return;
      }
    }

    // Caso 2: Arraste Ortogonal (↔ / ↕) de Objeto dentro de um Bloco
    if (src.kind === 'object' && src.objId) {
      const sourceObj = canvas.querySelector(
        `[data-mpx-obj-id="${src.objId}"]`,
      ) as HTMLElement | null;
      const parentBox = sourceObj?.parentElement as HTMLElement | null;
      if (sourceObj && parentBox) {
        let hoveredObj = targetEl?.closest('[data-mpx-obj-id]') as HTMLElement | null;
        if (hoveredObj && hoveredObj.parentElement !== parentBox) {
          let curr: HTMLElement | null = targetEl;
          hoveredObj = null;
          while (curr && curr !== parentBox && curr !== canvas) {
            if (curr.parentElement === parentBox) {
              hoveredObj = curr;
              break;
            }
            curr = curr.parentElement;
          }
        }
        canvas
          .querySelectorAll('.mpx-grid-swap-hover')
          .forEach((el) => el.classList.remove('mpx-grid-swap-hover'));
        if (
          hoveredObj &&
          hoveredObj !== sourceObj &&
          this.areElementsOrthogonalInContainer(sourceObj, hoveredObj, parentBox)
        ) {
          hoveredObj.classList.add('mpx-grid-swap-hover');
          this.canvasDropTarget = {
            blockIdx: 0,
            objId: hoveredObj.getAttribute('data-mpx-obj-id') || '',
            position: 'swap',
          };
        } else {
          this.canvasDropTarget = null;
        }
        return;
      }
    }

    // Caso 3: Arraste Ortogonal (Mesma Linha ↔ ou Mesma Coluna ↕) de Bloco / Card dentro de um Grid
    if (src.kind === 'cell' || src.kind === 'kpi') {
      const container = this.getTopLevelBlocksContainer(canvas);
      const parentGrid = container.children[src.index] as HTMLElement | undefined;
      if (parentGrid) {
        const cells = Array.from(parentGrid.children) as HTMLElement[];
        const sourceCell = cells[src.cellIdx ?? src.kpiIdx ?? 0];
        let hoveredCell = targetEl?.closest('[data-mpx-drag-cell]') as HTMLElement | null;
        if (!hoveredCell && targetEl && parentGrid.contains(targetEl)) {
          let curr: HTMLElement | null = targetEl;
          while (curr && curr !== parentGrid && curr !== canvas) {
            if (curr.parentElement === parentGrid) {
              hoveredCell = curr;
              break;
            }
            curr = curr.parentElement;
          }
        }

        if (hoveredCell && parentGrid.contains(hoveredCell)) {
          canvas
            .querySelectorAll(
              '.mpx-grid-swap-hover, .mpx-canvas-drop-before, .mpx-canvas-drop-after',
            )
            .forEach((el) =>
              el.classList.remove(
                'mpx-grid-swap-hover',
                'mpx-canvas-drop-before',
                'mpx-canvas-drop-after',
              ),
            );
          if (
            sourceCell &&
            hoveredCell !== sourceCell &&
            this.areElementsOrthogonalInContainer(sourceCell, hoveredCell, parentGrid)
          ) {
            const targetCellIdx = cells.indexOf(hoveredCell);
            hoveredCell.classList.add('mpx-grid-swap-hover');
            this.canvasDropTarget = {
              blockIdx: src.index,
              cellIdx: targetCellIdx,
              kpiIdx: targetCellIdx,
              position: 'swap',
            };
          } else {
            this.canvasDropTarget = null;
          }
          return;
        }
        this.canvasDropTarget = null;
        return;
      }
    }

    // Caso 4: Arraste vertical (↑ / ↓) entre Grids / Linhas Principais da página
    const container = this.getTopLevelBlocksContainer(canvas);
    const blockEls = Array.from(container.children) as HTMLElement[];
    if (blockEls.length === 0) {
      return;
    }

    canvas
      .querySelectorAll('.mpx-canvas-drop-left, .mpx-canvas-drop-right, .mpx-grid-swap-hover')
      .forEach((el) =>
        el.classList.remove(
          'mpx-canvas-drop-left',
          'mpx-canvas-drop-right',
          'mpx-grid-swap-hover',
        ),
      );

    let hoveredBlock: HTMLElement | null = null;
    let position: 'before' | 'after' = 'before';

    for (let i = 0; i < blockEls.length; i++) {
      const b = blockEls[i];
      const r = b.getBoundingClientRect();
      const midY = r.top + r.height / 2;
      if (event.clientY <= midY) {
        hoveredBlock = b;
        position = 'before';
        break;
      }
      if (event.clientY <= r.bottom) {
        hoveredBlock = b;
        position = 'after';
        break;
      }
      if (i < blockEls.length - 1) {
        const nextRect = blockEls[i + 1].getBoundingClientRect();
        if (event.clientY < nextRect.top) {
          const gapMid = (r.bottom + nextRect.top) / 2;
          if (event.clientY <= gapMid) {
            hoveredBlock = b;
            position = 'after';
          } else {
            hoveredBlock = blockEls[i + 1];
            position = 'before';
          }
          break;
        }
      } else {
        hoveredBlock = b;
        position = 'after';
      }
    }

    if (!hoveredBlock) {
      hoveredBlock = blockEls[blockEls.length - 1];
      position = 'after';
    }

    const blockIdx = hoveredBlock.hasAttribute('data-mpx-drag-block')
      ? Number(hoveredBlock.getAttribute('data-mpx-drag-block') || 0)
      : blockEls.indexOf(hoveredBlock);

    if (
      this.canvasDropTarget?.blockIdx === blockIdx &&
      this.canvasDropTarget?.cellIdx === undefined &&
      this.canvasDropTarget?.position === position
    ) {
      return;
    }

    this.canvasDropTarget = { blockIdx, position };
    for (const b of blockEls) {
      b.classList.remove('mpx-canvas-drop-before', 'mpx-canvas-drop-after');
    }
    if ((src.kind === 'block' || src.kind === 'cell' || src.kind === 'kpi') && src.index === blockIdx) {
      return;
    }
    hoveredBlock.classList.add(
      position === 'before' ? 'mpx-canvas-drop-before' : 'mpx-canvas-drop-after',
    );
  }

  protected onVisualPreviewDragLeave(event: DragEvent): void {
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    const related = event.relatedTarget as Node | null;
    if (canvas && related && canvas.contains(related)) {
      return;
    }
    const blockEls = canvas?.querySelectorAll(
      '.mpx-canvas-drop-before, .mpx-canvas-drop-after, .mpx-canvas-drop-left, .mpx-canvas-drop-right, .mpx-grid-swap-hover',
    );
    blockEls?.forEach((el) => {
      el.classList.remove(
        'mpx-canvas-drop-before',
        'mpx-canvas-drop-after',
        'mpx-canvas-drop-left',
        'mpx-canvas-drop-right',
        'mpx-grid-swap-hover',
      );
    });
  }

  protected onVisualPreviewDragEnd(): void {
    this.stopDragAutoScroll();
    this.clearCanvasDropIndicators();
    this.visualDragSource.set(null);
  }

  protected onVisualPreviewDrop(event: DragEvent): void {
    const src = this.visualDragSource();
    const dropInfo = this.canvasDropTarget;
    this.stopDragAutoScroll();
    this.clearCanvasDropIndicators();
    this.visualDragSource.set(null);
    if (!src) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const doc = this.parseCurrentPageDom();

    if (src.kind === 'palette-block' && src.paletteBlockType) {
      if (src.paletteBlockType === 'contas-pagar' || src.paletteBlockType === 'notas-fiscais') {
        this.generateCompleteStarterTemplate(src.paletteBlockType);
        return;
      }
      // Se soltou diretamente sobre uma Célula Vazia específica de um Grid (ex.: 3ª linha, 5ª coluna)
      if (
        dropInfo?.position === 'swap' &&
        dropInfo.emptyCellGridIdx !== undefined &&
        dropInfo.emptyCellIdx !== undefined &&
        src.paletteBlockType !== 'grid'
      ) {
        this.visualTargetType.set('grid');
        this.visualGridBlockIndex.set(dropInfo.emptyCellGridIdx);
        this.visualGridCellIndex.set(dropInfo.emptyCellIdx);
        const container = this.getTopLevelBlocksContainer(doc.body);
        const gridEl = container.children[dropInfo.emptyCellGridIdx] as HTMLElement | undefined;
        const targetEmptyCell = gridEl?.children[dropInfo.emptyCellIdx] as HTMLElement | undefined;
        if (targetEmptyCell && targetEmptyCell.hasAttribute('data-mpx-grid-empty-cell')) {
          // Marca temporariamente como a primeira célula alvo para o insertHtmlBlock preencher exatamente ela
          targetEmptyCell.setAttribute('data-mpx-drop-target-cell', 'true');
          this.commitVisualHtmlMutation(doc.body.innerHTML);
        }
      }
      const insertIdx =
        dropInfo && dropInfo.position !== 'swap'
          ? dropInfo.position === 'after'
            ? dropInfo.blockIdx + 1
            : dropInfo.blockIdx
          : undefined;
      this.insertHtmlBlock(src.paletteBlockType, insertIdx);
      return;
    }

    if (src.kind === 'palette-object' && src.paletteObjectType) {
      this.insertVisualObjectFromPalette(src.paletteObjectType);
      return;
    }

    // Troca Ortogonal (Swap A <-> B) de Campos dentro de um Formulário
    if (src.kind === 'field' && dropInfo?.position === 'swap' && dropInfo.fieldIdx !== undefined) {
      const form = doc.body.querySelectorAll('form')[src.formIdx ?? 0];
      const formGrid =
        (form?.querySelector('[data-mpx-form-grid]') as HTMLElement | null) ||
        (form?.querySelector('.grid') as HTMLElement | null);
      if (!formGrid) {
        return;
      }
      const items = Array.from(formGrid.children);
      const fromItem = items[src.index];
      const toItem = items[dropInfo.fieldIdx];
      if (!fromItem || !toItem || fromItem === toItem) {
        return;
      }
      this.swapDomElements(fromItem, toItem);
      this.commitVisualHtmlMutation(doc.body.innerHTML);
      return;
    }

    // Troca Ortogonal (Swap A <-> B) de Objetos dentro de um Bloco
    if (src.kind === 'object' && dropInfo?.position === 'swap' && dropInfo.objId && src.objId) {
      this.ensureVisualObjectIdsInDom(doc);
      const fromObj = doc.body.querySelector(`[data-mpx-obj-id="${src.objId}"]`);
      const toObj = doc.body.querySelector(`[data-mpx-obj-id="${dropInfo.objId}"]`);
      if (!fromObj || !toObj || fromObj === toObj) {
        return;
      }
      this.swapDomElements(fromObj, toObj);
      this.commitVisualHtmlMutation(doc.body.innerHTML);
      return;
    }

    // Troca Ortogonal (Swap A <-> B, inclusive com Espaço Vazio!) de Blocos/Cards dentro de um Grid
    if (
      (src.kind === 'cell' || src.kind === 'kpi') &&
      dropInfo?.position === 'swap' &&
      dropInfo.cellIdx !== undefined
    ) {
      const container = this.getTopLevelBlocksContainer(doc.body);
      const parentGrid = container.children[src.index] as HTMLElement | undefined;
      if (!parentGrid) {
        return;
      }
      const cells = Array.from(parentGrid.children);
      const fromCell = cells[src.cellIdx ?? src.kpiIdx ?? 0];
      const toCell = cells[dropInfo.cellIdx];
      if (!fromCell || !toCell || fromCell === toCell) {
        return;
      }
      this.swapDomElements(fromCell, toCell);
      this.commitVisualHtmlMutation(doc.body.innerHTML);
      return;
    }

    // Reordenação vertical (↑ / ↓) de Grids / Linhas Principais da página
    if (
      (src.kind === 'block' || src.kind === 'cell' || src.kind === 'kpi') &&
      dropInfo &&
      dropInfo.position !== 'swap'
    ) {
      const container = this.getTopLevelBlocksContainer(doc.body);
      const blocks = Array.from(container.children);
      const fromEl = blocks[src.index];
      const toIdx = dropInfo.blockIdx ?? -1;
      const toEl = blocks[toIdx];
      if (!fromEl || !toEl || src.index === toIdx) {
        return;
      }

      if (dropInfo.position === 'after') {
        container.insertBefore(fromEl, toEl.nextSibling);
      } else {
        container.insertBefore(fromEl, toEl);
      }
      this.commitVisualHtmlMutation(doc.body.innerHTML);
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
    if (!this.draggingMenuItem() && !this.visualDragSource()) {
      return;
    }
    this.lastDragClientY = event.clientY;
  }

  private startDragAutoScroll(): void {
    this.stopDragAutoScroll();
    this.dragAutoScrollTimer = setInterval(() => {
      const isMenuDrag = !!this.draggingMenuItem();
      const isCanvasDrag = !!this.visualDragSource();
      if ((!isMenuDrag && !isCanvasDrag) || this.lastDragClientY <= 0) {
        return;
      }

      // Quando estiver arrastando blocos/objetos no Editor de Página, rola o próprio #visualPreviewCanvas (e a janela)
      const canvas = this.visualPreviewCanvasRef?.nativeElement;
      if (isCanvasDrag && canvas) {
        const cRect = canvas.getBoundingClientRect();
        const canvasEdge = 110;
        let canvasDelta = 0;
        if (this.lastDragClientY >= cRect.top - 40 && this.lastDragClientY < cRect.top + canvasEdge) {
          canvasDelta = -Math.max(
            6,
            Math.ceil(((cRect.top + canvasEdge - this.lastDragClientY) / canvasEdge) * 22),
          );
        } else if (
          this.lastDragClientY <= cRect.bottom + 40 &&
          this.lastDragClientY > cRect.bottom - canvasEdge
        ) {
          canvasDelta = Math.max(
            6,
            Math.ceil(((this.lastDragClientY - (cRect.bottom - canvasEdge)) / canvasEdge) * 22),
          );
        }
        if (canvasDelta !== 0) {
          canvas.scrollTop += canvasDelta;
        }
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
