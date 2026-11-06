import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

export type PortalCardColorKey = 'violet' | 'indigo' | 'jade' | 'amber';

export interface PortalCardAccent {
  key: PortalCardColorKey;
  bannerClass: string;
  iconBoxClass: string;
  badgeClass: string;
}

export interface PortalCardBadge {
  label: string;
  classes: string;
  dotClass?: string;
  icon?: string;
  tooltip?: string;
}

export interface PortalColorOption {
  key: PortalCardColorKey;
  label: string;
  dotClass: string;
}

@Component({
  selector: 'mpx-portal-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    MatTooltip,
  ],
  templateUrl: './portal-card.component.html',
  styleUrl: './portal-card.component.scss',
})
export class MpxPortalCardComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() icon = 'boxes';
  @Input() isImageIcon = false;
  @Input({ required: true }) color: PortalCardColorKey = 'violet';
  @Input({ required: true }) accent!: PortalCardAccent;
  @Input() badges: PortalCardBadge[] = [];
  @Input() favorite = false;
  @Input() disabled = false;
  @Input() leftMetaLabel?: string;
  @Input() leftMetaIcon?: string;
  @Input() actionLabel = 'Acessar';
  @Input() colorPickerLabel = 'Personalize sua aplicação';
  @Input() showViewApplicationsOption = false;
  @Input() showViewWorkspacesOption = false;
  @Input() colorOptions: PortalColorOption[] = [];

  @Output() readonly access = new EventEmitter<void>();
  @Output() readonly favoriteToggle = new EventEmitter<void>();
  @Output() readonly viewApplications = new EventEmitter<void>();
  @Output() readonly viewWorkspaces = new EventEmitter<void>();
  @Output() readonly colorChange = new EventEmitter<PortalCardColorKey>();

  protected onCardAccess(): void {
    if (this.disabled) {
      return;
    }
    this.access.emit();
  }

  protected onSelectColor(color: PortalCardColorKey, event: Event): void {
    event.stopPropagation();
    this.colorChange.emit(color);
  }
}
