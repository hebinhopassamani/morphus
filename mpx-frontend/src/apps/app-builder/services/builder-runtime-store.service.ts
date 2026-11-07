import { inject, Injectable, signal } from '@angular/core';
import { MorphusContextService } from '@morphus/services/morphus-context.service';

export interface AppBuilderRecord {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface AppBuilderCollectionMeta {
  key: string;
  label: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppBuilderRuntimeStoreService {
  private readonly context = inject(MorphusContextService);

  /** Incrementado sempre que qualquer registro ou lista de opções é alterada, permitindo re-hidratação reativa */
  readonly version = signal<number>(0);

  readonly defaultCollections: AppBuilderCollectionMeta[] = [
    {
      key: 'contas-pagar',
      label: 'Contas a Pagar',
      description: 'Títulos, boletos, vencimentos e pagamentos a fornecedores.',
    },
    {
      key: 'notas-fiscais',
      label: 'Notas Fiscais',
      description: 'Notas fiscais de entrada/serviço com chave, valor e aprovação.',
    },
    {
      key: 'fornecedores',
      label: 'Fornecedores',
      description: 'Cadastro de fornecedores, prestadores e parceiros comerciais.',
    },
    {
      key: 'registros-gerais',
      label: 'Registros da Página',
      description: 'Armazenamento padrão dos formulários e tabelas desta página.',
    },
  ];

  private getCorpKey(): string {
    return (
      this.context.activeWorkspace()?.corporationId ||
      this.context.activeWorkspace()?.id ||
      'default-corp'
    );
  }

  normalizeCollectionKey(raw?: string | null): string {
    const clean = (raw || 'contas-pagar')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return clean || 'contas-pagar';
  }

  normalizeFieldKey(raw?: string | null): string {
    const clean = (raw || 'campo')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return clean || 'campo';
  }

  getRecords(collectionKey: string): AppBuilderRecord[] {
    const normKey = this.normalizeCollectionKey(collectionKey);
    const storageKey = `morphus:app-data:${this.getCorpKey()}:${normKey}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback para seed inicial
    }

    const seeded = this.getInitialSeedForCollection(normKey);
    this.saveAllRecords(normKey, seeded, false);
    return seeded;
  }

  saveRecord(
    collectionKey: string,
    payload: Record<string, any>,
    existingId?: string | null,
  ): AppBuilderRecord {
    const normKey = this.normalizeCollectionKey(collectionKey);
    const records = [...this.getRecords(normKey)];
    const now = new Date().toISOString();

    if (existingId) {
      const idx = records.findIndex((r) => r.id === existingId);
      if (idx !== -1) {
        const updated: AppBuilderRecord = {
          ...records[idx],
          ...payload,
          id: existingId,
          updatedAt: now,
        };
        records[idx] = updated;
        this.saveAllRecords(normKey, records, true);
        return updated;
      }
    }

    const nextNum = records.length + 1;
    const code = `#${String(nextNum).padStart(3, '0')}`;
    const created: AppBuilderRecord = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      code,
      createdAt: now,
      updatedAt: now,
      ...payload,
    };

    records.unshift(created);
    this.saveAllRecords(normKey, records, true);
    return created;
  }

  deleteRecord(collectionKey: string, recordId: string): void {
    const normKey = this.normalizeCollectionKey(collectionKey);
    const records = this.getRecords(normKey).filter((r) => r.id !== recordId);
    this.saveAllRecords(normKey, records, true);
  }

