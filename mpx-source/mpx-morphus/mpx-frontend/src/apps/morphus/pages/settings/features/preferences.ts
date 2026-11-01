import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatLabel,
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Scheme, Theming } from '@/apps/core/theming';
import { THEME_PRESETS } from '@morphus/pages/settings/data/preferences';
import { SettingsUnsavedChanges } from '@morphus/pages/settings/ui/unsaved-changes';

@Component({
  selector: 'settings-preferences',
  imports: [
    FormField,
    FormRoot,
    MatDivider,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    MatSlideToggle,
    SettingsUnsavedChanges,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <form
      class="flex flex-auto flex-col gap-y-10"
      [formRoot]="preferencesForm"
    >
      <!-- Appearance -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Appearance</div>
          <div class="text-neutral-a11">How the app looks</div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Color scheme -->
          <div
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Color scheme</h3>
              <p class="text-sm text-neutral-a11">
                Choose between light and dark mode, or let it follow your system
                preference
              </p>
            </div>

            <mat-form-field class="small w-full shrink-0 sm:w-40">
              <mat-select
                aria-label="Color scheme"
                [value]="theming.scheme()"
                (valueChange)="theming.scheme.set($event)"
              >
                @for (item of schemes; track item.value) {
                  <mat-option [value]="item.value">
                    <mat-icon [svgIcon]="item.icon" />
                    {{ item.label }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-divider />

          <!-- Theme -->
          <div
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Theme</h3>
              <p class="text-sm text-neutral-a11">
                The accent color and its matching neutral tint
              </p>
            </div>

            <mat-form-field
              class="small w-full shrink-0 [--form-field-padding-inline-start:--spacing(1.5)] sm:w-40"
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

          <mat-divider />

          <!-- Dark sidebar -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="theming.sidebarScheme() === 'dark'"
            [disabled]="theming.isDark()"
            (change)="
              theming.sidebarScheme.set($event.checked ? 'dark' : 'light')
            "
          >
            <div class="flex flex-col">
              <div class="font-medium">Dark sidebar</div>
              <div class="text-sm text-neutral-a11">
                Keeps the sidebar dark in light mode
              </div>
            </div>
          </mat-slide-toggle>

          <mat-divider />

          <!-- Compact sidebar -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="compactSidebar()"
            (change)="compactSidebar.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Compact sidebar</div>
              <div class="text-sm text-neutral-a11">
                Show icons only in the sidebar and reveal labels on hover
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Accessibility -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Accessibility</div>
          <div class="text-neutral-a11">
            Make the app easier to read and follow
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:col-span-2">
          <!-- Font size -->
          <div
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <div class="flex flex-auto flex-col">
              <h3 class="font-medium">Font size</h3>
              <p class="text-sm text-neutral-a11">
                The size of text across the app
              </p>
            </div>

            <mat-form-field class="small w-full shrink-0 sm:w-40">
              <mat-select
                aria-label="Font size"
                [formField]="preferencesForm.fontSize"
              >
                <mat-option value="small">Small</mat-option>
                <mat-option value="default">Default</mat-option>
                <mat-option value="large">Large</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-divider />

          <!-- High contrast -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="highContrast()"
            (change)="highContrast.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">High contrast</div>
              <div class="text-sm text-neutral-a11">
                Stronger borders and text colors that stand out from the
                background
              </div>
            </div>
          </mat-slide-toggle>

          <mat-divider />

          <!-- Underline links -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="underlineLinks()"
            (change)="underlineLinks.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Underline links</div>
              <div class="text-sm text-neutral-a11">
                Tell links apart from the text around them without relying on
                color
              </div>
            </div>
          </mat-slide-toggle>

          <mat-divider />

          <!-- Reduce motion -->
          <mat-slide-toggle
            class="[--slide-toggle-gap-x:1rem]"
            fullWidth
            labelPosition="before"
            [checked]="reduceMotion()"
            (change)="reduceMotion.set($event.checked)"
          >
            <div class="flex flex-col">
              <div class="font-medium">Reduce motion</div>
              <div class="text-sm text-neutral-a11">
                Tone down transitions and animations across the app
              </div>
            </div>
          </mat-slide-toggle>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Localization -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Localization</div>
          <div class="text-neutral-a11">
            Your language, time zone and how dates and times are written
          </div>
        </div>

        <div class="grid gap-6 sm:col-span-2 sm:grid-cols-6">
          <!-- Language -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Language</mat-label>
              <mat-select [formField]="preferencesForm.language">
                <mat-option value="pt-br">Português (Brasil)</mat-option>
                <mat-option value="en-us">English (US)</mat-option>
                <mat-option value="en-gb">English (UK)</mat-option>
                <mat-option value="fr-fr">French (France)</mat-option>
                <mat-option value="de-de">German (Germany)</mat-option>
                <mat-option value="es-es">Spanish (Spain)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Time zone -->
          <div class="col-span-full">
            <mat-form-field class="w-full">
              <mat-label>Time zone</mat-label>
              <mat-select [formField]="preferencesForm.timeZone">
                <mat-option value="brasilia">Horário de Brasília (BRT)</mat-option>
                <mat-option value="pacific">Pacific Time (PT)</mat-option>
                <mat-option value="central">Central Time (CT)</mat-option>
                <mat-option value="eastern">Eastern Time (ET)</mat-option>
                <mat-option value="utc">Coordinated Universal Time (UTC)</mat-option>
                <mat-option value="cet">Central European Time (CET)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Date format -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Date format</mat-label>
              <mat-select [formField]="preferencesForm.dateFormat">
                <mat-option value="dd-mm-yyyy">DD/MM/YYYY</mat-option>
                <mat-option value="mm-dd-yyyy">MM/DD/YYYY</mat-option>
                <mat-option value="yyyy-mm-dd">YYYY-MM-DD</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Time format -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Time format</mat-label>
              <mat-select [formField]="preferencesForm.timeFormat">
                <mat-option value="24-hour">24-hour</mat-option>
                <mat-option value="12-hour">12-hour</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- First day of week -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>First day of week</mat-label>
              <mat-select [formField]="preferencesForm.firstDayOfWeek">
                <mat-option value="sunday">Sunday</mat-option>
                <mat-option value="monday">Monday</mat-option>
                <mat-option value="saturday">Saturday</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Number format -->
          <div class="col-span-full sm:col-span-3">
            <mat-form-field class="w-full">
              <mat-label>Number format</mat-label>
              <mat-select [formField]="preferencesForm.numberFormat">
                <mat-option value="period-comma">1.234,56</mat-option>
                <mat-option value="comma-period">1,234.56</mat-option>
                <mat-option value="space-comma">1 234,56</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </section>

      <!-- Unsaved changes -->
      @if (preferencesForm().dirty()) {
        <settings-unsaved-changes
          class="mt-auto"
          (discard)="preferencesForm().reset(defaults())"
        />
      }
    </form>
  `,
})
export default class SettingsPreferences {
  protected readonly theming = inject(Theming);

  protected readonly schemes: { label: string; value: Scheme; icon: string }[] = [
    { label: 'Light', value: 'light', icon: 'sun' },
    { label: 'Dark', value: 'dark', icon: 'moon' },
    { label: 'System', value: 'system', icon: 'monitor' },
  ];
  protected readonly themePresets = THEME_PRESETS;
  protected readonly selectedPreset = computed(
    () =>
      THEME_PRESETS.find(
        (preset) =>
          preset.primary.value.toLowerCase() ===
          this.theming.theme().primary.toLowerCase()
      ) ?? THEME_PRESETS[2]
  );
  protected readonly reduceMotion = signal(false);
  protected readonly compactSidebar = signal(false);
  protected readonly highContrast = signal(false);
  protected readonly underlineLinks = signal(false);

  private preferencesFormModel = signal(this.defaults());
  protected preferencesForm = form(this.preferencesFormModel, {
    submission: {
      action: async (field) => {
        field().reset();
      },
    },
  });

  protected setPreset(preset: (typeof THEME_PRESETS)[number]) {
    this.theming.theme.update((theme) => ({
      ...theme,
      primary: preset.primary.value,
      neutral: preset.neutral.value,
    }));
  }

  protected defaults() {
    return {
      language: 'pt-br',
      timeZone: 'brasilia',
      dateFormat: 'dd-mm-yyyy',
      timeFormat: '24-hour',
      firstDayOfWeek: 'monday',
      numberFormat: 'period-comma',
      fontSize: 'default',
    };
  }
}

