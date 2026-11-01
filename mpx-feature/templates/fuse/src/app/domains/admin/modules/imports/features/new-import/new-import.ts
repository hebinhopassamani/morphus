import { DecimalPipe, I18nPluralPipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { FileSizePipe } from '@/app/domains/admin/modules/files/ui/file-size';
import {
  DUPLICATE_OPTIONS,
  DuplicateHandling,
  IMPORT_REASONS,
  IMPORT_TEMPLATES,
  Import,
  ImportsService,
  ImportType,
} from '@/app/domains/admin/modules/imports/data/imports';

type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    title: 'Type',
    description: 'Choose what the file holds.',
  },
  {
    title: 'Upload',
    description: 'Add a CSV or Excel file.',
  },
  {
    title: 'Map columns',
    description: 'Match columns to fields.',
  },
  {
    title: 'Review',
    description: 'Check rows before importing.',
  },
  {
    title: 'Done',
    description: 'Follow progress and results.',
  },
];

@Component({
  selector: 'new-import',
  imports: [
    DecimalPipe,
    FileSizePipe,
    I18nPluralPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatIcon,
    MatOption,
    MatProgressBar,
    MatRadioButton,
    MatRadioGroup,
    MatSelect,
    MatTableModule,
    RouterLink,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">New import</div>
          <div class="text-neutral-a11 sm:text-lg">
            Bring records in from a spreadsheet in a few steps.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <a
            matButton
            class="max-sm:icon-only"
            routerLink="/imports"
          >
            <mat-icon svgIcon="x" />
            Cancel
          </a>
        </div>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
        <!-- Steps -->
        <nav
          class="hidden w-64 shrink-0 lg:block"
          aria-label="Import steps"
        >
          <ol class="flex flex-col">
            @for (
              item of steps;
              track item.title;
              let index = $index, last = $last
            ) {
              <li class="flex">
                <button
                  class="flex flex-auto cursor-pointer gap-x-4 text-start disabled:cursor-default"
                  [attr.aria-current]="step() === index ? 'step' : null"
                  [disabled]="index >= step() || step() === steps.length - 1"
                  (click)="step.set(index)"
                >
                  <!-- Rail -->
                  <div class="flex flex-col items-center">
                    @if (index < step()) {
                      <div
                        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-contrast"
                      >
                        <mat-icon
                          class="size-4 text-primary-contrast"
                          svgIcon="check"
                        />
                      </div>
                    } @else if (index === step()) {
                      <div
                        class="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-medium text-primary"
                      >
                        {{ index + 1 }}
                      </div>
                    } @else {
                      <div
                        class="flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium text-neutral-a10"
                      >
                        {{ index + 1 }}
                      </div>
                    }
                    @if (!last) {
                      <div
                        class="my-2 w-0.5 flex-auto rounded-full"
                        [class.bg-primary]="step() > index"
                        [class.bg-neutral-a4]="step() <= index"
                      ></div>
                    }
                  </div>
                  <div
                    class="pt-1"
                    [class.pb-6]="!last"
                  >
                    <div
                      class="font-medium"
                      [class.text-neutral-a10]="step() < index"
                    >
                      {{ item.title }}
                    </div>
                    <div class="text-pretty text-neutral-a11">
                      {{ item.description }}
                    </div>
                  </div>
                </button>
              </li>
            }
          </ol>
        </nav>

        <div class="flex min-w-0 flex-auto flex-col gap-y-6">
          <!-- Progress -->
          <div class="flex flex-col gap-y-2 lg:hidden">
            <div class="flex items-center gap-x-2">
              <div class="text-sm text-neutral-a11 tabular-nums">
                Step {{ step() + 1 }} of {{ steps.length }}
              </div>
              <div class="font-medium">{{ steps[step()].title }}</div>
            </div>
            <div class="flex items-center gap-x-1.5">
              @for (item of steps; track item.title; let index = $index) {
                <div
                  class="h-1 flex-auto rounded-full"
                  [class.bg-primary]="step() >= index"
                  [class.bg-neutral-a4]="step() < index"
                ></div>
              }
            </div>
          </div>

          @if (step() === 0) {
            <!-- Type -->
            <div class="flex flex-col gap-y-1">
              <div class="text-xl font-semibold tracking-tight">
                What are you importing?
              </div>
              <div class="text-pretty text-neutral-a11">
                Each type comes with a sample file that shows the expected
                columns.
              </div>
            </div>

            <mat-radio-group
              class="flex-col gap-3"
              aria-label="Import type"
              [value]="type()"
              (change)="type.set($event.value)"
            >
              @for (option of templates; track option.type) {
                <div
                  class="flex flex-col gap-y-3 rounded-lg border p-4 has-checked:border-primary-a6 has-checked:bg-primary-a3"
                >
                  <div class="flex items-center gap-x-3">
                    <mat-radio-button
                      class="min-w-0 flex-auto"
                      [value]="option.type"
                    >
                      <div class="flex flex-col">
                        <div class="font-medium">{{ option.label }}</div>
                        <div class="text-sm text-neutral-a11">
                          {{ option.description }}
                        </div>
                      </div>
                    </mat-radio-button>
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-a3 text-neutral-a11"
                    >
                      <mat-icon
                        class="size-4"
                        [svgIcon]="option.icon"
                      />
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-1.5 ps-6">
                    @for (field of option.fields; track field.id) {
                      <div
                        class="inline-flex items-center rounded-md border border-neutral-a5 px-1.5 py-0.5 text-sm text-neutral-a11"
                      >
                        {{ field.label }}
                      </div>
                    }
                  </div>
                  <button
                    matButton
                    class="link ms-6 self-start"
                  >
                    <mat-icon svgIcon="download" />
                    Download sample file
                  </button>
                </div>
              }
            </mat-radio-group>
          } @else if (template(); as template) {
            @switch (step()) {
              @case (1) {
                <!-- Upload -->
                <div class="flex flex-col gap-y-1">
                  <div class="text-xl font-semibold tracking-tight">
                    Upload your file
                  </div>
                  <div class="text-pretty text-neutral-a11">
                    CSV and Excel files up to 10 MB. The first row should hold
                    the column names.
                  </div>
                </div>

                @if (uploaded()) {
                  <div
                    class="flex items-center gap-x-3 rounded-lg border border-neutral-a4 p-3"
                  >
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-md bg-jade-a3 text-jade-a11"
                    >
                      <mat-icon
                        class="size-4"
                        svgIcon="file-spreadsheet"
                      />
                    </div>
                    <div class="flex min-w-0 flex-auto flex-col">
                      <div class="truncate font-medium">
                        {{ template.fileName }}
                      </div>
                      <div class="text-sm text-neutral-a11 tabular-nums">
                        {{ template.size | fileSize }} ·
                        {{ template.rows | i18nPlural: rowPlural }}
                      </div>
                    </div>
                    <button
                      matButton
                      class="small"
                      (click)="uploaded.set(false)"
                    >
                      Remove
                    </button>
                  </div>
                } @else {
                  <div
                    class="flex flex-col items-center justify-center gap-y-3 rounded-lg border border-dashed border-neutral-a6 px-6 py-12 text-center"
                  >
                    <mat-icon
                      class="size-10 text-neutral-a10"
                      svgIcon="cloud-upload"
                    />
                    <div class="flex flex-col gap-y-0.5">
                      <div class="font-medium">Drop your file here</div>
                      <div class="text-sm text-neutral-a11">
                        or pick one from your computer
                      </div>
                    </div>
                    <button
                      matButton
                      (click)="uploaded.set(true)"
                    >
                      <mat-icon svgIcon="folder-open" />
                      Browse
                    </button>
                  </div>
                }
              }
              @case (2) {
                <!-- Map columns -->
                <div class="flex flex-col gap-y-1">
                  <div class="text-xl font-semibold tracking-tight">
                    Map columns
                  </div>
                  <div class="text-pretty text-neutral-a11">
                    Match each column in your file to a field. Columns set to Do
                    not import are left out.
                  </div>
                </div>

                <div class="flex flex-col gap-y-3">
                  <div
                    class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
                  >
                    <div class="text-neutral-a11 tabular-nums">
                      {{ mappedCount() }} of {{ template.columns.length }}
                      columns mapped
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5">
                      @for (field of required(); track field.id) {
                        <div
                          class="inline-flex items-center gap-x-1 rounded-md border px-1.5 py-0.5 font-medium"
                          [class.border-neutral-a5]="field.mapped"
                          [class.text-neutral-a11]="field.mapped"
                          [class.border-amber-a4]="!field.mapped"
                          [class.bg-amber-a3]="!field.mapped"
                          [class.text-amber-a11]="!field.mapped"
                        >
                          <mat-icon
                            class="size-3.5"
                            [svgIcon]="field.mapped ? 'check' : 'circle-alert'"
                          />
                          {{ field.label }}
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Table -->
                  <div class="flex flex-col">
                    <div
                      class="relative isolate overflow-x-visible overflow-y-hidden"
                    >
                      <table
                        class="whitespace-nowrap"
                        mat-table
                        [dataSource]="template.columns"
                      >
                        <!-- Column column -->
                        <ng-container matColumnDef="column">
                          <th
                            mat-header-cell
                            *matHeaderCellDef
                          >
                            Column
                          </th>
                          <td
                            class="font-medium"
                            mat-cell
                            *matCellDef="let row"
                          >
                            {{ row.name }}
                          </td>
                        </ng-container>

                        <!-- Sample column -->
                        <ng-container matColumnDef="sample">
                          <th
                            mat-header-cell
                            *matHeaderCellDef
                          >
                            Sample
                          </th>
                          <td
                            class="text-neutral-a11"
                            mat-cell
                            *matCellDef="let row"
                          >
                            {{ row.sample }}
                          </td>
                        </ng-container>

                        <!-- Field column -->
                        <ng-container matColumnDef="field">
                          <th
                            class="w-64"
                            mat-header-cell
                            *matHeaderCellDef
                          >
                            Field
                          </th>
                          <td
                            class="py-1.5"
                            mat-cell
                            *matCellDef="let row"
                          >
                            <mat-form-field class="w-full">
                              <mat-select
                                placeholder="Do not import"
                                [aria-label]="row.name"
                                [value]="mapping()[row.name]"
                                (selectionChange)="
                                  setTarget(row.name, $event.value)
                                "
                              >
                                <mat-option [value]="null">
                                  Do not import
                                </mat-option>
                                @for (
                                  field of template.fields;
                                  track field.id
                                ) {
                                  <mat-option [value]="field.id">
                                    {{ field.label
                                    }}{{ field.required ? ' *' : '' }}
                                  </mat-option>
                                }
                              </mat-select>
                            </mat-form-field>
                          </td>
                        </ng-container>

                        <!-- Header row definition -->
                        <tr
                          mat-header-row
                          *matHeaderRowDef="mappingColumns"
                        ></tr>

                        <!-- Row definition -->
                        <tr
                          mat-row
                          *matRowDef="let row; columns: mappingColumns"
                        ></tr>
                      </table>
                    </div>
                  </div>
                </div>
              }
              @case (3) {
                <!-- Review -->
                <div class="flex flex-col gap-y-1">
                  <div class="text-xl font-semibold tracking-tight">
                    Review and import
                  </div>
                  <div class="text-pretty text-neutral-a11">
                    Check what happens to each row before the import starts.
                  </div>
                </div>

                <!-- Summary -->
                <mat-card
                  appearance="filled"
                  class="@container"
                >
                  <div class="grid grid-cols-2 gap-1 @3xl:grid-cols-3">
                    @for (stat of summary(); track stat.label) {
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

                <!-- Issues -->
                <div class="flex flex-col gap-y-3">
                  <div class="font-medium">Issues</div>
                  <div
                    class="flex flex-col divide-y divide-neutral-a4 rounded-lg border border-neutral-a4"
                  >
                    @for (issue of issues(); track issue.text) {
                      <div class="flex items-center gap-x-3 px-3 py-2.5">
                        <mat-icon
                          class="size-4 shrink-0"
                          [class.text-red-a11]="issue.error"
                          [class.text-amber-a11]="!issue.error"
                          [svgIcon]="
                            issue.error ? 'circle-alert' : 'triangle-alert'
                          "
                        />
                        <div class="flex min-w-0 flex-auto flex-col">
                          <div class="truncate">{{ issue.text }}</div>
                          <div class="truncate text-sm text-neutral-a11">
                            {{ issue.detail }}
                          </div>
                        </div>
                        <div
                          class="shrink-0 text-sm text-neutral-a11 tabular-nums"
                        >
                          {{ issue.count | i18nPlural: rowPlural }}
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Duplicates -->
                <div class="flex flex-col gap-y-3">
                  <div class="flex flex-col gap-y-0.5">
                    <div class="font-medium">Duplicates</div>
                    <div class="text-sm text-neutral-a11">
                      {{ template.matches | i18nPlural: rowPlural }} match
                      existing {{ template.label.toLowerCase() }} by
                      {{ template.match }}.
                    </div>
                  </div>
                  <mat-radio-group
                    class="flex-col gap-2"
                    aria-label="Duplicate handling"
                    [value]="duplicates()"
                    (change)="duplicates.set($event.value)"
                  >
                    @for (option of duplicateOptions; track option.id) {
                      <mat-radio-button [value]="option.id">
                        <div class="flex flex-col">
                          <div class="font-medium">{{ option.label }}</div>
                          <div class="text-sm text-neutral-a11">
                            {{ option.description }}
                          </div>
                        </div>
                      </mat-radio-button>
                    }
                  </mat-radio-group>
                </div>
              }
              @default {
                <!-- Done -->
                @if (result(); as result) {
                  <div class="flex flex-col gap-y-1">
                    <div class="text-xl font-semibold tracking-tight">
                      Import finished
                    </div>
                    <div class="text-pretty text-neutral-a11">
                      {{ result.fileName }} was processed. Rows with errors are
                      listed on the result page.
                    </div>
                  </div>

                  <mat-card
                    appearance="filled"
                    class="@container"
                  >
                    <div class="grid grid-cols-2 gap-1 @3xl:grid-cols-4">
                      @for (stat of resultStats(result); track stat.label) {
                        <mat-card-content class="flex min-w-0 flex-col">
                          <div class="truncate text-neutral-a11">
                            {{ stat.label }}
                          </div>
                          <div class="mt-1 text-2xl font-semibold tabular-nums">
                            {{ stat.value | number }}
                          </div>
                        </mat-card-content>
                      }
                    </div>
                  </mat-card>

                  <div class="flex items-center gap-x-3">
                    <a
                      matButton
                      class="primary"
                      [routerLink]="['/imports', result.id]"
                    >
                      View result
                    </a>
                    <a
                      matButton
                      routerLink="/imports"
                    >
                      Back to imports
                    </a>
                  </div>
                } @else {
                  <div class="flex flex-col gap-y-1">
                    <div class="text-xl font-semibold tracking-tight">
                      Importing {{ template.label.toLowerCase() }}
                    </div>
                    <div class="text-pretty text-neutral-a11">
                      Processing {{ template.rows | number }} rows from
                      {{ template.fileName }}.
                    </div>
                  </div>

                  <div class="flex items-center gap-x-3">
                    <mat-progress-bar
                      aria-label="Import progress"
                      [value]="progress()"
                    />
                    <div
                      class="w-10 shrink-0 text-end text-sm text-neutral-a11 tabular-nums"
                    >
                      {{ progress() }}%
                    </div>
                  </div>
                }
              }
            }
          }

          <!-- Footer -->
          @if (step() < steps.length - 1) {
            <div
              class="flex items-center gap-x-3 border-t border-neutral-a4 pt-6"
            >
              @if (step()) {
                <button
                  matButton
                  (click)="step.set(step() - 1)"
                >
                  <mat-icon svgIcon="move-left" />
                  Back
                </button>
              }
              <div class="flex-auto"></div>
              @if (step() === steps.length - 2) {
                <button
                  matButton
                  class="primary"
                  (click)="start()"
                >
                  Start import
                </button>
              } @else {
                <button
                  matButton
                  class="primary"
                  [disabled]="!valid()"
                  (click)="step.set(step() + 1)"
                >
                  Continue
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export default class NewImport {
  // Dependencies
  private importsService = inject(ImportsService);

  // State
  private steps = STEPS;
  private templates = Object.values(IMPORT_TEMPLATES);
  private duplicateOptions = DUPLICATE_OPTIONS;
  private rowPlural = { '=1': '# row', other: '# rows' };
  private mappingColumns = ['column', 'sample', 'field'];
  private step = signal(0);
  private type = signal<ImportType | null>(null);
  private uploaded = linkedSignal({
    source: this.type,
    computation: () => false,
  });
  private duplicates = signal<DuplicateHandling>('skip');
  private progress = signal(0);
  private importId = signal<string | null>(null);

  // Computed state
  private template = computed(() => {
    const type = this.type();
    return type && IMPORT_TEMPLATES[type];
  });
  private mapping = linkedSignal<Record<string, string | null>>(() =>
    Object.fromEntries(
      (this.template()?.columns ?? []).map((column) => [
        column.name,
        column.matched ? column.target : null,
      ])
    )
  );
  private mappedCount = computed(
    () => Object.values(this.mapping()).filter(Boolean).length
  );
  private required = computed(() =>
    (this.template()?.fields ?? [])
      .filter((field) => field.required)
      .map((field) => ({
        ...field,
        mapped: Object.values(this.mapping()).includes(field.id),
      }))
  );
  private issues = computed(() => {
    const template = this.template();

    return template
      ? [
          ...Object.entries(template.errors).map(([key, count]) => ({
            error: true,
            text: IMPORT_REASONS[template.type][key].reason,
            detail: `${IMPORT_REASONS[template.type][key].field}, rows will be skipped`,
            count,
          })),
          ...template.warnings.map((warning) => ({
            error: false,
            text: warning.text,
            detail: 'Rows are imported with changes',
            count: warning.count,
          })),
        ]
      : [];
  });
  private summary = computed(() => {
    const rows = this.template()?.rows ?? 0;
    const count = (error: boolean) =>
      this.issues()
        .filter((issue) => issue.error === error)
        .reduce((total, issue) => total + issue.count, 0);

    return [
      {
        label: 'Ready',
        value: rows - count(true),
        caption: 'Rows to import',
      },
      {
        label: 'With warnings',
        value: count(false),
        caption: 'Imported with changes',
      },
      {
        label: 'With errors',
        value: count(true),
        caption: 'Rows to be skipped',
      },
    ];
  });
  private valid = computed(() => {
    switch (this.step()) {
      case 0:
        return !!this.type();
      case 1:
        return this.uploaded();
      case 2:
        return this.required().every((field) => field.mapped);
      default:
        return true;
    }
  });
  private result = computed(() => {
    const id = this.importId();
    return id && this.importsService.byId(id);
  });

  private resultStats(item: Import) {
    return [
      {
        label: 'Imported',
        value: item.imported,
      },
      {
        label: 'Updated',
        value: item.updated,
      },
      {
        label: 'Skipped',
        value: item.skipped,
      },
      {
        label: 'Failed',
        value: item.failed,
      },
    ];
  }

  private setTarget(column: string, target: string | null) {
    this.mapping.update((mapping) => ({ ...mapping, [column]: target }));
  }

  private start() {
    const mapping = Object.entries(this.mapping()).map(([source, target]) => ({
      source,
      target,
    }));

    this.step.set(STEPS.length - 1);

    const timer = setInterval(() => {
      this.progress.update((progress) => progress + 5);

      if (this.progress() === 100) {
        clearInterval(timer);
        this.importId.set(
          this.importsService.start(
            this.template()!,
            this.duplicates(),
            mapping
          )
        );
      }
    }, 150);
  }
}