  getComboOptions(comboKey: string, fallbackOptions: string[] = []): string[] {
    const normKey = this.normalizeFieldKey(comboKey);
    const storageKey = `morphus:combo-options:${this.getCorpKey()}:${normKey}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((x) => String(x));
        }
      }
    } catch {
      // ignore
    }

    if (fallbackOptions.length > 0) {
      return fallbackOptions;
    }

    return this.getDefaultComboOptionsByKey(normKey);
  }

  saveComboOptions(comboKey: string, options: string[]): string[] {
    const normKey = this.normalizeFieldKey(comboKey);
    const clean = Array.from(
      new Set(options.map((o) => String(o || '').trim()).filter((o) => o.length > 0)),
    );
    const storageKey = `morphus:combo-options:${this.getCorpKey()}:${normKey}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(clean));
    } catch {
      // ignore
    }
    this.version.update((v) => v + 1);
    return clean;
  }

  parseCurrencyNumber(val: unknown): number {
    if (typeof val === 'number') {
      return Number.isFinite(val) ? val : 0;
    }
    const str = String(val ?? '').trim();
    if (!str) {
      return 0;
    }
    // Remove R$, espaços e pontos de milhar quando há vírgula decimal
    const cleaned = str.replace(/[R$\s]/gi, '');
    if (cleaned.includes(',') && cleaned.includes('.')) {
      const num = Number(cleaned.replace(/\./g, '').replace(',', '.'));
      return Number.isFinite(num) ? num : 0;
    }
    if (cleaned.includes(',')) {
      const num = Number(cleaned.replace(',', '.'));
      return Number.isFinite(num) ? num : 0;
    }
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  formatCurrencyBRL(value: unknown): string {
    const num = this.parseCurrencyNumber(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  }

  private saveAllRecords(
    normKey: string,
    records: AppBuilderRecord[],
    bumpVersion: boolean,
  ): void {
    const storageKey = `morphus:app-data:${this.getCorpKey()}:${normKey}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch {
      // ignore
    }
    if (bumpVersion) {
      this.version.update((v) => v + 1);
    }
  }

  private getDefaultComboOptionsByKey(normKey: string): string[] {
    if (normKey.includes('categoria') || normKey.includes('centro')) {
      return ['Infraestrutura Cloud', 'Licenças de Software', 'Serviços Contábeis', 'Marketing', 'Operações'];
    }
    if (normKey.includes('forma') || normKey.includes('pagamento')) {
      return ['PIX Corporativo', 'Boleto Bancário', 'Transferência TED', 'Cartão Corporativo'];
    }
    if (normKey.includes('status') || normKey.includes('situacao')) {
      return ['Pendente', 'Aprovado', 'Pago', 'Vencido'];
    }
    if (normKey.includes('fornecedor')) {
      return ['Amazon AWS Brasil', 'Microsoft Cloud', 'Contabilidade Prime', 'Telecom Fibra S/A'];
    }
    return ['Opção 1', 'Opção 2', 'Opção 3'];
  }

  private getInitialSeedForCollection(normKey: string): AppBuilderRecord[] {
    const now = new Date().toISOString();
    if (normKey.includes('nota')) {
      return [
        {
          id: 'nf-seed-1',
          code: '#001',
          createdAt: now,
          updatedAt: now,
          numero_nf: 'NF-2026/00481',
          fornecedor: 'Amazon AWS Brasil',
          cnpj: '23.412.247/0001-10',
          data_emissao: '2026-11-02',
          categoria: 'Infraestrutura Cloud',
          valor: 'R$ 14.850,00',
          status: 'Aprovado',
          observacoes: 'Servidores de produção PostgreSQL + Containers.',
        },
        {
          id: 'nf-seed-2',
          code: '#002',
          createdAt: now,
          updatedAt: now,
          numero_nf: 'NF-2026/00482',
          fornecedor: 'Microsoft Cloud',
          cnpj: '04.712.500/0001-07',
          data_emissao: '2026-11-05',
          categoria: 'Licenças de Software',
          valor: 'R$ 6.320,00',
          status: 'Pendente',
          observacoes: 'Renovação anual licenças corporativas.',
        },
        {
          id: 'nf-seed-3',
          code: '#003',
          createdAt: now,
          updatedAt: now,
          numero_nf: 'NF-2026/00483',
          fornecedor: 'Contabilidade Prime',
          cnpj: '18.901.332/0001-88',
          data_emissao: '2026-11-06',
          categoria: 'Serviços Contábeis',
          valor: 'R$ 3.500,00',
          status: 'Aprovado',
          observacoes: 'Assessoria fiscal e fechamento mensal.',
        },
      ];
    }

    if (normKey.includes('fornecedor')) {
      return [
        {
          id: 'forn-seed-1',
          code: '#001',
          createdAt: now,
          updatedAt: now,
          fornecedor: 'Amazon AWS Brasil',
          cnpj: '23.412.247/0001-10',
          categoria: 'Infraestrutura Cloud',
          status: 'Ativo',
        },
        {
          id: 'forn-seed-2',
          code: '#002',
          createdAt: now,
          updatedAt: now,
          fornecedor: 'Microsoft Cloud',
          cnpj: '04.712.500/0001-07',
          categoria: 'Licenças de Software',
          status: 'Ativo',
        },
      ];
    }

    // Default: Contas a Pagar / Registros Gerais
    return [
      {
        id: 'cp-seed-1',
        code: '#001',
        createdAt: now,
        updatedAt: now,
        titulo: 'Fatura Servidores Cloud AWS',
        descricao: 'Fatura Servidores Cloud AWS',
        fornecedor: 'Amazon AWS Brasil',
        categoria: 'Infraestrutura Cloud',
        vencimento: '2026-11-15',
        forma_pagamento: 'Boleto Bancário',
        valor: 'R$ 14.850,00',
        status: 'Pago',
      },
      {
        id: 'cp-seed-2',
        code: '#002',
        createdAt: now,
        updatedAt: now,
        titulo: 'Licenças Enterprise DevOps',
        descricao: 'Licenças Enterprise DevOps',
        fornecedor: 'Microsoft Cloud',
        categoria: 'Licenças de Software',
        vencimento: '2026-11-20',
        forma_pagamento: 'PIX Corporativo',
        valor: 'R$ 6.320,00',
        status: 'Pendente',
      },
      {
        id: 'cp-seed-3',
        code: '#003',
        createdAt: now,
        updatedAt: now,
        titulo: 'Honorários Contábeis Mensais',
        descricao: 'Honorários Contábeis Mensais',
        fornecedor: 'Contabilidade Prime',
        categoria: 'Serviços Contábeis',
        vencimento: '2026-11-25',
        forma_pagamento: 'PIX Corporativo',
        valor: 'R$ 3.500,00',
        status: 'Aprovado',
      },
    ];
  }
}
