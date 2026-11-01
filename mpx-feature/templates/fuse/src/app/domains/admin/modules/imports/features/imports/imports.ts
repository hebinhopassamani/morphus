import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  Import,
  IMPORT_TEMPLATES,
  ImportsService,
  ImportStatus,
  ImportType,
} from '@/app/domains/admin/modules/imports/data/imports';
import { ImportStatusTag } from '@/app/domains/admin/modules/imports/ui/tags';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type TypeOption = {
  label: string;
  type: ImportType | null;
};

type StatusOption = {
  label: string;
  status: ImportStatus | null;
};

type SortOption = {
  label: string;
  compare: (a: Import, b: Import) => number;
};

const TYPE_OPTIONS: TypeOption[] = [
  {
    label: 'All types',
    type: null,
  },
  ...Object.values(IMPORT_TEMPLATES).map(({ label, type }) => ({
    label,
    type,
  })),
];

const STATUS_OPTIONS: StatusOption[] = [
  {
    label: 'Any status',
    status: null,
  },
  {
    label: 'Completed',
    status: 'completed',
  },
  {
    label: 'Partial',
    status: 'partial',
  },
  {
    label: 'Failed',
    status: 'failed',
  },
  {
    label: 'Running',
    status: 'running',
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Newest first',
    compare: (a, b) => b.startedAt.localeCompare(a.startedAt),
  },
  {
    label: 'Oldest first',
    compare: (a, b) => a.startedAt.localeCompare(b.startedAt),
  },
  {
    label: 'Most rows',
    compare: (a, b) => b.rows - a.rows,
  },
];

