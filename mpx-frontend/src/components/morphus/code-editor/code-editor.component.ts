import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  effect,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import * as prettierStandalone from 'prettier/standalone';
import * as prettierPluginHtml from 'prettier/plugins/html';
import { Theming } from '@core/mpx-theming';
import { environment } from '@/environments/environment';

declare global {
  interface Window {
    require?: any;
    monaco?: any;
    __morphusMonacoLoadingPromise?: Promise<any>;
  }
}

const MONACO_CDN_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';
const PRETTIER_STORAGE_KEY = 'morphus_studio_prettierrc_v1';
const DEFAULT_PRETTIER_CONFIG = JSON.stringify(
  {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    singleQuote: false,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
    singleAttributePerLine: false,
  },
  null,
  2,
);

const VOID_HTML_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export function formatHtmlPretty(rawHtml: string): string {
  const src = (rawHtml ?? '').trim();
  if (!src) {
    return '';
  }

  // Quebra qualquer transição entre tags (mesmo coladas sem espaço: ><)
  const normalized = src
    .replace(/>\s*</g, '>\n<')
    .replace(/\r\n/g, '\n');

  const rawLines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let indent = 0;
  const formattedLines: string[] = [];

  for (const line of rawLines) {
    const isClosingTag = /^<\//.test(line);
    const openMatch = line.match(/^<([a-zA-Z0-9-]+)/);
    const tagName = openMatch ? openMatch[1].toLowerCase() : '';
    const isSelfClosing =
      /\/>$/.test(line) ||
      /^<![a-zA-Z-]/.test(line) ||
      (tagName.length > 0 && VOID_HTML_TAGS.has(tagName));
    const hasInlineClose =
      tagName.length > 0 &&
      new RegExp(`^<${tagName}(\\s[^>]*)?>.*<\\/${tagName}>$`, 'i').test(line);

    if (isClosingTag) {
      indent = Math.max(0, indent - 1);
    }

    formattedLines.push(`${'  '.repeat(indent)}${line}`);

    if (openMatch && !isClosingTag && !isSelfClosing && !hasInlineClose) {
      indent += 1;
    }
  }

  return formattedLines.join('\n');
}

