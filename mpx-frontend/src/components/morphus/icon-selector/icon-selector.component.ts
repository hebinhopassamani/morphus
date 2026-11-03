import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MPX_ICON_COLORS, MPX_ICONS } from '@core/mpx-icons';

const ALL_ICON_NAMES = Object.keys(MPX_ICONS).filter((key) => key !== 'default-icon');

@Component({
  selector: 'mpx-icon-selector',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatTooltip,
  ],
  styleUrl: './icon-selector.component.css',
  templateUrl: './icon-selector.component.html',
})
export class MpxIconSelectorComponent {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menuTrigger = viewChild(MatMenuTrigger);

  public readonly label = input<string>('Ícone');
  public readonly value = input<string | null | undefined>('building-2');
  public readonly defaultIcon = input<string>('building-2');

  public readonly valueChange = output<string>();

  protected search = '';
  protected readonly themeColors = MPX_ICON_COLORS;
  protected readonly panelWidth = signal<number>(280);
  protected readonly filteredIcons = signal<string[]>(ALL_ICON_NAMES);

  protected syncPanelWidth(): void {
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    if (rect.width > 0) {
      this.panelWidth.set(Math.round(rect.width));
    }
  }

  protected baseIconName(): string {
    const raw = this.value() || this.defaultIcon();
    const hashIdx = raw.indexOf('#');
    return hashIdx !== -1 ? raw.substring(0, hashIdx) : raw;
  }

  protected activeColor(): string {
    const raw = this.value() || '';
    const hashIdx = raw.indexOf('#');
    return hashIdx !== -1 ? raw.substring(hashIdx) : '';
  }

  protected buildIconKey(iconName: string, colorHex?: string): string {
    const color = colorHex !== undefined ? colorHex : this.activeColor();
    return color ? `${iconName}${color}` : iconName;
  }

  protected selectColor(colorHex: string): void {
    const nextValue = this.buildIconKey(this.baseIconName(), colorHex);
    this.valueChange.emit(nextValue);
  }

  protected onSearchChange(term: string): void {
    this.search = term;
    const clean = term.trim().toLowerCase();
    if (!clean) {
      this.filteredIcons.set(ALL_ICON_NAMES);
      return;
    }
    this.filteredIcons.set(
      ALL_ICON_NAMES.filter((iconName) => iconName.toLowerCase().includes(clean)),
    );
  }

  protected selectIcon(iconName: string): void {
    this.valueChange.emit(this.buildIconKey(iconName));
    this.menuTrigger()?.closeMenu();
  }

  protected clearSearch(event: Event): void {
    event.stopPropagation();
    this.onSearchChange('');
  }
}
