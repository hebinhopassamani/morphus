import { I18nPluralPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { Media } from '@/app/core/media';
import {
  Integration,
  IntegrationsService,
} from '@/app/domains/admin/modules/integrations/data/integrations';
import { IntegrationsIntegrationDetails } from '@/app/domains/admin/modules/integrations/features/integrations/integration-details';
import {
  IntegrationLevelPill,
  IntegrationStatusPill,
} from '@/app/domains/admin/modules/integrations/ui/pills';
import { IntegrationTypeTag } from '@/app/domains/admin/modules/integrations/ui/tags';
import {
  BuiCollapsible,
  BuiCollapsibleContent,
  BuiCollapsiblePanel,
  BuiCollapsibleTrigger,
} from '@/app/ui/collapsible';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';
import {
  BuiSidebar,
  BuiSidebarBadge,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarIcon,
  BuiSidebarLabel,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
  BuiSidebarSectionHeader,
} from '@/app/ui/sidebar';

type FilterId = 'status' | 'category' | 'types' | 'level' | 'access';

type FilterOption = {
  id: string;
  label: string;
};

type Filter = {
  id: FilterId;
  label: string;
  expanded: boolean;
  options: FilterOption[];
};

type SortOption = {
  label: string;
  compare: (a: Integration, b: Integration) => number;
};

const FILTERS: Filter[] = [
  {
    id: 'status',
    label: 'Status',
    expanded: true,
    options: [
      {
        id: 'connected',
        label: 'Connected',
      },
      {
        id: 'not-connected',
        label: 'Not connected',
      },
      {
        id: 'needs-attention',
        label: 'Needs attention',
      },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    expanded: true,
    options: [
      {
        id: 'ai',
        label: 'AI',
      },
      {
        id: 'payments',
        label: 'Payments',
      },
      {
        id: 'shipping',
        label: 'Shipping',
      },
      {
        id: 'communication',
        label: 'Communication',
      },
      {
        id: 'analytics',
        label: 'Analytics',
      },
      {
        id: 'developer',
        label: 'Developer',
      },
    ],
  },
  {
    id: 'types',
    label: 'Type',
    expanded: true,
    options: [
      {
        id: 'rest-api',
        label: 'REST API',
      },
      {
        id: 'mcp-server',
        label: 'MCP server',
      },
      {
        id: 'webhook',
        label: 'Webhook',
      },
      {
        id: 'oauth-app',
        label: 'OAuth app',
      },
      {
        id: 'sdk',
        label: 'SDK',
      },
    ],
  },
  {
    id: 'level',
    label: 'Level',
    expanded: true,
    options: [
      {
        id: 'native',
        label: 'Native',
      },
      {
        id: 'verified',
        label: 'Verified partner',
      },
      {
        id: 'community',
        label: 'Community',
      },
    ],
  },
  {
    id: 'access',
    label: 'Access',
    expanded: false,
    options: [
      {
        id: 'read',
        label: 'Read only',
      },
      {
        id: 'read-write',
        label: 'Read and write',
      },
    ],
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Popular',
    compare: (a, b) => b.installs - a.installs,
  },
  {
    label: 'Name',
    compare: (a, b) => a.name.localeCompare(b.name),
  },
  {
    label: 'Recently added',
    compare: (a, b) => b.addedAt.localeCompare(a.addedAt),
  },
];

@Component({
  selector: 'integrations',
  imports: [
    BuiCollapsible,
    BuiCollapsibleContent,
    BuiCollapsiblePanel,
    BuiCollapsibleTrigger,
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    BuiSidebar,
    BuiSidebarBadge,
    BuiSidebarBody,
    BuiSidebarButton,
    BuiSidebarIcon,
    BuiSidebarLabel,
    BuiSidebarMenuRow,
    BuiSidebarSection,
    BuiSidebarSectionContent,
    BuiSidebarSectionHeader,
    FormsModule,
    I18nPluralPipe,
    IntegrationLevelPill,
    IntegrationStatusPill,
    IntegrationTypeTag,
    IntegrationsIntegrationDetails,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatPrefix,
    MatPseudoCheckbox,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatSuffix,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">
            Integrations
          </div>
          <div class="text-neutral-a11 sm:text-lg">
            Connect the payment, shipping and AI tools your shop runs on.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="primary max-sm:icon-only"
          >
            <mat-icon svgIcon="message-square-plus" />
            Request an integration
          </button>
        </div>
      </div>

      <div class="flex flex-auto flex-col gap-y-3">
        <!-- Search & Sort -->
        <div class="flex items-center gap-x-2">
          @if (isNarrow()) {
            <button
              matButton
              class="min-h-8 shrink-0 max-sm:icon-only"
              (click)="filtersPanel.toggle()"
            >
              <mat-icon svgIcon="funnel" />
              Filters
              @if (activeFilters().length) {
                <span
                  matButtonIcon
                  iconPositionEnd
                  class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11 tabular-nums"
                >
                  {{ activeFilters().length }}
                </span>
              }
            </button>
          }

          <!-- Search -->
          <mat-form-field class="w-full max-w-md">
            <mat-icon
              svgIcon="search"
              matIconPrefix
            />
            <input
              matInput
              placeholder="Search integrations"
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
            />
            @if (search()) {
              <button
                matIconButton
                matIconSuffix
                (click)="search.set('')"
              >
                <mat-icon svgIcon="x" />
              </button>
            }
          </mat-form-field>

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <!-- Sort -->
          <div
            buiCombobox
            class="w-fit"
            [value]="[sort()]"
            (valueChange)="sort.set($event[0] ?? sort())"
          >
            <button
              matButton
              buiComboboxTrigger
              id="integrations-sort"
              class="min-h-8 max-sm:icon-only"
            >
              <mat-icon svgIcon="arrow-down-up" />
              {{ sort().label }}
              <mat-icon
                svgIcon="chevron-down"
                class="max-sm:hidden"
                iconPositionEnd
              />
            </button>
            <ng-template
              buiComboboxPortal
              position="bottom-end"
              matchWidth="false"
            >
              <div
                buiComboboxContent
                class="min-w-40"
              >
                <div
                  buiComboboxListbox
                  aria-labelledby="integrations-sort"
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (option of sortOptions; track option.label) {
                    <div
                      buiComboboxOption
                      [value]="option"
                      [label]="option.label"
                    >
                      <span class="flex-auto truncate">{{ option.label }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
              </div>
            </ng-template>
          </div>
        </div>

        <mat-sidenav-container
          class="z-auto flex-auto border-t border-neutral-a4 [&_.mat-drawer-backdrop]:fixed [&_.mat-drawer-backdrop]:z-100"
        >
          <!-- Filters -->
          <mat-sidenav
            class="start-0 z-100 w-64 border-none bg-white dark:bg-neutral-2"
            [mode]="isNarrow() ? 'over' : 'side'"
            [opened]="!isNarrow()"
            [disableClose]="!isNarrow()"
            [fixedInViewport]="isNarrow()"
            #filtersPanel
          >
            <aside buiSidebar>
              <div
                buiSidebarBody
                class="pt-4 xl:px-0 xl:pt-3"
              >
                @for (filter of filters; track filter.id) {
                  <div
                    buiSidebarSection
                    class="xl:px-0"
                    buiCollapsible
                    [expanded]="filter.expanded"
                  >
                    <div buiSidebarSectionHeader>
                      <button
                        buiSidebarButton
                        buiCollapsibleTrigger
                      >
                        <span
                          buiSidebarLabel
                          class="grow-0"
                        >
                          {{ filter.label }}
                        </span>
                        <mat-icon
                          buiSidebarIcon
                          svgIcon="chevron-right"
                          class="size-4 transition-[rotate] group-data-[state=open]/bui-collapsible:rotate-90"
                        />
                      </button>
                    </div>
                    <ng-template buiCollapsiblePanel>
                      <div buiCollapsibleContent>
                        <div buiSidebarSectionContent>
                          @for (option of filter.options; track option.id) {
                            @let checked =
                              selections()[filter.id].includes(option.id);
                            <div buiSidebarMenuRow>
                              <button
                                buiSidebarButton
                                class="first:ps-2"
                                role="checkbox"
                                [attr.aria-checked]="checked"
                                (click)="toggleOption(filter, option)"
                              >
                                <mat-pseudo-checkbox
                                  [state]="checked ? 'checked' : 'unchecked'"
                                />
                                <span buiSidebarLabel>
                                  {{ option.label }}
                                </span>
                                <span buiSidebarBadge>
                                  {{ counts()[filter.id][option.id] ?? 0 }}
                                </span>
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    </ng-template>
                  </div>
                }
              </div>
            </aside>
          </mat-sidenav>

          <mat-sidenav-content class="flex flex-col gap-y-3 pt-3 xl:ps-6">
            <!-- Count & Active filters -->
            <div class="flex flex-wrap items-center">
              <div class="flex h-8 items-center text-neutral-a11 tabular-nums">
                @if (activeFilters().length) {
                  Showing {{ results().length }} of
                  {{ integrations().length | i18nPlural: integrationPlural }}
                } @else {
                  {{ results().length | i18nPlural: integrationPlural }}
                }
              </div>

              @if (activeFilters().length) {
                <mat-divider
                  vertical
                  class="ms-2.5 me-1 h-3"
                />

                <button
                  matButton
                  class="tertiary tiny"
                  (click)="clearFilters()"
                >
                  Clear all
                </button>
              }
            </div>

            <!-- Integrations -->
            <div class="@container">
              <div class="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
                @for (integration of results(); track integration.id) {
                  <mat-card
                    appearance="filled"
                    class="flex flex-col"
                  >
                    <mat-card-content
                      class="flex flex-auto cursor-pointer flex-col gap-y-4"
                      role="button"
                      tabindex="0"
                      (click)="selected.set(integration.id)"
                      (keydown.enter)="selected.set(integration.id)"
                    >
                      <div class="flex items-center gap-x-3">
                        <div
                          class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                          [class]="integration.colorClass"
                        >
                          <mat-icon
                            class="size-5"
                            [svgIcon]="integration.icon"
                          />
                        </div>
                        <div class="flex min-w-0 flex-col">
                          <div class="truncate font-medium">
                            {{ integration.name }}
                          </div>
                          <integration-level-pill
                            class="text-neutral-a11"
                            [level]="integration.level"
                          />
                        </div>
                      </div>

                      <div class="truncate text-neutral-a11">
                        {{ integration.description }}
                      </div>

                      <div class="mt-auto flex flex-wrap gap-1.5">
                        @for (type of integration.types; track type) {
                          <integration-type-tag [type]="type" />
                        }
                      </div>
                    </mat-card-content>

                    <mat-card-footer class="items-center px-3 py-2">
                      @if (integration.status === 'not-connected') {
                        <div class="flex-auto"></div>
                        <button
                          matButton
                          class="primary tiny"
                          (click)="integrationsService.connect(integration)"
                        >
                          Connect
                        </button>
                      } @else {
                        <integration-status-pill
                          [status]="integration.status"
                        />
                        <div class="flex-auto"></div>
                        <button
                          matButton
                          class="tiny"
                          (click)="selected.set(integration.id)"
                        >
                          Manage
                        </button>
                      }
                    </mat-card-footer>
                  </mat-card>
                } @empty {
                  <div
                    class="col-span-full flex flex-col items-center justify-center gap-y-2 py-10"
                  >
                    <mat-icon
                      class="size-10"
                      svgIcon="plug"
                    />
                    <div class="text-center text-neutral-a11">
                      No integrations match these filters.
                    </div>
                  </div>
                }
              </div>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    </div>

    <!-- Details -->
    <integrations-integration-details [(id)]="selected" />
  `,
})
export default class Integrations {
  // Dependencies
  private integrationsService = inject(IntegrationsService);
  private media = inject(Media);

  // State
  private integrations = this.integrationsService.integrations;
  private filters = FILTERS;
  private sortOptions = SORT_OPTIONS;
  private integrationPlural = {
    '=1': '# integration',
    other: '# integrations',
  };
  private isNarrow = this.media.match(`(width < 80rem)`);
  private search = signal('');
  private sort = signal(SORT_OPTIONS[0]);
  private selections = signal<Record<FilterId, string[]>>({
    status: [],
    category: [],
    types: [],
    level: [],
    access: [],
  });
  private selected = signal<string | null>(null);

  // Computed state
  private counts = computed(
    () =>
      Object.fromEntries(
        FILTERS.map((filter) => [
          filter.id,
          Object.fromEntries(
            filter.options.map((option) => [
              option.id,
              this.integrations().filter((integration) =>
                this.values(integration, filter.id).includes(option.id)
              ).length,
            ])
          ),
        ])
      ) as Record<FilterId, Record<string, number>>
  );
  private activeFilters = computed(() =>
    FILTERS.flatMap((filter) =>
      filter.options
        .filter((option) => this.selections()[filter.id].includes(option.id))
        .map((option) => ({ filter, option }))
    )
  );
  private results = computed(() => {
    const search = this.search().trim().toLowerCase();

    return this.integrations()
      .filter(
        (integration) =>
          (!search ||
            integration.name.toLowerCase().includes(search) ||
            integration.description.toLowerCase().includes(search)) &&
          FILTERS.every((filter) => {
            const selection = this.selections()[filter.id];

            return (
              !selection.length ||
              this.values(integration, filter.id).some((value) =>
                selection.includes(value)
              )
            );
          })
      )
      .sort(this.sort().compare);
  });

  private values(integration: Integration, id: FilterId): string[] {
    return [integration[id]].flat();
  }

  private toggleOption(filter: Filter, option: FilterOption) {
    this.selections.update((selections) => ({
      ...selections,
      [filter.id]: selections[filter.id].includes(option.id)
        ? selections[filter.id].filter((value) => value !== option.id)
        : [...selections[filter.id], option.id],
    }));
  }

  private clearFilters() {
    this.selections.set({
      status: [],
      category: [],
      types: [],
      level: [],
      access: [],
    });
  }
}
