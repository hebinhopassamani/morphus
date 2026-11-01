import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { Theming } from '@/app/core/theming';
import { SidebarService } from '@/app/domains/admin/layout/data/sidebar';
import { THEME_PRESETS } from '@/app/domains/admin/modules/settings/data/preferences';
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

@Component({
  selector: 'quick-settings',
  imports: [
    MatIconButton,
    MatIcon,
    MatDivider,
    MatSlideToggle,
    MatTooltip,
    BuiPopover,
    BuiPopoverTrigger,
    BuiPopoverPortal,
    BuiPopoverContent,
    BuiPopoverClose,
    MatFormField,
    MatSelect,
    MatSelectTrigger,
    MatOption,
  ],
  template: `
    <div
      buiPopover
      class="w-72"
      position="bottom-end"
    >
      <!-- Trigger -->
      <button
        matIconButton
        buiPopoverTrigger
      >
        <mat-icon svgIcon="paintbrush" />
      </button>

      <!-- Panel -->
      <ng-template buiPopoverPortal>
        <div
          buiPopoverContent
          class="p-0 [--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"
        >
          <!-- Header -->
          <div class="mx-6 mt-5 flex items-center gap-x-1">
            <div class="text-xl font-medium">Quick settings</div>

            <div class="flex-auto"></div>

            <button
              matIconButton
              buiPopoverClose
              class="small"
              matTooltip="Close"
            >
              <mat-icon svgIcon="x" />
            </button>
          </div>

          <div class="mx-6 mt-4 mb-6 flex flex-col gap-y-5">
            <!-- Theme -->
            <div class="flex flex-col gap-y-1.75">
              <div class="flex flex-col">
                <div class="flex-auto font-medium">Theme</div>
                <div class="text-sm text-neutral-a11">
                  The accent color and its matching neutral tint
                </div>
              </div>
              <mat-form-field
                class="[--form-field-padding-inline-start:--spacing(2)]"
              >
                <mat-select
                  aria-label="Theme"
                  placeholder="Custom"
                  [value]="selectedPreset()"
                  (valueChange)="setPreset($event)"
                >
                  <mat-select-trigger class="flex items-center gap-x-2">
                    @if (selectedPreset(); as preset) {
                      <div
                        class="flex w-10 shrink-0 items-center justify-center gap-x-1 rounded-md border text-xs font-medium"
                        [class]="preset.neutral.chipClass"
                      >
                        <div
                          class="size-1.5 rounded-full"
                          [style.background-color]="preset.primary.value"
                        ></div>
                        Aa
                      </div>
                      {{ preset.primary.name }}
                    }
                  </mat-select-trigger>
                  @for (preset of themePresets; track preset.primary.value) {
                    <mat-option [value]="preset">
                      <div
                        class="flex h-5 w-10 shrink-0 items-center justify-center gap-x-1 rounded-md border text-xs font-medium"
                        [class]="preset.neutral.chipClass"
                      >
                        <div
                          class="size-1.5 rounded-full"
                          [style.background-color]="preset.primary.value"
                        ></div>
                        Aa
                      </div>
                      {{ preset.primary.name }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-divider class="mt-1" />

            <!-- Sidebar -->
            <mat-slide-toggle
              fullWidth
              labelPosition="before"
              [checked]="sidebarService.scheme() === 'dark'"
              [disabled]="theming.isDark()"
              (change)="
                sidebarService.setScheme($event.checked ? 'dark' : 'light')
              "
            >
              <div class="flex flex-col">
                <div class="font-medium">Dark sidebar</div>
                <div class="text-sm text-neutral-a11">
                  Keeps the sidebar dark in light mode
                </div>
              </div>
            </mat-slide-toggle>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class QuickSettings {
  // Dependencies
  private readonly sidebarService = inject(SidebarService);
  private readonly theming = inject(Theming);

  // State
  private readonly themePresets = THEME_PRESETS;
  private readonly selectedPreset = computed(() =>
    THEME_PRESETS.find(
      (preset) =>
        preset.primary.value === this.theming.theme().primary &&
        preset.neutral.value === this.theming.theme().neutral
    )
  );

  private setPreset(preset: (typeof THEME_PRESETS)[number]) {
    this.theming.theme.update((theme) => ({
      ...theme,
      primary: preset.primary.value,
      neutral: preset.neutral.value,
    }));
  }
}
