import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { formatHtmlPretty } from '@src/components/morphus/code-editor';
import {
  MorphusApplication,
  MorphusApplicationModuleRef,
  MorphusApplicationSubModuleRef,
} from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';
import { AppBuilderMatchedPage } from '@app-builder/entities';
import {
  AppBuilderRecord,
  AppBuilderRuntimeStoreService,
  AppBuilderSanitizerService,
} from '@app-builder/services';

type LiveTargetType = 'field' | 'form' | 'table' | 'kpi' | 'hero';
type LiveFieldType =
  | 'text'
  | 'currency'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea';

@Component({
  selector: 'mpx-builder-page',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
  ],
  host: {
    class: 'flex flex-auto flex-col p-6 lg:p-8',
  },
  templateUrl: './builder-page.component.html',
  styleUrl: './builder-page.component.scss',
})
export class AppBuilderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(AppBuilderSanitizerService);
  private readonly runtimeStore = inject(AppBuilderRuntimeStoreService);
  private readonly applicationService = inject(ApplicationService);
  private readonly context = inject(MorphusContextService);

  @ViewChild('runtimeRoot') private runtimeRootRef?: ElementRef<HTMLElement>;

  private readonly paramMap = toSignal(this.route.paramMap);
  private readonly urlSegments = toSignal(this.route.url, { initialValue: [] });

  protected readonly isLoading = signal<boolean>(false);
  protected readonly fetchedApp = signal<MorphusApplication | null>(null);
  protected readonly editingRecordId = signal<string | null>(null);
  protected readonly editingCollectionKey = signal<string | null>(null);

  // =========================================================================
  // MODO CONSTRUTOR VISUAL DIRETO NA PÁGINA AO VIVO (/app/:appKey/:slug)
  // =========================================================================
  protected readonly liveBuilderMode = signal<boolean>(false);
  protected readonly liveDraftHtml = signal<string>('');
  protected readonly savingLivePage = signal<boolean>(false);
  protected readonly liveSaveSuccess = signal<boolean>(false);

  protected readonly vTargetType = signal<LiveTargetType | null>(null);
  protected readonly vFormIdx = signal<number>(0);
  protected readonly vFieldIdx = signal<number>(0);
  protected readonly vTableIdx = signal<number>(0);
  protected readonly vKpiIdx = signal<number>(0);

  protected readonly vFieldLabel = signal<string>('Título');
  protected readonly vFieldPlaceholder = signal<string>('Digite aqui...');
  protected readonly vFieldType = signal<LiveFieldType>('text');
  protected readonly vFieldColSpan = signal<number>(6);
  protected readonly vFieldRequired = signal<boolean>(false);
  protected readonly vFieldOptions = signal<string[]>([]);
  protected readonly vFieldNewOption = signal<string>('');
  protected readonly vFieldKey = signal<string>('titulo');

  protected readonly vFormTitle = signal<string>('Novo Registro');
  protected readonly vFormCollection = signal<string>('contas-pagar');
  protected readonly vFormButtonText = signal<string>('Salvar Registro');

  protected readonly vTableCollection = signal<string>('contas-pagar');
  protected readonly vTableColumns = signal<{ header: string; fieldKey: string }[]>([]);
  protected readonly vTableNewColHeader = signal<string>('');

  protected readonly vKpiTitle = signal<string>('Indicador');
  protected readonly vKpiValue = signal<string>('R$ 0,00');
  protected readonly vKpiMode = signal<'sum' | 'count' | 'pending' | 'static'>('sum');
  protected readonly vKpiColor = signal<'neutral' | 'jade' | 'amber' | 'violet' | 'red'>('neutral');

  protected readonly vHeroBadge = signal<string>('Módulo Ativo');
  protected readonly vHeroTitle = signal<string>('Título Principal');
  protected readonly vHeroSubtitle = signal<string>('Subtítulo explicativo.');

  protected readonly availableCollections = computed(() => this.runtimeStore.defaultCollections);
  protected readonly colSpanChoices: { span: number; label: string; desc: string }[] = [
    { span: 3, label: '25%', desc: '4 por linha' },
    { span: 4, label: '33%', desc: '3 por linha' },
    { span: 6, label: '50%', desc: '2 por linha' },
    { span: 9, label: '75%', desc: '3/4 da linha' },
    { span: 12, label: '100%', desc: 'Linha inteira' },
  ];
  protected readonly fieldTypeChoices: { type: LiveFieldType; label: string }[] = [
    { type: 'text', label: 'Texto Curto' },
    { type: 'currency', label: 'Moeda (R$)' },
    { type: 'number', label: 'Número' },
    { type: 'date', label: 'Data' },
    { type: 'select', label: 'Combo (Lista com botão +)' },
    { type: 'checkbox', label: 'Checkbox (Sim / Não)' },
    { type: 'radio', label: 'Radio (Escolha Única)' },
    { type: 'textarea', label: 'Texto Longo (Observações)' },
  ];

  // Estado do Mini-Modal do botão [+] de Combos (Listas Suspensas)
  protected readonly comboModalOpen = signal<boolean>(false);
  protected readonly comboModalKey = signal<string>('');
  protected readonly comboModalLabel = signal<string>('');
  protected readonly comboModalOptions = signal<string[]>([]);
  protected readonly comboModalNewOption = signal<string>('');

  protected readonly appKey = computed<string>(() => {
    const own = this.paramMap()?.get('appKey');
    if (own) {
      return own;
    }
    return this.route.parent?.snapshot.paramMap.get('appKey') || '';
  });

  protected readonly subPath = computed<string>(() => {
    const segs = this.urlSegments() || [];
    return segs
      .map((s) => s.path)
      .filter(Boolean)
      .join('/');
  });

  protected readonly activeApp = computed<MorphusApplication | null>(() => {
    const keyUpper = this.appKey().trim().toUpperCase();
    const fetched = this.fetchedApp();
    if (
      fetched &&
      ((fetched.key ?? '').toUpperCase() === keyUpper ||
        (fetched.prefix ?? '').toUpperCase() === keyUpper)
    ) {
      return fetched;
    }

    const fromContext = this.context
      .availableApplications()
      .find(
        (a) =>
          (a.key ?? '').toUpperCase() === keyUpper ||
          (a.prefix ?? '').toUpperCase() === keyUpper,
      );

    return fromContext ?? fetched;
  });

  protected readonly matchedPage = computed<AppBuilderMatchedPage | null>(() => {
    const app = this.activeApp();
    if (!app?.applicationModules?.length) {
      return null;
    }

    const rawPath = this.subPath().trim();
    const allItems: {
      module: MorphusApplicationModuleRef;
      subModule: MorphusApplicationSubModuleRef;
    }[] = [];

    for (const mod of app.applicationModules) {
      for (const sm of mod.applicationSubModules ?? []) {
        allItems.push({ module: mod, subModule: sm });
      }
    }

    if (allItems.length === 0) {
      return null;
    }

    if (!rawPath) {
      const def =
        allItems.find((x) => x.subModule.default) ??
        allItems.find((x) => (x.subModule.routePattern ?? '').toLowerCase() === 'dashboard') ??
        allItems[0];
      return { ...def, params: {} };
    }

    for (const item of allItems) {
      const pattern = (item.subModule.routePattern || item.subModule.key || '').trim();
      const matchParams = this.matchRoutePattern(pattern, rawPath);
      if (matchParams !== null) {
        return { ...item, params: matchParams };
      }
      if ((item.subModule.key ?? '').toUpperCase() === rawPath.toUpperCase()) {
        return { ...item, params: {} };
      }
    }

    return { ...allItems[0], params: {} };
  });

  protected readonly currentRawHtml = computed<string>(() => {
    const draft = this.liveDraftHtml();
    if (draft) {
      return draft;
    }
    return this.matchedPage()?.subModule.htmlContent || '';
  });

  protected readonly trustedHtml = computed<SafeHtml>(() => {
    return this.sanitizer.toTrustedHtml(this.currentRawHtml());
  });

  constructor() {
    effect(() => {
      const key = this.appKey().trim();
      if (!key) {
        return;
      }

      untracked(() => {
        this.isLoading.set(true);
        this.applicationService.getByKey(key).subscribe({
          next: (app) => {
            this.fetchedApp.set(app ?? null);
            this.isLoading.set(false);

            if (app && !this.subPath()) {
              const allSubs = (app.applicationModules ?? []).flatMap(
                (m) => m.applicationSubModules ?? [],
              );
              const defSub =
                allSubs.find((s) => s.default) ??
                allSubs.find((s) => (s.routePattern ?? '').toLowerCase() === 'dashboard') ??
                allSubs[0];
              const targetSlug = defSub?.routePattern || defSub?.key || 'dashboard';
              void this.router.navigateByUrl(`/app/${app.key || key}/${targetSlug}`, {
                replaceUrl: true,
              });
            }
          },
          error: () => {
            this.isLoading.set(false);
          },
        });
      });
    });

    // Sincroniza o HTML inicial quando troca de página (priorizando rascunho não salvo vindo do Editor de Página)
    effect(() => {
      const matched = this.matchedPage();
      untracked(() => {
        const pendingDraft =
          this.runtimeStore.getPageDraftHtml(matched?.subModule.id || '') ??
          this.runtimeStore.getPageDraftHtml(matched?.subModule.routePattern || '') ??
          this.runtimeStore.getPageDraftHtml(this.subPath() || '');
        this.liveDraftHtml.set(pendingDraft ?? (matched?.subModule.htmlContent || ''));
        this.vTargetType.set(null);
      });
    });

    // Re-hidrata o DOM dinâmico e destaca a seleção sempre que a página ou os dados mudam
    effect(() => {
      const _html = this.trustedHtml();
      const _ver = this.runtimeStore.version();
      const _page = this.matchedPage();
      const _builder = this.liveBuilderMode();
      const _selType = this.vTargetType();
      const _fIdx = this.vFieldIdx();
      const _kIdx = this.vKpiIdx();
      setTimeout(() => {
        this.hydrateRuntimeDom();
        if (this.liveBuilderMode()) {
          this.applyLiveSelectionHighlight();
        }
      }, 25);
    });
  }

  protected toggleLiveBuilderMode(): void {
    const next = !this.liveBuilderMode();
    this.liveBuilderMode.set(next);
    if (!next) {
      this.runtimeRootRef?.nativeElement
        ?.querySelectorAll('.mpx-live-selected')
        .forEach((el) => el.classList.remove('mpx-live-selected'));
    } else {
      setTimeout(() => this.applyLiveSelectionHighlight(), 25);
    }
  }

  protected returnToEditor(): void {
    const app = this.activeApp();
    const matched = this.matchedPage();
    if (app?.id) {
      void this.router.navigate(['/morphus/application', app.id], {
        queryParams: {
          tab: 'editor',
          pageId: matched?.subModule.id || undefined,
        },
      });
      return;
    }
    void this.router.navigateByUrl('/morphus/application');
  }

  protected async saveLivePageToDatabase(): Promise<void> {
    const matched = this.matchedPage();
    if (!matched?.module.id || !matched.subModule) {
      return;
    }
    this.savingLivePage.set(true);
    try {
      const htmlToSave = formatHtmlPretty(this.currentRawHtml());
      const saved = await firstValueFrom(
        this.applicationService.savePage(matched.module.id, {
          ...matched.subModule,
          htmlContent: htmlToSave,
        }),
      );
      matched.subModule.htmlContent = saved.htmlContent || htmlToSave;
      this.liveDraftHtml.set(saved.htmlContent || htmlToSave);
      this.runtimeStore.clearPageDraftHtml(matched.subModule.id);
      this.runtimeStore.clearPageDraftHtml(matched.subModule.routePattern);
      this.liveSaveSuccess.set(true);
      setTimeout(() => this.liveSaveSuccess.set(false), 2500);
    } finally {
      this.savingLivePage.set(false);
    }
  }

  protected onRuntimeSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.liveBuilderMode()) {
      return;
    }
    const target = event.target as HTMLElement | null;
    const form = target?.closest('form') as HTMLFormElement | null;
    if (form) {
      this.processFormSubmission(form);
    }
  }

  protected onRuntimeClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const root = this.runtimeRootRef?.nativeElement;
    if (!target || !root) {
      return;
    }

    // 1. Clique no botão [+] ao lado de um Combo (<select>) funciona TANTO no modo Construtor QUANTO no modo Uso!
    const comboBtn = target.closest('[data-mpx-combo-manage]') as HTMLElement | null;
    if (comboBtn) {
      event.preventDefault();
      event.stopPropagation();
      const comboKey = comboBtn.getAttribute('data-mpx-combo-manage') || 'lista';
      const comboLabel = comboBtn.getAttribute('data-mpx-combo-label') || 'Opções da Lista';
      this.openComboManager(comboKey, comboLabel);
      return;
    }

    // SE ESTIVER EM MODO CONSTRUTOR VISUAL: clicar seleciona o elemento na tela sem redirecionar!
    if (this.liveBuilderMode()) {
      const anchorOrBtn = target.closest('a, button');
      if (anchorOrBtn) {
        event.preventDefault();
      }

      const labelEl = target.closest('form label') as HTMLLabelElement | null;
      if (labelEl) {
        event.stopPropagation();
        const formEl = labelEl.closest('form')!;
        const allForms = Array.from(root.querySelectorAll('form'));
        const formIdx = Math.max(0, allForms.indexOf(formEl));
        const allLabels = Array.from(formEl.querySelectorAll('label'));
        const fieldIdx = Math.max(0, allLabels.indexOf(labelEl));
        this.selectLiveField(formIdx, fieldIdx);
        return;
      }

      const formEl = target.closest('form') as HTMLFormElement | null;
      if (formEl) {
        event.stopPropagation();
        const allForms = Array.from(root.querySelectorAll('form'));
        this.selectLiveForm(Math.max(0, allForms.indexOf(formEl)));
        return;
      }

      const tableEl = target.closest('table') as HTMLTableElement | null;
      if (tableEl) {
        event.stopPropagation();
        const allTables = Array.from(root.querySelectorAll('table'));
        this.selectLiveTable(Math.max(0, allTables.indexOf(tableEl)));
        return;
      }

      const kpiGrid = target.closest(
        '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
      ) as HTMLElement | null;
      if (kpiGrid) {
        event.stopPropagation();
        const cards = Array.from(kpiGrid.children) as HTMLElement[];
        const clickedCard = cards.find((c) => c.contains(target));
        this.selectLiveKpi(clickedCard ? Math.max(0, cards.indexOf(clickedCard)) : 0);
        return;
      }

      const heroEl = target.closest('[data-mpx-block="hero"], .rounded-3xl') as HTMLElement | null;
      if (heroEl && heroEl.querySelector('h1')) {
        event.stopPropagation();
        this.selectLiveHero();
        return;
      }
      return;
    }

    // MODO OPERACIONAL (USANDO A PÁGINA PARA CADASTRAR/EDITAR/EXCLUIR REGISTROS):
    const editBtn = target.closest('[data-mpx-row-edit]') as HTMLElement | null;
    if (editBtn) {
      event.preventDefault();
      event.stopPropagation();
      const recordId = editBtn.getAttribute('data-mpx-row-edit') || '';
      const collection =
        editBtn.getAttribute('data-mpx-row-collection') || this.inferDefaultCollection();
      this.loadRecordIntoForm(collection, recordId);
      return;
    }

    const delBtn = target.closest('[data-mpx-row-delete]') as HTMLElement | null;
    if (delBtn) {
      event.preventDefault();
      event.stopPropagation();
      const recordId = delBtn.getAttribute('data-mpx-row-delete') || '';
      const collection =
        delBtn.getAttribute('data-mpx-row-collection') || this.inferDefaultCollection();
      if (recordId) {
        this.runtimeStore.deleteRecord(collection, recordId);
        if (this.editingRecordId() === recordId) {
          this.cancelFormEdit();
        }
      }
      return;
    }

    const cancelBtn = target.closest('[data-mpx-form-cancel]') as HTMLElement | null;
    if (cancelBtn) {
      event.preventDefault();
      event.stopPropagation();
      this.cancelFormEdit();
      return;
    }

    const btn = target.closest('button') as HTMLButtonElement | null;
    if (btn && !btn.hasAttribute('data-mpx-combo-manage')) {
      const form = btn.closest('form');
      if (form) {
        event.preventDefault();
        event.stopPropagation();
        this.processFormSubmission(form);
      }
    }
  }

  // =========================================================================
  // MÉTODOS DO CONSTRUTOR VISUAL AO VIVO
  // =========================================================================

  protected insertLiveBlock(blockType: 'hero' | 'kpi' | 'table' | 'form'): void {
    const defaultCol = this.inferDefaultCollection();
    const blocks: Record<'hero' | 'kpi' | 'table' | 'form', string> = {
      hero: `\n<div data-mpx-block="hero" class="rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm">\n  <div class="inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Módulo Ativo</div>\n  <h1 class="mt-3 text-2xl font-bold text-neutral-12">Título Principal da Página</h1>\n  <p class="mt-1 text-sm text-neutral-a11">Subtítulo explicativo desta área da aplicação.</p>\n</div>\n`,
      kpi: `\n<div data-mpx-block="kpi" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">\n  <div data-mpx-kpi-mode="sum" data-mpx-kpi-field="valor" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Total Financeiro</span>\n    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-neutral-12">R$ 24.670,00</div>\n  </div>\n  <div data-mpx-kpi-mode="count" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Total de Registros</span>\n    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-jade-a11">3 registro(s)</div>\n  </div>\n  <div data-mpx-kpi-mode="pending" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">\n    <span class="text-xs font-medium text-neutral-a10">Pendentes de Aprovação</span>\n    <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-amber-a11">1 pendente(s)</div>\n  </div>\n</div>\n`,
      table: `\n<div data-mpx-block="table" data-mpx-collection="${defaultCol}" class="mt-6 overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">\n  <table data-mpx-collection="${defaultCol}" class="w-full text-left text-sm">\n    <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">\n      <tr>\n        <th data-mpx-field="codigo" class="px-4 py-3">Código</th>\n        <th data-mpx-field="titulo" class="px-4 py-3">Título</th>\n        <th data-mpx-field="categoria" class="px-4 py-3">Categoria</th>\n        <th data-mpx-field="vencimento" class="px-4 py-3">Vencimento</th>\n        <th data-mpx-field="valor" class="px-4 py-3">Valor</th>\n        <th data-mpx-field="status" class="px-4 py-3">Status</th>\n      </tr>\n    </thead>\n    <tbody class="divide-y divide-neutral-a3"></tbody>\n  </table>\n</div>\n`,
      form: `\n<form data-mpx-block="form" data-mpx-collection="${defaultCol}" class="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6">\n  <h3 class="text-lg font-bold text-neutral-12">Novo Registro</h3>\n  <div data-mpx-form-grid class="grid grid-cols-12 gap-4">\n    <label data-mpx-col-span="6" class="col-span-12 sm:col-span-6 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Título *\n      <input type="text" name="titulo" data-mpx-field="titulo" data-mpx-type="text" required placeholder="Ex: Fatura Servidores Cloud..." class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Categoria\n      <select name="categoria" data-mpx-field="categoria" data-mpx-combo-key="categoria" data-mpx-type="select" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12">\n        <option value="Infraestrutura Cloud">Infraestrutura Cloud</option>\n        <option value="Licenças de Software">Licenças de Software</option>\n        <option value="Serviços Contábeis">Serviços Contábeis</option>\n      </select>\n    </label>\n    <label data-mpx-col-span="3" class="col-span-12 sm:col-span-3 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">\n      Valor (R$) *\n      <input type="text" name="valor" data-mpx-field="valor" data-mpx-type="currency" required placeholder="R$ 0,00" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />\n    </label>\n  </div>\n  <div class="flex justify-end">\n    <button type="submit" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Salvar Registro</button>\n  </div>\n</form>\n`,
    };

    const base = this.currentRawHtml().trimEnd();
    const blockClean = blocks[blockType].trim();
    this.liveDraftHtml.set(formatHtmlPretty(base ? `${base}\n\n${blockClean}\n` : `${blockClean}\n`));

    setTimeout(() => {
      if (blockType === 'form') this.selectLiveField(0, 0);
      else if (blockType === 'table') this.selectLiveTable(0);
      else if (blockType === 'kpi') this.selectLiveKpi(0);
      else this.selectLiveHero();
    }, 40);
  }

  protected generateLiveStarterTemplate(kind: 'contas-pagar' | 'notas-fiscais'): void {
    const isNF = kind === 'notas-fiscais';
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
    <tbody class="divide-y divide-neutral-a3"></tbody>
  </table>
</div>
`;
    this.liveDraftHtml.set(formatHtmlPretty(html.trim()));
    setTimeout(() => this.selectLiveField(0, 0), 40);
  }

  protected selectLiveField(formIdx: number, fieldIdx: number): void {
    const doc = this.parseDraftDom();
    const forms = Array.from(doc.body.querySelectorAll('form'));
    const form = forms[formIdx] ?? forms[0];
    if (!form) return;
    const labels = Array.from(form.querySelectorAll('label'));
    const label = labels[fieldIdx] ?? labels[0];
    if (!label) {
      this.selectLiveForm(formIdx);
      return;
    }

    this.vTargetType.set('field');
    this.vFormIdx.set(formIdx);
    this.vFieldIdx.set(labels.indexOf(label));

    const rawTitle = this.extractLabelText(label);
    this.vFieldLabel.set(rawTitle || 'Campo');

    const ctrl = label.querySelector('input, select, textarea') as HTMLElement | null;
    this.vFieldColSpan.set(this.detectColSpan(label));

    const isReq =
      ctrl?.hasAttribute('required') ||
      ctrl?.getAttribute('data-mpx-required') === 'true' ||
      rawTitle.endsWith('*');
    this.vFieldRequired.set(!!isReq);

    const fType = this.detectFieldType(ctrl);
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
      this.vFieldOptions.set(this.runtimeStore.getComboOptions(key, domOpts));
    } else if (fType === 'radio') {
      const opts = Array.from(label.querySelectorAll('input[type="radio"]'))
        .map((r) => (r.getAttribute('value') || '').trim())
        .filter(Boolean);
      this.vFieldOptions.set(opts.length > 0 ? opts : ['Sim', 'Não']);
    } else {
      this.vFieldOptions.set([]);
    }
  }

  protected selectLiveForm(formIdx: number): void {
    const doc = this.parseDraftDom();
    const form = doc.body.querySelectorAll('form')[formIdx] ?? doc.body.querySelector('form');
    if (!form) return;
    this.vTargetType.set('form');
    this.vFormIdx.set(formIdx);
    this.vFormTitle.set((form.querySelector('h3, h2, h4')?.textContent || 'Novo Registro').trim());
    this.vFormCollection.set(form.getAttribute('data-mpx-collection') || this.inferDefaultCollection());
    const btn = Array.from(form.querySelectorAll('button')).find(
      (b) => !b.hasAttribute('data-mpx-combo-manage'),
    );
    this.vFormButtonText.set((btn?.textContent || 'Salvar Registro').trim());
  }

  protected selectLiveTable(tableIdx: number): void {
    const doc = this.parseDraftDom();
    const table = doc.body.querySelectorAll('table')[tableIdx] ?? doc.body.querySelector('table');
    if (!table) return;
    this.vTargetType.set('table');
    this.vTableIdx.set(tableIdx);
    const col =
      table.getAttribute('data-mpx-collection') ||
      table.closest('[data-mpx-collection]')?.getAttribute('data-mpx-collection') ||
      this.inferDefaultCollection();
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

  protected selectLiveKpi(kpiIdx: number): void {
    const doc = this.parseDraftDom();
    const grid = doc.body.querySelector(
      '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
    );
    if (!grid) return;
    const cards = Array.from(grid.children) as HTMLElement[];
    const card = cards[kpiIdx] ?? cards[0];
    if (!card) return;
    this.vTargetType.set('kpi');
    this.vKpiIdx.set(cards.indexOf(card));
    this.vKpiTitle.set((card.querySelector('span')?.textContent || 'Indicador').trim());
    const valDiv = (card.querySelector('[data-mpx-kpi-value]') ||
      card.querySelector('.text-2xl')) as HTMLElement | null;
    this.vKpiValue.set((valDiv?.textContent || 'R$ 0,00').trim());
    const mode = card.getAttribute('data-mpx-kpi-mode') as
      | 'sum'
      | 'count'
      | 'pending'
      | 'static'
      | null;
    this.vKpiMode.set(mode || 'sum');
  }

  protected selectLiveHero(): void {
    const doc = this.parseDraftDom();
    const hero =
      doc.body.querySelector('[data-mpx-block="hero"]') || doc.body.querySelector('.rounded-3xl');
    if (!hero) return;
    this.vTargetType.set('hero');
    this.vHeroBadge.set((hero.querySelector('.rounded-full')?.textContent || 'Módulo Ativo').trim());
    this.vHeroTitle.set((hero.querySelector('h1')?.textContent || 'Título').trim());
    this.vHeroSubtitle.set((hero.querySelector('p')?.textContent || '').trim());
  }

  protected applyLiveFieldChanges(overrides?: {
    label?: string;
    placeholder?: string;
    type?: LiveFieldType;
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

    const doc = this.parseDraftDom();
    const form = doc.body.querySelectorAll('form')[this.vFormIdx()] ?? doc.body.querySelector('form');
    if (!form) return;
    this.ensureForm12ColGrid(form);
    const label = form.querySelectorAll('label')[this.vFieldIdx()];
    if (!label) return;

    const cleanLabel = this.vFieldLabel().replace(/\*/g, '').trim() || 'Campo';
    const fieldKey = this.runtimeStore.normalizeFieldKey(cleanLabel);
    this.vFieldKey.set(fieldKey);
    const fType = this.vFieldType();
    let options = this.vFieldOptions();
    if ((fType === 'select' || fType === 'radio') && options.length === 0) {
      options = this.runtimeStore.getComboOptions(fieldKey, ['Opção 1', 'Opção 2', 'Opção 3']);
      this.vFieldOptions.set(options);
    }
    if (fType === 'select') {
      this.runtimeStore.saveComboOptions(fieldKey, options);
    }

    const newEl = this.createFieldDomNode(doc, {
      label: cleanLabel,
      fieldKey,
      type: fType,
      colSpan: this.vFieldColSpan(),
      required: this.vFieldRequired(),
      placeholder:
        this.vFieldPlaceholder() || (fType === 'currency' ? 'R$ 0,00' : 'Digite aqui...'),
      options,
    });
    label.replaceWith(newEl);
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  protected addNewFieldToLiveForm(): void {
    const doc = this.parseDraftDom();
    const form = doc.body.querySelectorAll('form')[this.vFormIdx()] ?? doc.body.querySelector('form');
    if (!form) {
      this.insertLiveBlock('form');
      return;
    }
    const grid = this.ensureForm12ColGrid(form);
    const idx = grid.querySelectorAll('label').length + 1;
    const label = `Novo Campo ${idx}`;
    const fieldKey = this.runtimeStore.normalizeFieldKey(label);
    grid.appendChild(
      this.createFieldDomNode(doc, {
        label,
        fieldKey,
        type: 'text',
        colSpan: 6,
        required: false,
        placeholder: 'Digite aqui...',
        options: [],
      }),
    );
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
    setTimeout(() => this.selectLiveField(this.vFormIdx(), idx - 1), 30);
  }

  protected moveLiveField(dir: -1 | 1): void {
    const doc = this.parseDraftDom();
    const form = doc.body.querySelectorAll('form')[this.vFormIdx()] ?? doc.body.querySelector('form');
    if (!form) return;
    const labels = Array.from(form.querySelectorAll('label'));
    const i = this.vFieldIdx();
    const t = i + dir;
    if (i < 0 || t < 0 || t >= labels.length) return;
    const parent = labels[i].parentElement;
    if (!parent) return;
    if (dir === -1) parent.insertBefore(labels[i], labels[t]);
    else parent.insertBefore(labels[t], labels[i]);
    this.vFieldIdx.set(t);
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  protected removeLiveField(): void {
    const doc = this.parseDraftDom();
    const form = doc.body.querySelectorAll('form')[this.vFormIdx()] ?? doc.body.querySelector('form');
    if (!form) return;
    form.querySelectorAll('label')[this.vFieldIdx()]?.remove();
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
    this.vTargetType.set('form');
  }

  protected syncLiveTableWithForm(): void {
    const doc = this.parseDraftDom();
    const form = doc.body.querySelector('form');
    const table = doc.body.querySelectorAll('table')[this.vTableIdx()] ?? doc.body.querySelector('table');
    if (!form || !table) return;

    const col = form.getAttribute('data-mpx-collection') || this.inferDefaultCollection();
    table.setAttribute('data-mpx-collection', col);
    table.closest('[data-mpx-block="table"]')?.setAttribute('data-mpx-collection', col);

    const cols: { header: string; key: string }[] = [{ header: 'Código', key: 'codigo' }];
    for (const lbl of Array.from(form.querySelectorAll('label'))) {
      const h = this.extractLabelText(lbl);
      const ctrl = lbl.querySelector('input, select, textarea');
      const k =
        ctrl?.getAttribute('data-mpx-field') ||
        ctrl?.getAttribute('name') ||
        this.runtimeStore.normalizeFieldKey(h);
      if (h) cols.push({ header: h, key: k });
    }

    let theadRow = table.querySelector('thead tr');
    if (!theadRow) {
      const thead = doc.createElement('thead');
      theadRow = doc.createElement('tr');
      thead.appendChild(theadRow);
      table.prepend(thead);
    }
    theadRow.innerHTML = '';
    for (const c of cols) {
      const th = doc.createElement('th');
      th.setAttribute('data-mpx-field', c.key);
      th.className = 'px-4 py-3';
      th.textContent = c.header;
      theadRow.appendChild(th);
    }
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
    this.selectLiveTable(this.vTableIdx());
  }

  protected applyLiveFormChanges(overrides?: {
    title?: string;
    collection?: string;
    buttonText?: string;
  }): void {
    if (overrides?.title !== undefined) this.vFormTitle.set(overrides.title);
    if (overrides?.collection !== undefined) this.vFormCollection.set(overrides.collection);
    if (overrides?.buttonText !== undefined) this.vFormButtonText.set(overrides.buttonText);

    const doc = this.parseDraftDom();
    const form = doc.body.querySelectorAll('form')[this.vFormIdx()] ?? doc.body.querySelector('form');
    if (!form) return;
    form.setAttribute('data-mpx-collection', this.vFormCollection());
    const h3 = form.querySelector('h3, h2, h4');
    if (h3) h3.textContent = this.vFormTitle();
    const btn = Array.from(form.querySelectorAll('button')).find(
      (b) => !b.hasAttribute('data-mpx-combo-manage'),
    );
    if (btn) btn.textContent = this.vFormButtonText();
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  protected applyLiveTableCollection(col: string): void {
    this.vTableCollection.set(col);
    const doc = this.parseDraftDom();
    const table = doc.body.querySelectorAll('table')[this.vTableIdx()] ?? doc.body.querySelector('table');
    if (!table) return;
    table.setAttribute('data-mpx-collection', col);
    table.closest('[data-mpx-block="table"]')?.setAttribute('data-mpx-collection', col);
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  protected applyLiveKpiChanges(overrides?: {
    title?: string;
    value?: string;
    mode?: 'sum' | 'count' | 'pending' | 'static';
    color?: 'neutral' | 'jade' | 'amber' | 'violet' | 'red';
  }): void {
    if (overrides?.title !== undefined) this.vKpiTitle.set(overrides.title);
    if (overrides?.value !== undefined) this.vKpiValue.set(overrides.value);
    if (overrides?.mode !== undefined) this.vKpiMode.set(overrides.mode);
    if (overrides?.color !== undefined) this.vKpiColor.set(overrides.color);

    const doc = this.parseDraftDom();
    const grid = doc.body.querySelector(
      '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
    );
    const card = grid?.children[this.vKpiIdx()] as HTMLElement | undefined;
    if (!card) return;
    card.setAttribute('data-mpx-kpi-mode', this.vKpiMode());
    const span = card.querySelector('span');
    if (span) span.textContent = this.vKpiTitle();
    const valDiv = (card.querySelector('[data-mpx-kpi-value]') ||
      card.querySelector('.text-2xl')) as HTMLElement | null;
    if (valDiv) {
      const colorMap: Record<string, string> = {
        neutral: 'text-neutral-12',
        jade: 'text-jade-a11',
        amber: 'text-amber-a11',
        violet: 'text-primary-11',
        red: 'text-red-a11',
      };
      valDiv.className = `mt-2 text-2xl font-bold ${colorMap[this.vKpiColor()] || 'text-neutral-12'}`;
      if (this.vKpiMode() === 'static') valDiv.textContent = this.vKpiValue();
    }
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  protected applyLiveHeroChanges(overrides?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  }): void {
    if (overrides?.badge !== undefined) this.vHeroBadge.set(overrides.badge);
    if (overrides?.title !== undefined) this.vHeroTitle.set(overrides.title);
    if (overrides?.subtitle !== undefined) this.vHeroSubtitle.set(overrides.subtitle);

    const doc = this.parseDraftDom();
    const hero =
      doc.body.querySelector('[data-mpx-block="hero"]') || doc.body.querySelector('.rounded-3xl');
    if (!hero) return;
    const badge = hero.querySelector('.rounded-full');
    if (badge) badge.textContent = this.vHeroBadge();
    const h1 = hero.querySelector('h1');
    if (h1) h1.textContent = this.vHeroTitle();
    const p = hero.querySelector('p');
    if (p) p.textContent = this.vHeroSubtitle();
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  protected removeSelectedLiveBlock(): void {
    const doc = this.parseDraftDom();
    const t = this.vTargetType();
    if (t === 'form') doc.body.querySelectorAll('form')[this.vFormIdx()]?.remove();
    else if (t === 'table') {
      const tbl = doc.body.querySelectorAll('table')[this.vTableIdx()];
      (tbl?.closest('[data-mpx-block="table"]') || tbl)?.remove();
    } else if (t === 'kpi') {
      doc.body
        .querySelector('[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4')
        ?.remove();
    } else if (t === 'hero') {
      (
        doc.body.querySelector('[data-mpx-block="hero"]') || doc.body.querySelector('.rounded-3xl')
      )?.remove();
    }
    this.vTargetType.set(null);
    this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
  }

  private parseDraftDom(): Document {
    const parser = new DOMParser();
    return parser.parseFromString(this.currentRawHtml(), 'text/html');
  }

  private ensureForm12ColGrid(form: HTMLElement): HTMLElement {
    let grid =
      (form.querySelector('[data-mpx-form-grid]') as HTMLElement | null) ||
      (form.querySelector('.grid') as HTMLElement | null);
    if (!grid) {
      grid = form.ownerDocument.createElement('div');
      form.insertBefore(grid, form.lastElementChild);
    }
    grid.setAttribute('data-mpx-form-grid', '');
    grid.className = 'grid grid-cols-12 gap-4';
    return grid;
  }

  private detectColSpan(el: HTMLElement): number {
    const attr = Number(el.getAttribute('data-mpx-col-span'));
    if ([3, 4, 6, 9, 12].includes(attr)) return attr;
    const cls = el.className || '';
    if (cls.includes('sm:col-span-3')) return 3;
    if (cls.includes('sm:col-span-4')) return 4;
    if (cls.includes('sm:col-span-9')) return 9;
    if (cls.includes('sm:col-span-12')) return 12;
    return 6;
  }

  private colSpanClass(span: number): string {
    if (span === 3) return 'col-span-12 sm:col-span-3';
    if (span === 4) return 'col-span-12 sm:col-span-4';
    if (span === 9) return 'col-span-12 sm:col-span-9';
    if (span === 12) return 'col-span-12 sm:col-span-12';
    return 'col-span-12 sm:col-span-6';
  }

  private detectFieldType(ctrl: HTMLElement | null): LiveFieldType {
    if (!ctrl) return 'text';
    const exp = ctrl.getAttribute('data-mpx-type') as LiveFieldType | null;
    if (exp) return exp;
    const tag = ctrl.tagName.toLowerCase();
    if (tag === 'select') return 'select';
    if (tag === 'textarea') return 'textarea';
    const t = (ctrl.getAttribute('type') || 'text').toLowerCase();
    if (t === 'date') return 'date';
    if (t === 'number') return 'number';
    if (t === 'checkbox') return 'checkbox';
    if (t === 'radio') return 'radio';
    if ((ctrl.getAttribute('placeholder') || '').includes('R$')) return 'currency';
    return 'text';
  }

  private createFieldDomNode(
    doc: Document,
    cfg: {
      label: string;
      fieldKey: string;
      type: LiveFieldType;
      colSpan: number;
      required: boolean;
      placeholder: string;
      options: string[];
    },
  ): HTMLElement {
    const lbl = doc.createElement('label');
    lbl.setAttribute('data-mpx-col-span', String(cfg.colSpan));
    lbl.className = `${this.colSpanClass(cfg.colSpan)} flex flex-col gap-1 text-xs font-semibold text-neutral-a11`;
    lbl.appendChild(doc.createTextNode(`\n      ${cfg.required ? cfg.label + ' *' : cfg.label}\n      `));

    const cls =
      'rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12';
    if (cfg.type === 'select') {
      const sel = doc.createElement('select');
      sel.setAttribute('name', cfg.fieldKey);
      sel.setAttribute('data-mpx-field', cfg.fieldKey);
      sel.setAttribute('data-mpx-combo-key', cfg.fieldKey);
      sel.setAttribute('data-mpx-type', 'select');
      if (cfg.required) sel.setAttribute('required', '');
      sel.className = cls;
      for (const o of cfg.options) {
        const opt = doc.createElement('option');
        opt.setAttribute('value', o);
        opt.textContent = o;
        sel.appendChild(opt);
      }
      lbl.appendChild(sel);
    } else if (cfg.type === 'textarea') {
      const ta = doc.createElement('textarea');
      ta.setAttribute('name', cfg.fieldKey);
      ta.setAttribute('data-mpx-field', cfg.fieldKey);
      ta.setAttribute('data-mpx-type', 'textarea');
      ta.setAttribute('rows', '3');
      ta.setAttribute('placeholder', cfg.placeholder);
      if (cfg.required) ta.setAttribute('required', '');
      ta.className = cls;
      lbl.appendChild(ta);
    } else if (cfg.type === 'checkbox') {
      const wrap = doc.createElement('div');
      wrap.className = 'mt-1 flex h-10 items-center gap-2.5 rounded-xl border border-neutral-a5 px-3.5';
      const chk = doc.createElement('input');
      chk.setAttribute('type', 'checkbox');
      chk.setAttribute('name', cfg.fieldKey);
      chk.setAttribute('data-mpx-field', cfg.fieldKey);
      chk.setAttribute('data-mpx-type', 'checkbox');
      chk.className = 'size-4 accent-violet-600';
      const span = doc.createElement('span');
      span.className = 'text-sm font-medium text-neutral-12';
      span.textContent = cfg.placeholder || 'Sim / Ativo';
      wrap.appendChild(chk);
      wrap.appendChild(span);
      lbl.appendChild(wrap);
    } else if (cfg.type === 'radio') {
      const wrap = doc.createElement('div');
      wrap.className = 'mt-1 flex flex-wrap items-center gap-4 rounded-xl border border-neutral-a5 px-3.5 py-2';
      (cfg.options.length ? cfg.options : ['Sim', 'Não']).forEach((optText, i) => {
        const s = doc.createElement('span');
        s.className = 'inline-flex items-center gap-1.5 text-sm font-normal text-neutral-12';
        const r = doc.createElement('input');
        r.setAttribute('type', 'radio');
        r.setAttribute('name', cfg.fieldKey);
        r.setAttribute('data-mpx-field', cfg.fieldKey);
        r.setAttribute('data-mpx-type', 'radio');
        r.setAttribute('value', optText);
        if (i === 0) r.setAttribute('checked', '');
        r.className = 'size-4 accent-violet-600';
        s.appendChild(r);
        s.appendChild(doc.createTextNode(optText));
        wrap.appendChild(s);
      });
      lbl.appendChild(wrap);
    } else {
      const inp = doc.createElement('input');
      inp.setAttribute(
        'type',
        cfg.type === 'date' ? 'date' : cfg.type === 'number' ? 'number' : 'text',
      );
      inp.setAttribute('name', cfg.fieldKey);
      inp.setAttribute('data-mpx-field', cfg.fieldKey);
      inp.setAttribute('data-mpx-type', cfg.type);
      inp.setAttribute('placeholder', cfg.placeholder);
      if (cfg.required) inp.setAttribute('required', '');
      inp.className = cls;
      lbl.appendChild(inp);
    }
    return lbl;
  }

  private liveDragPayload: {
    kind: 'block' | 'kpi' | 'field';
    index: number;
    formIndex?: number;
  } | null = null;

  protected onLiveDragStart(event: DragEvent): void {
    if (!this.liveBuilderMode()) return;
    const target = event.target as HTMLElement | null;
    const root = this.runtimeRootRef?.nativeElement;
    if (!target || !root) return;

    const labelEl = target.closest('form label') as HTMLLabelElement | null;
    if (labelEl) {
      const formEl = labelEl.closest('form');
      const allForms = Array.from(root.querySelectorAll('form'));
      const fIdx = formEl ? Math.max(0, allForms.indexOf(formEl)) : 0;
      const allLabels = formEl ? Array.from(formEl.querySelectorAll('label')) : [];
      const lIdx = Math.max(0, allLabels.indexOf(labelEl));
      this.liveDragPayload = { kind: 'field', index: lIdx, formIndex: fIdx };
      event.dataTransfer?.setData('text/plain', `field:${fIdx}:${lIdx}`);
      return;
    }

    const kpiGrid = target.closest(
      '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
    );
    if (kpiGrid) {
      const cards = Array.from(kpiGrid.children) as HTMLElement[];
      const cardEl = cards.find((c) => c === target || c.contains(target));
      if (cardEl) {
        const kIdx = cards.indexOf(cardEl);
        this.liveDragPayload = { kind: 'kpi', index: kIdx };
        event.dataTransfer?.setData('text/plain', `kpi:${kIdx}`);
        return;
      }
    }

    const container = (root.querySelector('.flex.flex-col') || root) as HTMLElement;
    const topBlocks = Array.from(container.children) as HTMLElement[];
    const blockEl = topBlocks.find((b) => b === target || b.contains(target));
    if (blockEl) {
      const bIdx = topBlocks.indexOf(blockEl);
      this.liveDragPayload = { kind: 'block', index: bIdx };
      event.dataTransfer?.setData('text/plain', `block:${bIdx}`);
    }
  }

  protected onLiveDragOver(event: DragEvent): void {
    if (!this.liveBuilderMode() || !this.liveDragPayload) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected onLiveDrop(event: DragEvent): void {
    if (!this.liveBuilderMode()) return;
    const payload = this.liveDragPayload;
    this.liveDragPayload = null;
    if (!payload) return;
    event.preventDefault();

    const target = event.target as HTMLElement | null;
    const root = this.runtimeRootRef?.nativeElement;
    if (!target || !root) return;

    const doc = this.parseDraftDom();

    if (payload.kind === 'field') {
      const labelEl = target.closest('form label') as HTMLLabelElement | null;
      if (!labelEl) return;
      const formEl = labelEl.closest('form');
      const allLabels = formEl ? Array.from(formEl.querySelectorAll('label')) : [];
      const toIdx = allLabels.indexOf(labelEl);
      if (toIdx < 0 || toIdx === payload.index) return;

      const domForm =
        doc.body.querySelectorAll('form')[payload.formIndex ?? 0] ?? doc.body.querySelector('form');
      if (!domForm) return;
      const domLabels = Array.from(domForm.querySelectorAll('label'));
      const src = domLabels[payload.index];
      const dst = domLabels[toIdx];
      if (!src || !dst || !dst.parentElement) return;
      if (payload.index < toIdx) {
        dst.parentElement.insertBefore(src, dst.nextSibling);
      } else {
        dst.parentElement.insertBefore(src, dst);
      }
      this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
      setTimeout(() => this.selectLiveField(payload.formIndex ?? 0, toIdx), 30);
      return;
    }

    if (payload.kind === 'kpi') {
      const kpiGrid = target.closest(
        '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
      );
      if (!kpiGrid) return;
      const cards = Array.from(kpiGrid.children) as HTMLElement[];
      const cardEl = cards.find((c) => c === target || c.contains(target));
      if (!cardEl) return;
      const toIdx = cards.indexOf(cardEl);
      if (toIdx < 0 || toIdx === payload.index) return;

      const domGrid = doc.body.querySelector(
        '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
      );
      if (!domGrid) return;
      const domCards = Array.from(domGrid.children);
      const src = domCards[payload.index];
      const dst = domCards[toIdx];
      if (!src || !dst) return;
      if (payload.index < toIdx) {
        domGrid.insertBefore(src, dst.nextSibling);
      } else {
        domGrid.insertBefore(src, dst);
      }
      this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
      setTimeout(() => this.selectLiveKpi(toIdx), 30);
      return;
    }

    if (payload.kind === 'block') {
      const container = (root.querySelector('.flex.flex-col') || root) as HTMLElement;
      const topBlocks = Array.from(container.children) as HTMLElement[];
      const blockEl = topBlocks.find((b) => b === target || b.contains(target));
      if (!blockEl) return;
      const toIdx = topBlocks.indexOf(blockEl);
      if (toIdx < 0 || toIdx === payload.index) return;

      const domContainer =
        (doc.body.querySelector('.flex.flex-col') as HTMLElement | null) || doc.body;
      const domBlocks = Array.from(domContainer.children);
      const src = domBlocks[payload.index];
      const dst = domBlocks[toIdx];
      if (!src || !dst) return;
      if (payload.index < toIdx) {
        domContainer.insertBefore(src, dst.nextSibling);
      } else {
        domContainer.insertBefore(src, dst);
      }
      this.liveDraftHtml.set(formatHtmlPretty(doc.body.innerHTML));
    }
  }

  private applyLiveSelectionHighlight(): void {
    const root = this.runtimeRootRef?.nativeElement;
    if (!root) return;
    root.querySelectorAll('.mpx-live-selected').forEach((el) => el.classList.remove('mpx-live-selected'));

    if (this.liveBuilderMode()) {
      root.querySelectorAll('form label').forEach((el) => el.setAttribute('draggable', 'true'));
      root
        .querySelectorAll('[data-mpx-block="kpi"] > *, .sm\\:grid-cols-3 > *, .sm\\:grid-cols-4 > *')
        .forEach((el) => el.setAttribute('draggable', 'true'));
      const container = (root.querySelector('.flex.flex-col') || root) as HTMLElement;
      Array.from(container.children).forEach((el) => el.setAttribute('draggable', 'true'));
    }

    const t = this.vTargetType();
    if (!t) return;
    if (t === 'field') {
      const form = root.querySelectorAll('form')[this.vFormIdx()];
      form?.querySelectorAll('label')[this.vFieldIdx()]?.classList.add('mpx-live-selected');
    } else if (t === 'form') {
      root.querySelectorAll('form')[this.vFormIdx()]?.classList.add('mpx-live-selected');
    } else if (t === 'table') {
      const tbl = root.querySelectorAll('table')[this.vTableIdx()];
      (tbl?.closest('[data-mpx-block="table"]') || tbl)?.classList.add('mpx-live-selected');
    } else if (t === 'kpi') {
      const grid = root.querySelector(
        '[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4',
      );
      grid?.children[this.vKpiIdx()]?.classList.add('mpx-live-selected');
    } else if (t === 'hero') {
      (
        root.querySelector('[data-mpx-block="hero"]') || root.querySelector('.rounded-3xl')
      )?.classList.add('mpx-live-selected');
    }
  }

  protected openComboManager(comboKey: string, comboLabel: string): void {
    const root = this.runtimeRootRef?.nativeElement;
    const selectEl = root?.querySelector(
      `select[data-mpx-combo-key="${comboKey}"], select[name="${comboKey}"]`,
    ) as HTMLSelectElement | null;
    const domDefaults = selectEl
      ? Array.from(selectEl.options)
          .map((o) => o.value || o.textContent || '')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('selecione'))
      : [];

    const options = this.runtimeStore.getComboOptions(comboKey, domDefaults);
    this.comboModalKey.set(comboKey);
    this.comboModalLabel.set(comboLabel);
    this.comboModalOptions.set([...options]);
    this.comboModalNewOption.set('');
    this.comboModalOpen.set(true);
  }

  protected addComboOptionInModal(): void {
    const val = this.comboModalNewOption().trim();
    if (!val) {
      return;
    }
    const updated = this.runtimeStore.saveComboOptions(this.comboModalKey(), [
      ...this.comboModalOptions(),
      val,
    ]);
    this.comboModalOptions.set(updated);
    this.comboModalNewOption.set('');
    if (this.vTargetType() === 'field' && this.vFieldKey() === this.comboModalKey()) {
      this.vFieldOptions.set(updated);
    }
  }

  protected removeComboOptionInModal(optionText: string): void {
    const next = this.comboModalOptions().filter((o) => o !== optionText);
    const updated = this.runtimeStore.saveComboOptions(this.comboModalKey(), next);
    this.comboModalOptions.set(updated);
    if (this.vTargetType() === 'field' && this.vFieldKey() === this.comboModalKey()) {
      this.vFieldOptions.set(updated);
    }
  }

  protected closeComboModal(): void {
    this.comboModalOpen.set(false);
  }

  private inferDefaultCollection(): string {
    const slug = (this.matchedPage()?.subModule.routePattern || this.subPath() || '').toLowerCase();
    if (slug.includes('nota') || slug.includes('nf')) {
      return 'notas-fiscais';
    }
    if (slug.includes('fornecedor')) {
      return 'fornecedores';
    }
    return 'contas-pagar';
  }

  private hydrateRuntimeDom(): void {
    const root = this.runtimeRootRef?.nativeElement;
    if (!root) {
      return;
    }

    const defaultCollection = this.inferDefaultCollection();

    // 1. Hidratar todos os <select> com as opções salvas + botão [+] ao lado
    const selects = Array.from(root.querySelectorAll('select'));
    for (const selectEl of selects) {
      const labelEl = selectEl.closest('label');
      const labelText = this.extractLabelText(labelEl) || 'Opções';
      const fieldKey =
        selectEl.getAttribute('data-mpx-combo-key') ||
        selectEl.getAttribute('data-mpx-field') ||
        selectEl.getAttribute('name') ||
        this.runtimeStore.normalizeFieldKey(labelText);

      selectEl.setAttribute('data-mpx-combo-key', fieldKey);
      if (!selectEl.getAttribute('name')) {
        selectEl.setAttribute('name', fieldKey);
      }

      const domOptions = Array.from(selectEl.options)
        .map((o) => (o.value || o.textContent || '').trim())
        .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('selecione'));

      const currentValue = selectEl.value;
      const savedOptions = this.runtimeStore.getComboOptions(fieldKey, domOptions);

      selectEl.innerHTML = '';
      const placeholderOpt = document.createElement('option');
      placeholderOpt.value = '';
      placeholderOpt.textContent = 'Selecione...';
      selectEl.appendChild(placeholderOpt);

      for (const optText of savedOptions) {
        const opt = document.createElement('option');
        opt.value = optText;
        opt.textContent = optText;
        selectEl.appendChild(opt);
      }
      if (currentValue && savedOptions.includes(currentValue)) {
        selectEl.value = currentValue;
      }

      const parent = selectEl.parentElement;
      if (parent && !parent.querySelector(`[data-mpx-combo-manage="${fieldKey}"]`)) {
        if (parent.tagName === 'LABEL') {
          const rowWrap = document.createElement('div');
          rowWrap.className = 'flex items-center gap-1.5 w-full';
          selectEl.classList.add('flex-1', 'w-full');
          parent.insertBefore(rowWrap, selectEl);
          rowWrap.appendChild(selectEl);
          rowWrap.appendChild(this.createComboPlusButton(fieldKey, labelText));
        } else {
          parent.classList.add('flex', 'items-center', 'gap-1.5');
          selectEl.classList.add('flex-1', 'w-full');
          parent.appendChild(this.createComboPlusButton(fieldKey, labelText));
        }
      }
    }

    // 2. Garantir atributo name / data-mpx-field em todos os inputs e textareas de formulários
    const forms = Array.from(root.querySelectorAll('form'));
    for (const form of forms) {
      if (!form.getAttribute('data-mpx-collection')) {
        form.setAttribute('data-mpx-collection', defaultCollection);
      }
      const labels = Array.from(form.querySelectorAll('label'));
      for (const label of labels) {
        const labelTitle = this.extractLabelText(label);
        const input = label.querySelector('input, select, textarea') as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | null;
        if (input && labelTitle) {
          const key =
            input.getAttribute('data-mpx-field') ||
            input.getAttribute('name') ||
            this.runtimeStore.normalizeFieldKey(labelTitle);
          input.setAttribute('data-mpx-field', key);
          if (!input.getAttribute('name')) {
            input.setAttribute('name', key);
          }
        }
      }
    }

    // 3. Hidratar Tabelas (<table>) com os registros reais da coleção + botões Editar e Excluir
    const tables = Array.from(root.querySelectorAll('table'));
    for (const table of tables) {
      const wrapper = table.closest('[data-mpx-collection]') as HTMLElement | null;
      const collection =
        table.getAttribute('data-mpx-collection') ||
        wrapper?.getAttribute('data-mpx-collection') ||
        forms[0]?.getAttribute('data-mpx-collection') ||
        defaultCollection;

      const records = this.runtimeStore.getRecords(collection);
      const theadRow = table.querySelector('thead tr');
      const tbody = table.querySelector('tbody');
      if (!theadRow || !tbody) {
        continue;
      }

      const ths = Array.from(theadRow.querySelectorAll('th'));
      const dataThs = ths.filter((th) => !th.hasAttribute('data-mpx-actions-col'));
      if (!theadRow.querySelector('[data-mpx-actions-col]')) {
        const actionTh = document.createElement('th');
        actionTh.setAttribute('data-mpx-actions-col', 'true');
        actionTh.className = 'px-4 py-3 text-right';
        actionTh.textContent = 'Ações';
        theadRow.appendChild(actionTh);
      }

      const columns = dataThs.map((th, idx) => {
        const text = (th.textContent || '').trim();
        const explicitField = th.getAttribute('data-mpx-field');
        const key = explicitField || this.runtimeStore.normalizeFieldKey(text);
        return { index: idx, header: text, key };
      });

      tbody.innerHTML = '';
      if (records.length === 0) {
        const emptyTr = document.createElement('tr');
        const emptyTd = document.createElement('td');
        emptyTd.colSpan = columns.length + 1;
        emptyTd.className = 'px-4 py-8 text-center text-xs text-neutral-a10';
        emptyTd.textContent =
          'Nenhum registro cadastrado ainda. Utilize o formulário para incluir o primeiro item.';
        emptyTr.appendChild(emptyTd);
        tbody.appendChild(emptyTr);
        continue;
      }

      for (const rec of records) {
        const tr = document.createElement('tr');
        tr.className = 'transition hover:bg-neutral-a2/40';
        if (this.editingRecordId() === rec.id) {
          tr.className += ' bg-primary-a2/50';
        }

        for (const col of columns) {
          const td = document.createElement('td');
          td.className = 'px-4 py-3 text-sm text-neutral-12';
          const val = this.resolveRecordValueForColumn(rec, col.key, col.header, col.index);
          this.renderCellContent(td, col.key, col.header, val);
          tr.appendChild(td);
        }

        const actionTd = document.createElement('td');
        actionTd.className = 'px-4 py-3 text-right whitespace-nowrap';
        actionTd.innerHTML = `
          <div class="inline-flex items-center justify-end gap-1.5">
            <button type="button" data-mpx-row-edit="${rec.id}" data-mpx-row-collection="${collection}" class="rounded-lg border border-neutral-a5 bg-neutral-1 px-2.5 py-1 text-xs font-semibold text-neutral-12 transition hover:border-primary-8 hover:text-primary-11">
              Editar
            </button>
            <button type="button" data-mpx-row-delete="${rec.id}" data-mpx-row-collection="${collection}" class="rounded-lg border border-red-a5 bg-red-a2 px-2.5 py-1 text-xs font-semibold text-red-a11 transition hover:bg-red-a3">
              Excluir
            </button>
          </div>
        `;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
      }
    }

    // 4. Hidratar Cards de KPI (Soma automática, contagem ou filtro)
    const kpiBlocks = Array.from(
      root.querySelectorAll('[data-mpx-block="kpi"], .sm\\:grid-cols-3, .sm\\:grid-cols-4'),
    );
    const activeCollection =
      forms[0]?.getAttribute('data-mpx-collection') ||
      tables[0]?.getAttribute('data-mpx-collection') ||
      defaultCollection;
    const recordsForKpi = this.runtimeStore.getRecords(activeCollection);

    for (const kpiGrid of kpiBlocks) {
      const cards = Array.from(kpiGrid.children) as HTMLElement[];
      cards.forEach((card, cardIdx) => {
        const mode =
          card.getAttribute('data-mpx-kpi-mode') ||
          (cardIdx === 0 ? 'sum' : cardIdx === 1 ? 'count' : 'pending');
        if (mode === 'static') {
          return;
        }
        const field = card.getAttribute('data-mpx-kpi-field') || 'valor';
        const valEl =
          (card.querySelector('[data-mpx-kpi-value]') as HTMLElement | null) ||
          (card.querySelector('.text-2xl') as HTMLElement | null);
        if (!valEl) {
          return;
        }

        if (mode === 'sum') {
          const total = recordsForKpi.reduce((acc, item) => {
            const rawVal =
              item[field] ?? item['valor'] ?? item['valor_total'] ?? item['total'] ?? 0;
            return acc + this.runtimeStore.parseCurrencyNumber(rawVal);
          }, 0);
          valEl.textContent = this.runtimeStore.formatCurrencyBRL(total);
        } else if (mode === 'count') {
          valEl.textContent = `${recordsForKpi.length} registro(s)`;
        } else if (mode === 'pending') {
          const pendingCount = recordsForKpi.filter((r) => {
            const st = String(r['status'] || r['situacao'] || '').toLowerCase();
            return st.includes('pendente') || st.includes('aberto') || st.includes('vencid');
          }).length;
          valEl.textContent = `${pendingCount} pendente(s)`;
        }
      });
    }
  }

  private createComboPlusButton(fieldKey: string, labelText: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-mpx-combo-manage', fieldKey);
    btn.setAttribute('data-mpx-combo-label', labelText);
    btn.title = `Adicionar ou remover opções de "${labelText}"`;
    btn.className =
      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary-a6 bg-primary-a2 text-base font-bold text-primary-11 transition hover:bg-primary-9 hover:text-white';
    btn.textContent = '+';
    return btn;
  }

  private extractLabelText(label: HTMLElement | null): string {
    if (!label) {
      return '';
    }
    const clone = label.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('input, select, textarea, button, div, span[data-mpx-err]')
      .forEach((el) => el.remove());
    return (clone.textContent || '').replace(/\*/g, '').trim();
  }

  private resolveRecordValueForColumn(
    rec: AppBuilderRecord,
    colKey: string,
    colHeader: string,
    colIndex: number,
  ): any {
    if (colKey in rec && rec[colKey] !== undefined && rec[colKey] !== '') {
      return rec[colKey];
    }
    if (colKey === 'codigo' || colKey === 'id' || colHeader.toLowerCase().includes('cód')) {
      return rec.code || '#001';
    }
    if (colKey.includes('descri') || colKey.includes('titulo')) {
      return rec['titulo'] || rec['descricao'] || rec['fornecedor'] || rec['numero_nf'] || '-';
    }
    if (colKey.includes('valor') || colKey.includes('total')) {
      return rec['valor'] || rec['valor_total'] || 'R$ 0,00';
    }
    if (colKey.includes('status') || colKey.includes('situacao')) {
      return rec['status'] || rec['situacao'] || 'Ativo';
    }
    if (colKey.includes('vencimento') || colKey.includes('data')) {
      return rec['vencimento'] || rec['data_emissao'] || rec['data'] || '-';
    }
    const userKeys = Object.keys(rec).filter(
      (k) => !['id', 'code', 'createdAt', 'updatedAt'].includes(k),
    );
    return rec[userKeys[colIndex]] ?? '-';
  }

  private renderCellContent(
    td: HTMLTableCellElement,
    colKey: string,
    colHeader: string,
    val: any,
  ): void {
    const strVal = String(val ?? '-');
    if (colKey === 'codigo' || strVal.startsWith('#')) {
      td.className = 'px-4 py-3 font-mono text-xs text-neutral-a11';
      td.textContent = strVal;
      return;
    }
    if (colKey.includes('status') || colKey.includes('situacao')) {
      const lower = strVal.toLowerCase();
      let badgeClass = 'bg-jade-a3 text-jade-a11';
      if (lower.includes('pendente') || lower.includes('aguard')) {
        badgeClass = 'bg-amber-a3 text-amber-a11';
      } else if (lower.includes('vencid') || lower.includes('cancel') || lower.includes('rejeit')) {
        badgeClass = 'bg-red-a3 text-red-a11';
      }
      td.innerHTML = `<span class="rounded-md px-2.5 py-0.5 text-xs font-semibold ${badgeClass}">${strVal}</span>`;
      return;
    }
    if (
      colKey.includes('valor') ||
      colHeader.toLowerCase().includes('valor') ||
      strVal.startsWith('R$')
    ) {
      td.className = 'px-4 py-3 font-semibold text-neutral-12';
      td.textContent = strVal.startsWith('R$')
        ? strVal
        : this.runtimeStore.formatCurrencyBRL(strVal);
      return;
    }
    td.textContent = strVal;
  }

  private processFormSubmission(form: HTMLFormElement): void {
    const collection = form.getAttribute('data-mpx-collection') || this.inferDefaultCollection();
    const controls = Array.from(
      form.querySelectorAll('input, select, textarea'),
    ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    form.querySelectorAll('[data-mpx-err]').forEach((el) => el.remove());

    let hasValidationError = false;
    const payload: Record<string, any> = {};
    const processedRadioGroups = new Set<string>();

    for (const ctrl of controls) {
      const labelEl = ctrl.closest('label');
      const labelText = this.extractLabelText(labelEl) || ctrl.getAttribute('name') || 'Campo';
      const fieldKey =
        ctrl.getAttribute('data-mpx-field') ||
        ctrl.getAttribute('name') ||
        this.runtimeStore.normalizeFieldKey(labelText);

      const isRequired =
        ctrl.hasAttribute('required') || ctrl.getAttribute('data-mpx-required') === 'true';

      if (ctrl instanceof HTMLInputElement && ctrl.type === 'checkbox') {
        payload[fieldKey] = ctrl.checked ? 'Sim' : 'Não';
        continue;
      }

      if (ctrl instanceof HTMLInputElement && ctrl.type === 'radio') {
        const groupName = ctrl.name || fieldKey;
        if (processedRadioGroups.has(groupName)) {
          continue;
        }
        processedRadioGroups.add(groupName);
        const checkedRadio = form.querySelector(
          `input[type="radio"][name="${groupName}"]:checked`,
        ) as HTMLInputElement | null;
        const val = checkedRadio?.value || '';
        if (isRequired && !val) {
          hasValidationError = true;
          this.appendFieldError(
            labelEl || ctrl.parentElement,
            `Selecione uma opção em "${labelText}".`,
          );
        }
        payload[fieldKey] = val;
        continue;
      }

      const rawValue = (ctrl.value || '').trim();
      if (isRequired && !rawValue) {
        hasValidationError = true;
        ctrl.classList.add('!border-red-9');
        this.appendFieldError(
          labelEl || ctrl.parentElement,
          `O campo "${labelText}" é obrigatório.`,
        );
        continue;
      } else {
        ctrl.classList.remove('!border-red-9');
      }

      const fieldType = ctrl.getAttribute('data-mpx-type') || ctrl.getAttribute('type') || 'text';
      if (
        fieldType === 'currency' ||
        fieldKey.includes('valor') ||
        (ctrl.getAttribute('placeholder') || '').includes('R$')
      ) {
        payload[fieldKey] = rawValue
          ? this.runtimeStore.formatCurrencyBRL(rawValue)
          : 'R$ 0,00';
      } else {
        payload[fieldKey] = rawValue;
      }
    }

    if (hasValidationError) {
      return;
    }

    this.runtimeStore.saveRecord(collection, payload, this.editingRecordId());
    this.editingRecordId.set(null);
    this.editingCollectionKey.set(null);
    form.reset();

    const submitBtn = form.querySelector(
      'button[type="submit"], button:not([data-mpx-combo-manage])',
    ) as HTMLButtonElement | null;
    if (submitBtn && submitBtn.hasAttribute('data-mpx-orig-label')) {
      submitBtn.textContent = submitBtn.getAttribute('data-mpx-orig-label');
      submitBtn.removeAttribute('data-mpx-orig-label');
    }
    form.querySelector('[data-mpx-form-cancel]')?.remove();
  }

  private appendFieldError(container: HTMLElement | null, msg: string): void {
    if (!container) {
      return;
    }
    const span = document.createElement('span');
    span.setAttribute('data-mpx-err', 'true');
    span.className = 'mt-1 text-[11px] font-semibold text-red-a11';
    span.textContent = msg;
    container.appendChild(span);
  }

  private loadRecordIntoForm(collection: string, recordId: string): void {
    const root = this.runtimeRootRef?.nativeElement;
    if (!root) {
      return;
    }
    const form = root.querySelector('form') as HTMLFormElement | null;
    if (!form) {
      return;
    }
    const rec = this.runtimeStore.getRecords(collection).find((r) => r.id === recordId);
    if (!rec) {
      return;
    }

    this.editingRecordId.set(recordId);
    this.editingCollectionKey.set(collection);

    const controls = Array.from(
      form.querySelectorAll('input, select, textarea'),
    ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    for (const ctrl of controls) {
      const labelEl = ctrl.closest('label');
      const labelText = this.extractLabelText(labelEl) || '';
      const fieldKey =
        ctrl.getAttribute('data-mpx-field') ||
        ctrl.getAttribute('name') ||
        this.runtimeStore.normalizeFieldKey(labelText);

      const recVal = rec[fieldKey];
      if (recVal === undefined) {
        continue;
      }

      if (ctrl instanceof HTMLInputElement && ctrl.type === 'checkbox') {
        ctrl.checked = recVal === 'Sim' || recVal === true;
      } else if (ctrl instanceof HTMLInputElement && ctrl.type === 'radio') {
        ctrl.checked = ctrl.value === String(recVal);
      } else {
        ctrl.value = String(recVal);
      }
    }

    const submitBtn = Array.from(form.querySelectorAll('button')).find(
      (b) => !b.hasAttribute('data-mpx-combo-manage') && !b.hasAttribute('data-mpx-form-cancel'),
    );
    if (submitBtn) {
      if (!submitBtn.hasAttribute('data-mpx-orig-label')) {
        submitBtn.setAttribute('data-mpx-orig-label', submitBtn.textContent || 'Salvar');
      }
      submitBtn.textContent = `Atualizar Registro (${rec.code || ''})`;

      if (!form.querySelector('[data-mpx-form-cancel]')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.setAttribute('data-mpx-form-cancel', 'true');
        cancelBtn.className =
          'mr-2 rounded-xl border border-neutral-a5 bg-neutral-1 px-4 py-2 text-xs font-semibold text-neutral-12 transition hover:bg-neutral-a3';
        cancelBtn.textContent = 'Cancelar Edição';
        submitBtn.parentElement?.insertBefore(cancelBtn, submitBtn);
      }
    }

    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.hydrateRuntimeDom();
  }

  private cancelFormEdit(): void {
    const root = this.runtimeRootRef?.nativeElement;
    const form = root?.querySelector('form') as HTMLFormElement | null;
    this.editingRecordId.set(null);
    this.editingCollectionKey.set(null);
    if (form) {
      form.reset();
      const submitBtn = Array.from(form.querySelectorAll('button')).find(
        (b) => b.hasAttribute('data-mpx-orig-label'),
      );
      if (submitBtn) {
        submitBtn.textContent = submitBtn.getAttribute('data-mpx-orig-label');
        submitBtn.removeAttribute('data-mpx-orig-label');
      }
      form.querySelector('[data-mpx-form-cancel]')?.remove();
    }
    this.hydrateRuntimeDom();
  }

  private matchRoutePattern(pattern: string, actualPath: string): Record<string, string> | null {
    const cleanPattern = pattern.replace(/^\/+|\/+$/g, '');
    const cleanActual = actualPath.replace(/^\/+|\/+$/g, '');
    if (!cleanPattern) {
      return null;
    }

    const patternParts = cleanPattern.split('/');
    const actualParts = cleanActual.split('/');
    if (patternParts.length !== actualParts.length) {
      return null;
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      const a = actualParts[i];
      if (p.startsWith(':')) {
        params[p.substring(1)] = decodeURIComponent(a);
      } else if (p.toLowerCase() !== a.toLowerCase()) {
        return null;
      }
    }
    return params;
  }
}