@Component({
  selector: 'mpx-code-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
})
export class MpxCodeEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  protected readonly theming = inject(Theming);

  @ViewChild('editorContainer', { static: false })
  private editorContainer?: ElementRef<HTMLDivElement>;

  @Input() value = '';
  @Input() language: 'html' | 'css' | 'javascript' | 'json' = 'html';
  @Input() height = '360px';
  @Input() placeholder = 'Digite seu código HTML aqui...';
  @Input() appPrefix = 'APP';
  @Input() fileName = 'pagina';

  @Output() readonly valueChange = new EventEmitter<string>();

  protected readonly monacoReady = signal<boolean>(false);
  protected readonly monacoFailed = signal<boolean>(false);
  protected readonly resolvedHeight = signal<string>('360px');
  protected readonly showPrettierConfig = signal<boolean>(false);
  protected readonly vsCodeSyncActive = signal<boolean>(false);
  protected readonly vsCodeSyncPath = signal<string>('');
  protected readonly prettierConfigJson = signal<string>(DEFAULT_PRETTIER_CONFIG);

  private editorInstance: any = null;
  private suppressChangeEvent = false;
  private vsCodeWatchTimer: any = null;
  private localFileHandle: any = null;
  private lastKnownModified = 0;

  constructor() {
    effect(() => {
      const isDark = this.theming.isDark();
      untracked(() => {
        if (this.editorInstance && window.monaco?.editor) {
          window.monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
        }
      });
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const savedPrettier = localStorage.getItem(PRETTIER_STORAGE_KEY);
    if (savedPrettier?.trim()) {
      this.prettierConfigJson.set(savedPrettier);
    }
    this.recalculateHeight();
    setTimeout(() => this.recalculateHeight(), 80);
    void this.initMonaco();
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    this.recalculateHeight();
  }

  @HostListener('keydown', ['$event'])
  protected onHostKeydown(event: KeyboardEvent): void {
    const key = (event.key || '').toLowerCase();
    // Atalho padrão VS Code (Shift + Alt + F) ou alternativo (Ctrl + Shift + F) para Formatar com Prettier
    if (
      (event.shiftKey && event.altKey && key === 'f') ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'f')
    ) {
      event.preventDefault();
      event.stopPropagation();
      void this.formatDocument();
    }
  }

  protected togglePrettierConfig(forceValue?: boolean): void {
    const next = forceValue !== undefined ? forceValue : !this.showPrettierConfig();
    this.showPrettierConfig.set(next);
    setTimeout(() => this.recalculateHeight(), 20);
  }

  protected recalculateHeight(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.height !== 'auto-viewport') {
      this.resolvedHeight.set(this.height || '360px');
      return;
    }
    const el = this.editorContainer?.nativeElement;
    if (!el) {
      this.resolvedHeight.set('calc(100dvh - 260px)');
      return;
    }
    const rect = el.getBoundingClientRect();
    // Subtrai a posição Y real do topo do editor no monitor atual + 24px de margem inferior do card
    const availablePx = Math.max(260, Math.floor(window.innerHeight - rect.top - 24));
    this.resolvedHeight.set(`${availablePx}px`);
    if (this.editorInstance) {
      this.editorInstance.layout();
    }
  }

  protected onPrettierConfigChange(nextJson: string): void {
    this.prettierConfigJson.set(nextJson);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(PRETTIER_STORAGE_KEY, nextJson);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileName'] && !changes['fileName'].firstChange) {
      this.stopVsCodeSync();
      this.localFileHandle = null;
    }
    if (changes['value'] && this.editorInstance) {
      const incoming = this.value ?? '';
      const current = this.editorInstance.getValue();
      if (incoming !== current) {
        this.suppressChangeEvent = true;
        const pos = this.editorInstance.getPosition();
        this.editorInstance.setValue(incoming);
        if (pos) {
          this.editorInstance.setPosition(pos);
        }
        this.suppressChangeEvent = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.stopVsCodeSync();
    if (this.editorInstance) {
      this.editorInstance.dispose();
      this.editorInstance = null;
    }
  }

  async openInVsCodeDesktop(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const rawCurrentHtml = this.editorInstance ? this.editorInstance.getValue() : (this.value ?? '');
    const currentHtml = await this.formatStringWithPrettier(rawCurrentHtml);
    if (currentHtml !== rawCurrentHtml) {
      this.applyExternalCodeUpdate(currentHtml);
    }

    // 1. Tenta via ponte direta com a Mpx.Api usando fetch nativo (sem disparar o interceptor de erro 404 caso o backend não tenha sido reiniciado)
    try {
      const apiBase = environment.apiUrl.replace(/\/+$/, '');
      const resp = await fetch(`${apiBase}/application/vscode-bridge/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appPrefix: this.appPrefix || 'APP',
          fileName: this.fileName || 'pagina',
          htmlContent: currentHtml,
        }),
      });

      if (resp.ok) {
        const res = (await resp.json()) as {
          filePath: string;
          vscodeUrl: string;
          lastModifiedTicks: number;
          openedByServer?: boolean;
        };

        if (res?.filePath) {
          this.stopVsCodeSync();
          this.vsCodeSyncActive.set(true);
          this.vsCodeSyncPath.set(res.filePath);
          this.lastKnownModified = res.lastModifiedTicks;

          this.vsCodeWatchTimer = setInterval(async () => {
            try {
              const pollUrl = `${apiBase}/application/vscode-bridge/poll?filePath=${encodeURIComponent(res.filePath)}&sinceTicks=${this.lastKnownModified}`;
              const pollResp = await fetch(pollUrl);
              if (!pollResp.ok) {
                return;
              }
              const poll = (await pollResp.json()) as {
                changed: boolean;
                lastModifiedTicks: number;
                htmlContent: string;
              };
              if (poll?.changed && typeof poll.htmlContent === 'string') {
                this.lastKnownModified = poll.lastModifiedTicks;
                this.applyExternalCodeUpdate(poll.htmlContent);
              }
            } catch {
              // ignora falha momentânea
            }
          }, 800);
          return;
        }
      }
    } catch {
      // Fallback imediato via File System Access API nativa do navegador
    }

    // 2. Fallback via File System Access API (Chrome / Edge) + vscode://
    try {
      const win = window as any;
      if (typeof win.showSaveFilePicker === 'function') {
        const cleanSlug = (this.fileName || 'pagina').replace(/[^a-zA-Z0-9_-]/g, '-');
        if (!this.localFileHandle) {
          this.localFileHandle = await win.showSaveFilePicker({
            suggestedName: `${cleanSlug}.html`,
            startIn: 'downloads',
            types: [
              {
                description: 'Página HTML Morphus',
                accept: { 'text/html': ['.html'] },
              },
            ],
          });
        }

        const writable = await this.localFileHandle.createWritable();
        await writable.write(currentHtml);
        await writable.close();

        const fileObj = await this.localFileHandle.getFile();
        this.lastKnownModified = fileObj.lastModified;

        this.stopVsCodeSync();
        this.vsCodeSyncActive.set(true);
        this.vsCodeSyncPath.set(fileObj.name);

        // Abre no VS Code Desktop apontando para a pasta Downloads padrão
        const downloadsPath = `C:/Users/hebin/Downloads/${fileObj.name}`;
        window.location.href = `vscode://file/${downloadsPath}`;

        this.vsCodeWatchTimer = setInterval(async () => {
          try {
            if (!this.localFileHandle) {
              return;
            }
            const latestFile = await this.localFileHandle.getFile();
            if (latestFile.lastModified > this.lastKnownModified) {
              this.lastKnownModified = latestFile.lastModified;
              const newText = await latestFile.text();
              this.applyExternalCodeUpdate(newText);
            }
          } catch {
            // ignora erro de leitura enquanto o VS Code está gravando
          }
        }, 800);
      }
    } catch {
      // Usuário cancelou o seletor
    }
  }

  stopVsCodeSync(): void {
    if (this.vsCodeWatchTimer) {
      clearInterval(this.vsCodeWatchTimer);
      this.vsCodeWatchTimer = null;
    }
    this.vsCodeSyncActive.set(false);
  }

  private applyExternalCodeUpdate(newHtml: string): void {
    if (this.editorInstance) {
      const current = this.editorInstance.getValue();
      if (newHtml !== current) {
        this.suppressChangeEvent = true;
        this.editorInstance.setValue(newHtml);
        this.suppressChangeEvent = false;
        this.value = newHtml;
        this.valueChange.emit(newHtml);
      }
    } else if (newHtml !== this.value) {
      this.onFallbackChange(newHtml);
    }
  }

  private async formatStringWithPrettier(raw: string): Promise<string> {
    if (!raw?.trim()) {
      return '';
    }
    let parsedConfig: Record<string, any> = {
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      singleQuote: false,
      bracketSameLine: true,
      htmlWhitespaceSensitivity: 'ignore',
      singleAttributePerLine: false,
    };
    try {
      parsedConfig = { ...parsedConfig, ...JSON.parse(this.prettierConfigJson()) };
    } catch {
      // fallback se JSON estiver sendo editado
    }

    // 1. Pré-quebra tags coladas (><) para garantir que elementos inline/bloco colados em 1 linha sejam separados
    const preSplit = formatHtmlPretty(raw);

    try {
      const formatFn = (prettierStandalone as any).default?.format ?? prettierStandalone.format;
      const htmlPlugin = (prettierPluginHtml as any).default ?? prettierPluginHtml;
      const formatted = await formatFn(preSplit, {
        ...parsedConfig,
        parser: 'html',
        plugins: [htmlPlugin],
      });
      return formatted.trim();
    } catch {
      return preSplit;
    }
  }

  async formatDocument(): Promise<void> {
    const current = this.editorInstance ? this.editorInstance.getValue() : this.value;
    const pretty = await this.formatStringWithPrettier(current);

    if (this.editorInstance) {
      if (pretty && pretty !== current) {
        this.editorInstance.setValue(pretty);
      }
    } else if (pretty !== this.value) {
      this.onFallbackChange(pretty);
    }
  }

  triggerUndo(): void {
    if (this.editorInstance) {
      this.editorInstance.trigger('toolbar', 'undo', null);
    }
  }

  triggerRedo(): void {
    if (this.editorInstance) {
      this.editorInstance.trigger('toolbar', 'redo', null);
    }
  }

  protected onFallbackChange(nextVal: string): void {
    this.value = nextVal;
    this.valueChange.emit(nextVal);
  }

  private async initMonaco(): Promise<void> {
    try {
      const monaco = await this.loadMonacoScript();
      if (!monaco || !this.editorContainer?.nativeElement) {
        this.monacoFailed.set(true);
        return;
      }

      this.editorInstance = monaco.editor.create(this.editorContainer.nativeElement, {
        value: this.value ?? '',
        language: this.language,
        theme: this.theming.isDark() ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        tabSize: 2,
        padding: { top: 12, bottom: 12 },
        roundedSelection: true,
      });

      this.editorInstance.onDidChangeModelContent(() => {
        if (this.suppressChangeEvent) {
          return;
        }
        const val = this.editorInstance.getValue();
        this.value = val;
        this.valueChange.emit(val);
      });

      if (monaco.KeyMod && monaco.KeyCode) {
        this.editorInstance.addCommand(
          monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
          () => {
            void this.formatDocument();
          },
        );
        this.editorInstance.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
          () => {
            void this.formatDocument();
          },
        );
      }

      this.monacoReady.set(true);
    } catch {
      this.monacoFailed.set(true);
    }
  }

  private loadMonacoScript(): Promise<any> {
    if (window.monaco?.editor) {
      return Promise.resolve(window.monaco);
    }

    if (window.__morphusMonacoLoadingPromise) {
      return window.__morphusMonacoLoadingPromise;
    }

    window.__morphusMonacoLoadingPromise = new Promise((resolve, reject) => {
      const configureAndLoad = () => {
        try {
          window.require.config({ paths: { vs: MONACO_CDN_BASE } });
          window.require(['vs/editor/editor.main'], () => {
            resolve(window.monaco);
          });
        } catch (err) {
          reject(err);
        }
      };

      if (window.require?.config) {
        configureAndLoad();
        return;
      }

      const script = document.createElement('script');
      script.src = `${MONACO_CDN_BASE}/loader.js`;
      script.async = true;
      script.onload = () => configureAndLoad();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });

    return window.__morphusMonacoLoadingPromise;
  }
}
