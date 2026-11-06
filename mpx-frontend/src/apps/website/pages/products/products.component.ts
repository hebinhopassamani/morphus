import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';
import { Auth } from '@core/mpx-auth';

export interface PublicProductCard {
  id: string;
  name: string;
  prefix?: string;
  icon?: string;
  color?: string;
  description?: string;
  system?: boolean;
  categoryName?: string;
  categoryLabel?: string;
  categoryColor?: string;
}

const DEFAULT_PRODUCTS: PublicProductCard[] = [
  {
    id: 'prod-morphus',
    name: 'Morphus',
    prefix: 'MPX',
    icon: 'boxes',
    color: 'violet',
    system: true,
    categoryLabel: 'Gestão',
    description:
      'Aplicação principal de gestão empresarial, governança corporativa, matriz, filiais e espaços de trabalho (workspaces).',
  },
  {
    id: 'prod-security',
    name: 'Segurança',
    prefix: 'SEC',
    icon: 'shield',
    color: 'indigo',
    system: true,
    categoryLabel: 'Segurança',
    description:
      'Controle centralizado de identidade, usuários, perfis de acesso (Roles) e permissões granulares (Claims) para todas as aplicações.',
  },
  {
    id: 'prod-financeiro',
    name: 'Morphus Financeiro',
    prefix: 'FIN',
    icon: 'wallet',
    color: 'jade',
    system: false,
    categoryLabel: 'Finanças',
    description:
      'Contas a pagar e receber, entrada automatizada de notas fiscais, conciliação bancária e visão consolidada de fluxo de caixa.',
  },
  {
    id: 'prod-flow',
    name: 'Morphus Flow',
    prefix: 'FLW',
    icon: 'workflow',
    color: 'violet',
    system: false,
    categoryLabel: 'Automação',
    description:
      'Motor visual de workflows configuráveis, roteamento condicional, aprovações por alçada e automação inteligente entre setores.',
  },
  {
    id: 'prod-crm',
    name: 'Morphus CRM',
    prefix: 'CRM',
    icon: 'users',
    color: 'indigo',
    system: false,
    categoryLabel: 'Comercial',
    description:
      'Gestão de funil comercial, carteira de clientes, histórico de relacionamento, oportunidades e propostas comerciais.',
  },
  {
    id: 'prod-kalupa',
    name: 'Kalupa Automação',
    prefix: 'KAL',
    icon: 'sparkles',
    color: 'amber',
    system: false,
    categoryLabel: 'Automação',
    description:
      'Estruturação inteligente de conhecimento com agentes de IA, templates dinâmicos e entrega sincronizada na pasta local.',
  },
  {
    id: 'prod-mail',
    name: 'Morphus Mail',
    prefix: 'MAL',
    icon: 'mail',
    color: 'jade',
    system: false,
    categoryLabel: 'Comunicação',
    description:
      'Disparo de e-mails transacionais de alta entregabilidade, gestão de templates HTML e verificação de domínios próprios.',
  },
];

@Component({
  selector: 'web-products',
  standalone: true,
  imports: [MatButton, MatCard, MatCardContent, MatIcon, RouterLink],
  host: {
    class: 'flex flex-auto flex-col gap-y-12 py-6 text-neutral-12 lg:py-10',
  },
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly auth = inject(Auth);
  protected readonly products = signal<PublicProductCard[]>(DEFAULT_PRODUCTS);

  ngOnInit(): void {
    this.http.get<PublicProductCard[]>(`${environment.apiUrl}/website/products`).subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          const filtered = items.filter(
            (a) => (a.name ?? '').trim().toUpperCase() !== 'WEBSITE',
          );
          if (filtered.length > 0) {
            this.products.set(filtered);
          }
        }
      },
      error: () => {
        // Mantém a lista padrão de produtos em caso de falha de rede
      },
    });
  }

  protected accentClasses(color?: string, index = 0): {
    bannerClass: string;
    iconBoxClass: string;
    badgeClass: string;
  } {
    const palette = [
      {
        key: 'violet',
        bannerClass: 'from-violet-a4 via-violet-a2 to-transparent',
        iconBoxClass: 'bg-violet-a3 text-violet-a11 ring-1 ring-violet-a5',
        badgeClass: 'bg-violet-a3 text-violet-a11',
      },
      {
        key: 'indigo',
        bannerClass: 'from-indigo-a4 via-indigo-a2 to-transparent',
        iconBoxClass: 'bg-indigo-a3 text-indigo-a11 ring-1 ring-indigo-a5',
        badgeClass: 'bg-indigo-a3 text-indigo-a11',
      },
      {
        key: 'jade',
        bannerClass: 'from-jade-a4 via-jade-a2 to-transparent',
        iconBoxClass: 'bg-jade-a3 text-jade-a11 ring-1 ring-jade-a5',
        badgeClass: 'bg-jade-a3 text-jade-a11',
      },
      {
        key: 'amber',
        bannerClass: 'from-amber-a4 via-amber-a2 to-transparent',
        iconBoxClass: 'bg-amber-a3 text-amber-a11 ring-1 ring-amber-a5',
        badgeClass: 'bg-amber-a3 text-amber-a11',
      },
    ];

    const normalized = (color ?? '').trim().toLowerCase();
    const found = palette.find((p) => p.key === normalized);
    return found ?? palette[index % palette.length];
  }
}
