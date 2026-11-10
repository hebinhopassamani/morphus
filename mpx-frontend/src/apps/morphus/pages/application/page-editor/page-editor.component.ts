import {
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MorphusApplicationSubModuleRef } from '@morphus/entities/application';
import { AppBuilderRuntimeStoreService, AppBuilderSanitizerService } from '@app-builder/services';
import { MorphusMessageService } from '@core/mpx-message';
import { formatHtmlPretty, MpxCodeEditorComponent } from '@src/components/morphus/code-editor';

export type PageEditorLevel = 'container' | 'row' | 'block' | 'object';
export type PageEditorInspectorTab = 'properties' | 'blocks' | 'objects';
export type PageEditorBlockKind =
  | 'empty'
  | 'hero'
  | 'kpi'
  | 'form'
  | 'table'
  | 'section'
  | 'alert'
  | 'quick-actions';
export type PageEditorObjectType =
  | 'heading'
  | 'button'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'badge'
  | 'link'
  | 'image';
export type PageEditorFieldType =
  | 'text'
  | 'currency'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea';

@Component({
  selector: 'mpx-page-editor',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MpxCodeEditorComponent,
  ],
  templateUrl: './page-editor.component.html',
  styleUrl: './page-editor.component.css',
})
export class PageEditorComponent implements OnChanges {
  private readonly sanitizer = inject(AppBuilderSanitizerService);
  private readonly runtimeStore = inject(AppBuilderRuntimeStoreService);
  private readonly messageService = inject(MorphusMessageService);

  @ViewChild('visualPreviewCanvas')
  protected visualPreviewCanvasRef?: ElementRef<HTMLDivElement>;

  @Input() page: Partial<MorphusApplicationSubModuleRef> | null = null;
  @Input() appPrefix = 'APP';
  @Input() saving = false;
  @Input() initialHtml = '';

  @Output() readonly pageChange = new EventEmitter<Partial<MorphusApplicationSubModuleRef>>();
  @Output() readonly savePage = new EventEmitter<void>();
  @Output() readonly autoSavePage = new EventEmitter<Partial<MorphusApplicationSubModuleRef>>();
  @Output() readonly cancelEditor = new EventEmitter<void>();
  @Output() readonly resetPage = new EventEmitter<void>();
  @Output() readonly openLivePreview = new EventEmitter<void>();

  /** Sinal interno espelhando a página atual para reatividade instantânea */
  protected readonly pageSignal = signal<Partial<MorphusApplicationSubModuleRef> | null>(null);

  /** Modo de Construção da Página na Fase 1: false = 1 - Editor Visual | true = 2 - Editor HTML */
  protected readonly isCustomHtmlMode = computed<boolean>(
    () => !!this.pageSignal()?.isCustomHtml,
  );

  /** Aba ativa no Modo 2 (Editor HTML Customizado): index.html | styles.css | script.ts */
  protected readonly activeCodeTab = signal<'html' | 'css' | 'ts'>('html');
  protected readonly usbGuideOpen = signal<boolean>(false);

  /** Estado do Painel Direito (Recursos e Propriedades) */
  protected readonly visualInspectorOpen = signal<boolean>(true);
  protected readonly helpGuideOpen = signal<boolean>(false);
  protected readonly inspectorTab = signal<PageEditorInspectorTab>('properties');

  /** Máquina de Estados dos 4 Níveis (Apenas 1 Nível Ativo por Vez!) */
  protected readonly activeLevel = signal<PageEditorLevel>('container');
  protected readonly openedContainerIdx = signal<number | null>(null);
  protected readonly openedRowIdx = signal<number | null>(null);
  protected readonly openedBlockIdx = signal<number | null>(null);

  protected readonly selectedContainerIdx = signal<number>(0);
  protected readonly selectedRowIdx = signal<number>(0);
  protected readonly selectedBlockIdx = signal<number>(0);
  protected readonly selectedObjectIdx = signal<number>(0);

  /** Contadores e Metadados do Elemento Selecionado para o Painel de Propriedades */
  protected readonly containerCount = signal<number>(1);
  protected readonly selectedContainerRowCount = signal<number>(1);
  protected readonly selectedRowSlotCount = signal<number>(2);
  protected readonly selectedBlockKind = signal<PageEditorBlockKind>('empty');
  protected readonly vBlockColSpan = signal<number>(6);

  /** Nomes amigáveis/customizáveis (data-mpx-name) da trilha Container => Linha => Bloco => Objeto */
  protected readonly activeContainerDisplayName = signal<string>('Container 1');
  protected readonly activeRowDisplayName = signal<string>('Linha 1');
  protected readonly activeBlockDisplayName = signal<string>('Bloco 1');
  protected readonly activeObjectDisplayName = signal<string>('Objeto 1');

  protected readonly currentEditableName = computed(() => {
    const lvl = this.activeLevel();
    if (lvl === 'container') return this.activeContainerDisplayName();
    if (lvl === 'row') return this.activeRowDisplayName();
    if (lvl === 'block') return this.activeBlockDisplayName();
    return this.activeObjectDisplayName();
  });

  /** Propriedades de Blocos Específicos (Hero, KPI, Form, Table, Section) */
  protected readonly vHeroBadge = signal<string>('');
  protected readonly vHeroTitle = signal<string>('');
  protected readonly vHeroSubtitle = signal<string>('');

  protected readonly vKpiTitle = signal<string>('');
  protected readonly vKpiMode = signal<'static' | 'sum' | 'count' | 'pending'>('static');
  protected readonly vKpiValue = signal<string>('');

  protected readonly vFormTitle = signal<string>('');
  protected readonly vFormCollection = signal<string>('contas-pagar');
  protected readonly vFormButtonText = signal<string>('Salvar Registro');

  protected readonly vTableCollection = signal<string>('contas-pagar');

  protected readonly vSectionTitle = signal<string>('');
  protected readonly vSectionSubtitle = signal<string>('');

  /** Propriedades do Nível 4 (Objeto Interno) */
  protected readonly selectedObjectIsFormField = signal<boolean>(false);
  protected readonly vObjLabel = signal<string>('');
  protected readonly vObjColSpan = signal<number>(6);
  protected readonly vFieldType = signal<PageEditorFieldType>('text');
  protected readonly vObjPlaceholder = signal<string>('');
  protected readonly vObjRequired = signal<boolean>(false);

  /** Pilhas de Undo / Redo (Ctrl+Z / Ctrl+Y) */
  protected readonly undoStack = signal<string[]>([]);
  protected readonly redoStack = signal<string[]>([]);

  /** Estado de Drag & Drop no Nível Ativo */
  private dragState: {
    sourceType: 'canvas-level' | 'palette-block' | 'palette-object';
    fromIndex?: number;
    paletteBlock?: PageEditorBlockKind;
    paletteObject?: PageEditorObjectType;
  } | null = null;

  private lastPageId: string | null = null;

  protected readonly availableCollections = computed(() => this.runtimeStore.defaultCollections);

  protected readonly colSpanChoices: { span: number; label: string; desc: string }[] = [
    { span: 3, label: '25%', desc: '4 itens na mesma linha' },
    { span: 4, label: '33%', desc: '3 itens na mesma linha' },
    { span: 6, label: '50%', desc: '2 itens lado a lado' },
    { span: 8, label: '67%', desc: '2/3 da linha' },
    { span: 9, label: '75%', desc: '3/4 da linha' },
    { span: 12, label: '100%', desc: 'Linha inteira' },
  ];

  protected readonly blockPaletteItems: {
    type: PageEditorBlockKind;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    {
      type: 'hero',
      label: 'Cabeçalho da Página',
      desc: 'Selo superior, título principal e subtítulo',
      icon: 'sparkles',
    },
    {
      type: 'kpi',
      label: 'Card Indicador KPI',
      desc: 'Card de soma automática, contagem ou valor fixo',
      icon: 'chart-no-axes-combined',
    },
    {
      type: 'form',
      label: 'Formulário de Cadastro',
      desc: 'Grade de campos 25%, 50%, 100% conectado à API',
      icon: 'file-text',
    },
    {
      type: 'table',
      label: 'Tabela de Dados',
      desc: 'Listagem conectada ao cadastro com colunas',
      icon: 'layers',
    },
    {
      type: 'section',
      label: 'Seção Livre para Objetos',
      desc: 'Bloco limpo para posicionar botões, combos e textos',
      icon: 'boxes',
    },
    {
      type: 'quick-actions',
      label: 'Barra de Ações Rápidas',
      desc: 'Bloco com botões de ação configuráveis',
      icon: 'repeat',
    },
    {
      type: 'alert',
      label: 'Aviso Operacional / Alerta',
      desc: 'Faixa de destaque com etiqueta de status',
      icon: 'shield-check',
    },
  ];

  protected readonly visualObjectChoices: {
    type: PageEditorObjectType;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    {
      type: 'button',
      label: 'Botão de Ação',
      desc: 'Dispara gravação, navegação ou limpeza',
      icon: 'sparkles',
    },
    {
      type: 'input',
      label: 'Campo de Digitação',
      desc: 'Texto, Moeda (R$), Data ou Número',
      icon: 'file-text',
    },
    {
      type: 'select',
      label: 'Lista de Seleção (Combo)',
      desc: 'Caixa de opções cadastráveis',
      icon: 'layers',
    },
    {
      type: 'checkbox',
      label: 'Caixa de Marcação',
      desc: 'Opção Sim/Não ou Chave Liga/Desliga',
      icon: 'circle-check',
    },
    {
      type: 'heading',
      label: 'Título ou Texto',
      desc: 'Título de destaque, subtítulo ou parágrafo',
      icon: 'file-text',
    },
    {
      type: 'badge',
      label: 'Etiqueta de Status',
      desc: 'Selo colorido (Pago, Pendente, Urgente)',
      icon: 'shield-check',
    },
    {
      type: 'link',
      label: 'Link de Navegação',
      desc: 'Atalho clicável para outra página ou URL',
      icon: 'arrow-right',
    },
    {
      type: 'image',
      label: 'Imagem / Logo',
      desc: 'Exibe logotipo, foto ou ilustração',
      icon: 'boxes',
    },
  ];

  protected readonly fieldTypeChoices: { type: PageEditorFieldType; label: string }[] = [
    { type: 'text', label: 'Texto Curto' },
    { type: 'currency', label: 'Moeda (R$)' },
    { type: 'number', label: 'Número' },
    { type: 'date', label: 'Data' },
    { type: 'select', label: 'Lista de Opções (Combo)' },
    { type: 'checkbox', label: 'Caixa de Marcação (Sim / Não)' },
    { type: 'textarea', label: 'Texto Longo (Observações)' },
  ];

  protected readonly selectedBlockKindLabel = computed(() => {
    const kind = this.selectedBlockKind();
    const map: Record<PageEditorBlockKind, string> = {
      empty: 'Espaço Vazio',
      hero: 'Cabeçalho',
      kpi: 'Indicador KPI',
      form: 'Formulário',
      table: 'Tabela de Dados',
      section: 'Seção Livre',
      alert: 'Alerta',
      'quick-actions': 'Ações Rápidas',
    };
    return map[kind] || 'Bloco';
  });