@Component({
  selector: 'imports',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    DatePipe,
    DecimalPipe,
    FormsModule,
    ImportStatusTag,
    MatButton,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatPrefix,
    MatSuffix,
    MatTableModule,
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Imports</div>
          <div class="text-neutral-a11 sm:text-lg">
            Bring customers, orders and invoices in from spreadsheet files.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <a
            matButton
            class="primary max-sm:icon-only"
            routerLink="new"
          >
            <mat-icon svgIcon="plus" />
            New import
          </a>
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Search & Sort -->
        <div class="flex items-center gap-x-2">
          <!-- Search -->
          <mat-form-field class="w-full max-w-72">
            <mat-icon
              svgIcon="search"
              matIconPrefix
            />
            <input
              matInput
              placeholder="Search imports"
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
              id="imports-sort"
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
                  aria-labelledby="imports-sort"
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

        <!-- Filters -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
        >
          <!-- Type filter -->
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [value]="[type()]"
              (valueChange)="type.set($event[0] ?? type())"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="imports-type-filter"
              >
                <span class="font-medium">
                  Type:
                  <span class="font-normal">{{ type().label }}</span>
                </span>
                <mat-icon
                  svgIcon="chevron-down"
                  iconPositionEnd
                />
              </button>
              <ng-template
                buiComboboxPortal
                matchWidth="false"
              >
                <div
                  buiComboboxContent
                  class="min-w-40"
                >
                  <div
                    buiComboboxListbox
                    aria-labelledby="imports-type-filter"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of typeOptions; track option.label) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.label"
                      >
                        <span class="flex-auto truncate">{{
                          option.label
                        }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Status filter -->
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [value]="[status()]"
              (valueChange)="status.set($event[0] ?? status())"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="imports-status-filter"
              >
                <span class="font-medium">
                  Status:
                  <span class="font-normal">{{ status().label }}</span>
                </span>
                <mat-icon
                  svgIcon="chevron-down"
                  iconPositionEnd
                />
              </button>
              <ng-template
                buiComboboxPortal
                matchWidth="false"
              >
                <div
                  buiComboboxContent
                  class="min-w-40"
                >
                  <div
                    buiComboboxListbox
                    aria-labelledby="imports-status-filter"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of statusOptions; track option.label) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.label"
                      >
                        <span class="flex-auto truncate">{{
                          option.label
                        }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          @if (type() !== typeOptions[0] || status() !== statusOptions[0]) {
            <button
              matButton
              class="tertiary tiny"
              (click)="clearFilters()"
            >
              Clear all
            </button>
          }
        </div>

        <!-- Table -->
        <div class="flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="whitespace-nowrap"
              mat-table
              [dataSource]="results()"
              [trackBy]="trackBy"
            >
              <!-- File column -->
              <ng-container matColumnDef="file">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  File
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2.5 py-1.5">
                    <div
                      class="flex size-7 shrink-0 items-center justify-center rounded-md bg-jade-a3 text-jade-a11"
                    >
                      <mat-icon
                        class="size-4"
                        svgIcon="file-spreadsheet"
                      />
                    </div>
                    <div class="font-medium">{{ row.fileName }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Type column -->
              <ng-container matColumnDef="type">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Type
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ template(row).label }}
                </td>
              </ng-container>

              <!-- Rows column -->
              <ng-container matColumnDef="rows">
                <th
                  class="w-20 text-end"
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Rows
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.rows | number }}
                </td>
              </ng-container>

              <!-- Status column -->
              <ng-container matColumnDef="status">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Status
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <import-status-tag [status]="row.status" />
                </td>
              </ng-container>

              <!-- Started by column -->
              <ng-container matColumnDef="startedBy">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Started by
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  @if (membersService.byId(row.startedById); as member) {
                    <div class="flex items-center gap-x-2">
                      <img
                        class="shrink-0 rounded-full object-cover"
                        width="24"
                        height="24"
                        [ngSrc]="member.photo"
                        [alt]="member.name"
                      />
                      {{ member.name }}
                    </div>
                  }
                </td>
              </ng-container>

              <!-- Date column -->
              <ng-container matColumnDef="startedAt">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                >
                  Date
                </th>
                <td
                  class="tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.startedAt | date: 'MMM d, h:mm a' }}
                </td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th
                  class="w-12"
                  mat-header-cell
                  *matHeaderCellDef
                ></th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <button
                    matIconButton
                    class="tiny mx-auto"
                    [matMenuTriggerFor]="importMenu"
                    [matMenuTriggerData]="{ item: row }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </td>
              </ng-container>

              <ng-template matNoDataRow>
                <tr>
                  <td [attr.colspan]="columnIds.length">
                    <div
                      class="flex flex-col items-center justify-center gap-y-2 py-10"
                    >
                      <mat-icon
                        class="size-10"
                        svgIcon="file-up"
                      />
                      <div class="text-center text-neutral-a11">
                        No imports match this view.
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-template>

              <!-- Header row definition -->
              <tr
                mat-header-row
                *matHeaderRowDef="columnIds"
              ></tr>

              <!-- Row definition -->
              <tr
                class="cursor-pointer hover:bg-neutral-a2"
                mat-row
                *matRowDef="let row; columns: columnIds"
                [routerLink]="row.id"
              ></tr>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Import menu -->
    <mat-menu
      xPosition="before"
      #importMenu="matMenu"
    >
      <ng-template
        matMenuContent
        let-item="item"
      >
        <button
          mat-menu-item
          [routerLink]="item.id"
        >
          <mat-icon svgIcon="eye" />
          View result
        </button>
        @if (item.errors.length) {
          <button mat-menu-item>
            <mat-icon svgIcon="download" />
            Download error report
          </button>
        }
        <mat-divider />
        <button
          mat-menu-item
          class="text-red-a11 hover:bg-red-a3"
          (click)="importsService.remove(item.id)"
        >
          <mat-icon
            class="text-red-a11"
            svgIcon="trash"
          />
          Remove
        </button>
      </ng-template>
    </mat-menu>
  `,
})
export default class Imports {
  // Dependencies
  private importsService = inject(ImportsService);
  private membersService = inject(MembersService);

  // State
  private typeOptions = TYPE_OPTIONS;
  private statusOptions = STATUS_OPTIONS;
  private sortOptions = SORT_OPTIONS;
  private columnIds = [
    'file',
    'type',
    'rows',
    'status',
    'startedBy',
    'startedAt',
    'actions',
  ];
  private search = signal('');
  private type = signal(TYPE_OPTIONS[0]);
  private status = signal(STATUS_OPTIONS[0]);
  private sort = signal(SORT_OPTIONS[0]);

  // Computed state
  private results = computed(() => {
    const search = this.search().trim().toLowerCase();
    const type = this.type().type;
    const status = this.status().status;

    return this.importsService
      .imports()
      .filter(
        (item) =>
          (!search || item.fileName.toLowerCase().includes(search)) &&
          (!type || item.type === type) &&
          (!status || item.status === status)
      )
      .sort(this.sort().compare);
  });

  private template(item: Import) {
    return IMPORT_TEMPLATES[item.type];
  }

  private clearFilters() {
    this.type.set(TYPE_OPTIONS[0]);
    this.status.set(STATUS_OPTIONS[0]);
  }

  private trackBy(_: number, item: Import) {
    return item.id;
  }
}
