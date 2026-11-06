import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {
  BuiCollapsible,
  BuiCollapsibleContent,
  BuiCollapsiblePanel,
  BuiCollapsibleTrigger,
} from '@builder-kit/collapsible';
import {
  BuiSidebarButton,
  BuiSidebarIcon,
  BuiSidebarLabel,
  BuiSidebarMenu,
  BuiSidebarMenuItem,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
} from '@builder-kit/sidebar';
import { Menu } from '@security/entities/menu';

@Component({
  selector: 'mpx-menu',
  exportAs: 'mpxMenu',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    MatIcon,
    BuiCollapsible,
    BuiCollapsibleTrigger,
    BuiCollapsiblePanel,
    BuiCollapsibleContent,
    BuiSidebarSection,
    BuiSidebarSectionContent,
    BuiSidebarMenu,
    BuiSidebarMenuItem,
    BuiSidebarMenuRow,
    BuiSidebarButton,
    BuiSidebarIcon,
    BuiSidebarLabel,
  ],
  styleUrl: './menu.component.css',
  templateUrl: './menu.component.html',
})
export class MpxMenuComponent {
  private readonly router = inject(Router);

  /** URL atual reativa para destacar o menu pai quando um submenu filho estiver selecionado */
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects || e.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Fonte de dados (lista hierárquica de menus) a ser renderizada */
  readonly source = input<Menu[]>([]);

  /** Alias opcional caso passe via [menus] */
  readonly menus = input<Menu[]>([]);

  /** Lista resolvida e ordenada por `order` a partir de [source] ou [menus] */
  protected readonly items = computed<Menu[]>(() => {
    const raw = this.source().length > 0 ? this.source() : this.menus();
    return this.asMenuList(raw);
  });

  /** Indica se os menus ainda estão sendo carregados */
  readonly loading = input<boolean>(false);

  /** Mensagem exibida quando a lista de menus está vazia e não está carregando */
  readonly emptyMessage = input<string>('Nenhum menu cadastrado para esta aplicação.');

  /** Rota padrão caso um item de menu folha não possua URL definida */
  readonly defaultUrl = input<string>('/morphus');

  /** Define se os submenus retráteis iniciam abertos por padrão */
  readonly expandedByDefault = input<boolean>(true);

  protected asMenuList(items: unknown): Menu[] {
    const list = (items as Menu[]) ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  protected isExactRoute(url?: string | null): boolean {
    if (!url) {
      return true;
    }
    const clean = url.split('?')[0].replace(/\/+$/, '');
    return (
      clean === '' ||
      clean === '/morphus' ||
      clean === '/security' ||
      clean === '/website' ||
      clean === '/website/home' ||
      clean === '/morphus/settings'
    );
  }

  protected isUrlActive(url?: string | null): boolean {
    if (!url) {
      return false;
    }
    const cleanTarget = url.split('?')[0].replace(/\/+$/, '');
    const cleanCurrent = (this.currentUrl() ?? '').split('?')[0].replace(/\/+$/, '');
    if (!cleanTarget) {
      return false;
    }
    if (this.isExactRoute(cleanTarget)) {
      return cleanCurrent === cleanTarget;
    }
    return cleanCurrent === cleanTarget || cleanCurrent.startsWith(`${cleanTarget}/`);
  }

  protected isParentActive(item: Menu): boolean {
    if (!item.subMenus?.length) {
      return this.isUrlActive(item.url);
    }
    return item.subMenus.some(
      (child) => this.isUrlActive(child.url) || this.isParentActive(child),
    );
  }
}
