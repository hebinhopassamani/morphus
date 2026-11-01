import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

type CardAccent = {
  bannerClass: string;
  iconBoxClass: string;
  badgeClass: string;
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
    bannerClass: 'from-violet-a4 via-violet-a2 to-transparent',
    iconBoxClass: 'bg-violet-a3 text-violet-a11 ring-1 ring-violet-a5',
    badgeClass: 'bg-violet-a3 text-violet-a11',
  },
  {
    bannerClass: 'from-indigo-a4 via-indigo-a2 to-transparent',
    iconBoxClass: 'bg-indigo-a3 text-indigo-a11 ring-1 ring-indigo-a5',
    badgeClass: 'bg-indigo-a3 text-indigo-a11',
  },
  {
    bannerClass: 'from-jade-a4 via-jade-a2 to-transparent',
    iconBoxClass: 'bg-jade-a3 text-jade-a11 ring-1 ring-jade-a5',
    badgeClass: 'bg-jade-a3 text-jade-a11',
  },
  {
    bannerClass: 'from-amber-a4 via-amber-a2 to-transparent',
    iconBoxClass: 'bg-amber-a3 text-amber-a11 ring-1 ring-amber-a5',
    badgeClass: 'bg-amber-a3 text-amber-a11',
  },
];

@Component({
  selector: 'web-home',
  imports: [MatButton, MatCard, MatCardContent, MatCardFooter, MatIcon, RouterLink],
  host: {
    class: 'flex flex-auto flex-col gap-y-20 py-6 text-neutral-12 lg:gap-y-28 lg:py-10',
  },
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | null = null;

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

  protected accentFor(index: number): CardAccent {
    return CARD_ACCENTS[index % CARD_ACCENTS.length];
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

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
