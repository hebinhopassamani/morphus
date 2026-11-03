import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  BuiSidebarSectionHeader,
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
    BuiSidebarSectionHeader,
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
  /** Fonte de dados (lista hierárquica de menus) a ser renderizada */
  readonly source = input<Menu[]>([]);

  /** Alias opcional caso passe via [menus] */
  readonly menus = input<Menu[]>([]);

  /** Lista resolvida a partir de [source] ou [menus] */
  protected readonly items = computed<Menu[]>(() =>
    this.source().length > 0 ? this.source() : this.menus(),
  );

  /** Indica se os menus ainda estão sendo carregados */
  readonly loading = input<boolean>(false);

  /** Mensagem exibida quando a lista de menus está vazia e não está carregando */
  readonly emptyMessage = input<string>('Nenhum menu cadastrado para esta aplicação.');

  /** Rota padrão caso um item de menu folha não possua URL definida */
  readonly defaultUrl = input<string>('/admin');

  /** Define se os submenus retráteis iniciam abertos por padrão */
  readonly expandedByDefault = input<boolean>(true);

  protected asMenuList(items: unknown): Menu[] {
    return (items as Menu[]) ?? [];
  }

  protected isSection(item: Menu): boolean {
    return !item.menuId && !item.url && !!item.subMenus?.length;
  }
}
