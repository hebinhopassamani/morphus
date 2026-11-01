import {
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
  NgOptimizedImage,
} from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { formatDuration } from 'date-fns';
import { FileSizePipe } from '@/app/domains/admin/modules/files/ui/file-size';
import {
  DUPLICATE_OPTIONS,
  Import,
  IMPORT_TEMPLATES,
  ImportsService,
} from '@/app/domains/admin/modules/imports/data/imports';
import { ImportStatusTag } from '@/app/domains/admin/modules/imports/ui/tags';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';

@Component({
  selector: 'import',
  imports: [
    DatePipe,
    DecimalPipe,
    FileSizePipe,
    I18nPluralPipe,
    ImportStatusTag,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatIcon,
    MatProgressBar,
    MatTableModule,
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    @if (item(); as item) {
      @let template = templates[item.type];

      <div
        class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
      >
        <!-- Back link -->
        <a
          matButton
          class="link -mb-2 self-start"
          routerLink="/imports"
        >
          <mat-icon svgIcon="chevron-left" />
          Imports
        </a>

        <!-- Header -->
        <div class="flex flex-col gap-y-5">
          <div class="flex items-start gap-x-3">
            <div class="flex min-w-0 flex-col gap-y-1">
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <div class="text-3xl font-semibold tracking-tighter break-all">
                  {{ item.fileName }}
                </div>
                <import-status-tag [status]="item.status" />
              </div>
            </div>

            <!-- Spacer -->
            <div class="flex-auto"></div>

            <!-- Actions -->
            @if (item.errors.length) {
              <div class="flex shrink-0 items-center gap-x-2">
                <button
                  matButton
                  class="small max-sm:icon-only"
                >
                  <mat-icon svgIcon="download" />
                  Download error report
                </button>
              </div>
            }
          </div>

          <!-- Meta -->
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-2 text-neutral-a11"
          >
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="calendar"
              />
              Started {{ item.startedAt | date: 'MMM d, y, h:mm a' }}
            </div>
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                [svgIcon]="template.icon"
              />
              {{ template.label }}
            </div>
            <div class="flex items-center gap-x-1.5">
              <mat-icon
                class="size-4"
                svgIcon="rows-3"
              />
              {{ item.rows | i18nPlural: rowPlural }}
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <!-- Main column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
            @if (item.status === 'running') {
              <!-- Progress -->
              <mat-card
                appearance="filled"
                class="flex flex-col"
              >
                <mat-card-header>
                  <div class="flex flex-auto items-center gap-x-2">
                    <mat-icon
                      class="size-4"
                      svgIcon="loader-circle"
                    />
                    <div class="font-medium tracking-tight">In progress</div>
                  </div>
                </mat-card-header>
                <mat-card-content class="flex flex-col gap-y-3">
                  <div class="text-neutral-a11">
                    Processing {{ item.rows | number }} rows. Results appear
                    here when the import finishes.
                  </div>
                  <mat-progress-bar
                    aria-label="Import progress"
                    mode="indeterminate"
                  />
                </mat-card-content>
              </mat-card>
            } @else {
              <!-- Summary -->
              <mat-card
                appearance="filled"
                class="@container"
              >
                <div
                  class="grid grid-cols-2 gap-1 @3xl:auto-cols-fr @3xl:grid-flow-col @3xl:grid-cols-none"
                >
                  @for (stat of stats(item); track stat.label) {
                    <mat-card-content class="flex min-w-0 flex-col">
                      <div class="truncate text-neutral-a11">
                        {{ stat.label }}
                      </div>
                      <div class="mt-1 text-2xl font-semibold tabular-nums">
                        {{ stat.value | number }}
                      </div>
                      <div class="mt-2 truncate text-sm text-neutral-a11">
                        {{ stat.caption }}
                      </div>
                    </mat-card-content>
                  }
                </div>
              </mat-card>

              <!-- Errors -->
              <mat-card
                appearance="filled"
                class="flex flex-col"
              >
                <mat-card-header>
                  <div class="flex flex-auto items-center gap-x-2">
                    <mat-icon
                      class="size-4"
                      svgIcon="circle-alert"
                    />
                    <div class="font-medium tracking-tight">Errors</div>
                    <div class="ms-auto text-sm text-neutral-a11 tabular-nums">
                      {{ item.errors.length | i18nPlural: errorPlural }}
                    </div>
                  </div>
                </mat-card-header>
                @if (item.errors.length) {
                  <mat-card-content class="flex flex-col p-0">
                    <div class="flex flex-col">
                      <div
                        class="relative isolate overflow-x-visible overflow-y-hidden"
                      >
                        <table
                          class="-mt-px whitespace-nowrap [--table-cell-padding-x:calc(var(--spacing)*3)]"
                          mat-table
                          [dataSource]="item.errors"
                        >
                          <!-- Row column -->
                          <ng-container matColumnDef="row">
                            <th
                              class="w-16"
                              mat-header-cell
                              *matHeaderCellDef
                            >
                              Row
                            </th>
                            <td
                              class="text-neutral-a11 tabular-nums"
                              mat-cell
                              *matCellDef="let row"
                            >
                              {{ row.row }}
                            </td>
                          </ng-container>

                          <!-- Field column -->
                          <ng-container matColumnDef="field">
                            <th
                              mat-header-cell
                              *matHeaderCellDef
                            >
                              Field
                            </th>
                            <td
                              mat-cell
                              *matCellDef="let row"
                            >
                              {{ row.field }}
                            </td>
                          </ng-container>

                          <!-- Value column -->
                          <ng-container matColumnDef="value">
                            <th
                              mat-header-cell
                              *matHeaderCellDef
                            >
                              Value
                            </th>
                            <td
                              class="font-mono text-sm"
                              mat-cell
                              *matCellDef="let row"
                            >
                              @if (row.value) {
                                {{ row.value }}
                              } @else {
                                <span class="text-neutral-a8">—</span>
                              }
                            </td>
                          </ng-container>

                          <!-- Reason column -->
                          <ng-container matColumnDef="reason">
                            <th
                              mat-header-cell
                              *matHeaderCellDef
                            >
                              Reason
                            </th>
                            <td
                              class="text-red-a11"
                              mat-cell
                              *matCellDef="let row"
                            >
                              {{ row.reason }}
                            </td>
                          </ng-container>

                          <!-- Header row definition -->
                          <tr
                            mat-header-row
                            *matHeaderRowDef="errorColumns"
                          ></tr>

                          <!-- Row definition -->
                          <tr
                            mat-row
                            *matRowDef="let row; columns: errorColumns"
                          ></tr>
                        </table>
                      </div>
                    </div>
                  </mat-card-content>
                } @else {
                  <mat-card-content
                    class="flex flex-col items-center justify-center gap-y-2 py-10"
                  >
                    <mat-icon
                      class="size-10"
                      svgIcon="circle-check"
                    />
                    <div class="text-center text-neutral-a11">
                      Every row was processed without errors.
                    </div>
                  </mat-card-content>
                }
              </mat-card>
            }
          </div>

          <!-- Side column -->
          <div class="flex min-w-0 flex-col gap-4 sm:gap-6">
            <!-- Details -->
            <mat-card
              appearance="filled"
              class="@container flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="info"
                  />
                  <div class="font-medium tracking-tight">Details</div>
                </div>
              </mat-card-header>
              <mat-card-content
                class="grid grid-cols-1 items-center gap-x-4 gap-y-3 @xs:grid-cols-[6rem_1fr]"
              >
                <div class="text-neutral-a11">File</div>
                <div class="truncate">{{ item.fileName }}</div>

                <div class="text-neutral-a11">Size</div>
                <div class="tabular-nums">{{ item.size | fileSize }}</div>

                <div class="text-neutral-a11">Type</div>
                <div>{{ template.label }}</div>

                <div class="text-neutral-a11">Started by</div>
                <div>
                  @if (membersService.byId(item.startedById); as member) {
                    <div class="flex items-center gap-x-2">
                      <img
                        class="shrink-0 rounded-full object-cover"
                        width="24"
                        height="24"
                        [ngSrc]="member.photo"
                        [alt]="member.name"
                      />
                      <a
                        class="truncate hover:underline"
                        [routerLink]="['/members', member.id]"
                      >
                        {{ member.name }}
                      </a>
                    </div>
                  }
                </div>

                <div class="text-neutral-a11">Started at</div>
                <div class="tabular-nums">
                  {{ item.startedAt | date: 'MMM d, y, h:mm a' }}
                </div>

                <div class="text-neutral-a11">Duration</div>
                <div class="tabular-nums">
                  @if (item.duration; as duration) {
                    {{ formatDuration(duration) }}
                  } @else {
                    <span class="text-neutral-a8">—</span>
                  }
                </div>

                <div class="text-neutral-a11">Duplicates</div>
                <div>{{ duplicateLabel(item) }}</div>
              </mat-card-content>
            </mat-card>

            <!-- Column mapping -->
            <mat-card
              appearance="filled"
              class="flex flex-col"
            >
              <mat-card-header>
                <div class="flex flex-auto items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    svgIcon="columns-3"
                  />
                  <div class="font-medium tracking-tight">Column mapping</div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-col gap-y-2.5">
                @for (column of item.mapping; track column.source) {
                  <div class="flex items-center gap-x-2">
                    <div class="min-w-0 flex-1 truncate">
                      {{ column.source }}
                    </div>
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a10"
                      svgIcon="arrow-right"
                    />
                    <div class="min-w-0 flex-1 truncate">
                      @if (column.target) {
                        {{ fieldLabel(item, column.target) }}
                      } @else {
                        <span class="text-neutral-a8">Not imported</span>
                      }
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    }
  `,
})
export default class ImportResult {
  // Dependencies
  private importsService = inject(ImportsService);
  private membersService = inject(MembersService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private rowPlural = { '=1': '# row', other: '# rows' };
  private errorPlural = { '=0': 'None', '=1': '# error', other: '# errors' };
  private errorColumns = ['row', 'field', 'value', 'reason'];
  private templates = IMPORT_TEMPLATES;

  // Computed state
  private item = computed(() => this.importsService.byId(this.id()));

  constructor() {
    effect(() => {
      if (!this.item()) {
        this.router.navigate(['/imports']);
      }
    });
  }

  private stats(item: Import) {
    return [
      {
        label: 'Imported',
        value: item.imported,
        caption: 'New records',
      },
      {
        label: 'Updated',
        value: item.updated,
        caption: 'Existing records changed',
      },
      {
        label: 'Skipped',
        value: item.skipped,
        caption: 'Duplicates left as is',
      },
      ...(item.failed
        ? [
            {
              label: 'Failed',
              value: item.failed,
              caption: 'Rows with errors',
            },
          ]
        : []),
    ];
  }

  private duplicateLabel(item: Import) {
    return DUPLICATE_OPTIONS.find((option) => option.id === item.duplicates)
      ?.label;
  }

  private fieldLabel(item: Import, id: string) {
    return IMPORT_TEMPLATES[item.type].fields.find((field) => field.id === id)
      ?.label;
  }

  private formatDuration(seconds: number) {
    return formatDuration({
      minutes: Math.floor(seconds / 60),
      seconds: seconds % 60,
    });
  }
}
