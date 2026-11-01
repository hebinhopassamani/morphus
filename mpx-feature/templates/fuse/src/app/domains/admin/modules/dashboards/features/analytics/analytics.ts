import { DecimalPipe, formatNumber } from '@angular/common';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelect } from '@angular/material/select';
import {
  ApexAxisChartSeries,
  ApexOptions,
  ApexTooltip,
  ChartComponent,
} from 'ng-apexcharts';
import { Theming } from '@/app/core/theming';
import {
  AnalyticsDashboardService,
  AnalyticsRange,
} from '@/app/domains/admin/modules/dashboards/data/analytics';
import { ChartResize } from '@/app/domains/admin/ui/chart-resize';

@Component({
  selector: 'analytics-dashboard',
  imports: [
    ChartComponent,
    ChartResize,
    DecimalPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatOption,
    MatPrefix,
    MatProgressBar,
    MatSelect,
    MatCardFooter,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Analytics</div>
          <div class="text-neutral-a11 sm:text-lg">
            How teams use Harbor across workspaces, sessions and features.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <mat-form-field class="small min-w-40">
          <mat-icon
            svgIcon="calendar-range"
            matIconPrefix
          />
          <mat-select
            [value]="selectedRange()"
            (selectionChange)="selectedRange.set($event.value)"
          >
            @for (option of rangeOptions; track option.value) {
              <mat-option [value]="option">{{ option.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Active users -->
      <mat-card
        appearance="filled"
        class="flex flex-col"
      >
        <mat-card-header>
          <div class="flex flex-auto items-center gap-x-2">
            <mat-icon
              class="size-4"
              svgIcon="chart-line"
            />
            <div class="font-medium tracking-tight">Active users</div>
            <div class="ms-auto">
              <button
                class="tiny"
                matIconButton
                [matMenuTriggerFor]="activeUsersMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #activeUsersMenu="matMenu"
              >
                <button mat-menu-item>Download chart</button>
                <button mat-menu-item>Refresh data</button>
                <mat-divider />
                <button mat-menu-item>Settings</button>
              </mat-menu>
            </div>
          </div>
        </mat-card-header>
        <div class="@container">
          <div class="-mt-px grid gap-1 @2xl:grid-cols-3">
            @for (item of range().highlights; track item.label) {
              <mat-card-content class="flex min-w-0 flex-col">
                <div class="truncate text-neutral-a11">{{ item.label }}</div>
                <div class="mt-1 text-3xl font-semibold tabular-nums">
                  {{ item.value }}
                </div>
                <div class="mt-2 flex items-center gap-x-1">
                  @if (item.change.up) {
                    <mat-icon
                      class="size-4 text-green-11"
                      svgIcon="arrow-up"
                    />
                  } @else {
                    <mat-icon
                      class="size-4 text-red-11"
                      svgIcon="arrow-down"
                    />
                  }
                  <div
                    class="flex items-center gap-x-1 text-sm font-medium text-neutral-a11"
                  >
                    <div class="tabular-nums">
                      {{ item.change.value > 0 ? '+' : ''
                      }}{{ item.change.value | number: '1.1-1'
                      }}{{ item.change.unit }}
                    </div>
                    <div>{{ item.change.period }}</div>
                  </div>
                </div>
              </mat-card-content>
            }

            <mat-card-content
              class="flex min-w-0 flex-auto flex-col p-0 pb-1 @2xl:col-span-3"
            >
              <apx-chart
                class="h-full min-h-64 w-full flex-auto"
                [chart]="activeUsersChartOptions.chart"
                [colors]="activeUsersChartOptions.colors"
                [dataLabels]="activeUsersChartOptions.dataLabels"
                [fill]="activeUsersChartOptions.fill"
                [grid]="activeUsersChartOptions.grid"
                [legend]="activeUsersChartOptions.legend"
                [series]="activeUsersChartOptions.series()"
                [states]="activeUsersChartOptions.states"
                [stroke]="activeUsersChartOptions.stroke"
                [tooltip]="activeUsersChartOptions.tooltip()"
                [xaxis]="activeUsersChartOptions.xaxis"
                [yaxis]="activeUsersChartOptions.yaxis"
              ></apx-chart>
            </mat-card-content>
          </div>
        </div>
      </mat-card>

      <!-- Small stats -->
      <div class="@container">
        <div class="grid gap-4 sm:gap-6 @3xl:grid-cols-3">
          @for (item of range().kpis; track item.title) {
            <mat-card
              appearance="filled"
              class="flex min-w-0 flex-col"
            >
              <mat-card-header>
                <div class="flex items-center gap-x-2">
                  <mat-icon
                    class="size-4"
                    [svgIcon]="item.icon"
                  />
                  <div class="font-medium tracking-tight">
                    {{ item.title }}
                  </div>
                </div>
              </mat-card-header>
              <mat-card-content class="flex flex-auto flex-col">
                <div class="text-4xl font-semibold tabular-nums">
                  {{ item.value | number }}
                </div>
                <div class="mt-2 flex items-center gap-x-1">
                  @if (item.change.up) {
                    <mat-icon
                      class="size-4 text-green-11"
                      svgIcon="arrow-up"
                    />
                  } @else {
                    <mat-icon
                      class="size-4 text-red-11"
                      svgIcon="arrow-down"
                    />
                  }
                  <div
                    class="flex items-center gap-x-1 text-sm font-medium text-neutral-a11"
                  >
                    <div class="tabular-nums">
                      {{ item.change.value > 0 ? '+' : ''
                      }}{{ item.change.value | number: '1.1-1'
                      }}{{ item.change.unit }}
                    </div>
                    <div>{{ item.change.period }}</div>
                  </div>
                </div>

                <div class="flex-auto"></div>

                <apx-chart
                  class="mt-2 h-16 w-full"
                  [chart]="sparklineChartOptions.chart"
                  [colors]="sparklineChartOptions.colors"
                  [dataLabels]="sparklineChartOptions.dataLabels"
                  [fill]="sparklineChartOptions.fill"
                  [series]="item.series"
                  [stroke]="sparklineChartOptions.stroke"
                  [tooltip]="sparklineChartOptions.tooltip"
                ></apx-chart>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>

      <!-- AI insights -->
      <mat-card
        appearance="filled"
        class="flex flex-col"
      >
        <mat-card-header>
          <div class="flex flex-auto items-center gap-x-2">
            <mat-icon
              class="size-4 text-primary-11"
              svgIcon="sparkles"
            />
            <div class="font-medium tracking-tight">AI insights</div>
            <div class="ms-auto">
              <button
                class="tiny"
                matIconButton
              >
                <mat-icon svgIcon="refresh-cw" />
              </button>
            </div>
          </div>
        </mat-card-header>
        <mat-card-content class="flex flex-auto flex-col">
          <div class="flex flex-col gap-y-3">
            @for (insight of range().insights; track insight.text) {
              <div class="flex items-start gap-x-2">
                <mat-icon
                  class="mt-0.5 size-4 shrink-0 text-primary-11"
                  [svgIcon]="insight.icon"
                />
                <div class="text-neutral-a11">{{ insight.text }}</div>
              </div>
            }
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            @for (suggestion of data.aiSuggestions; track suggestion) {
              <button
                matButton
                class="tiny secondary"
              >
                {{ suggestion }}
              </button>
            }
          </div>
        </mat-card-content>
        <mat-card-footer class="flex items-center gap-x-1.5 px-2 py-1">
          <mat-icon
            svgIcon="zap"
            class="size-3"
          />
          <div class="text-xs text-neutral-a11">Generated 4 minutes ago</div>
        </mat-card-footer>
      </mat-card>

      <!-- Engagement -->
      <div class="mt-2 flex flex-col gap-y-0.5">
        <h2 class="text-2xl font-semibold tracking-tight">Engagement</h2>
        <div class="text-neutral-a11">
          Where sessions come from and which parts of Harbor teams keep reaching
          for.
        </div>
      </div>

      <div class="@container">
        <div class="grid gap-4 sm:gap-6 @3xl:grid-cols-2 @6xl:grid-cols-4">
          <!-- Feature adoption -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col @3xl:col-span-2"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="blocks"
                />
                <div class="font-medium tracking-tight">Feature adoption</div>
                <div class="ms-auto">
                  <button
                    class="tiny"
                    matIconButton
                    [matMenuTriggerFor]="featureAdoptionMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    class="min-w-40"
                    #featureAdoptionMenu="matMenu"
                  >
                    <button mat-menu-item>Download chart</button>
                    <button mat-menu-item>Refresh data</button>
                    <mat-divider />
                    <button mat-menu-item>Settings</button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex min-w-0 flex-auto flex-col">
              <div class="mt-2 text-lg text-neutral-a11">
                Share of the
                {{ data.featureAdoption.teams | number }} active teams using
                each feature every week.
              </div>
              <apx-chart
                class="h-full min-h-64 w-full flex-auto"
                [chart]="featureAdoptionChartOptions.chart"
                [colors]="featureAdoptionChartOptions.colors"
                [dataLabels]="featureAdoptionChartOptions.dataLabels"
                [grid]="featureAdoptionChartOptions.grid"
                [legend]="featureAdoptionChartOptions.legend"
                [plotOptions]="featureAdoptionChartOptions.plotOptions"
                [series]="featureAdoptionChartOptions.series"
                [states]="featureAdoptionChartOptions.states"
                [stroke]="featureAdoptionChartOptions.stroke"
                [tooltip]="featureAdoptionChartOptions.tooltip()"
                [xaxis]="featureAdoptionChartOptions.xaxis"
                [yaxis]="featureAdoptionChartOptions.yaxis"
              ></apx-chart>
            </mat-card-content>
          </mat-card>

          <!-- Sessions by platform -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="monitor"
                />
                <div class="font-medium tracking-tight">
                  Sessions by platform
                </div>
              </div>
            </mat-card-header>
            <mat-card-content
              class="@container flex min-w-0 flex-auto flex-col"
            >
              <div
                class="flex flex-col @md:flex-row @md:items-center @md:gap-x-6"
              >
                <apx-chart
                  class="h-48 w-full @md:w-48 @md:shrink-0"
                  [chart]="platformsChartOptions.chart"
                  [colors]="platformsChartOptions.colors"
                  [dataLabels]="platformsChartOptions.dataLabels"
                  [grid]="platformsChartOptions.grid"
                  [labels]="platformsChartOptions.labels"
                  [legend]="platformsChartOptions.legend"
                  [plotOptions]="platformsChartOptions.plotOptions"
                  [series]="platformsChartOptions.series"
                  [states]="platformsChartOptions.states"
                  [stroke]="platformsChartOptions.stroke"
                  [tooltip]="platformsChartOptions.tooltip()"
                ></apx-chart>

                <div
                  class="mt-4 flex flex-col gap-y-3 @md:mt-0 @md:min-w-0 @md:flex-auto"
                >
                  @for (item of platformsBreakdown; track item.label) {
                    <div class="flex items-center gap-x-2">
                      <div class="text-neutral-a11">{{ item.label }}</div>
                      <div class="flex-auto"></div>
                      <div class="text-neutral-a11 tabular-nums">
                        {{ item.percentage | number: '1.1-1' }}%
                      </div>
                      <div class="font-medium tabular-nums">
                        {{ item.value | number }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Plan mix -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="credit-card"
                />
                <div class="font-medium tracking-tight">Plan mix</div>
              </div>
            </mat-card-header>
            <mat-card-content
              class="@container flex min-w-0 flex-auto flex-col"
            >
              <div
                class="flex flex-col @md:flex-row @md:items-center @md:gap-x-6"
              >
                <apx-chart
                  class="h-48 w-full @md:w-48 @md:shrink-0"
                  [chart]="plansChartOptions.chart"
                  [colors]="plansChartOptions.colors"
                  [dataLabels]="plansChartOptions.dataLabels"
                  [grid]="plansChartOptions.grid"
                  [labels]="plansChartOptions.labels"
                  [legend]="plansChartOptions.legend"
                  [plotOptions]="plansChartOptions.plotOptions"
                  [series]="plansChartOptions.series"
                  [states]="plansChartOptions.states"
                  [stroke]="plansChartOptions.stroke"
                  [tooltip]="plansChartOptions.tooltip()"
                ></apx-chart>

                <div
                  class="mt-4 flex flex-col gap-y-3 @md:mt-0 @md:min-w-0 @md:flex-auto"
                >
                  @for (item of plansBreakdown; track item.label) {
                    <div class="flex items-center gap-x-2">
                      <div class="text-neutral-a11">{{ item.label }}</div>
                      <div class="flex-auto"></div>
                      <div class="text-neutral-a11 tabular-nums">
                        {{ item.percentage | number: '1.1-1' }}%
                      </div>
                      <div class="font-medium tabular-nums">
                        {{ item.value | number }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Retention -->
      <mat-card
        appearance="filled"
        class="flex flex-col"
      >
        <mat-card-header>
          <div class="flex flex-auto items-center gap-x-2">
            <mat-icon
              class="size-4"
              svgIcon="grid-2x2"
            />
            <div class="font-medium tracking-tight">Retention cohorts</div>
            <div class="ms-auto">
              <button
                class="tiny"
                matIconButton
                [matMenuTriggerFor]="retentionMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #retentionMenu="matMenu"
              >
                <button mat-menu-item>Download chart</button>
                <button mat-menu-item>Refresh data</button>
                <mat-divider />
                <button mat-menu-item>Settings</button>
              </mat-menu>
            </div>
          </div>
        </mat-card-header>
        <mat-card-content class="flex min-w-0 flex-auto flex-col">
          <div class="mt-2 text-lg text-neutral-a11">
            {{ data.retention.total | number }} sign-ups across eight weekly
            cohorts, and the share of each still active since.
          </div>
          <apx-chart
            class="h-full min-h-96 w-full flex-auto"
            [chart]="retentionChartOptions.chart"
            [dataLabels]="retentionChartOptions.dataLabels"
            [grid]="retentionChartOptions.grid"
            [legend]="retentionChartOptions.legend"
            [plotOptions]="retentionChartOptions.plotOptions"
            [series]="retentionChartOptions.series"
            [states]="retentionChartOptions.states"
            [stroke]="retentionChartOptions.stroke"
            [tooltip]="retentionChartOptions.tooltip()"
            [xaxis]="retentionChartOptions.xaxis"
            [yaxis]="retentionChartOptions.yaxis"
          ></apx-chart>
        </mat-card-content>
      </mat-card>

      <div class="@container">
        <div class="grid gap-4 sm:gap-6 @3xl:grid-cols-2">
          <!-- Top workspaces -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="building"
                />
                <div class="font-medium tracking-tight">Top workspaces</div>
                <div class="ms-auto">
                  <button
                    class="tiny"
                    matIconButton
                    [matMenuTriggerFor]="workspacesMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    class="min-w-40"
                    #workspacesMenu="matMenu"
                  >
                    <button mat-menu-item>Export as CSV</button>
                    <button mat-menu-item>Refresh data</button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col gap-y-4">
              @for (item of data.workspaces; track item.name) {
                <div class="flex items-center gap-x-3">
                  <div class="flex min-w-0 flex-auto items-center gap-x-3">
                    <div
                      class="w-3 shrink-0 text-sm text-neutral-a11 tabular-nums"
                    >
                      {{ $index + 1 }}
                    </div>
                    <div class="min-w-0 flex-auto">
                      <div class="truncate font-medium">{{ item.name }}</div>
                      <div class="text-sm text-neutral-a11 tabular-nums">
                        {{ item.members | number }} members
                      </div>
                    </div>
                  </div>
                  <div class="shrink-0 text-end">
                    <div class="font-medium tabular-nums">
                      {{ item.sessions | number }}
                    </div>
                    <div class="text-sm text-neutral-a11">sessions</div>
                  </div>
                  <div
                    class="flex shrink-0 items-center gap-x-0.5 rounded px-1.5 py-0.5 text-xs font-medium tabular-nums"
                    [class.bg-green-a3]="item.change.up"
                    [class.text-green-11]="item.change.up"
                    [class.bg-red-a3]="!item.change.up"
                    [class.text-red-11]="!item.change.up"
                  >
                    <mat-icon
                      class="size-3"
                      [class.text-green-11]="item.change.up"
                      [class.text-red-11]="!item.change.up"
                      [svgIcon]="item.change.up ? 'arrow-up' : 'arrow-down'"
                    />
                    {{ item.change.value | number: '1.1-1' }}%
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Sign-up sources -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="user-plus"
                />
                <div class="font-medium tracking-tight">Sign-up sources</div>
                <div class="ms-auto">
                  <button
                    class="tiny"
                    matIconButton
                    [matMenuTriggerFor]="signUpSourcesMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    class="min-w-40"
                    #signUpSourcesMenu="matMenu"
                  >
                    <button mat-menu-item>Export as CSV</button>
                    <button mat-menu-item>Refresh data</button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col gap-y-4">
              @for (item of range().signUpSources; track item.label) {
                <div class="flex flex-col gap-y-1.5">
                  <div class="flex items-center gap-x-2">
                    <div class="text-neutral-a11">{{ item.label }}</div>
                    <div class="flex-auto"></div>
                    <div class="font-medium tabular-nums">
                      {{ item.value | number }}
                    </div>
                    <div
                      class="w-12 text-end text-sm text-neutral-a11 tabular-nums"
                    >
                      {{ item.percentage }}%
                    </div>
                  </div>
                  <mat-progress-bar [value]="item.percentage" />
                </div>
              }

              <div class="flex-auto"></div>

              <div
                class="flex items-center gap-x-1 border-t border-neutral-a4 pt-3"
              >
                <div class="font-medium">Total</div>
                <div class="flex-auto"></div>
                <div class="font-medium tabular-nums">
                  {{ range().signUpsTotal | number }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
})
export default class AnalyticsDashboard {
  // Dependencies
  private analyticsDashboardService = inject(AnalyticsDashboardService);
  private theming = inject(Theming);

  // Data
  private data = this.analyticsDashboardService.data;
  private platformsBreakdown = this.data.platforms.breakdown.map((item) => ({
    ...item,
    percentage: (item.value / this.data.platforms.total) * 100,
  }));
  private plansBreakdown = this.data.plans.breakdown.map((item) => ({
    ...item,
    percentage: (item.value / this.data.plans.total) * 100,
  }));

  // State
  private rangeOptions: { label: string; value: AnalyticsRange }[] = [
    { label: 'Last 30 days', value: '30days' },
    { label: 'Last 90 days', value: '90days' },
    { label: 'Last 12 months', value: '12months' },
  ];
  private selectedRange = signal(this.rangeOptions[0]);
  private range = computed(() => this.data.ranges[this.selectedRange().value]);

  private activeUsersChartOptions: Omit<ApexOptions, 'series'> & {
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
      toolbar: {
        show: false,
      },
      type: 'area',
      zoom: {
        enabled: false,
      },
    },
    colors: ['var(--color-primary-9)'],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        gradientToColors: ['var(--color-primary-9)'],
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
    series: computed(() => this.range().activeUsers),
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
    tooltip: computed(() => ({
      theme: this.theming.isDark() ? 'dark' : 'light',
      x: {
        format: 'MMM dd, yyyy',
      },
      y: {
        formatter: (value: number): string => formatNumber(value, 'en'),
      },
    })),
    xaxis: {
      axisBorder: {
        color: 'var(--color-neutral-a4)',
      },
      axisTicks: {
        color: 'var(--color-neutral-a4)',
      },
      labels: {
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
      show: false,
    },
  };

  private sparklineChartOptions: ApexOptions = {
    chart: {
      animations: {
        enabled: false,
      },
      fontFamily: 'inherit',
      foreColor: 'inherit',
      width: '100%',
      height: '100%',
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      type: 'area',
      zoom: {
        enabled: false,
      },
    },
    colors: ['var(--color-primary-9)'],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'solid',
      colors: ['var(--color-primary-a4)'],
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    tooltip: {
      enabled: false,
    },
  };

  private featureAdoptionChartOptions: ApexOptions & {
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
      toolbar: {
        show: false,
      },
      type: 'bar',
      zoom: {
        enabled: false,
      },
    },
    colors: ['var(--color-primary-9)'],
    dataLabels: {
      enabled: true,
      formatter: (value: number): string => `${value}%`,
      offsetX: 8,
      style: {
        colors: ['var(--color-primary-contrast)'],
        fontWeight: 500,
      },
      textAnchor: 'start',
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
    plotOptions: {
      bar: {
        barHeight: '64%',
        borderRadius: 2,
        dataLabels: {
          position: 'bottom',
        },
        horizontal: true,
      },
    },
    series: this.data.featureAdoption.chart.series,
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
      width: 0,
    },
    tooltip: computed(() => ({
      theme: this.theming.isDark() ? 'dark' : 'light',
      y: {
        formatter: (value: number): string => `${value}%`,
      },
    })),
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      categories: this.data.featureAdoption.chart.labels,
      labels: {
        show: false,
      },
      max: 100,
      min: 0,
    },
    yaxis: {
      labels: {
        style: {
          cssClass: 'fill-neutral-a11',
        },
      },
    },
  };

  private platformsChartOptions: ApexOptions & {
    tooltip: Signal<ApexTooltip>;
  } = {
    ...this.donutChartOptions(),
    labels: this.data.platforms.breakdown.map((item) => item.label),
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: {
              color: 'var(--color-neutral-12)',
              formatter: (value: string): string => formatNumber(+value, 'en'),
            },
            total: {
              color: 'var(--color-neutral-12)',
              show: true,
              showAlways: true,
              label: 'Sessions',
              formatter: (): string =>
                formatNumber(this.data.platforms.total, 'en'),
            },
          },
        },
      },
    },
    series: this.data.platforms.breakdown.map((item) => item.value),
  };

  private plansChartOptions: ApexOptions & {
    tooltip: Signal<ApexTooltip>;
  } = {
    ...this.donutChartOptions(),
    labels: this.data.plans.breakdown.map((item) => item.label),
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: {
              color: 'var(--color-neutral-12)',
              formatter: (value: string): string => formatNumber(+value, 'en'),
            },
            total: {
              color: 'var(--color-neutral-12)',
              show: true,
              showAlways: true,
              label: 'Seats',
              formatter: (): string =>
                formatNumber(this.data.plans.total, 'en'),
            },
          },
        },
      },
    },
    series: this.data.plans.breakdown.map((item) => item.value),
  };

  private retentionChartOptions: ApexOptions & {
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
      toolbar: {
        show: false,
      },
      type: 'heatmap',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: 'var(--color-neutral-a4)',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 8,
      },
    },
    legend: {
      show: true,
      position: 'bottom',
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 29,
              name: 'Under 30%',
              color: 'var(--color-primary-4)',
            },
            {
              from: 30,
              to: 37,
              name: '30 to 37%',
              color: 'var(--color-primary-6)',
            },
            {
              from: 38,
              to: 45,
              name: '38 to 45%',
              color: 'var(--color-primary-7)',
            },
            {
              from: 46,
              to: 59,
              name: '46 to 59%',
              color: 'var(--color-primary-8)',
            },
            {
              from: 60,
              to: 100,
              name: '60% and up',
              color: 'var(--color-primary-9)',
            },
          ],
        },
        // Shading multiplies the range color, which a CSS variable cannot carry
        enableShades: false,
        radius: 2,
      },
    },
    series: this.data.retention.chart.series,
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
      colors: ['var(--color-neutral-a4)'],
      width: 1,
    },
    tooltip: computed(() => ({
      theme: this.theming.isDark() ? 'dark' : 'light',
      y: {
        formatter: (value: number): string => `${value}%`,
      },
    })),
    xaxis: {
      axisBorder: {
        color: 'var(--color-neutral-a4)',
      },
      axisTicks: {
        color: 'var(--color-neutral-a4)',
      },
      categories: this.data.retention.chart.labels,
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
      labels: {
        style: {
          cssClass: 'fill-neutral-a11',
        },
      },
    },
  };

  private donutChartOptions(): ApexOptions & { tooltip: Signal<ApexTooltip> } {
    return {
      chart: {
        animations: {
          enabled: false,
        },
        background: 'transparent',
        fontFamily: 'inherit',
        foreColor: 'inherit',
        width: '100%',
        height: '100%',
        toolbar: {
          show: false,
        },
        type: 'donut',
        zoom: {
          enabled: false,
        },
      },
      colors: [
        'var(--color-primary-9)',
        'var(--color-primary-8)',
        'var(--color-primary-7)',
        'var(--color-primary-6)',
      ],
      dataLabels: {
        enabled: false,
      },
      grid: {
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
        colors: ['var(--color-neutral-a4)'],
        width: 1,
      },
      tooltip: computed(() => ({
        theme: this.theming.isDark() ? 'dark' : 'light',
        y: {
          formatter: (value: number): string => formatNumber(value, 'en'),
        },
      })),
    };
  }
}
