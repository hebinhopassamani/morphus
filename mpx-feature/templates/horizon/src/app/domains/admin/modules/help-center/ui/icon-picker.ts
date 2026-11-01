import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { Component, model } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

const GROUPS: { label: string; rows: string[][] }[] = [
  {
    label: 'General',
    rows: [
      [
        'folder',
        'file-text',
        'star',
        'heart',
        'tag',
        'bookmark',
        'calendar',
        'clock',
      ],
      [
        'globe',
        'house',
        'layers',
        'layout-grid',
        'image',
        'paperclip',
        'archive',
        'box',
      ],
    ],
  },
  {
    label: 'Getting started',
    rows: [
      [
        'rocket',
        'compass',
        'map',
        'flag',
        'sparkles',
        'graduation-cap',
        'book-open',
        'lightbulb',
      ],
      [
        'play',
        'list-checks',
        'milestone',
        'footprints',
        'target',
        'map-pin',
        'trophy',
        'zap',
      ],
    ],
  },
  {
    label: 'Account and billing',
    rows: [
      [
        'credit-card',
        'wallet',
        'receipt',
        'banknote',
        'user-round',
        'users-round',
        'key-round',
        'shield',
      ],
      [
        'lock',
        'building',
        'badge-check',
        'piggy-bank',
        'user-round-cog',
        'id-card',
        'coins',
        'crown',
      ],
    ],
  },
  {
    label: 'Tickets and channels',
    rows: [
      [
        'ticket',
        'inbox',
        'mail',
        'message-square',
        'phone',
        'headset',
        'bell',
        'megaphone',
      ],
      [
        'message-circle',
        'at-sign',
        'send',
        'smartphone',
        'phone-call',
        'messages-square',
        'reply',
        'video',
      ],
    ],
  },
  {
    label: 'Integrations',
    rows: [
      [
        'plug',
        'cable',
        'link',
        'webhook',
        'puzzle',
        'blocks',
        'cloud',
        'database',
      ],
      [
        'code',
        'terminal',
        'server',
        'git-branch',
        'workflow',
        'key',
        'share-2',
        'cpu',
      ],
    ],
  },
  {
    label: 'Troubleshooting',
    rows: [
      [
        'wrench',
        'bug',
        'life-buoy',
        'circle-question-mark',
        'triangle-alert',
        'settings',
        'activity',
        'refresh-cw',
      ],
      [
        'search',
        'hammer',
        'circle-alert',
        'shield-alert',
        'circle-x',
        'gauge',
        'stethoscope',
        'scan-search',
      ],
    ],
  },
];

@Component({
  selector: 'help-icon-picker',
  imports: [
    Grid,
    GridRow,
    GridCell,
    MatIconButton,
    MatIcon,
    BuiPopover,
    BuiPopoverTrigger,
    BuiPopoverPortal,
    BuiPopoverContent,
    BuiPopoverClose,
  ],
  template: `
    <div
      buiPopover
      class="w-70"
      position="bottom-start"
      autoFocus="[ngGrid]"
    >
      <!-- Trigger -->
      <button
        matIconButton
        buiPopoverTrigger
        type="button"
        aria-label="Icon"
      >
        <mat-icon [svgIcon]="icon()" />
      </button>

      <!-- Panel -->
      <ng-template buiPopoverPortal>
        <div
          buiPopoverContent
          class="p-0"
        >
          <div
            ngGrid
            enableSelection
            selectionMode="follow"
            focusMode="roving"
            rowWrap="continuous"
            colWrap="continuous"
            aria-label="Icons"
            class="max-h-80 overflow-y-auto p-1 pb-3"
            [multi]="false"
          >
            @for (group of groups; track group.label) {
              <div
                class="px-2 py-1.5 font-medium"
                [class.pt-3]="!$first"
              >
                {{ group.label }}
              </div>
              <div class="flex flex-col gap-y-1 px-2">
                @for (row of group.rows; track $index) {
                  <div
                    ngGridRow
                    class="grid grid-cols-8 gap-1"
                  >
                    @for (name of row; track name) {
                      <button
                        ngGridCell
                        matIconButton
                        buiPopoverClose
                        type="button"
                        class="small aria-selected:bg-neutral-a4"
                        [attr.aria-label]="humanize(name)"
                        [selected]="name === icon()"
                        (selectedChange)="$event && icon.set(name)"
                      >
                        <mat-icon [svgIcon]="name" />
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class HelpIconPicker {
  // Inputs / Outputs
  readonly icon = model.required<string>();

  // State
  private groups = GROUPS;

  private humanize(name: string) {
    const label = name.replaceAll('-', ' ');
    return label[0].toUpperCase() + label.slice(1);
  }
}
