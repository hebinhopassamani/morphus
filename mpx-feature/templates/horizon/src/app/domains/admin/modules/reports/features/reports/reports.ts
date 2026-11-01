import { DecimalPipe, formatNumber, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  differenceInSeconds,
  formatDistanceToNowStrict,
  getISODay,
} from 'date-fns';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexOptions,
  ApexTooltip,
  ChartComponent,
} from 'ng-apexcharts';
import { Theming } from '@/app/core/theming';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import {
  AgentReport,
  RATINGS,
  ReportRange,
  ReportsService,
  RESPONSE_TARGET,
} from '@/app/domains/admin/modules/reports/data/reports';
import { ChartResize } from '@/app/domains/admin/ui/chart-resize';

type Metric = 'created' | 'resolved' | 'firstResponse' | 'resolution';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

@Component({
  selector: 'reports',
  imports: [
    ChartComponent,
    ChartResize,
    DecimalPipe,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatSort,
    MatSortHeader,
    MatTableModule,
    NgOptimizedImage,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl min-w-0 flex-auto flex-col gap-y-5 p-5"
    >
      <!-- Header -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="me-auto text-3xl font-semibold tracking-tighter">
          Reports
        </div>

        <!-- Range -->
        <mat-button-toggle-group
          class="segmented"
          name="range"
          [value]="range()"
          (valueChange)="range.set($event)"
        >
          <mat-button-toggle [value]="7">7 days</mat-button-toggle>
          <mat-button-toggle [value]="30">30 days</mat-button-toggle>
          <mat-button-toggle [value]="90">90 days</mat-button-toggle>
        </mat-button-toggle-group>

        <!-- Export -->
        <button
          matButton
          class="primary max-sm:icon-only"
        >
          <mat-icon svgIcon="download" />
          Export
        </button>
      </div>

      <mat-divider />

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        @for (stat of stats(); track stat.id) {
          <button
            class="flex min-w-0 flex-col rounded-[calc(var(--theme-border-radius)*1.5)] border p-4 text-start"
            type="button"
            [class]="
              metric() === stat.id
                ? 'mat-mdc-card'
                : 'border-transparent hover:bg-neutral-a3'
            "
            [attr.aria-pressed]="metric() === stat.id"
            (click)="metric.set(stat.id)"
          >
            <div class="flex min-w-0 flex-col">
              <div class="truncate text-neutral-a11">{{ stat.label }}</div>
              <div class="mt-1 text-4xl font-semibold tabular-nums">
                {{ stat.value }}
              </div>
              <div class="mt-2 flex items-center gap-x-1.5">
                <div
                  class="flex shrink-0 items-center gap-x-0.5 rounded px-1.5 py-0.5 text-xs font-medium tabular-nums"
                  [class.bg-green-a3]="stat.good"
                  [class.text-green-11]="stat.good"
                  [class.bg-red-a3]="!stat.good"
                  [class.text-red-11]="!stat.good"
                >
                  <mat-icon
                    class="size-3 text-current"
                    [svgIcon]="stat.up ? 'arrow-up' : 'arrow-down'"
                  />
                  {{ stat.change | number: '1.1-1' }}%
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  vs previous {{ range() }} days
                </div>
              </div>
            </div>
          </button>
        }
      </div>

      <!-- Metric -->
      <mat-card class="flex flex-col [--card-padding:--spacing(5)]">
        <mat-card-header
          class="-mx-(--card-padding) -mt-(--card-padding) items-center border-b p-(--card-padding)"
        >
          <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
            <div class="text-lg font-medium tracking-tight">
              {{ metricHeader().title }}
            </div>
            <div class="truncate text-sm text-neutral-a11">
              {{ metricHeader().subtitle }}
            </div>
          </div>
          <button
            class="small"
            matIconButton
            [matMenuTriggerFor]="metricMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
          <mat-menu
            class="min-w-40"
            #metricMenu="matMenu"
          >
            <button mat-menu-item>View details</button>
            <button mat-menu-item>Compare periods</button>
            <mat-divider />
            <button mat-menu-item>Export CSV</button>
            <button mat-menu-item>Export PNG</button>
          </mat-menu>
        </mat-card-header>
        <mat-card-content class="flex min-w-0 flex-auto flex-col p-0 pb-1">
          <apx-chart
            class="h-full min-h-64 w-full flex-auto"
            [annotations]="metricChartOptions.annotations()"
            [chart]="metricChartOptions.chart"
            [colors]="metricChartOptions.colors"
            [dataLabels]="metricChartOptions.dataLabels"
            [fill]="metricChartOptions.fill"
            [grid]="metricChartOptions.grid"
            [legend]="metricChartOptions.legend"
            [series]="metricChartOptions.series()"
            [states]="metricChartOptions.states"
            [stroke]="metricChartOptions.stroke"
            [tooltip]="metricChartOptions.tooltip()"
            [xaxis]="metricChartOptions.xaxis"
            [yaxis]="metricChartOptions.yaxis"
          ></apx-chart>
        </mat-card-content>
      </mat-card>

      <div class="@container">
        <div class="grid gap-5 @3xl:grid-cols-2">
          <!-- Busiest days -->
          <mat-card class="flex min-w-0 flex-col [--card-padding:--spacing(5)]">
            <mat-card-header
              class="-mx-(--card-padding) -mt-(--card-padding) items-center border-b p-(--card-padding)"
            >
              <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
                <div class="text-lg font-medium tracking-tight">
                  Busiest days
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  {{ weekdays().busiest.label }} sees the most new tickets
                </div>
              </div>
              <button
                class="small"
                matIconButton
                [matMenuTriggerFor]="busiestDaysMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #busiestDaysMenu="matMenu"
              >
                <button mat-menu-item>View by hour</button>
                <button mat-menu-item>View by week</button>
                <mat-divider />
                <button mat-menu-item>Export CSV</button>
              </mat-menu>
            </mat-card-header>
            <mat-card-content class="flex min-w-0 flex-auto flex-col p-0 pb-1">
              <apx-chart
                class="h-full min-h-56 w-full flex-auto"
                [chart]="weekdayChartOptions.chart"
                [colors]="weekdayChartOptions.colors"
                [dataLabels]="weekdayChartOptions.dataLabels()"
                [grid]="weekdayChartOptions.grid"
                [legend]="weekdayChartOptions.legend"
                [plotOptions]="weekdayChartOptions.plotOptions"
                [series]="weekdayChartOptions.series()"
                [states]="weekdayChartOptions.states"
                [tooltip]="weekdayChartOptions.tooltip()"
                [xaxis]="weekdayChartOptions.xaxis"
                [yaxis]="weekdayChartOptions.yaxis"
              ></apx-chart>
            </mat-card-content>
          </mat-card>

          <!-- Satisfaction -->
          <mat-card class="flex min-w-0 flex-col [--card-padding:--spacing(5)]">
            <mat-card-header
              class="-mx-(--card-padding) -mt-(--card-padding) items-center border-b p-(--card-padding)"
            >
              <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
                <div class="text-lg font-medium tracking-tight">
                  Satisfaction
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  From {{ report().rated | number }} rated tickets
                </div>
              </div>
              <button
                class="small"
                matIconButton
                [matMenuTriggerFor]="satisfactionMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #satisfactionMenu="matMenu"
              >
                <button mat-menu-item>View all ratings</button>
                <button mat-menu-item>Survey settings</button>
                <mat-divider />
                <button mat-menu-item>Export CSV</button>
              </mat-menu>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col">
              <div class="flex items-baseline gap-x-2">
                <div class="text-4xl font-semibold tabular-nums">
                  {{ report().satisfaction | number: '1.1-1' }}%
                </div>
                <div
                  class="flex shrink-0 items-center gap-x-0.5 rounded px-1.5 py-0.5 text-xs font-medium tabular-nums"
                  [class.bg-green-a3]="satisfactionChange().good"
                  [class.text-green-11]="satisfactionChange().good"
                  [class.bg-red-a3]="!satisfactionChange().good"
                  [class.text-red-11]="!satisfactionChange().good"
                >
                  <mat-icon
                    class="size-3 text-current"
                    [svgIcon]="
                      satisfactionChange().up ? 'arrow-up' : 'arrow-down'
                    "
                  />
                  {{ satisfactionChange().change | number: '1.1-1' }} pts
                </div>
              </div>
              <apx-chart
                class="mt-4 min-h-20 w-full flex-auto"
                [chart]="satisfactionChartOptions.chart"
                [colors]="satisfactionChartOptions.colors"
                [dataLabels]="satisfactionChartOptions.dataLabels"
                [fill]="satisfactionChartOptions.fill"
                [grid]="satisfactionChartOptions.grid"
                [legend]="satisfactionChartOptions.legend"
                [series]="satisfactionChartOptions.series()"
                [states]="satisfactionChartOptions.states"
                [stroke]="satisfactionChartOptions.stroke"
                [tooltip]="satisfactionChartOptions.tooltip()"
                [xaxis]="satisfactionChartOptions.xaxis"
                [yaxis]="satisfactionChartOptions.yaxis"
              ></apx-chart>

              <div class="mt-6 flex h-2 gap-x-1">
                @for (item of report().ratings; track item.id) {
                  <div
                    class="basis-0 rounded-full"
                    [class]="item.color"
                    [style.flex-grow]="item.value"
                  ></div>
                }
              </div>
              <div class="mt-4 flex flex-col gap-y-2">
                @for (item of report().ratings; track item.id) {
                  <div class="flex items-center gap-x-2">
                    <div
                      class="flex size-4 shrink-0 items-center justify-center"
                    >
                      <div
                        class="size-2 rounded-full"
                        [class]="item.color"
                      ></div>
                    </div>
                    <div class="flex-auto truncate">{{ item.label }}</div>
                    <div class="font-medium tabular-nums">
                      {{ item.value | number }}
                    </div>
                    <div class="w-12 text-end text-neutral-a11 tabular-nums">
                      {{ item.percentage | number: '1.0-0' }}%
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="@container">
        <div class="grid gap-5 @3xl:grid-cols-2">
          <!-- Breakdown -->
          <mat-card class="flex min-w-0 flex-col [--card-padding:--spacing(5)]">
            <mat-card-header
              class="-mx-(--card-padding) -mt-(--card-padding) items-center border-b p-(--card-padding)"
            >
              <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
                <div class="text-lg font-medium tracking-tight">Breakdown</div>
                <div class="truncate text-sm text-neutral-a11">
                  {{ report().created | number }} tickets by bucket, channel and
                  priority
                </div>
              </div>
              <button
                class="small"
                matIconButton
                [matMenuTriggerFor]="breakdownMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #breakdownMenu="matMenu"
              >
                <button mat-menu-item>View tickets</button>
                <mat-divider />
                <button mat-menu-item>Export CSV</button>
              </mat-menu>
            </mat-card-header>
            <mat-card-content class="flex flex-col gap-y-6">
              @for (group of breakdown(); track group.id) {
                <div class="flex flex-col gap-y-2">
                  <div class="flex items-center gap-x-2">
                    <div class="me-auto text-sm font-medium">
                      {{ group.label }}
                    </div>
                    <div class="text-sm text-neutral-a11">
                      {{ group.leader.label }}
                      {{ group.leader.percentage | number: '1.0-0' }}%
                    </div>
                  </div>
                  <div class="flex h-2 gap-x-1">
                    @for (item of group.items; track item.id) {
                      <div
                        class="basis-0 rounded-full"
                        [class]="item.color"
                        [style.flex-grow]="item.value"
                      ></div>
                    }
                  </div>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    @for (item of group.items; track item.id) {
                      <div class="flex items-center gap-x-1.5">
                        <div
                          class="size-2 rounded-full"
                          [class]="item.color"
                        ></div>
                        {{ item.label }}
                        <span class="text-neutral-a11 tabular-nums">
                          {{ item.value | number }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Recent feedback -->
          <mat-card class="flex min-w-0 flex-col [--card-padding:--spacing(5)]">
            <mat-card-header
              class="-mx-(--card-padding) -mt-(--card-padding) items-center border-b p-(--card-padding)"
            >
              <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
                <div class="text-lg font-medium tracking-tight">
                  Recent feedback
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  Latest ratings from customers
                </div>
              </div>
              <button
                class="small"
                matIconButton
                [matMenuTriggerFor]="feedbackMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #feedbackMenu="matMenu"
              >
                <button mat-menu-item>View all feedback</button>
                <button mat-menu-item>Survey settings</button>
              </mat-menu>
            </mat-card-header>
            <mat-card-content class="flex flex-col gap-y-4">
              @for (item of feedback(); track item.id) {
                <div class="flex items-start gap-x-3">
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-a3 text-neutral-a11"
                  >
                    <mat-icon
                      class="size-4 text-current"
                      [svgIcon]="item.rating.icon"
                    />
                  </div>
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="flex items-center gap-x-2">
                      <div class="truncate font-medium">
                        {{ item.customer.name }}
                      </div>
                      <div class="ms-auto shrink-0 text-sm text-neutral-a11">
                        {{ item.ago }}
                      </div>
                    </div>
                    <div class="text-neutral-a11">{{ item.comment }}</div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Agents -->
      <mat-card class="flex min-w-0 flex-col [--card-padding:--spacing(5)]">
        <mat-card-header
          class="-mx-(--card-padding) -mt-(--card-padding) items-center border-b p-(--card-padding)"
        >
          <div class="flex min-w-0 flex-auto flex-col gap-y-0.5">
            <div class="text-lg font-medium tracking-tight">Agents</div>
            <div class="truncate text-sm text-neutral-a11">
              {{ report().agents.length }} agents resolved
              {{ report().resolved | number }} tickets
            </div>
          </div>
          <button
            class="small"
            matIconButton
            [matMenuTriggerFor]="agentsMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
          <mat-menu
            class="min-w-40"
            #agentsMenu="matMenu"
          >
            <button mat-menu-item>View team</button>
            <button mat-menu-item>Manage agents</button>
            <mat-divider />
            <button mat-menu-item>Export CSV</button>
          </mat-menu>
        </mat-card-header>
        <mat-card-content class="-mx-3 -mt-3 -mb-2 flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="border-spacing-y-1 whitespace-nowrap [--table-body-border-color:transparent] [--table-body-row-height:--spacing(14)] [--table-header-border-color:transparent]"
              mat-table
              [dataSource]="dataSource"
              [trackBy]="trackBy"
              matSort
              matSortActive="resolved"
              matSortDirection="desc"
            >
              <!-- Agent column -->
              <ng-container matColumnDef="name">
                <th
                  class="max-md:w-full"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Agent
                </th>
                <td
                  class="max-md:w-full"
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2.5 py-1.5">
                    <img
                      class="size-7 shrink-0 rounded-full object-cover"
                      width="28"
                      height="28"
                      [ngSrc]="row.photo"
                      [alt]="row.name"
                    />
                    <div class="flex flex-col">
                      <div class="font-medium">{{ row.name }}</div>
                      <div class="text-sm text-neutral-a11">
                        {{ row.title }}
                      </div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Share column -->
              <ng-container matColumnDef="share">
                <th
                  class="max-md:hidden md:w-full"
                  mat-header-cell
                  *matHeaderCellDef
                ></th>
                <td
                  class="max-md:hidden md:w-full"
                  mat-cell
                  *matCellDef="let row"
                >
                  <div
                    class="ms-auto h-2 w-full max-w-60 rounded-full bg-neutral-a3"
                  >
                    <div
                      class="h-full rounded-full bg-primary-9"
                      [style.width.%]="(row.resolved / topResolved()) * 100"
                    ></div>
                  </div>
                </td>
              </ng-container>

              <!-- Resolved column -->
              <ng-container matColumnDef="resolved">
                <th
                  class="text-end"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                  arrowPosition="before"
                >
                  Resolved
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.resolved | number }}
                </td>
              </ng-container>

              <!-- First response column -->
              <ng-container matColumnDef="firstResponse">
                <th
                  class="text-end"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                  arrowPosition="before"
                >
                  First response
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ duration(row.firstResponse) }}
                </td>
              </ng-container>

              <!-- Satisfaction column -->
              <ng-container matColumnDef="satisfaction">
                <th
                  class="text-end"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                  arrowPosition="before"
                >
                  Satisfaction
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.satisfaction | number: '1.1-1' }}%
                </td>
              </ng-container>

              <!-- Header row definition -->
              <tr
                class="*:not-first:ps-6 *:first:ps-3 *:last:pe-3"
                mat-header-row
                *matHeaderRowDef="columnIds"
              ></tr>

              <!-- Row definition -->
              <!-- Hover tile: cells paint the background, end cells round it -->
              <tr
                class="*:not-first:ps-6 *:first:rounded-s-lg *:first:ps-3 *:last:rounded-e-lg *:last:pe-3 hover:*:bg-neutral-a3"
                mat-row
                *matRowDef="let row; columns: columnIds"
              ></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class Reports {
  // Dependencies
  private customersService = inject(CustomersService);
  private reportsService = inject(ReportsService);
  private theming = inject(Theming);

  // Queries
  readonly sort = viewChild(MatSort);

  // State
  private columnIds = [
    'name',
    'share',
    'resolved',
    'firstResponse',
    'satisfaction',
  ];
  private range = signal<ReportRange>(30);
  private metric = signal<Metric>('created');
  private dataSource = new MatTableDataSource<AgentReport>([]);

  // Computed state
  private report = computed(() => this.reportsService.summary(this.range()));
  private previous = computed(() =>
    this.reportsService.summary(this.range(), 1)
  );
  private stats = computed(() => {
    const report = this.report();
    const previous = this.previous();
    const stats: {
      id: Metric;
      label: string;
      value: string;
      higherIsBetter: boolean;
    }[] = [
      {
        id: 'created',
        label: 'New tickets',
        value: formatNumber(report.created, 'en'),
        higherIsBetter: false,
      },
      {
        id: 'resolved',
        label: 'Resolved tickets',
        value: formatNumber(report.resolved, 'en'),
        higherIsBetter: true,
      },
      {
        id: 'firstResponse',
        label: 'Median first response',
        value: this.duration(report.firstResponse),
        higherIsBetter: false,
      },
      {
        id: 'resolution',
        label: 'Median resolution time',
        value: this.duration(report.resolution),
        higherIsBetter: false,
      },
    ];

    return stats.map((stat) => ({
      ...stat,
      ...this.change(
        ((report[stat.id] - previous[stat.id]) / previous[stat.id]) * 100,
        stat.higherIsBetter
      ),
    }));
  });
  private satisfactionChange = computed(() =>
    this.change(this.report().satisfaction - this.previous().satisfaction, true)
  );
  private metricHeader = computed(() => {
    const report = this.report();

    return {
      created: {
        title: 'New tickets',
        subtitle: `${formatNumber(report.created, 'en')} created in the last ${this.range()} days`,
      },
      resolved: {
        title: 'Resolved tickets',
        subtitle: `${formatNumber(report.resolved, 'en')} resolved in the last ${this.range()} days`,
      },
      firstResponse: {
        title: 'First response time',
        subtitle: `Median ${this.duration(report.firstResponse)} against a ${this.duration(RESPONSE_TARGET)} target`,
      },
      resolution: {
        title: 'Resolution time',
        subtitle: `Median ${this.duration(report.resolution)} in the last ${this.range()} days`,
      },
    }[this.metric()];
  });
  private weekdays = computed(() => {
    const days = this.report().days;
    const weekdays = WEEKDAYS.map((label, index) => {
      const matches = days.filter((day) => getISODay(day.date) === index + 1);

      return {
        label,
        value: Math.round(
          matches.reduce((total, day) => total + day.created, 0) /
            matches.length
        ),
      };
    });

    return {
      weekdays,
      busiest: weekdays.reduce((busiest, weekday) =>
        weekday.value > busiest.value ? weekday : busiest
      ),
    };
  });
  private breakdown = computed(() => {
    const report = this.report();

    return [
      {
        id: 'buckets',
        label: 'Buckets',
        items: report.buckets.map((bucket) => ({
          id: bucket.id,
          label: bucket.name,
          color: bucket.color,
          value: bucket.value,
          percentage: bucket.percentage,
        })),
      },
      {
        id: 'channel',
        label: 'Channel',
        items: [...report.channels]
          .sort((a, b) => b.value - a.value)
          .map((channel, index) => ({
            id: channel.id,
            label: channel.label,
            color: ['bg-primary-9', 'bg-primary-6'][index],
            value: channel.value,
            percentage: channel.percentage,
          })),
      },
      {
        id: 'priority',
        label: 'Priority',
        items: report.priorities.map((priority) => ({
          id: priority.id,
          label: priority.label,
          color: {
            urgent: 'bg-red-a9',
            high: 'bg-amber-a10',
            normal: 'bg-neutral-a8',
            low: 'bg-neutral-a5',
          }[priority.id],
          value: priority.value,
          percentage: priority.percentage,
        })),
      },
    ].map((group) => ({
      ...group,
      leader: group.items.reduce((leader, item) =>
        item.value > leader.value ? item : leader
      ),
    }));
  });
  private topResolved = computed(() =>
    Math.max(...this.report().agents.map((agent) => agent.resolved))
  );
  private feedback = computed(() =>
    this.reportsService.feedback().map((item) => ({
      ...item,
      customer: this.customersService.byId(item.customerId)!,
      rating: RATINGS.find((rating) => rating.id === item.rating)!,
      ago:
        differenceInSeconds(Date.now(), item.at) < 60
          ? 'Just now'
          : formatDistanceToNowStrict(item.at, { addSuffix: true }),
    }))
  );

  private metricChartOptions: Omit<ApexOptions, 'series'> & {
    annotations: Signal<ApexAnnotations>;
    series: Signal<ApexAxisChartSeries>;
    tooltip: Signal<ApexTooltip>;
  } = {
    ...this.areaChartOptions([
      'var(--color-primary-9)',
      'var(--color-neutral-a8)',
    ]),
    annotations: computed(() => ({
      yaxis:
        this.metric() === 'firstResponse'
          ? [
              {
                y: RESPONSE_TARGET,
                borderColor: 'var(--color-red-9)',
                strokeDashArray: 4,
              },
            ]
          : [],
    })),
    fill: {
      type: 'gradient',
      gradient: {
        gradientToColors: ['var(--color-primary-9)', 'var(--color-neutral-a8)'],
        opacityFrom: [0.35, 0],
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    series: computed(() => {
      const previous = this.previous().days;

      return [
        {
          name: 'Current period',
          data: this.report().days.map((day) => ({
            x: day.date,
            y: day[this.metric()],
          })),
        },
        {
          name: 'Previous period',
          data: this.report().days.map((day, index) => ({
            x: day.date,
            y: previous[index][this.metric()],
          })),
        },
      ];
    }),
    stroke: {
      curve: 'smooth',
      dashArray: [0, 4],
      width: 2,
    },
    tooltip: computed(() => {
      const metric = this.metric();

      return {
        theme: this.theming.isDark() ? 'dark' : 'light',
        x: {
          format: 'MMM dd, yyyy',
        },
        y: {
          formatter: (value: number): string =>
            metric === 'created' || metric === 'resolved'
              ? formatNumber(value, 'en')
              : this.duration(value),
        },
      };
    }),
  };

  private satisfactionChartOptions: Omit<ApexOptions, 'series'> & {
    series: Signal<ApexAxisChartSeries>;
    tooltip: Signal<ApexTooltip>;
  } = {
    ...this.areaChartOptions(['var(--color-primary-9)'], true),
    series: computed(() => [
      {
        name: 'Satisfaction',
        data: this.report().satisfactionTrend,
      },
    ]),
    tooltip: computed(() => ({
      theme: this.theming.isDark() ? 'dark' : 'light',
      x: {
        format: 'MMM dd, yyyy',
      },
      y: {
        formatter: (value: number): string =>
          `${formatNumber(value, 'en', '1.1-1')}%`,
      },
    })),
    yaxis: {
      min: (min: number) => min - 2,
      max: (max: number) => max + 2,
      show: false,
    },
  };

  private weekdayChartOptions: Omit<ApexOptions, 'series'> & {
    dataLabels: Signal<ApexDataLabels>;
    series: Signal<ApexAxisChartSeries>;
    tooltip: Signal<ApexTooltip>;
  } = {
    chart: {
      animations: {
        enabled: false,
      },
      fontFamily: 'inherit',
      foreColor: 'inherit',
      width: '100%',
      height: '100%',
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
      type: 'bar',
      zoom: {
        enabled: false,
      },
    },
    colors: ['var(--color-neutral-a8)'],
    dataLabels: computed(() => {
      const { weekdays, busiest } = this.weekdays();

      return {
        distributed: true,
        offsetY: -20,
        style: {
          colors: weekdays.map((weekday) =>
            weekday === busiest
              ? 'var(--color-neutral-12)'
              : 'var(--color-neutral-a11)'
          ),
          fontSize: '12px',
          fontWeight: 500,
        },
      };
    }),
    grid: {
      show: false,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        borderRadiusApplication: 'end',
        columnWidth: '55%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    series: computed(() => {
      const { weekdays, busiest } = this.weekdays();

      return [
        {
          name: 'Average new tickets',
          data: weekdays.map((weekday) => ({
            x: weekday.label.slice(0, 3),
            y: weekday.value,
            fillColor:
              weekday === busiest
                ? 'var(--color-primary-9)'
                : 'var(--color-neutral-a8)',
          })),
        },
      ];
    }),
    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },
    tooltip: computed(() => ({
      theme: this.theming.isDark() ? 'dark' : 'light',
    })),
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          cssClass: 'fill-neutral-a11',
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      // Headroom for the value labels above the tallest bar
      max: (max: number) => max * 1.15,
      show: false,
    },
  };

  constructor() {
    afterNextRender(() => {
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.report().agents;
    });
  }

  private duration(minutes: number) {
    const hours = Math.floor(minutes / 60);

    if (!hours) {
      return `${minutes}m`;
    }

    return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
  }

  private change(change: number, higherIsBetter: boolean) {
    return {
      change: Math.abs(change),
      up: change > 0,
      good: change > 0 === higherIsBetter,
    };
  }

  private areaChartOptions(colors: string[], sparkline = false): ApexOptions {
    return {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        width: '100%',
        height: '100%',
        sparkline: {
          enabled: sparkline,
        },
        toolbar: {
          show: false,
        },
        type: 'area',
        zoom: {
          enabled: false,
        },
      },
      colors,
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient',
        gradient: {
          gradientToColors: colors,
          opacityFrom: 0.35,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
      grid: {
        borderColor: 'var(--color-neutral-a4)',
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        show: false,
      },
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      xaxis: {
        axisBorder: {
          color: 'var(--color-neutral-a4)',
        },
        axisTicks: {
          color: 'var(--color-neutral-a4)',
        },
        labels: {
          datetimeUTC: false,
          style: {
            cssClass: 'fill-neutral-a11',
          },
        },
        type: 'datetime',
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        min: 0,
        show: false,
      },
    };
  }

  private trackBy(_: number, item: AgentReport) {
    return item.id;
  }
}
