import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { Component, model } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { BUCKET_HUES } from '@/app/domains/admin/modules/tickets/data/tickets';
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

@Component({
  selector: 'ticket-hue-picker',
  imports: [
    Grid,
    GridRow,
    GridCell,
    MatIconButton,
    BuiPopover,
    BuiPopoverTrigger,
    BuiPopoverPortal,
    BuiPopoverContent,
    BuiPopoverClose,
  ],
  template: `
    <div
      buiPopover
      class="w-66"
      position="bottom-start"
      autoFocus="[ngGrid]"
    >
      <!-- Trigger -->
      <button
        matIconButton
        buiPopoverTrigger
        type="button"
        aria-label="Color"
      >
        <span
          class="size-2 rounded-full"
          [class]="bucketHues[hue()].color"
        ></span>
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
            aria-label="Colors"
            class="p-1"
            [multi]="false"
          >
            <div
              ngGridRow
              class="grid grid-cols-8 gap-1 px-px"
            >
              @for (name of hueNames; track name) {
                <button
                  ngGridCell
                  matIconButton
                  buiPopoverClose
                  type="button"
                  class="small aria-selected:bg-neutral-a4"
                  [attr.aria-label]="humanize(name)"
                  [selected]="name === hue()"
                  (selectedChange)="$event && hue.set(name)"
                >
                  <span
                    class="size-2 rounded-full"
                    [class]="bucketHues[name].color"
                  ></span>
                </button>
              }
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class TicketHuePicker {
  // Inputs / Outputs
  readonly hue = model.required<string>();

  // State
  private bucketHues = BUCKET_HUES;
  private hueNames = Object.keys(BUCKET_HUES);

  private humanize(name: string) {
    return name[0].toUpperCase() + name.slice(1);
  }
}