  /** HTML do Modo 1 (Editor Visual) enriquecido com os atributos do nível ativo */
  protected readonly livePreviewHtml = computed<SafeHtml>(() => {
    const p = this.pageSignal();
    const raw = p?.htmlContent || '';
    const level = this.activeLevel();
    const openC = this.openedContainerIdx();
    const openR = this.openedRowIdx();
    const openB = this.openedBlockIdx();

    if (typeof DOMParser === 'undefined') {
      return this.sanitizer.toTrustedHtml(raw);
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'text/html');
      this.ensureHierarchyInDom(doc);

      doc.body.querySelectorAll('a, img').forEach((el) => el.setAttribute('draggable', 'false'));

      const containers = Array.from(
        doc.body.querySelectorAll(':scope > [data-mpx-container]'),
      ) as HTMLElement[];

      if (containers.length === 0) {
        return this.sanitizer.toTrustedHtml(`
          <div data-mpx-empty-page="true" class="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-a5 bg-neutral-a2/20 p-8 text-center">
            <span class="text-base font-bold text-neutral-12">Esta é sua nova página</span>
          </div>
        `);
      }

      containers.forEach((cEl, cIdx) => {
        cEl.setAttribute('data-mpx-container-idx', String(cIdx));
        cEl.setAttribute('data-mpx-order-v', String(cIdx + 1));
        cEl.setAttribute('data-mpx-label', `Container #${cIdx + 1}`);

        if (level === 'container') {
          cEl.setAttribute('draggable', 'true');
          cEl.removeAttribute('data-mpx-dimmed');
        } else {
          cEl.removeAttribute('draggable');
          if (openC !== null && cIdx !== openC) {
            cEl.setAttribute('data-mpx-dimmed', 'true');
          } else {
            cEl.removeAttribute('data-mpx-dimmed');
          }
        }

        const rows = Array.from(cEl.querySelectorAll(':scope > [data-mpx-row]')) as HTMLElement[];
        rows.forEach((rEl, rIdx) => {
          rEl.setAttribute('data-mpx-row-idx', String(rIdx));
          rEl.setAttribute('data-mpx-order-v', String(rIdx + 1));
          rEl.setAttribute('data-mpx-label', `Linha #${rIdx + 1}`);

          const isRowScope = level === 'row' && openC === cIdx;
          if (isRowScope) {
            rEl.setAttribute('data-mpx-active-scope', 'true');
            rEl.setAttribute('draggable', 'true');
          } else {
            rEl.removeAttribute('data-mpx-active-scope');
            rEl.removeAttribute('draggable');
          }

          if (
            (level === 'block' || level === 'object') &&
            openC === cIdx &&
            openR !== null &&
            rIdx !== openR
          ) {
            rEl.setAttribute('data-mpx-dimmed', 'true');
          } else {
            rEl.removeAttribute('data-mpx-dimmed');
          }

          const blocks = Array.from(
            rEl.querySelectorAll(':scope > [data-mpx-block]'),
          ) as HTMLElement[];
          blocks.forEach((bEl, bIdx) => {
            bEl.setAttribute('data-mpx-block-idx', String(bIdx));
            bEl.setAttribute('data-mpx-order-h', String(bIdx + 1));
            const bKind = (bEl.getAttribute('data-mpx-block') || 'section') as PageEditorBlockKind;
            bEl.setAttribute('data-mpx-label', `Bloco #${bIdx + 1} (${this.getBlockLabel(bKind)})`);
            if (bKind === 'empty') {
              bEl.setAttribute(
                'data-mpx-slot-hint',
                `Linha #${rIdx + 1} · Coluna #${bIdx + 1} (Ordem H: ${bIdx + 1})`,
              );
            }

            const isBlockScope = level === 'block' && openC === cIdx && openR === rIdx;
            if (isBlockScope) {
              bEl.setAttribute('data-mpx-active-scope', 'true');
              bEl.setAttribute('draggable', 'true');
            } else {
              bEl.removeAttribute('data-mpx-active-scope');
              bEl.removeAttribute('draggable');
            }

            if (
              level === 'object' &&
              openC === cIdx &&
              openR === rIdx &&
              openB !== null &&
              bIdx !== openB
            ) {
              bEl.setAttribute('data-mpx-dimmed', 'true');
            } else {
              bEl.removeAttribute('data-mpx-dimmed');
            }

            // Nível 4: Objetos dentro do Bloco aberto
            const isObjectScope =
              level === 'object' && openC === cIdx && openR === rIdx && openB === bIdx;
            const objects = this.getObjectsInsideBlock(bEl);
            objects.forEach((oEl, oIdx) => {
              oEl.setAttribute('data-mpx-obj-item', 'true');
              oEl.setAttribute('data-mpx-obj-idx', String(oIdx));
              oEl.setAttribute('data-mpx-order-h', String(oIdx + 1));
              if (isObjectScope) {
                oEl.setAttribute('data-mpx-active-scope', 'true');
                oEl.setAttribute('draggable', 'true');
              } else {
                oEl.removeAttribute('data-mpx-active-scope');
                oEl.removeAttribute('draggable');
              }
            });
          });
        });
      });

      return this.sanitizer.toTrustedHtml(doc.body.innerHTML);
    } catch {
      return this.sanitizer.toTrustedHtml(raw);
    }
  });

  /** Bundle em Memória para o Modo 2 (Editor HTML Customizado: <style> + customHtmlContent) */
  protected readonly customBundlePreviewHtml = computed<SafeHtml>(() => {
    const p = this.pageSignal();
    const html = p?.customHtmlContent ?? p?.htmlContent ?? '';
    const css = (p?.cssContent || '').trim();
    const combined = css ? `<style>${css}</style>\n${html}` : html;
    return this.sanitizer.toTrustedHtml(combined);
  });

  constructor() {
    effect(() => {
      this.livePreviewHtml();
      this.activeLevel();
      this.selectedContainerIdx();
      this.selectedRowIdx();
      this.selectedBlockIdx();
      this.selectedObjectIdx();
      setTimeout(() => {
        this.syncCanvasSelectionAndInspector();
      }, 25);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page']) {
      const incoming = this.page;
      if (!incoming) {
        this.pageSignal.set(null);
        this.lastPageId = null;
        return;
      }

      const incomingKey = incoming.id || incoming.routePattern || incoming.name || 'new';
      const isDifferentPage = incomingKey !== this.lastPageId;
      this.lastPageId = incomingKey;

      let html = (incoming.htmlContent || '').trim();
      if (!incoming.isCustomHtml && html && typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        if (this.ensureHierarchyInDom(doc)) {
          html = formatHtmlPretty(doc.body.innerHTML);
        }
      }

      this.pageSignal.set({
        ...incoming,
        htmlContent: html,
      });

      if (isDifferentPage) {
        this.undoStack.set([]);
        this.redoStack.set([]);
        this.activeLevel.set('container');
        this.openedContainerIdx.set(null);
        this.openedRowIdx.set(null);
        this.openedBlockIdx.set(null);
        this.selectedContainerIdx.set(0);
        this.selectedRowIdx.set(0);
        this.selectedBlockIdx.set(0);
        this.selectedObjectIdx.set(0);
      }
    }
  }

  /** Retorna o HTML inicial padrão: 1 Container com 1 Linha × 2 Colunas vazias */
  private getDefaultVisualContainerHtml(): string {
    return formatHtmlPretty(`
<div data-mpx-container="true" data-mpx-order-v="1" class="flex flex-col gap-4">
  <div data-mpx-row="true" data-mpx-order-v="1" class="grid grid-cols-12 gap-4">
    <div data-mpx-block="empty" data-mpx-order-h="1" data-mpx-col-span="6" class="col-span-12 sm:col-span-6"></div>
    <div data-mpx-block="empty" data-mpx-order-h="2" data-mpx-col-span="6" class="col-span-12 sm:col-span-6"></div>
  </div>
</div>`);
  }

  /**
   * Garante que toda página do Editor Visual obedeça estritamente à hierarquia:
   * Container ([data-mpx-container]) -> Linha ([data-mpx-row]) -> Bloco ([data-mpx-block])
   * Também corrige automaticamente estruturas legadas onde um wrapper flex-col/space-y-6/grid
   * havia ficado empacotado como um único bloco.
   */
  private ensureHierarchyInDom(doc: Document): boolean {
    let mutated = false;

    // Se a página estiver em branco (nova página ou tudo excluído), preserva em branco para exibir "Esta é sua nova página"
    if (doc.body.children.length === 0) {
      return false;
    }

    // Desempacota wrappers legados de página inteira se não forem containers
    while (
      doc.body.children.length === 1 &&
      !doc.body.firstElementChild?.hasAttribute('data-mpx-container') &&
      this.isMultiRowStackWrapper(doc.body.firstElementChild as HTMLElement)
    ) {
      const wrapper = doc.body.firstElementChild as HTMLElement;
      while (wrapper.firstChild) {
        doc.body.insertBefore(wrapper.firstChild, wrapper);
      }
      wrapper.remove();
      mutated = true;
    }

    const topChildren = Array.from(doc.body.children) as HTMLElement[];
    const hasAnyContainer = topChildren.some((el) => el.hasAttribute('data-mpx-container'));

    if (!hasAnyContainer) {
      const container = doc.createElement('div');
      container.setAttribute('data-mpx-container', 'true');
      container.setAttribute('data-mpx-order-v', '1');
      container.className = 'flex flex-col gap-4';

      topChildren.forEach((child, idx) => {
        const row = this.buildRowFromLegacyElement(doc, child, idx + 1);
        container.appendChild(row);
      });

      doc.body.innerHTML = '';
      doc.body.appendChild(container);
      return true;
    }

    // Garante que todos os elementos de topo sejam [data-mpx-container] e desempacota stacks multi-linha internos
    topChildren.forEach((el, cIdx) => {
      if (!el.hasAttribute('data-mpx-container')) {
        const cWrap = doc.createElement('div');
        cWrap.setAttribute('data-mpx-container', 'true');
        cWrap.setAttribute('data-mpx-order-v', String(cIdx + 1));
        cWrap.className = 'flex flex-col gap-4';
        el.replaceWith(cWrap);

        if (this.isMultiRowStackWrapper(el)) {
          const stackItems = Array.from(el.children) as HTMLElement[];
          stackItems.forEach((item, rIdx) => {
            cWrap.appendChild(this.buildRowFromLegacyElement(doc, item, rIdx + 1));
          });
        } else {
          cWrap.appendChild(this.buildRowFromLegacyElement(doc, el, 1));
        }
        mutated = true;
      } else {
        // Auto-reparo: se uma Linha dentro do Container contém um wrapper multi-seção (ex: flex-col gap-6 com Hero + KPIs + Tabela),
        // explode esse wrapper em múltiplas Linhas reais dentro do Container!
        const initialRows = Array.from(el.children) as HTMLElement[];
        initialRows.forEach((rEl) => {
          if (rEl.children.length === 1) {
            const singleBlock = rEl.firstElementChild as HTMLElement;
            if (this.isMultiRowStackWrapper(singleBlock)) {
              const innerSections = Array.from(singleBlock.children) as HTMLElement[];
              innerSections.forEach((secEl, sIdx) => {
                const newRow = this.buildRowFromLegacyElement(doc, secEl, sIdx + 1);
                el.insertBefore(newRow, rEl);
              });
              rEl.remove();
              mutated = true;
            }
          }
        });

        const rows = Array.from(el.children) as HTMLElement[];
        if (rows.length === 0) {
          el.appendChild(this.createEmptyRowElement(doc, 1, 2));
          mutated = true;
        } else {
          rows.forEach((rEl, rIdx) => {
            if (!rEl.hasAttribute('data-mpx-row')) {
              rEl.setAttribute('data-mpx-row', 'true');
              rEl.setAttribute('data-mpx-order-v', String(rIdx + 1));
              rEl.className = 'grid grid-cols-12 gap-4';
              mutated = true;
            } else {
              rEl.setAttribute('data-mpx-order-v', String(rIdx + 1));
            }

            // Auto-reparo: se a Linha contém 1 único filho que na verdade é um grid multi-coluna (ex: 4 KPIs ou 2 colunas),
            // desempacota os filhos desse grid diretamente como Blocos irmãos da Linha!
            if (rEl.children.length === 1) {
              const singleChild = rEl.firstElementChild as HTMLElement;
              if (this.isMultiColumnRowWrapper(singleChild)) {
                const subBlocks = Array.from(singleChild.children) as HTMLElement[];
                subBlocks.forEach((sb) => rEl.insertBefore(sb, singleChild));
                singleChild.remove();
                mutated = true;
              }
            }

            const blocks = Array.from(rEl.children) as HTMLElement[];
            if (blocks.length === 0) {
              rEl.appendChild(this.createEmptyBlockSlotElement(doc, 1, 6));
              rEl.appendChild(this.createEmptyBlockSlotElement(doc, 2, 6));
              mutated = true;
            } else {
              const fallbackSpan =
                blocks.length >= 4 ? 3 : blocks.length === 3 ? 4 : blocks.length === 2 ? 6 : 12;
              blocks.forEach((bEl, bIdx) => {
                const prevKind = bEl.getAttribute('data-mpx-block');
                this.normalizeElementAsBlockSlot(bEl, bIdx + 1, fallbackSpan);
                if (bEl.getAttribute('data-mpx-block') !== prevKind) {
                  mutated = true;
                }
              });

              // Auto-reparo: se uma Linha ficou com blocos empilhados misturados (ex: Cabeçalho Hero + 4 KPIs + Tabelas na mesma Linha),
              // separa automaticamente cada grupo na sua própria Linha vertical!
              if (this.shouldSplitOverloadedRow(blocks)) {
                const splitGroups = this.groupBlocksIntoProperRows(blocks);
                if (splitGroups.length > 1) {
                  splitGroups.forEach((group, gIdx) => {
                    const newRow = doc.createElement('div');
                    newRow.setAttribute('data-mpx-row', 'true');
                    newRow.setAttribute('data-mpx-order-v', String(gIdx + 1));
                    newRow.className = 'grid grid-cols-12 gap-4';
                    const groupSpan =
                      group.length >= 4 ? 3 : group.length === 3 ? 4 : group.length === 2 ? 6 : 12;
                    group.forEach((item, iIdx) => {
                      const itemKind = item.getAttribute('data-mpx-block');
                      if (itemKind === 'hero' || group.length === 1) {
                        this.setElementColSpan(item, 12);
                      } else if (itemKind === 'kpi') {
                        this.setElementColSpan(item, groupSpan);
                      } else if (group.length === 2) {
                        const curSpan = Number(item.getAttribute('data-mpx-col-span')) || 6;
                        this.setElementColSpan(item, [5, 6, 7].includes(curSpan) ? curSpan : 6);
                      }
                      item.setAttribute('data-mpx-order-h', String(iIdx + 1));
                      newRow.appendChild(item);
                    });
                    el.insertBefore(newRow, rEl);
                  });
                  rEl.remove();
                  mutated = true;
                }
              }
            }
          });

          // Reindexa a ordem vertical das linhas do container após eventuais divisões
          Array.from(el.children).forEach((finalRow, fIdx) => {
            finalRow.setAttribute('data-mpx-order-v', String(fIdx + 1));
          });
        }
      }
    });

    return mutated;
  }

  private shouldSplitOverloadedRow(blocks: HTMLElement[]): boolean {
    if (blocks.length <= 1) {
      return false;
    }
    const kinds = blocks.map((b) => b.getAttribute('data-mpx-block') || 'section');
    const hasHero = kinds.includes('hero');
    const hasKpi = kinds.includes('kpi');
    const hasNonKpi = kinds.some((k) => k !== 'kpi' && k !== 'hero');
    if (hasHero && blocks.length > 1) {
      return true;
    }
    // Só separa se for uma linha legada corrompida que misturou mais de 4 blocos (ex: 4 KPIs + Tabelas na mesma linha)
    if (blocks.length > 4 && hasKpi && hasNonKpi) {
      return true;
    }
    return false;
  }

  private groupBlocksIntoProperRows(blocks: HTMLElement[]): HTMLElement[][] {
    const rows: HTMLElement[][] = [];
    let currentRow: HTMLElement[] = [];
    let currentKindGroup: 'hero' | 'kpi' | 'other' | null = null;

    for (const b of blocks) {
      const kind = b.getAttribute('data-mpx-block') || 'section';
      const group: 'hero' | 'kpi' | 'other' =
        kind === 'hero' ? 'hero' : kind === 'kpi' ? 'kpi' : 'other';

      if (
        currentRow.length > 0 &&
        (group === 'hero' || currentKindGroup === 'hero' || group !== currentKindGroup)
      ) {
        rows.push(currentRow);
        currentRow = [];
      }

      currentRow.push(b);
      currentKindGroup = group;
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
    return rows;
  }

  /** Detecta se um elemento é apenas um wrapper vertical de várias linhas (ex: <div class="flex flex-col gap-6">) */
  private isMultiRowStackWrapper(el: HTMLElement | null): boolean {
    if (!el || el.tagName.toLowerCase() !== 'div' || el.children.length <= 1) {
      return false;
    }
    const isCard =
      el.classList.contains('border') ||
      el.classList.contains('border-2') ||
      el.classList.contains('rounded-2xl') ||
      el.classList.contains('rounded-3xl');
    if (isCard) {
      return false;
    }
    if (this.isMultiColumnRowWrapper(el)) {
      return false;
    }
    if (
      el.classList.contains('space-y-6') ||
      el.classList.contains('space-y-4') ||
      el.classList.contains('flex-col') ||
      el.classList.contains('grid-cols-1')
    ) {
      return true;
    }
    const hasHeroOrGrid = !!el.querySelector(':scope > .rounded-3xl, :scope > .grid');
    const hasOtherSection = el.children.length >= 2;
    return hasHeroOrGrid && hasOtherSection;
  }

  /** Detecta se um elemento é um wrapper de linha multi-colunas horizontal (ex: grid de 4 KPIs ou 2 colunas) */
  private isMultiColumnRowWrapper(el: HTMLElement | null): boolean {
    if (!el || el.tagName.toLowerCase() !== 'div' || el.children.length <= 1) {
      return false;
    }
    const isCard =
      el.classList.contains('border') ||
      el.classList.contains('border-2') ||
      el.classList.contains('rounded-2xl') ||
      el.classList.contains('rounded-3xl');
    if (isCard) {
      return false;
    }
    return (
      el.classList.contains('sm:grid-cols-2') ||
      el.classList.contains('sm:grid-cols-3') ||
      el.classList.contains('sm:grid-cols-4') ||
      el.classList.contains('md:grid-cols-2') ||
      el.classList.contains('md:grid-cols-3') ||
      el.classList.contains('md:grid-cols-4') ||
      el.classList.contains('lg:grid-cols-2') ||
      el.classList.contains('lg:grid-cols-3') ||
      el.classList.contains('lg:grid-cols-4') ||
      el.classList.contains('xl:grid-cols-4') ||
      el.classList.contains('lg:grid-cols-12') ||
      el.classList.contains('grid-cols-12') ||
      Number(el.getAttribute('data-mpx-grid-cols') || '0') >= 2
    );
  }

  private buildRowFromLegacyElement(doc: Document, child: HTMLElement, orderV: number): HTMLElement {
    const row = doc.createElement('div');
    row.setAttribute('data-mpx-row', 'true');
    row.setAttribute('data-mpx-order-v', String(orderV));
    row.className = 'grid grid-cols-12 gap-4';

    if (this.isMultiColumnRowWrapper(child)) {
      const cells = Array.from(child.children) as HTMLElement[];
      const defaultSpan =
        cells.length >= 4 ? 3 : cells.length === 3 ? 4 : cells.length === 2 ? 6 : 12;
      cells.forEach((cell, cIdx) => {
        this.normalizeElementAsBlockSlot(cell, cIdx + 1, defaultSpan);
        row.appendChild(cell);
      });
      child.remove();
    } else {
      this.normalizeElementAsBlockSlot(child, 1, 12);
      row.appendChild(child);
    }
    return row;
  }

  private normalizeElementAsBlockSlot(
    el: HTMLElement,
    orderH: number,
    defaultColSpan: number,
  ): void {
    el.classList.remove('mt-6');
    const tag = el.tagName.toLowerCase();

    if (el.hasAttribute('data-mpx-grid-empty-cell') || el.getAttribute('data-mpx-block') === 'empty') {
      el.removeAttribute('data-mpx-grid-empty-cell');
      el.setAttribute('data-mpx-block', 'empty');
    } else if (tag === 'form' || el.querySelector(':scope > form')) {
      el.setAttribute('data-mpx-block', 'form');
    } else if (tag === 'table' || el.querySelector('table')) {
      el.setAttribute('data-mpx-block', 'table');
    } else if (el.classList.contains('rounded-3xl')) {
      el.setAttribute('data-mpx-block', 'hero');
    } else if (
      el.hasAttribute('data-mpx-kpi-mode') ||
      el.querySelector('[data-mpx-kpi-value]') ||
      (el.classList.contains('rounded-2xl') &&
        !el.querySelector('table, form') &&
        !!el.querySelector('.text-2xl.font-bold, .text-xl.font-bold'))
    ) {
      el.setAttribute('data-mpx-block', 'kpi');
      if (!el.hasAttribute('data-mpx-kpi-mode')) {
        el.setAttribute('data-mpx-kpi-mode', 'static');
      }
      const valEl = el.querySelector('[data-mpx-kpi-value], .text-2xl.font-bold, .text-xl.font-bold');
      if (valEl && !valEl.hasAttribute('data-mpx-kpi-value')) {
        valEl.setAttribute('data-mpx-kpi-value', 'true');
      }
    } else if (!el.hasAttribute('data-mpx-block')) {
      el.setAttribute('data-mpx-block', 'section');
    }

    el.setAttribute('data-mpx-order-h', String(orderH));

    // Preserva col-span legado e normaliza para as porcentagens oficiais (25%=3, 33%=4, 50%=6, 67%=8, 75%=9, 100%=12)
    let detectedSpan = Number(el.getAttribute('data-mpx-col-span')) || 0;
    if (!detectedSpan) {
      for (const s of [3, 4, 5, 6, 7, 8, 9, 12]) {
        if (
          el.classList.contains(`sm:col-span-${s}`) ||
          el.classList.contains(`lg:col-span-${s}`)
        ) {
          detectedSpan = s;
          break;
        }
      }
    }
    this.setElementColSpan(el, this.normalizeColSpan(detectedSpan || defaultColSpan));
  }

  private normalizeColSpan(span: number): number {
    if (span === 5 || span === 7) {
      return 6; // 50%
    }
    return [3, 4, 6, 8, 9, 12].includes(span) ? span : 6;
  }

  private setElementColSpan(el: HTMLElement, span: number): void {
    const validSpan = this.normalizeColSpan(span);
    el.setAttribute('data-mpx-col-span', String(validSpan));
    [
      'col-span-12',
      'sm:col-span-3',
      'sm:col-span-4',
      'sm:col-span-5',
      'sm:col-span-6',
      'sm:col-span-7',
      'sm:col-span-8',
      'sm:col-span-9',
      'sm:col-span-12',
      'lg:col-span-5',
      'lg:col-span-7',
      'lg:col-span-12',
    ].forEach((cls) => el.classList.remove(cls));
    el.classList.add('col-span-12', `sm:col-span-${validSpan}`);
  }

  private createEmptyRowElement(doc: Document, orderV: number, cols = 2): HTMLElement {
    const row = doc.createElement('div');
    row.setAttribute('data-mpx-row', 'true');
    row.setAttribute('data-mpx-order-v', String(orderV));
    row.className = 'grid grid-cols-12 gap-4';
    const span = cols === 4 ? 3 : cols === 3 ? 4 : cols === 2 ? 6 : 12;
    for (let i = 1; i <= cols; i++) {
      row.appendChild(this.createEmptyBlockSlotElement(doc, i, span));
    }
    return row;
  }

  private createEmptyBlockSlotElement(doc: Document, orderH: number, colSpan = 6): HTMLElement {
    const slot = doc.createElement('div');
    slot.setAttribute('data-mpx-block', 'empty');
    slot.setAttribute('data-mpx-order-h', String(orderH));
    this.setElementColSpan(slot, colSpan);
    return slot;
  }

  private getBlockLabel(kind: PageEditorBlockKind): string {
    const labels: Record<PageEditorBlockKind, string> = {
      empty: 'Vazio',
      hero: 'Cabeçalho',
      kpi: 'KPI',
      form: 'Formulário',
      table: 'Tabela',
      section: 'Seção',
      alert: 'Alerta',
      'quick-actions': 'Ações',
    };
    return labels[kind] || 'Bloco';
  }

  private getObjectsInsideBlock(blockEl: HTMLElement): HTMLElement[] {
    const kind = blockEl.getAttribute('data-mpx-block') || '';
    if (kind === 'empty') {
      return [];
    }

    let rawList: HTMLElement[] = [];

    if (kind === 'form' || blockEl.tagName.toLowerCase() === 'form') {
      rawList = Array.from(
        blockEl.querySelectorAll('h2, h3, label, button[type="submit"], button'),
      ) as HTMLElement[];
    } else if (kind === 'table' || blockEl.querySelector('table')) {
      rawList = Array.from(
        blockEl.querySelectorAll('h2, h3, p, span.rounded-lg, span.rounded-md, th'),
      ).filter((el) => !el.closest('tbody')) as HTMLElement[];
    } else if (kind === 'kpi') {
      rawList = Array.from(
        blockEl.querySelectorAll(
          'span, [data-mpx-kpi-value], .text-2xl.font-bold, .text-xl.font-bold, p',
        ),
      ) as HTMLElement[];
    } else if (kind === 'hero') {
      rawList = Array.from(
        blockEl.querySelectorAll('div.inline-flex, span.rounded-full, h1, h2, p, a, button'),
      ) as HTMLElement[];
    } else {
      const objGrid = blockEl.querySelector('[data-mpx-objects-grid]');
      if (objGrid) {
        rawList = [
          ...(Array.from(blockEl.querySelectorAll(':scope > h2, :scope > h3, :scope > p')) as HTMLElement[]),
          ...(Array.from(objGrid.children) as HTMLElement[]),
        ];
      } else {
        rawList = Array.from(
          blockEl.querySelectorAll(
            'h1, h2, h3, p, label, span.rounded-full, span.rounded-md, span.rounded-lg, button, a, img',
          ),
        ) as HTMLElement[];
      }
    }

    // Evita que um elemento pai e um filho sejam marcados simultaneamente como objetos
    return rawList.filter(
      (el, idx) =>
        rawList.indexOf(el) === idx && !rawList.some((other) => other !== el && other.contains(el)),
    );
  }

  // ==========================================================================
  // ALTERNÂNCIA DE MODO (Fluxo Protegido: Editor de Páginas => Editor HTML)
  // ==========================================================================

  private isPageEditorEmptyOrDefault(html: string): boolean {
    const trimmed = (html || '').trim();
    if (!trimmed) {
      return true;
    }
    if (typeof DOMParser === 'undefined') {
      return false;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/html');
    const blocks = Array.from(doc.body.querySelectorAll('[data-mpx-block]')) as HTMLElement[];
    if (blocks.length > 0) {
      // Se todos os blocos forem apenas espaços vazios ("empty") e tiver apenas 1 container padrão sem nome customizado, considera página vazia/nova
      const hasAnyRealBlock = blocks.some((b) => b.getAttribute('data-mpx-block') !== 'empty');
      const hasAnyCustomName = !!doc.body.querySelector('[data-mpx-name]');
      const containers = doc.body.querySelectorAll(':scope > [data-mpx-container]');
      const rows = doc.body.querySelectorAll('[data-mpx-row]');
      if (!hasAnyRealBlock && !hasAnyCustomName && containers.length <= 1 && rows.length <= 1) {
        return true;
      }
    }
    return false;
  }

  protected setPageBuildMode(isCustomHtml: boolean): void {
    const curr = this.pageSignal();
    if (!curr || !!curr.isCustomHtml === isCustomHtml) {
      return;
    }

    // 1. Indo do Editor de Páginas => Editor HTML:
    if (isCustomHtml) {
      // Se o HTML estiver vazio (página nova / apenas espaços vazios iniciais), vai direto sem exibir a mensagem!
      if (this.isPageEditorEmptyOrDefault(curr.htmlContent || '')) {
        const next: Partial<MorphusApplicationSubModuleRef> = {
          ...curr,
          customHtmlContent: curr.customHtmlContent ?? '',
          isCustomHtml: true,
        };
        this.pageSignal.set(next);
        this.pageChange.emit(next);
        this.scheduleAutoSave(next, 250);
        return;
      }

      // Caso já tenha conteúdo montado no Editor de Páginas, exibe o aviso do marcador de retorno!
      this.messageService.confirm(
        {
          severity: 'warn',
          icon: 'repeat',
          title: 'Continuar no Editor HTML?',
          detail:
            'Esta página foi inicializada pelo Editor de Páginas, você pode continuar a sua edição pelo Editor HTML porém caso queira retornar ao Editor de Páginas todo HTML customizado no Editor HTML será removido, mas não se preocupe, seu HTML customizado ainda estará guardado se ainda quiser voltar ao Editor HTML.\n\nAo continuar você concorda que este será o marcador de retorno para o Editor de Páginas.',
          confirmButtonText: 'Concordo, ir para o Editor HTML',
          confirmButtonIcon: 'check',
          cancelButtonText: 'Permanecer no Editor de Páginas',
          cancelButtonIcon: 'arrow-left',
        },
        () => {
          const latest = this.pageSignal();
          if (!latest) return;
          const baseEditorHtml = latest.htmlContent || '';
          const next: Partial<MorphusApplicationSubModuleRef> = {
            ...latest,
            htmlContent: baseEditorHtml,
            customHtmlContent: latest.customHtmlContent || baseEditorHtml,
            isCustomHtml: true,
          };
          this.pageSignal.set(next);
          this.pageChange.emit(next);
          this.scheduleAutoSave(next, 250);
        },
      );
      return;
    }

    // 2. Indo do Editor HTML => Editor de Páginas:
    // Somente neste fluxo compara os HTMLs: se forem iguais (nenhuma customização feita), volta direto sem mensagem!
    const baseHtml = (curr.htmlContent || '').trim();
    const customHtml = (curr.customHtmlContent ?? '').trim();
    if (!customHtml || customHtml === baseHtml) {
      const editorHtml = curr.htmlContent || '';
      const restored: Partial<MorphusApplicationSubModuleRef> = {
        ...curr,
        htmlContent: editorHtml,
        customHtmlContent: curr.customHtmlContent,
        isCustomHtml: false,
      };
      this.pageSignal.set(restored);
      this.pageChange.emit(restored);
      this.scheduleAutoSave(restored, 250);
      return;
    }

    const wasInitializedInPageEditor = !this.isPageEditorEmptyOrDefault(curr.htmlContent || '');
    const returnDetail = wasInitializedInPageEditor
      ? 'Esta página foi inicializada pelo Editor de Páginas e customizada pelo Editor HTML, caso retorne ao Editor de Páginas o HTML customizado será removido e sua página voltará ao estado do momento em que aceitou vir para o Editor HTML, mas não se preocupe, seu HTML customizado ainda estará aqui se quiser voltar ao Editor HTML.\n\nDeseja continuar?'
      : 'Esta página foi inicializada pelo Editor HTML, caso escolha editá-la pelo Editor de Páginas o HTML customizado será removido e sua página começará em branco, mas não se preocupe, seu HTML customizado ainda estará aqui se quiser voltar ao Editor HTML.\n\nDeseja continuar?';

    // Se o HTML customizado for diferente do marcador, exibe a confirmação mantendo customHtmlContent guardado!
    this.messageService.confirm(
      {
        severity: 'warn',
        icon: 'repeat',
        title: wasInitializedInPageEditor
          ? 'Retornar ao Editor de Páginas?'
          : 'Mudar para o Editor de Páginas?',
        detail: returnDetail,
        confirmButtonText: wasInitializedInPageEditor
          ? 'Sim, retornar ao Editor de Páginas'
          : 'Sim, ir para o Editor de Páginas',
        confirmButtonIcon: 'check',
        cancelButtonText: 'Continuar no Editor HTML',
        cancelButtonIcon: 'arrow-left',
      },
      () => {
        const latest = this.pageSignal();
        if (!latest) return;
        const editorHtml = latest.htmlContent || '';
        const restored: Partial<MorphusApplicationSubModuleRef> = {
          ...latest,
          htmlContent: editorHtml,
          // Mantém o customHtmlContent guardado no banco para caso o usuário volte ao Editor HTML!
          customHtmlContent: latest.customHtmlContent,
          isCustomHtml: false,
        };
        this.pageSignal.set(restored);
        this.pageChange.emit(restored);
        this.scheduleAutoSave(restored, 250);
      },
    );
  }

  protected onCustomCodeChange(
    field: 'customHtmlContent' | 'cssContent' | 'tsContent',
    value: string,
  ): void {
    const curr = this.pageSignal();
    if (!curr) {
      return;
    }
    if (field === 'customHtmlContent' && value !== (curr.customHtmlContent || '')) {
      if (!this.undoTypingBurstActive) {
        this.pushUndoHistory(curr.customHtmlContent || curr.htmlContent || '');
        this.undoTypingBurstActive = true;
      }
      if (this.undoTypingTimer) {
        clearTimeout(this.undoTypingTimer);
      }
      this.undoTypingTimer = setTimeout(() => {
        this.undoTypingBurstActive = false;
        this.undoTypingTimer = null;
      }, 900);
    }
    const next: Partial<MorphusApplicationSubModuleRef> = {
      ...curr,
      [field]: value,
      isCustomHtml: true,
    };
    this.pageSignal.set(next);
    this.pageChange.emit(next);
    this.scheduleAutoSave(next, 1000);
  }

  protected toggleVisualInspector(): void {
    this.visualInspectorOpen.update((v) => !v);
  }

  protected toggleHelpGuide(): void {
    this.helpGuideOpen.update((v) => !v);
  }

  // ==========================================================================
  // NAVEGAÇÃO ENTRE OS 4 NÍVEIS (1 CLIQUE = SELECIONA | DUPLO CLIQUE = DESCE NÍVEL | ESC = SOBE NÍVEL)
  // ==========================================================================

  protected navigateToLevel(targetLevel: PageEditorLevel): void {
    if (targetLevel === 'container') {
      this.activeLevel.set('container');
      this.openedContainerIdx.set(null);
      this.openedRowIdx.set(null);
      this.openedBlockIdx.set(null);
    } else if (targetLevel === 'row') {
      if (this.openedContainerIdx() === null) {
        this.openedContainerIdx.set(this.selectedContainerIdx());
      }
      this.activeLevel.set('row');
      this.openedRowIdx.set(null);
      this.openedBlockIdx.set(null);
    } else if (targetLevel === 'block') {
      if (this.openedContainerIdx() === null) {
        this.openedContainerIdx.set(this.selectedContainerIdx());
      }
      if (this.openedRowIdx() === null) {
        this.openedRowIdx.set(this.selectedRowIdx());
      }
      this.activeLevel.set('block');
      this.openedBlockIdx.set(null);
    }
    this.inspectorTab.set('properties');
  }

  protected stepOutLevel(): void {
    const lvl = this.activeLevel();
    if (lvl === 'object') {
      this.navigateToLevel('block');
    } else if (lvl === 'block') {
      this.navigateToLevel('row');
    } else if (lvl === 'row') {
      this.navigateToLevel('container');
    }
  }

  protected drillDownFromContainer(cIdx: number): void {
    this.selectedContainerIdx.set(cIdx);
    this.openedContainerIdx.set(cIdx);
    this.selectedRowIdx.set(0);
    this.openedRowIdx.set(null);
    this.openedBlockIdx.set(null);
    this.activeLevel.set('row');
    this.inspectorTab.set('properties');
  }

  protected drillDownFromRow(rIdx: number): void {
    this.selectedRowIdx.set(rIdx);
    this.openedRowIdx.set(rIdx);
    this.selectedBlockIdx.set(0);
    this.openedBlockIdx.set(null);
    this.activeLevel.set('block');
    this.inspectorTab.set('properties');
  }

  protected drillDownFromBlock(bIdx: number): void {
    this.selectedBlockIdx.set(bIdx);
    if (this.selectedBlockKind() === 'empty') {
      this.inspectorTab.set('blocks');
      return;
    }
    this.openedBlockIdx.set(bIdx);
    this.selectedObjectIdx.set(0);
    this.activeLevel.set('object');
    this.inspectorTab.set('properties');
  }

  protected onCanvasSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /** 1 Clique no Canvas: Seleciona o item do nível ativo (ou sobe de nível se clicou fora do escopo aberto) */
  protected onCanvasClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!target || !canvas) {
      return;
    }

    const lvl = this.activeLevel();

    if (lvl === 'container') {
      const cEl = target.closest('[data-mpx-container]') as HTMLElement | null;
      if (cEl && canvas.contains(cEl)) {
        const idx = Number(cEl.getAttribute('data-mpx-container-idx') || '0');
        this.selectedContainerIdx.set(idx);
        this.inspectorTab.set('properties');
      }
      return;
    }

    if (lvl === 'row') {
      const rEl = target.closest(
        '[data-mpx-row][data-mpx-active-scope="true"]',
      ) as HTMLElement | null;
      if (rEl) {
        const idx = Number(rEl.getAttribute('data-mpx-row-idx') || '0');
        this.selectedRowIdx.set(idx);
        this.inspectorTab.set('properties');
        return;
      }
      // Se clicou em outro Container fora do aberto, volta ao Nível 1 e seleciona aquele Container
      const otherContainer = target.closest('[data-mpx-container]') as HTMLElement | null;
      if (otherContainer) {
        const cIdx = Number(otherContainer.getAttribute('data-mpx-container-idx') || '0');
        this.selectedContainerIdx.set(cIdx);
      }
      this.navigateToLevel('container');
      return;
    }

    if (lvl === 'block') {
      const bEl = target.closest(
        '[data-mpx-block][data-mpx-active-scope="true"]',
      ) as HTMLElement | null;
      if (bEl) {
        const idx = Number(bEl.getAttribute('data-mpx-block-idx') || '0');
        this.selectedBlockIdx.set(idx);
        this.inspectorTab.set('properties');
        return;
      }
      // Se clicou fora da Linha aberta, volta para o Nível 2 (Linhas)
      const otherRow = target.closest('[data-mpx-row]') as HTMLElement | null;
      if (otherRow && otherRow.closest('[data-mpx-container-idx]')?.getAttribute('data-mpx-container-idx') === String(this.openedContainerIdx())) {
        this.selectedRowIdx.set(Number(otherRow.getAttribute('data-mpx-row-idx') || '0'));
        this.navigateToLevel('row');
        return;
      }
      this.stepOutLevel();
      return;
    }

    if (lvl === 'object') {
      const oEl = target.closest(
        '[data-mpx-obj-item][data-mpx-active-scope="true"]',
      ) as HTMLElement | null;
      if (oEl) {
        event.preventDefault();
        const idx = Number(oEl.getAttribute('data-mpx-obj-idx') || '0');
        this.selectedObjectIdx.set(idx);
        this.inspectorTab.set('properties');
        return;
      }
      // Se clicou fora do Bloco aberto, sobe para o Nível 3 (Blocos)
      const otherBlock = target.closest('[data-mpx-block]') as HTMLElement | null;
      if (
        otherBlock &&
        otherBlock.closest('[data-mpx-row-idx]')?.getAttribute('data-mpx-row-idx') ===
          String(this.openedRowIdx())
      ) {
        this.selectedBlockIdx.set(Number(otherBlock.getAttribute('data-mpx-block-idx') || '0'));
        this.navigateToLevel('block');
        return;
      }
      this.stepOutLevel();
    }
  }

  /** Duplo Clique no Canvas: Abre o elemento atual e desce para o próximo nível (Container -> Linha -> Bloco -> Objeto) */
  protected onCanvasDblClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!target || !canvas) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const lvl = this.activeLevel();

    if (lvl === 'container') {
      const cEl = target.closest('[data-mpx-container]') as HTMLElement | null;
      if (cEl && canvas.contains(cEl)) {
        const cIdx = Number(cEl.getAttribute('data-mpx-container-idx') || '0');
        this.drillDownFromContainer(cIdx);
      }
      return;
    }

    if (lvl === 'row') {
      const rEl = target.closest(
        '[data-mpx-row][data-mpx-active-scope="true"]',
      ) as HTMLElement | null;
      if (rEl) {
        const rIdx = Number(rEl.getAttribute('data-mpx-row-idx') || '0');
        this.drillDownFromRow(rIdx);
      }
      return;
    }

    if (lvl === 'block') {
      const bEl = target.closest(
        '[data-mpx-block][data-mpx-active-scope="true"]',
      ) as HTMLElement | null;
      if (bEl) {
        const bIdx = Number(bEl.getAttribute('data-mpx-block-idx') || '0');
        this.selectedBlockIdx.set(bIdx);
        const kind = (bEl.getAttribute('data-mpx-block') || 'section') as PageEditorBlockKind;
        if (kind === 'empty') {
          this.inspectorTab.set('blocks');
        } else {
          this.openedBlockIdx.set(bIdx);
          this.selectedObjectIdx.set(0);
          this.activeLevel.set('object');
          this.inspectorTab.set('properties');
        }
      }
    }
  }

  // ==========================================================================
  // SINCRONIZAÇÃO DA BORDA SÓLIDA (.mpx-level-selected) E INSPETOR LATERAL
  // ==========================================================================

  private syncCanvasSelectionAndInspector(): void {
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    canvas
      .querySelectorAll('.mpx-level-selected')
      .forEach((el) => el.classList.remove('mpx-level-selected'));

    const containers = Array.from(
      canvas.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    this.containerCount.set(containers.length);

    const lvl = this.activeLevel();

    if (lvl === 'container') {
      const cIdx = Math.min(this.selectedContainerIdx(), Math.max(0, containers.length - 1));
      const cEl = containers[cIdx];
      if (cEl) {
        cEl.classList.add('mpx-level-selected');
        const rows = cEl.querySelectorAll(':scope > [data-mpx-row]');
        this.selectedContainerRowCount.set(rows.length);
        const customC = (cEl.getAttribute('data-mpx-name') || '').trim();
        this.activeContainerDisplayName.set(customC || `Container ${cIdx + 1}`);
      }
      return;
    }

    const openC = this.openedContainerIdx() ?? 0;
    const activeContainer = containers[openC];
    if (!activeContainer) {
      return;
    }
    const customC = (activeContainer.getAttribute('data-mpx-name') || '').trim();
    this.activeContainerDisplayName.set(customC || `Container ${openC + 1}`);

    const rows = Array.from(
      activeContainer.querySelectorAll(':scope > [data-mpx-row]'),
    ) as HTMLElement[];
    this.selectedContainerRowCount.set(rows.length);

    if (lvl === 'row') {
      const rIdx = Math.min(this.selectedRowIdx(), Math.max(0, rows.length - 1));
      const rEl = rows[rIdx];
      if (rEl) {
        rEl.classList.add('mpx-level-selected');
        const slots = rEl.querySelectorAll(':scope > [data-mpx-block]');
        this.selectedRowSlotCount.set(slots.length);
        const customR = (rEl.getAttribute('data-mpx-name') || '').trim();
        this.activeRowDisplayName.set(customR || `Linha ${rIdx + 1}`);
      }
      return;
    }

    const openR = this.openedRowIdx() ?? 0;
    const activeRow = rows[openR];
    if (!activeRow) {
      return;
    }
    const customR = (activeRow.getAttribute('data-mpx-name') || '').trim();
    this.activeRowDisplayName.set(customR || `Linha ${openR + 1}`);

    const blocks = Array.from(
      activeRow.querySelectorAll(':scope > [data-mpx-block]'),
    ) as HTMLElement[];
    this.selectedRowSlotCount.set(blocks.length);

    if (lvl === 'block') {
      const bIdx = Math.min(this.selectedBlockIdx(), Math.max(0, blocks.length - 1));
      const bEl = blocks[bIdx];
      if (bEl) {
        bEl.classList.add('mpx-level-selected');
        this.readBlockPropertiesIntoSignals(bEl);
        const customB = (bEl.getAttribute('data-mpx-name') || '').trim();
        this.activeBlockDisplayName.set(customB || `Bloco ${bIdx + 1}`);
      }
      return;
    }

    const openB = this.openedBlockIdx() ?? 0;
    const activeBlock = blocks[openB];
    if (!activeBlock) {
      return;
    }
    const customB = (activeBlock.getAttribute('data-mpx-name') || '').trim();
    this.activeBlockDisplayName.set(customB || `Bloco ${openB + 1}`);

    this.readBlockPropertiesIntoSignals(activeBlock);
    const objects = this.getObjectsInsideBlock(activeBlock);
    if (lvl === 'object' && objects.length > 0) {
      const oIdx = Math.min(this.selectedObjectIdx(), Math.max(0, objects.length - 1));
      const oEl = objects[oIdx];
      if (oEl) {
        oEl.classList.add('mpx-level-selected');
        this.readObjectPropertiesIntoSignals(oEl);
        const customO = (oEl.getAttribute('data-mpx-name') || '').trim();
        this.activeObjectDisplayName.set(customO || `Objeto ${oIdx + 1}`);
      }
    }
  }

  private readBlockPropertiesIntoSignals(bEl: HTMLElement): void {
    const kind = (bEl.getAttribute('data-mpx-block') || 'section') as PageEditorBlockKind;
    this.selectedBlockKind.set(kind);
    const span = this.normalizeColSpan(Number(bEl.getAttribute('data-mpx-col-span')) || 6);
    this.vBlockColSpan.set(span);

    if (kind === 'hero') {
      const badgeEl = bEl.querySelector('span, div.inline-flex');
      const h1El = bEl.querySelector('h1, h2');
      const pEl = bEl.querySelector('p');
      this.vHeroBadge.set((badgeEl?.textContent || '').trim());
      this.vHeroTitle.set((h1El?.textContent || '').trim());
      this.vHeroSubtitle.set((pEl?.textContent || '').trim());
    } else if (kind === 'kpi') {
      const titleEl = bEl.querySelector('span');
      const valEl = bEl.querySelector('[data-mpx-kpi-value]');
      const mode = (bEl.getAttribute('data-mpx-kpi-mode') || 'static') as
        | 'static'
        | 'sum'
        | 'count'
        | 'pending';
      this.vKpiTitle.set((titleEl?.textContent || '').trim());
      this.vKpiMode.set(mode);
      this.vKpiValue.set((valEl?.textContent || '').trim());
    } else if (kind === 'form') {
      const h3El = bEl.querySelector('h3, h2');
      const btnEl = bEl.querySelector('button[type="submit"]');
      this.vFormTitle.set((h3El?.textContent || '').trim());
      this.vFormCollection.set(bEl.getAttribute('data-mpx-collection') || 'contas-pagar');
      this.vFormButtonText.set((btnEl?.textContent || 'Salvar Registro').trim());
    } else if (kind === 'table') {
      const tableEl = bEl.tagName.toLowerCase() === 'table' ? bEl : bEl.querySelector('table');
      this.vTableCollection.set(
        tableEl?.getAttribute('data-mpx-collection') ||
          bEl.getAttribute('data-mpx-collection') ||
          'contas-pagar',
      );
    } else if (kind === 'section') {
      const h3El = bEl.querySelector('h3, h2');
      const pEl = bEl.querySelector('p');
      this.vSectionTitle.set((h3El?.textContent || '').trim());
      this.vSectionSubtitle.set((pEl?.textContent || '').trim());
    }
  }

  private readObjectPropertiesIntoSignals(oEl: HTMLElement): void {
    const tag = oEl.tagName.toLowerCase();
    const span = this.normalizeColSpan(Number(oEl.getAttribute('data-mpx-col-span')) || 6);
    this.vObjColSpan.set(span);

    if (tag === 'label') {
      this.selectedObjectIsFormField.set(true);
      const inputEl = oEl.querySelector('input, select, textarea') as HTMLElement | null;
      const clone = oEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('input, select, textarea').forEach((e) => e.remove());
      this.vObjLabel.set(clone.textContent?.replace('*', '').trim() || 'Campo');
      this.vFieldType.set(
        (inputEl?.getAttribute('data-mpx-type') as PageEditorFieldType) || 'text',
      );
      this.vObjPlaceholder.set(inputEl?.getAttribute('placeholder') || '');
      this.vObjRequired.set(inputEl?.hasAttribute('required') ?? false);
    } else {
      this.selectedObjectIsFormField.set(false);
      this.vObjLabel.set((oEl.textContent || '').trim());
    }
  }

  // ==========================================================================
  // MUTAÇÕES DE DOM POR NÍVEL (Auto-Save em Memória + Undo/Redo)
  // ==========================================================================

  private parseCurrentDom(): Document {
    const parser = new DOMParser();
    const raw = (this.pageSignal()?.htmlContent || '').trim();
    const doc = parser.parseFromString(raw, 'text/html');
    if (raw) {
      this.ensureHierarchyInDom(doc);
    }
    return doc;
  }

  private undoTypingBurstActive = false;
  private undoTypingTimer: ReturnType<typeof setTimeout> | null = null;
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleAutoSave(pageState: Partial<MorphusApplicationSubModuleRef>, delayMs = 400): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      this.autoSaveTimer = null;
      const latest = this.pageSignal() || pageState;
      if (latest) {
        this.autoSavePage.emit(latest);
      }
    }, delayMs);
  }

  private commitDomMutation(doc: Document, options?: { coalesceTyping?: boolean }): void {
    // Limpa atributos temporários de visualização antes de serializar
    doc.body
      .querySelectorAll(
        '[data-mpx-container-idx], [data-mpx-row-idx], [data-mpx-block-idx], [data-mpx-obj-idx], [data-mpx-active-scope], [data-mpx-dimmed], [data-mpx-label], [data-mpx-slot-hint], [data-mpx-drop-pos], .mpx-level-selected, .mpx-drop-target-hover',
      )
      .forEach((el) => {
        el.removeAttribute('data-mpx-container-idx');
        el.removeAttribute('data-mpx-row-idx');
        el.removeAttribute('data-mpx-block-idx');
        el.removeAttribute('data-mpx-obj-idx');
        el.removeAttribute('data-mpx-active-scope');
        el.removeAttribute('data-mpx-dimmed');
        el.removeAttribute('data-mpx-label');
        el.removeAttribute('data-mpx-slot-hint');
        el.removeAttribute('data-mpx-drop-pos');
        el.removeAttribute('draggable');
        el.classList.remove('mpx-level-selected', 'mpx-drop-target-hover');
      });

    // Atualiza data-mpx-order-v e data-mpx-order-h sequencialmente
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    containers.forEach((cEl, cIdx) => {
      cEl.setAttribute('data-mpx-order-v', String(cIdx + 1));
      const rows = Array.from(cEl.querySelectorAll(':scope > [data-mpx-row]')) as HTMLElement[];
      rows.forEach((rEl, rIdx) => {
        rEl.setAttribute('data-mpx-order-v', String(rIdx + 1));
        const blocks = Array.from(
          rEl.querySelectorAll(':scope > [data-mpx-block]'),
        ) as HTMLElement[];
        blocks.forEach((bEl, bIdx) => {
          bEl.setAttribute('data-mpx-order-h', String(bIdx + 1));
        });
      });
    });

    const pretty = formatHtmlPretty(doc.body.innerHTML);
    const curr = this.pageSignal();
    if (!curr) {
      return;
    }

    if (options?.coalesceTyping) {
      if (!this.undoTypingBurstActive) {
        this.pushUndoHistory(curr.htmlContent || '');
        this.undoTypingBurstActive = true;
      }
      if (this.undoTypingTimer) {
        clearTimeout(this.undoTypingTimer);
      }
      this.undoTypingTimer = setTimeout(() => {
        this.undoTypingBurstActive = false;
        this.undoTypingTimer = null;
      }, 900);
    } else {
      if (this.undoTypingTimer) {
        clearTimeout(this.undoTypingTimer);
        this.undoTypingTimer = null;
      }
      this.undoTypingBurstActive = false;
      this.pushUndoHistory(curr.htmlContent || '');
    }

    const next: Partial<MorphusApplicationSubModuleRef> = {
      ...curr,
      htmlContent: pretty,
      isCustomHtml: false,
    };
    this.pageSignal.set(next);
    this.pageChange.emit(next);
    this.scheduleAutoSave(next, options?.coalesceTyping ? 1000 : 350);
  }

  private pushUndoHistory(previousHtml: string): void {
    this.undoStack.update((stack) => {
      if (stack.length > 0 && stack[stack.length - 1] === previousHtml) {
        return stack;
      }
      return [...stack.slice(-49), previousHtml];
    });
    this.redoStack.set([]);
  }

  protected undo(): void {
    const stack = this.undoStack();
    const curr = this.pageSignal();
    if (!curr || stack.length === 0) {
      return;
    }
    const previous = stack[stack.length - 1];
    this.undoStack.set(stack.slice(0, -1));
    this.redoStack.update((r) => [...r, curr.htmlContent || '']);
    const next = { ...curr, htmlContent: previous };
    this.pageSignal.set(next);
    this.pageChange.emit(next);
    this.scheduleAutoSave(next, 250);
  }

  protected redo(): void {
    const redo = this.redoStack();
    const curr = this.pageSignal();
    if (!curr || redo.length === 0) {
      return;
    }
    const nextHtml = redo[redo.length - 1];
    this.redoStack.set(redo.slice(0, -1));
    this.undoStack.update((u) => [...u, curr.htmlContent || '']);
    const next = { ...curr, htmlContent: nextHtml };
    this.pageSignal.set(next);
    this.pageChange.emit(next);
    this.scheduleAutoSave(next, 250);
  }

  // ==========================================================================
  // OPERAÇÕES DO NÍVEL 1 (CONTAINERS)
  // ==========================================================================

  protected addNewContainer(): void {
    const doc = this.parseCurrentDom();
    const containers = Array.from(doc.body.querySelectorAll(':scope > [data-mpx-container]'));
    const newContainer = doc.createElement('div');
    newContainer.setAttribute('data-mpx-container', 'true');
    newContainer.setAttribute('data-mpx-order-v', String(containers.length + 1));
    newContainer.className = 'flex flex-col gap-4';
    newContainer.appendChild(this.createEmptyRowElement(doc, 1, 2));
    doc.body.appendChild(newContainer);
    this.commitDomMutation(doc);
    this.activeLevel.set('container');
    this.selectedContainerIdx.set(containers.length);
  }

  protected moveSelectedContainer(delta: -1 | 1): void {
    const doc = this.parseCurrentDom();
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    const from = this.selectedContainerIdx();
    const to = from + delta;
    if (to < 0 || to >= containers.length) {
      return;
    }
    const item = containers[from];
    const target = containers[to];
    if (delta === -1) {
      doc.body.insertBefore(item, target);
    } else {
      doc.body.insertBefore(target, item);
    }
    this.commitDomMutation(doc);
    this.selectedContainerIdx.set(to);
  }

  protected removeSelectedContainer(): void {
    const doc = this.parseCurrentDom();
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    if (containers.length === 0) {
      return;
    }
    if (containers.length <= 1) {
      // Se for o último Container, remove tudo e deixa a página em branco ("Esta é sua nova página")
      doc.body.innerHTML = '';
      this.commitDomMutation(doc);
      this.navigateToLevel('container');
      this.selectedContainerIdx.set(0);
      return;
    }
    const idx = this.selectedContainerIdx();
    containers[idx]?.remove();
    this.commitDomMutation(doc);
    this.selectedContainerIdx.set(Math.max(0, idx - 1));
  }

  /** Separa todas as Linhas do Container selecionado em Containers independentes */
  protected splitSelectedContainerRowsIntoContainers(): void {
    const doc = this.parseCurrentDom();
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    const idx = this.selectedContainerIdx();
    const targetContainer = containers[idx];
    if (!targetContainer) {
      return;
    }
    const rows = Array.from(
      targetContainer.querySelectorAll(':scope > [data-mpx-row]'),
    ) as HTMLElement[];
    if (rows.length <= 1) {
      return;
    }

    rows.slice(1).forEach((rowEl) => {
      const newContainer = doc.createElement('div');
      newContainer.setAttribute('data-mpx-container', 'true');
      newContainer.className = 'flex flex-col gap-4';
      rowEl.setAttribute('data-mpx-order-v', '1');
      newContainer.appendChild(rowEl);
      targetContainer.insertAdjacentElement('afterend', newContainer);
    });

    // Mantém a ordem original das linhas que viraram novos containers
    const inserted = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    if (inserted.length > 2 && rows.length > 2) {
      // Reordena o trecho recém-inserido para preservar a sequência exata 2..N
      const slice = inserted.slice(idx + 1, idx + rows.length).reverse();
      slice.forEach((cEl) => {
        targetContainer.insertAdjacentElement('afterend', cEl);
      });
    }

    this.commitDomMutation(doc);
    this.activeLevel.set('container');
    this.selectedContainerIdx.set(idx);
  }

  /** Extrai apenas a Linha selecionada para um novo Container independente logo abaixo */
  protected extractSelectedRowIntoNewContainer(): void {
    const doc = this.parseCurrentDom();
    const cIdx = this.openedContainerIdx() ?? 0;
    const rIdx = this.selectedRowIdx();
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    const currentContainer = containers[cIdx];
    if (!currentContainer) {
      return;
    }
    const rows = Array.from(
      currentContainer.querySelectorAll(':scope > [data-mpx-row]'),
    ) as HTMLElement[];
    if (rows.length <= 1 || !rows[rIdx]) {
      return;
    }

    const rowToExtract = rows[rIdx];
    const newContainer = doc.createElement('div');
    newContainer.setAttribute('data-mpx-container', 'true');
    newContainer.className = 'flex flex-col gap-4';
    rowToExtract.setAttribute('data-mpx-order-v', '1');
    newContainer.appendChild(rowToExtract);
    currentContainer.insertAdjacentElement('afterend', newContainer);

    this.commitDomMutation(doc);
    this.selectedRowIdx.set(Math.max(0, rIdx - 1));
  }

  // ==========================================================================
  // OPERAÇÕES DO NÍVEL 2 (LINHAS DO CONTAINER)
  // ==========================================================================

  protected addRowToSelectedContainer(): void {
    const doc = this.parseCurrentDom();
    const cIdx =
      this.activeLevel() === 'container'
        ? this.selectedContainerIdx()
        : (this.openedContainerIdx() ?? 0);
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    const container = containers[cIdx];
    if (!container) {
      return;
    }
    const rows = container.querySelectorAll(':scope > [data-mpx-row]');
    container.appendChild(this.createEmptyRowElement(doc, rows.length + 1, 2));
    this.commitDomMutation(doc);
    this.selectedRowIdx.set(rows.length);
  }

  protected setRowColumnsCount(cols: number): void {
    const doc = this.parseCurrentDom();
    const cIdx = this.openedContainerIdx() ?? 0;
    const rIdx = this.selectedRowIdx();
    const row = doc.body
      .querySelectorAll(':scope > [data-mpx-container]')
      [cIdx]?.querySelectorAll(':scope > [data-mpx-row]')[rIdx] as HTMLElement | undefined;
    if (!row) {
      return;
    }
    const currentSlots = Array.from(
      row.querySelectorAll(':scope > [data-mpx-block]'),
    ) as HTMLElement[];
    const targetSpan = cols === 4 ? 3 : cols === 3 ? 4 : cols === 2 ? 6 : 12;

    if (cols > currentSlots.length) {
      for (let i = currentSlots.length; i < cols; i++) {
        row.appendChild(this.createEmptyBlockSlotElement(doc, i + 1, targetSpan));
      }
    } else if (cols < currentSlots.length) {
      for (let i = currentSlots.length - 1; i >= cols; i--) {
        currentSlots[i].remove();
      }
    }

    Array.from(row.querySelectorAll(':scope > [data-mpx-block]')).forEach((bEl) => {
      this.setElementColSpan(bEl as HTMLElement, targetSpan);
    });

    this.commitDomMutation(doc);
  }

  protected moveSelectedRow(delta: -1 | 1): void {
    const doc = this.parseCurrentDom();
    const cIdx = this.openedContainerIdx() ?? 0;
    const container = doc.body.querySelectorAll(':scope > [data-mpx-container]')[cIdx];
    if (!container) {
      return;
    }
    const rows = Array.from(container.querySelectorAll(':scope > [data-mpx-row]')) as HTMLElement[];
    const from = this.selectedRowIdx();
    const to = from + delta;
    if (to < 0 || to >= rows.length) {
      return;
    }
    if (delta === -1) {
      container.insertBefore(rows[from], rows[to]);
    } else {
      container.insertBefore(rows[to], rows[from]);
    }
    this.commitDomMutation(doc);
    this.selectedRowIdx.set(to);
  }

  protected removeSelectedRow(): void {
    const doc = this.parseCurrentDom();
    const cIdx = this.openedContainerIdx() ?? 0;
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];
    const container = containers[cIdx];
    if (!container) {
      return;
    }
    const rows = Array.from(container.querySelectorAll(':scope > [data-mpx-row]')) as HTMLElement[];
    if (rows.length <= 1) {
      // Se for a última Linha do Container, exclui o próprio Container (se era o último Container, a página fica em branco!)
      container.remove();
      this.commitDomMutation(doc);
      this.navigateToLevel('container');
      this.selectedContainerIdx.set(Math.max(0, cIdx - 1));
      return;
    }
    const idx = this.selectedRowIdx();
    rows[idx]?.remove();
    this.commitDomMutation(doc);
    this.selectedRowIdx.set(Math.max(0, idx - 1));
  }

  // ==========================================================================
  // OPERAÇÕES DO NÍVEL 3 (BLOCOS DENTRO DA LINHA)
  // ==========================================================================

  private getTargetRowAndBlocks(doc: Document): {
    row: HTMLElement | null;
    blocks: HTMLElement[];
    blockIdx: number;
  } {
    const cIdx = this.openedContainerIdx() ?? this.selectedContainerIdx();
    const rIdx = this.openedRowIdx() ?? this.selectedRowIdx();
    const row = (doc.body
      .querySelectorAll(':scope > [data-mpx-container]')
      [cIdx]?.querySelectorAll(':scope > [data-mpx-row]')[rIdx] ?? null) as HTMLElement | null;
    const blocks = row
      ? (Array.from(row.querySelectorAll(':scope > [data-mpx-block]')) as HTMLElement[])
      : [];
    return { row, blocks, blockIdx: this.selectedBlockIdx() };
  }

  protected applySelectedBlockColSpan(span: number): void {
    const doc = this.parseCurrentDom();
    const { blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const blk = blocks[blockIdx];
    if (!blk) {
      return;
    }
    this.setElementColSpan(blk, span);
    this.commitDomMutation(doc);
  }

  protected moveSelectedBlock(delta: -1 | 1): void {
    const doc = this.parseCurrentDom();
    const { row, blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    if (!row) {
      return;
    }
    const to = blockIdx + delta;
    if (to < 0 || to >= blocks.length) {
      return;
    }
    if (delta === -1) {
      row.insertBefore(blocks[blockIdx], blocks[to]);
    } else {
      row.insertBefore(blocks[to], blocks[blockIdx]);
    }
    this.commitDomMutation(doc);
    this.selectedBlockIdx.set(to);
  }

  protected clearOrRemoveSelectedBlock(): void {
    const doc = this.parseCurrentDom();
    const { row, blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const blk = blocks[blockIdx];
    if (!blk || !row) {
      return;
    }
    const span = Number(blk.getAttribute('data-mpx-col-span')) || 6;
    if (blk.getAttribute('data-mpx-block') !== 'empty') {
      // Transforma o bloco de volta em espaço vazio preservando sua largura na linha
      blk.replaceWith(this.createEmptyBlockSlotElement(doc, blockIdx + 1, span));
      this.commitDomMutation(doc);
      return;
    }

    // Se o espaço já estava vazio ("empty") e o usuário mandou excluir de novo:
    if (blocks.length > 1) {
      blk.remove();
      const remaining = Array.from(row.querySelectorAll(':scope > [data-mpx-block]')) as HTMLElement[];
      const newSpan =
        remaining.length >= 4 ? 3 : remaining.length === 3 ? 4 : remaining.length === 2 ? 6 : 12;
      remaining.forEach((rBlk) => this.setElementColSpan(rBlk, newSpan));
      this.commitDomMutation(doc);
      this.selectedBlockIdx.set(Math.max(0, blockIdx - 1));
      return;
    }

    // Se era o último espaço vazio da Linha, exclui a própria Linha (e o Container se era a última Linha)!
    const parentContainer = row.parentElement;
    row.remove();
    if (parentContainer && parentContainer.querySelectorAll(':scope > [data-mpx-row]').length === 0) {
      parentContainer.remove();
      this.commitDomMutation(doc);
      this.navigateToLevel('container');
      this.selectedContainerIdx.set(0);
    } else {
      this.commitDomMutation(doc);
      this.navigateToLevel('row');
      this.selectedRowIdx.set(0);
    }
  }

  protected fillCurrentSlotWithBlock(kind: PageEditorBlockKind, targetSlotEl?: HTMLElement): void {
    if (kind === 'empty') {
      return;
    }
    const doc = this.parseCurrentDom();
    const defaultCol = this.inferDefaultCollection();
    const htmlMap: Record<Exclude<PageEditorBlockKind, 'empty'>, string> = {
      hero: `<div data-mpx-block="hero" class="rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm"><div class="inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Módulo Ativo</div><h1 class="mt-3 text-2xl font-bold text-neutral-12">Título Principal da Página</h1><p class="mt-1 text-sm text-neutral-a11">Subtítulo explicativo desta área da aplicação.</p></div>`,
      kpi: `<div data-mpx-block="kpi" data-mpx-kpi-mode="sum" data-mpx-kpi-field="valor" class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5"><span class="text-xs font-medium text-neutral-a10">Total Financeiro</span><div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-neutral-12">R$ 24.670,00</div></div>`,
      form: `<form data-mpx-block="form" data-mpx-collection="${defaultCol}" class="flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6"><h3 class="text-lg font-bold text-neutral-12">Novo Registro</h3><div data-mpx-form-grid class="grid grid-cols-12 gap-4"><label data-mpx-col-span="6" class="col-span-12 sm:col-span-6 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">Título *<input type="text" name="titulo" data-mpx-field="titulo" data-mpx-type="text" required placeholder="Ex: Fatura Cloud..." class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" /></label><label data-mpx-col-span="6" class="col-span-12 sm:col-span-6 flex flex-col gap-1 text-xs font-semibold text-neutral-a11">Valor (R$) *<input type="text" name="valor" data-mpx-field="valor" data-mpx-type="currency" required placeholder="R$ 0,00" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" /></label></div><div class="flex justify-end"><button type="submit" data-mpx-action="submit" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Salvar Registro</button></div></form>`,
      table: `<div data-mpx-block="table" data-mpx-collection="${defaultCol}" class="overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1"><table data-mpx-collection="${defaultCol}" class="w-full text-left text-sm"><thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11"><tr><th data-mpx-field="codigo" class="px-4 py-3">Código</th><th data-mpx-field="titulo" class="px-4 py-3">Título</th><th data-mpx-field="valor" class="px-4 py-3">Valor</th><th data-mpx-field="status" class="px-4 py-3">Status</th></tr></thead><tbody class="divide-y divide-neutral-a3"><tr><td class="px-4 py-3 font-mono text-xs">#001</td><td class="px-4 py-3 font-medium text-neutral-12">Fatura Servidores Cloud</td><td class="px-4 py-3 font-semibold text-neutral-12">R$ 14.850,00</td><td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Pago</span></td></tr></tbody></table></div>`,
      section: `<div data-mpx-block="section" class="flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6 shadow-sm"><div><h3 class="text-lg font-bold text-neutral-12">Seção Personalizada</h3><p class="mt-1 text-xs text-neutral-a11">Adicione objetos nesta seção.</p></div><div data-mpx-objects-grid class="grid grid-cols-12 gap-3 w-full"></div></div>`,
      alert: `<div data-mpx-block="alert" class="flex items-center justify-between gap-4 rounded-2xl border border-amber-a6 bg-amber-a2 p-5"><div><h3 class="text-sm font-bold text-amber-a11">Aviso Operacional Importante</h3><p class="mt-0.5 text-xs text-neutral-11">Confira os lançamentos pendentes antes do fechamento diário.</p></div><span data-mpx-obj-type="badge" class="rounded-full bg-amber-a4 px-3 py-1 text-xs font-bold text-amber-a11">Atenção</span></div>`,
      'quick-actions': `<div data-mpx-block="quick-actions" class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5"><div><h3 class="text-base font-bold text-neutral-12">Ações Rápidas</h3><p class="text-xs text-neutral-a11">Botões de ação da página.</p></div><div data-mpx-objects-grid class="flex flex-wrap items-center gap-2.5"><button type="button" data-mpx-obj-type="button" data-mpx-action="submit" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Nova Ação</button></div></div>`,
    };

    const temp = doc.createElement('div');
    temp.innerHTML = htmlMap[kind];
    const newEl = temp.firstElementChild as HTMLElement;

    // Se a página estava totalmente em branco, cria o primeiro Container + Linha automaticamente!
    if (doc.body.querySelectorAll(':scope > [data-mpx-container]').length === 0) {
      const firstContainer = doc.createElement('div');
      firstContainer.setAttribute('data-mpx-container', 'true');
      firstContainer.setAttribute('data-mpx-order-v', '1');
      firstContainer.className = 'flex flex-col gap-4';
      const firstRow = doc.createElement('div');
      firstRow.setAttribute('data-mpx-row', 'true');
      firstRow.setAttribute('data-mpx-order-v', '1');
      firstRow.className = 'grid grid-cols-12 gap-4';
      newEl.setAttribute('data-mpx-order-h', '1');
      this.setElementColSpan(newEl, 12);
      firstRow.appendChild(newEl);
      firstContainer.appendChild(firstRow);
      doc.body.appendChild(firstContainer);
      this.commitDomMutation(doc);
      this.openedContainerIdx.set(0);
      this.openedRowIdx.set(0);
      this.selectedBlockIdx.set(0);
      this.activeLevel.set('block');
      this.inspectorTab.set('properties');
      return;
    }

    const { row, blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const slotToReplace =
      targetSlotEl ||
      blocks[blockIdx] ||
      (doc.body.querySelector('[data-mpx-block="empty"]') as HTMLElement | null);

    if (slotToReplace) {
      const existingSpan = Number(slotToReplace.getAttribute('data-mpx-col-span')) || 6;
      const existingOrder = Number(slotToReplace.getAttribute('data-mpx-order-h')) || 1;
      newEl.setAttribute('data-mpx-order-h', String(existingOrder));
      this.setElementColSpan(newEl, existingSpan);
      slotToReplace.replaceWith(newEl);
    } else if (row) {
      newEl.setAttribute('data-mpx-order-h', String(blocks.length + 1));
      this.setElementColSpan(newEl, 12);
      row.appendChild(newEl);
    }

    this.commitDomMutation(doc);
    this.inspectorTab.set('properties');
  }

  // Edições rápidas das propriedades de Bloco no Nível 3
  protected applyHeroChanges(patch: { badge?: string; title?: string; subtitle?: string }): void {
    const doc = this.parseCurrentDom();
    const { blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[blockIdx];
    if (!bEl) return;
    if (patch.badge !== undefined) {
      const el = bEl.querySelector('span, div.inline-flex');
      if (el) el.textContent = patch.badge;
    }
    if (patch.title !== undefined) {
      const el = bEl.querySelector('h1, h2');
      if (el) el.textContent = patch.title;
    }
    if (patch.subtitle !== undefined) {
      const el = bEl.querySelector('p');
      if (el) el.textContent = patch.subtitle;
    }
    this.commitDomMutation(doc, { coalesceTyping: true });
  }

  protected applyKpiChanges(patch: {
    title?: string;
    mode?: 'static' | 'sum' | 'count' | 'pending';
    value?: string;
  }): void {
    const doc = this.parseCurrentDom();
    const { blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[blockIdx];
    if (!bEl) return;
    if (patch.title !== undefined) {
      const el = bEl.querySelector('span');
      if (el) el.textContent = patch.title;
    }
    if (patch.mode !== undefined) {
      bEl.setAttribute('data-mpx-kpi-mode', patch.mode);
    }
    if (patch.value !== undefined) {
      const el = bEl.querySelector('[data-mpx-kpi-value]');
      if (el) el.textContent = patch.value;
    }
    this.commitDomMutation(doc, { coalesceTyping: patch.mode === undefined });
  }

  protected applyFormChanges(patch: {
    title?: string;
    collection?: string;
    buttonText?: string;
  }): void {
    const doc = this.parseCurrentDom();
    const { blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[blockIdx];
    if (!bEl) return;
    if (patch.title !== undefined) {
      const el = bEl.querySelector('h3, h2');
      if (el) el.textContent = patch.title;
    }
    if (patch.collection !== undefined) {
      bEl.setAttribute('data-mpx-collection', patch.collection);
    }
    if (patch.buttonText !== undefined) {
      const el = bEl.querySelector('button[type="submit"]');
      if (el) el.textContent = patch.buttonText;
    }
    this.commitDomMutation(doc, { coalesceTyping: patch.collection === undefined });
  }

  protected applyTableCollection(collection: string): void {
    const doc = this.parseCurrentDom();
    const { blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[blockIdx];
    if (!bEl) return;
    bEl.setAttribute('data-mpx-collection', collection);
    const tbl = bEl.querySelector('table');
    if (tbl) tbl.setAttribute('data-mpx-collection', collection);
    this.commitDomMutation(doc);
  }

  protected applySectionChanges(patch: { title?: string; subtitle?: string }): void {
    const doc = this.parseCurrentDom();
    const { blocks, blockIdx } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[blockIdx];
    if (!bEl) return;
    if (patch.title !== undefined) {
      const el = bEl.querySelector('h3, h2');
      if (el) el.textContent = patch.title;
    }
    if (patch.subtitle !== undefined) {
      const el = bEl.querySelector('p');
      if (el) el.textContent = patch.subtitle;
    }
    this.commitDomMutation(doc, { coalesceTyping: true });
  }

  // ==========================================================================
  // OPERAÇÕES DO NÍVEL 4 (OBJETOS DENTRO DO BLOCO)
  // ==========================================================================

  protected insertObjectIntoCurrentBlock(objType: PageEditorObjectType): void {
    const doc = this.parseCurrentDom();
    const { blocks } = this.getTargetRowAndBlocks(doc);
    const bIdx = this.openedBlockIdx() ?? this.selectedBlockIdx();
    const bEl = blocks[bIdx];
    if (!bEl || bEl.getAttribute('data-mpx-block') === 'empty') {
      return;
    }

    const kind = bEl.getAttribute('data-mpx-block');
    if (kind === 'form' || bEl.tagName.toLowerCase() === 'form') {
      const formGrid = bEl.querySelector('[data-mpx-form-grid]') || bEl;
      const lbl = doc.createElement('label');
      this.setElementColSpan(lbl, 6);
      lbl.className = `${lbl.className} flex flex-col gap-1 text-xs font-semibold text-neutral-a11`.trim();
      lbl.innerHTML = `Novo Campo\n<input type="text" name="novo_campo" data-mpx-field="novo_campo" data-mpx-type="text" placeholder="Digite aqui..." class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />`;
      formGrid.appendChild(lbl);
    } else {
      let objGrid = bEl.querySelector('[data-mpx-objects-grid]') as HTMLElement | null;
      if (!objGrid) {
        objGrid = doc.createElement('div');
        objGrid.setAttribute('data-mpx-objects-grid', '');
        objGrid.className = 'mt-3 grid grid-cols-12 gap-3 w-full';
        bEl.appendChild(objGrid);
      }
      const wrapper = doc.createElement('div');
      this.setElementColSpan(wrapper, 6);
      if (objType === 'button') {
        wrapper.innerHTML = `<button type="button" data-mpx-obj-type="button" data-mpx-action="submit" class="w-full rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Novo Botão</button>`;
      } else if (objType === 'heading') {
        wrapper.innerHTML = `<h3 data-mpx-obj-type="heading" class="text-base font-bold text-neutral-12">Novo Título</h3>`;
      } else if (objType === 'badge') {
        wrapper.innerHTML = `<span data-mpx-obj-type="badge" class="inline-flex rounded-full bg-primary-a3 px-3 py-1 text-xs font-bold text-primary-11">Etiqueta</span>`;
      } else {
        wrapper.innerHTML = `<label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">Novo Objeto<input type="text" data-mpx-field="campo" data-mpx-type="text" class="w-full rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" /></label>`;
      }
      objGrid.appendChild(wrapper.firstElementChild || wrapper);
    }

    this.commitDomMutation(doc);
    this.openedBlockIdx.set(bIdx);
    this.activeLevel.set('object');
    this.inspectorTab.set('properties');
  }

  protected applyObjectChanges(patch: {
    label?: string;
    colSpan?: number;
    fieldType?: PageEditorFieldType;
    placeholder?: string;
    required?: boolean;
  }): void {
    const doc = this.parseCurrentDom();
    const { blocks } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[this.openedBlockIdx() ?? this.selectedBlockIdx()];
    if (!bEl) return;
    const objects = this.getObjectsInsideBlock(bEl);
    const oEl = objects[this.selectedObjectIdx()];
    if (!oEl) return;

    if (patch.colSpan !== undefined) {
      this.setElementColSpan(oEl, patch.colSpan);
    }

    if (oEl.tagName.toLowerCase() === 'label') {
      const inputEl = oEl.querySelector('input, select, textarea') as HTMLElement | null;
      if (patch.label !== undefined && inputEl) {
        const isReq = inputEl.hasAttribute('required');
        const fieldKey = this.runtimeStore.normalizeFieldKey(patch.label);
        inputEl.setAttribute('name', fieldKey);
        inputEl.setAttribute('data-mpx-field', fieldKey);
        oEl.innerHTML = `${patch.label}${isReq ? ' *' : ''}\n${inputEl.outerHTML}`;
      }
      const updatedInput = oEl.querySelector('input, select, textarea') as HTMLElement | null;
      if (updatedInput) {
        if (patch.fieldType !== undefined) {
          updatedInput.setAttribute('data-mpx-type', patch.fieldType);
        }
        if (patch.placeholder !== undefined) {
          updatedInput.setAttribute('placeholder', patch.placeholder);
        }
        if (patch.required !== undefined) {
          if (patch.required) {
            updatedInput.setAttribute('required', '');
          } else {
            updatedInput.removeAttribute('required');
          }
        }
      }
    } else if (patch.label !== undefined) {
      oEl.textContent = patch.label;
    }

    const isTypingOnly =
      (patch.label !== undefined || patch.placeholder !== undefined) &&
      patch.colSpan === undefined &&
      patch.fieldType === undefined &&
      patch.required === undefined;
    this.commitDomMutation(doc, { coalesceTyping: isTypingOnly });
  }

  protected moveSelectedObject(delta: -1 | 1): void {
    const doc = this.parseCurrentDom();
    const { blocks } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[this.openedBlockIdx() ?? this.selectedBlockIdx()];
    if (!bEl) return;
    const objects = this.getObjectsInsideBlock(bEl);
    const from = this.selectedObjectIdx();
    const to = from + delta;
    if (to < 0 || to >= objects.length) return;
    this.swapSiblingsInDom(objects[from], objects[to]);
    this.commitDomMutation(doc);
    this.selectedObjectIdx.set(to);
  }

  protected removeSelectedObject(): void {
    const doc = this.parseCurrentDom();
    const { blocks } = this.getTargetRowAndBlocks(doc);
    const bEl = blocks[this.openedBlockIdx() ?? this.selectedBlockIdx()];
    if (!bEl) return;
    const objects = this.getObjectsInsideBlock(bEl);
    const idx = this.selectedObjectIdx();
    const targetObj = objects[idx];
    if (!targetObj) return;

    // Se for coluna de tabela (<th>), remove também as células correspondentes em <tbody>
    if (targetObj.tagName.toLowerCase() === 'th' && targetObj.parentElement) {
      const ths = Array.from(targetObj.parentElement.children);
      const colIdx = ths.indexOf(targetObj);
      const table = targetObj.closest('table');
      if (table && colIdx >= 0) {
        table.querySelectorAll('tbody tr').forEach((tr) => {
          tr.children[colIdx]?.remove();
        });
      }
    }

    targetObj.remove();
    this.commitDomMutation(doc);
    this.selectedObjectIdx.set(Math.max(0, idx - 1));
  }

  // ==========================================================================
  // DRAG & DROP CONTEXTUAL AO NÍVEL ATIVO + AUTO-SCROLL SUAVE
  // ==========================================================================

  private autoScrollInterval: ReturnType<typeof setInterval> | null = null;
  private lastDragClientX = 0;
  private lastDragClientY = 0;

  protected onPaletteBlockDragStart(event: DragEvent, kind: PageEditorBlockKind): void {
    this.dragState = { sourceType: 'palette-block', paletteBlock: kind };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('text/plain', `block:${kind}`);
    }
    this.startAutoScrollLoop();
  }

  protected onPaletteObjectDragStart(event: DragEvent, objType: PageEditorObjectType): void {
    this.dragState = { sourceType: 'palette-object', paletteObject: objType };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('text/plain', `object:${objType}`);
    }
    this.startAutoScrollLoop();
  }

  protected onCanvasDragStart(event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const lvl = this.activeLevel();
    let draggedIndex: number | null = null;

    if (lvl === 'container') {
      const cEl = target.closest('[data-mpx-container]') as HTMLElement | null;
      if (cEl) {
        draggedIndex = Number(cEl.getAttribute('data-mpx-container-idx') || '0');
        this.selectedContainerIdx.set(draggedIndex);
      }
    } else if (lvl === 'row') {
      const rEl = target.closest('[data-mpx-row][data-mpx-active-scope="true"]') as HTMLElement | null;
      if (rEl) {
        draggedIndex = Number(rEl.getAttribute('data-mpx-row-idx') || '0');
        this.selectedRowIdx.set(draggedIndex);
      }
    } else if (lvl === 'block') {
      const bEl = target.closest('[data-mpx-block][data-mpx-active-scope="true"]') as HTMLElement | null;
      if (bEl) {
        draggedIndex = Number(bEl.getAttribute('data-mpx-block-idx') || '0');
        this.selectedBlockIdx.set(draggedIndex);
      }
    } else if (lvl === 'object') {
      const oEl = target.closest('[data-mpx-obj-item][data-mpx-active-scope="true"]') as HTMLElement | null;
      if (oEl) {
        draggedIndex = Number(oEl.getAttribute('data-mpx-obj-idx') || '0');
        this.selectedObjectIdx.set(draggedIndex);
      }
    }

    if (draggedIndex === null) {
      event.preventDefault();
      return;
    }

    this.dragState = {
      sourceType: 'canvas-level',
      fromIndex: draggedIndex,
    };

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${lvl}:${draggedIndex}`);
    }

    this.lastDragClientX = event.clientX;
    this.lastDragClientY = event.clientY;
    this.startAutoScrollLoop();
  }

  private clearDropIndicators(): void {
    this.visualPreviewCanvasRef?.nativeElement
      .querySelectorAll('[data-mpx-drop-pos], .mpx-drop-target-hover')
      .forEach((el) => {
        el.removeAttribute('data-mpx-drop-pos');
        el.classList.remove('mpx-drop-target-hover');
      });
  }

  private applyDropIndicator(hoverEl: HTMLElement | null, clientX: number, clientY: number): void {
    this.clearDropIndicators();
    if (!hoverEl || !this.dragState) {
      return;
    }

    if (this.dragState.sourceType === 'palette-block') {
      hoverEl.setAttribute('data-mpx-drop-pos', 'fill');
      return;
    }

    const lvl = this.activeLevel();
    const fromIdx = this.dragState.fromIndex;

    if (lvl === 'container' || lvl === 'row') {
      const idxAttr = lvl === 'container' ? 'data-mpx-container-idx' : 'data-mpx-row-idx';
      const toIdx = Number(hoverEl.getAttribute(idxAttr) || '0');
      if (fromIdx !== undefined && toIdx === fromIdx) {
        return;
      }
      const rect = hoverEl.getBoundingClientRect();
      const pos =
        fromIdx !== undefined
          ? toIdx < fromIdx
            ? 'top'
            : 'bottom'
          : clientY < (rect.top + rect.bottom) / 2
            ? 'top'
            : 'bottom';
      hoverEl.setAttribute('data-mpx-drop-pos', pos);
    } else {
      const idxAttr = lvl === 'block' ? 'data-mpx-block-idx' : 'data-mpx-obj-idx';
      const toIdx = Number(hoverEl.getAttribute(idxAttr) || '0');
      if (fromIdx !== undefined && toIdx === fromIdx) {
        return;
      }
      const rect = hoverEl.getBoundingClientRect();
      const pos =
        fromIdx !== undefined
          ? toIdx < fromIdx
            ? 'left'
            : 'right'
          : clientX < (rect.left + rect.right) / 2
            ? 'left'
            : 'right';
      hoverEl.setAttribute('data-mpx-drop-pos', pos);
    }
  }

  protected onCanvasDragOver(event: DragEvent): void {
    if (!this.dragState) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect =
        this.dragState.sourceType === 'canvas-level' ? 'move' : 'copy';
    }

    this.lastDragClientX = event.clientX;
    this.lastDragClientY = event.clientY;
    this.performAutoScrollStep(event.clientY);

    const hoverEl = this.findDropTargetAtPoint(
      event.target as HTMLElement | null,
      event.clientX,
      event.clientY,
    );
    this.applyDropIndicator(hoverEl, event.clientX, event.clientY);
  }

  protected onCanvasDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement | null;
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (canvas && (!related || !canvas.contains(related))) {
      this.clearDropIndicators();
    }
  }

  protected onCanvasDragEnd(): void {
    this.stopAutoScrollLoop();
    this.dragState = null;
    this.clearDropIndicators();
  }

  protected onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    const state = this.dragState;
    const clientX = event.clientX;
    const clientY = event.clientY;
    const target = event.target as HTMLElement | null;
    this.onCanvasDragEnd();
    if (!state) return;

    if (state.sourceType === 'palette-block' && state.paletteBlock) {
      const bEl = this.findElementByPoint('[data-mpx-block]', clientX, clientY);
      if (bEl) {
        const cEl = bEl.closest('[data-mpx-container]');
        const rEl = bEl.closest('[data-mpx-row]');
        if (cEl && rEl) {
          this.openedContainerIdx.set(Number(cEl.getAttribute('data-mpx-container-idx') || '0'));
          this.openedRowIdx.set(Number(rEl.getAttribute('data-mpx-row-idx') || '0'));
          this.selectedBlockIdx.set(Number(bEl.getAttribute('data-mpx-block-idx') || '0'));
          this.activeLevel.set('block');
        }
      }
      this.fillCurrentSlotWithBlock(state.paletteBlock);
      return;
    }

    if (state.sourceType === 'palette-object' && state.paletteObject) {
      this.insertObjectIntoCurrentBlock(state.paletteObject);
      return;
    }

    if (state.sourceType === 'canvas-level' && state.fromIndex !== undefined) {
      const hoverEl = this.findDropTargetAtPoint(target, clientX, clientY);
      if (!hoverEl) return;
      const lvl = this.activeLevel();
      const doc = this.parseCurrentDom();

      if (lvl === 'container') {
        const toIdx = Number(hoverEl.getAttribute('data-mpx-container-idx') || '0');
        if (toIdx === state.fromIndex) return;
        const list = Array.from(
          doc.body.querySelectorAll(':scope > [data-mpx-container]'),
        ) as HTMLElement[];
        this.swapSiblingsInDom(list[state.fromIndex], list[toIdx]);
        this.commitDomMutation(doc);
        this.selectedContainerIdx.set(toIdx);
      } else if (lvl === 'row') {
        const toIdx = Number(hoverEl.getAttribute('data-mpx-row-idx') || '0');
        if (toIdx === state.fromIndex) return;
        const cEl = doc.body.querySelectorAll(':scope > [data-mpx-container]')[
          this.openedContainerIdx() ?? 0
        ];
        const list = Array.from(
          cEl?.querySelectorAll(':scope > [data-mpx-row]') || [],
        ) as HTMLElement[];
        this.swapSiblingsInDom(list[state.fromIndex], list[toIdx]);
        this.commitDomMutation(doc);
        this.selectedRowIdx.set(toIdx);
      } else if (lvl === 'block') {
        const toIdx = Number(hoverEl.getAttribute('data-mpx-block-idx') || '0');
        if (toIdx === state.fromIndex) return;
        const { blocks } = this.getTargetRowAndBlocks(doc);
        this.swapSiblingsInDom(blocks[state.fromIndex], blocks[toIdx]);
        this.commitDomMutation(doc);
        this.selectedBlockIdx.set(toIdx);
      } else if (lvl === 'object') {
        const toIdx = Number(hoverEl.getAttribute('data-mpx-obj-idx') || '0');
        if (toIdx === state.fromIndex) return;
        const { blocks } = this.getTargetRowAndBlocks(doc);
        const bEl = blocks[this.openedBlockIdx() ?? 0];
        if (bEl) {
          const objs = this.getObjectsInsideBlock(bEl);
          this.swapSiblingsInDom(objs[state.fromIndex], objs[toIdx]);
          this.commitDomMutation(doc);
          this.selectedObjectIdx.set(toIdx);
        }
      }
    }
  }

  @HostListener('window:dragover', ['$event'])
  protected onWindowDragOver(event: DragEvent): void {
    if (!this.dragState) return;
    this.lastDragClientX = event.clientX;
    this.lastDragClientY = event.clientY;
  }

  @HostListener('window:dragend')
  protected onWindowDragEnd(): void {
    if (this.dragState) {
      this.onCanvasDragEnd();
    }
  }

  private startAutoScrollLoop(): void {
    this.stopAutoScrollLoop();
    this.autoScrollInterval = setInterval(() => {
      if (!this.dragState || !this.lastDragClientY) return;
      this.performAutoScrollStep(this.lastDragClientY);
      const canvas = this.visualPreviewCanvasRef?.nativeElement;
      if (canvas && this.lastDragClientX) {
        const hoverEl = this.findDropTargetAtPoint(null, this.lastDragClientX, this.lastDragClientY);
        this.applyDropIndicator(hoverEl, this.lastDragClientX, this.lastDragClientY);
      }
    }, 16);
  }

  private stopAutoScrollLoop(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
    this.lastDragClientX = 0;
    this.lastDragClientY = 0;
  }

  private performAutoScrollStep(clientY: number): void {
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!canvas || !clientY) return;

    const rect = canvas.getBoundingClientRect();
    const edgeZone = 115;
    const maxDelta = 20;

    if (clientY >= rect.top - 50 && clientY < rect.top + edgeZone) {
      const intensity = Math.max(0.25, (rect.top + edgeZone - clientY) / edgeZone);
      canvas.scrollTop -= Math.ceil(maxDelta * intensity);
    } else if (clientY <= rect.bottom + 50 && clientY > rect.bottom - edgeZone) {
      const intensity = Math.max(0.25, (clientY - (rect.bottom - edgeZone)) / edgeZone);
      canvas.scrollTop += Math.ceil(maxDelta * intensity);
    }

    const vh = window.innerHeight;
    const winEdge = 130;
    let winDelta = 0;
    if (clientY < winEdge) {
      winDelta = -Math.max(5, Math.ceil(((winEdge - clientY) / winEdge) * 18));
    } else if (vh - clientY < winEdge) {
      winDelta = Math.max(5, Math.ceil(((winEdge - (vh - clientY)) / winEdge) * 18));
    }

    if (winDelta !== 0) {
      window.scrollBy({ top: winDelta, behavior: 'auto' });
      document.scrollingElement?.scrollBy({ top: winDelta, behavior: 'auto' });
      document
        .querySelectorAll('.mat-drawer-content, .mat-sidenav-content, main')
        .forEach((el) => {
          (el as HTMLElement).scrollTop += winDelta;
        });
    }
  }

  private findDropTargetAtPoint(
    target: HTMLElement | null,
    clientX: number,
    clientY: number,
  ): HTMLElement | null {
    if (this.dragState?.sourceType === 'palette-block') {
      return this.findElementByPoint('[data-mpx-block]', clientX, clientY);
    }
    const lvl = this.activeLevel();
    const selector =
      lvl === 'container'
        ? '[data-mpx-container]'
        : lvl === 'row'
          ? '[data-mpx-row][data-mpx-active-scope="true"]'
          : lvl === 'block'
            ? '[data-mpx-block][data-mpx-active-scope="true"]'
            : '[data-mpx-obj-item][data-mpx-active-scope="true"]';

    const direct = target?.closest(selector) as HTMLElement | null;
    if (direct) {
      return direct;
    }
    return this.findElementByPoint(selector, clientX, clientY);
  }

  private findElementByPoint(selector: string, clientX: number, clientY: number): HTMLElement | null {
    const canvas = this.visualPreviewCanvasRef?.nativeElement;
    if (!canvas) return null;
    const candidates = Array.from(canvas.querySelectorAll(selector)) as HTMLElement[];
    if (candidates.length === 0) return null;

    // 1. Verifica qual elemento contém exatamente o ponto (clientX, clientY)
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return el;
      }
    }

    // 2. Se o cursor estiver no vão (gap) entre dois irmãos, pega o mais próximo
    let closest: HTMLElement | null = null;
    let bestDist = Infinity;
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < bestDist) {
        bestDist = dist;
        closest = el;
      }
    }
    return closest;
  }

  private swapSiblingsInDom(elA?: HTMLElement, elB?: HTMLElement): void {
    if (!elA || !elB || elA === elB || !elA.parentNode || !elB.parentNode) {
      return;
    }

    // Se forem duas colunas de tabela (<th>), troca também as células (<td>) em todas as linhas do <tbody>
    if (
      elA.tagName.toLowerCase() === 'th' &&
      elB.tagName.toLowerCase() === 'th' &&
      elA.parentElement === elB.parentElement &&
      elA.parentElement
    ) {
      const ths = Array.from(elA.parentElement.children);
      const idxA = ths.indexOf(elA);
      const idxB = ths.indexOf(elB);
      const table = elA.closest('table');
      if (table && idxA >= 0 && idxB >= 0) {
        table.querySelectorAll('tbody tr').forEach((tr) => {
          const tdA = tr.children[idxA] as HTMLElement | undefined;
          const tdB = tr.children[idxB] as HTMLElement | undefined;
          if (tdA && tdB) {
            const phTd = tdA.ownerDocument.createElement('td');
            tdA.parentNode?.insertBefore(phTd, tdA);
            tdB.parentNode?.insertBefore(tdA, tdB);
            phTd.parentNode?.insertBefore(tdB, phTd);
            phTd.remove();
          }
        });
      }
    }

    const placeholder = elA.ownerDocument.createElement('span');
    elA.parentNode.insertBefore(placeholder, elA);
    elB.parentNode.insertBefore(elA, elB);
    placeholder.parentNode?.insertBefore(elB, placeholder);
    placeholder.remove();
  }

  // ==========================================================================
  // TEMPLATES PRONTOS DA FASE 1 (Contas a Pagar e Notas Fiscais na Matriz de 4 Níveis)
  // ==========================================================================

  private inferDefaultCollection(): string {
    const slug = (
      this.pageSignal()?.routePattern ||
      this.pageSignal()?.name ||
      ''
    ).toLowerCase();
    if (slug.includes('nota') || slug.includes('nf')) {
      return 'notas-fiscais';
    }
    return 'contas-pagar';
  }

  protected generateStarterTemplate(kind: 'contas-pagar' | 'notas-fiscais'): void {
    const isNF = kind === 'notas-fiscais';
    const colKey = isNF ? 'notas-fiscais' : 'contas-pagar';
    const badge = isNF ? 'Módulo Fiscal & Entrada' : 'Módulo Financeiro';
    const title = isNF ? 'Gestão de Notas Fiscais' : 'Contas a Pagar';
    const subtitle = isNF
      ? 'Cadastre notas fiscais, gerencie fornecedores e acompanhe os valores aprovados.'
      : 'Controle vencimentos, categorias, formas de pagamento e baixas financeiras.';

    const html = `
<div data-mpx-container="true" data-mpx-order-v="1" class="flex flex-col gap-4">
  <div data-mpx-row="true" data-mpx-order-v="1" class="grid grid-cols-12 gap-4">
    <div data-mpx-block="hero" data-mpx-order-h="1" data-mpx-col-span="12" class="col-span-12 sm:col-span-12 rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm">
      <div class="inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">${badge}</div>
      <h1 class="mt-3 text-2xl font-bold text-neutral-12">${title}</h1>
      <p class="mt-1 text-sm text-neutral-a11">${subtitle}</p>
    </div>
  </div>
  <div data-mpx-row="true" data-mpx-order-v="2" class="grid grid-cols-12 gap-4">
    <div data-mpx-block="kpi" data-mpx-order-h="1" data-mpx-col-span="4" data-mpx-kpi-mode="sum" data-mpx-kpi-field="valor" class="col-span-12 sm:col-span-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-medium text-neutral-a10">Volume Financeiro Total</span>
      <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-neutral-12">R$ 24.670,00</div>
    </div>
    <div data-mpx-block="kpi" data-mpx-order-h="2" data-mpx-col-span="4" data-mpx-kpi-mode="count" class="col-span-12 sm:col-span-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-medium text-neutral-a10">${isNF ? 'Notas Lançadas' : 'Títulos Cadastrados'}</span>
      <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-jade-a11">3 registro(s)</div>
    </div>
    <div data-mpx-block="kpi" data-mpx-order-h="3" data-mpx-col-span="4" data-mpx-kpi-mode="pending" class="col-span-12 sm:col-span-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-medium text-neutral-a10">Pendentes</span>
      <div data-mpx-kpi-value class="mt-2 text-2xl font-bold text-amber-a11">1 pendente(s)</div>
    </div>
  </div>
</div>
<div data-mpx-container="true" data-mpx-order-v="2" class="flex flex-col gap-4">
  <div data-mpx-row="true" data-mpx-order-v="1" class="grid grid-cols-12 gap-4">
    <form data-mpx-block="form" data-mpx-order-h="1" data-mpx-col-span="12" data-mpx-collection="${colKey}" class="col-span-12 sm:col-span-12 flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6">
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
          Valor (R$) *
          <input type="text" name="valor" data-mpx-field="valor" data-mpx-type="currency" required placeholder="R$ 0,00" class="rounded-xl border border-neutral-a5 bg-transparent px-3.5 py-2 text-sm text-neutral-12" />
        </label>
      </div>
      <div class="flex justify-end">
        <button type="submit" data-mpx-action="submit" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">Salvar Registro</button>
      </div>
    </form>
  </div>
  <div data-mpx-row="true" data-mpx-order-v="2" class="grid grid-cols-12 gap-4">
    <div data-mpx-block="table" data-mpx-order-h="1" data-mpx-col-span="12" data-mpx-collection="${colKey}" class="col-span-12 sm:col-span-12 overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">
      <table data-mpx-collection="${colKey}" class="w-full text-left text-sm">
        <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">
          <tr>
            <th data-mpx-field="codigo" class="px-4 py-3">Código</th>
            <th data-mpx-field="${isNF ? 'numero_nf' : 'titulo'}" class="px-4 py-3">${isNF ? 'Número da NF' : 'Título'}</th>
            <th data-mpx-field="fornecedor" class="px-4 py-3">Fornecedor</th>
            <th data-mpx-field="valor" class="px-4 py-3">Valor</th>
            <th data-mpx-field="status" class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-a3">
          <tr>
            <td class="px-4 py-3 font-mono text-xs">#001</td>
            <td class="px-4 py-3 font-medium text-neutral-12">${isNF ? 'NF-2026/00481' : 'Fatura Servidores Cloud AWS'}</td>
            <td class="px-4 py-3 text-neutral-11">Amazon AWS Brasil</td>
            <td class="px-4 py-3 font-semibold text-neutral-12">R$ 14.850,00</td>
            <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Aprovado</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html.trim(), 'text/html');
    this.commitDomMutation(doc);
    this.activeLevel.set('container');
    this.selectedContainerIdx.set(0);
    this.inspectorTab.set('properties');
  }

  // ==========================================================================
  // RENOMEAÇÃO DO ELEMENTO SELECIONADO (data-mpx-name) & ATALHOS GLOBAIS
  // ==========================================================================

  private cancelRenameOnBlur = false;

  protected cancelLevelNameEdit(inputEl: HTMLInputElement, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cancelRenameOnBlur = true;
    inputEl.value = this.currentEditableName();
    inputEl.blur();
  }

  protected renameActiveLevelElement(rawName: string, inputEl?: HTMLInputElement): void {
    if (this.cancelRenameOnBlur) {
      this.cancelRenameOnBlur = false;
      return;
    }
    const trimmed = (rawName || '').trim();
    const doc = this.parseCurrentDom();
    const lvl = this.activeLevel();
    const containers = Array.from(
      doc.body.querySelectorAll(':scope > [data-mpx-container]'),
    ) as HTMLElement[];

    let targetEl: HTMLElement | undefined;
    let defaultName = '';

    if (lvl === 'container') {
      const cIdx = this.selectedContainerIdx();
      targetEl = containers[cIdx];
      defaultName = `Container ${cIdx + 1}`;
    } else if (lvl === 'row') {
      const cIdx = this.openedContainerIdx() ?? 0;
      const rIdx = this.selectedRowIdx();
      const rows = Array.from(
        containers[cIdx]?.querySelectorAll(':scope > [data-mpx-row]') || [],
      ) as HTMLElement[];
      targetEl = rows[rIdx];
      defaultName = `Linha ${rIdx + 1}`;
    } else if (lvl === 'block') {
      const { blocks } = this.getTargetRowAndBlocks(doc);
      const bIdx = this.selectedBlockIdx();
      targetEl = blocks[bIdx];
      defaultName = `Bloco ${bIdx + 1}`;
    } else if (lvl === 'object') {
      const { blocks } = this.getTargetRowAndBlocks(doc);
      const bEl = blocks[this.openedBlockIdx() ?? this.selectedBlockIdx()];
      if (bEl) {
        const objects = this.getObjectsInsideBlock(bEl);
        const oIdx = this.selectedObjectIdx();
        targetEl = objects[oIdx];
        defaultName = `Objeto ${oIdx + 1}`;
      }
    }

    if (targetEl) {
      const currentSaved = (targetEl.getAttribute('data-mpx-name') || '').trim();
      const nextSaved = !trimmed || trimmed === defaultName ? '' : trimmed;
      if (currentSaved !== nextSaved) {
        if (nextSaved) {
          targetEl.setAttribute('data-mpx-name', nextSaved);
        } else {
          targetEl.removeAttribute('data-mpx-name');
        }
        this.commitDomMutation(doc);
        const updatedPage = this.pageSignal();
        if (updatedPage) {
          this.autoSavePage.emit(updatedPage);
        }
      }
    }

    if (inputEl) {
      inputEl.blur();
    }
  }

  protected moveActiveLevelItem(delta: -1 | 1): void {
    const lvl = this.activeLevel();
    if (lvl === 'container') {
      this.moveSelectedContainer(delta);
    } else if (lvl === 'row') {
      this.moveSelectedRow(delta);
    } else if (lvl === 'block') {
      this.moveSelectedBlock(delta);
    } else if (lvl === 'object') {
      this.moveSelectedObject(delta);
    }
  }

  protected deleteActiveLevelItem(): void {
    const lvl = this.activeLevel();
    if (lvl === 'container') {
      this.removeSelectedContainer();
    } else if (lvl === 'row') {
      this.removeSelectedRow();
    } else if (lvl === 'block') {
      this.clearOrRemoveSelectedBlock();
    } else if (lvl === 'object') {
      this.removeSelectedObject();
    }
  }

  // ==========================================================================
  // ATALHOS DE TECLADO (ESC SOBE NÍVEL | DEL EXCLUI | PGUP/PGDN MOVE | CTRL+Z/Y)
  // ==========================================================================

  @HostListener('window:keydown', ['$event'])
  protected onWindowKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
    ) {
      return;
    }

    if (!this.isCustomHtmlMode()) {
      if (event.key === 'Escape' && this.activeLevel() !== 'container') {
        event.preventDefault();
        this.stepOutLevel();
        return;
      }

      if (event.key === 'Delete') {
        event.preventDefault();
        this.deleteActiveLevelItem();
        return;
      }

      if (event.key === 'PageUp') {
        event.preventDefault();
        this.moveActiveLevelItem(-1);
        return;
      }

      if (event.key === 'PageDown') {
        event.preventDefault();
        this.moveActiveLevelItem(1);
        return;
      }
    }

    const isCtrl = event.ctrlKey || event.metaKey;
    if (isCtrl && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
      return;
    }
    if (isCtrl && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      this.redo();
    }
  }
}
