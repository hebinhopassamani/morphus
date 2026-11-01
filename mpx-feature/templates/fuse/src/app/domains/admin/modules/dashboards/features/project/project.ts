import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ApexOptions, ApexTooltip, ChartComponent } from 'ng-apexcharts';
import { Theming } from '@/app/core/theming';
import { ProjectDashboardService } from '@/app/domains/admin/modules/dashboards/data/project';
import { ProjectBudgetTable } from '@/app/domains/admin/modules/dashboards/features/project/budget-table';
import { ChartResize } from '@/app/domains/admin/ui/chart-resize';

@Component({
  selector: 'project-dashboard',
  imports: [
    ChartComponent,
    ChartResize,
    DatePipe,
    DecimalPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    NgOptimizedImage,
    ProjectBudgetTable,
    MatCardFooter,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="flex items-center gap-x-2.5">
            <div class="text-3xl font-semibold tracking-tighter">
              Harbor Mobile App v2.4
            </div>
            <div
              class="inline-flex items-center rounded-lg bg-jade-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-jade-a11"
            >
              On track
            </div>
          </div>
          <div class="text-neutral-a11 sm:text-lg">
            Release readiness across issues, tasks and budget. Updated hourly.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Customize button with mobile variant -->
        <button
          matButton
          class="small hidden lg:flex"
        >
          <mat-icon svgIcon="settings-2" />
          Customize
        </button>
        <button
          matButton
          class="small lg:hidden"
        >
          <mat-icon svgIcon="settings-2" />
        </button>
      </div>

      <!-- AI summary -->
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
            <div class="font-medium tracking-tight">AI summary</div>
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
          <div class="text-neutral-a11">{{ data.aiSummary.text }}</div>

          <div class="mt-4 flex flex-wrap gap-2">
            @for (suggestion of data.aiSummary.suggestions; track suggestion) {
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
          <div class="text-xs text-neutral-a11">Generated 12 minutes ago</div>
        </mat-card-footer>
      </mat-card>

      <!-- Issues overview -->
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
            <div class="font-medium tracking-tight">Issues overview</div>
            <div class="ms-auto">
              <button
                class="tiny"
                matIconButton
                [matMenuTriggerFor]="issuesMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #issuesMenu="matMenu"
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
          <div class="-mt-px grid gap-1 @3xl:grid-cols-3">
            <mat-card-content
              class="flex min-w-0 flex-auto flex-col p-0 pb-1 @3xl:col-span-2"
            >
              <div class="flex flex-col px-6 pt-4">
                <div class="text-2xl font-semibold tracking-tight">
                  New vs closed
                </div>
                <div class="mt-0.5 text-neutral-a11">
                  178 opened against 167 closed this week, so the backlog grew
                  by 11.
                </div>
              </div>
              <apx-chart
                class="h-full min-h-56 w-full flex-auto"
                [chart]="issuesChartOptions.chart"
                [colors]="issuesChartOptions.colors"
                [dataLabels]="issuesChartOptions.dataLabels"
                [grid]="issuesChartOptions.grid"
                [legend]="issuesChartOptions.legend"
                [plotOptions]="issuesChartOptions.plotOptions"
                [series]="issuesChartOptions.series"
                [states]="issuesChartOptions.states"
                [stroke]="issuesChartOptions.stroke"
                [tooltip]="issuesChartOptions.tooltip()"
                [xaxis]="issuesChartOptions.xaxis"
                [yaxis]="issuesChartOptions.yaxis"
              ></apx-chart>
            </mat-card-content>

            <mat-card-content class="flex min-w-0 flex-col">
              <div class="font-medium tracking-tight">Status breakdown</div>
              <div class="mt-4 flex flex-col gap-y-3">
                @for (item of data.issues.overview; track item.label) {
                  <div class="flex items-center gap-x-1">
                    <div class="text-neutral-a11">{{ item.label }}</div>
                    <div class="flex-auto"></div>
                    <div class="font-medium tabular-nums">
                      {{ item.value | number }}
                    </div>
                  </div>
                }
                <div
                  class="flex items-center gap-x-1 border-t border-neutral-a4 pt-3"
                >
                  <div class="font-medium">Total</div>
                  <div class="flex-auto"></div>
                  <div class="font-medium tabular-nums">
                    {{ data.issues.total | number }}
                  </div>
                </div>
              </div>

              <div class="flex-auto"></div>

              <div class="mt-4 text-sm text-neutral-a11">
                Includes issues carried over from earlier weeks.
              </div>
            </mat-card-content>
          </div>
        </div>
      </mat-card>

      <!-- Small stats -->
      <div class="@container">
        <div
          class="grid gap-4 sm:gap-6 @max-md:grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4"
        >
          @for (item of data.summary; track item) {
            <mat-card appearance="filled">
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
              <mat-card-content>
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
                    <div>
                      {{ item.change.value > 0 ? '+' : ''
                      }}{{ item.change.value | number }}{{ item.change.unit }}
                    </div>
                    <div>{{ item.change.period }}</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>

      <div class="@container">
        <div class="grid gap-4 sm:gap-6 @3xl:grid-cols-2">
          <!-- Task distribution -->
          <mat-card
            appearance="filled"
            class="flex min-w-0 flex-col"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="chart-pie"
                />
                <div class="font-medium tracking-tight">Task distribution</div>
                <div class="ms-auto">
                  <button
                    class="tiny"
                    matIconButton
                    [matMenuTriggerFor]="taskDistributionMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    class="min-w-40"
                    #taskDistributionMenu="matMenu"
                  >
                    <button mat-menu-item>Download chart</button>
                    <button mat-menu-item>Refresh data</button>
                    <mat-divider />
                    <button mat-menu-item>Settings</button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-header>
            <mat-card-content class="flex flex-auto flex-col justify-center">
              <apx-chart
                class="h-full min-h-72 w-full flex-auto"
                [chart]="taskDistributionChartOptions.chart"
                [colors]="taskDistributionChartOptions.colors"
                [fill]="taskDistributionChartOptions.fill"
                [grid]="taskDistributionChartOptions.grid"
                [labels]="taskDistributionChartOptions.labels"
                [legend]="taskDistributionChartOptions.legend"
                [plotOptions]="taskDistributionChartOptions.plotOptions"
                [series]="taskDistributionChartOptions.series"
                [states]="taskDistributionChartOptions.states"
                [stroke]="taskDistributionChartOptions.stroke"
                [tooltip]="taskDistributionChartOptions.tooltip()"
                [yaxis]="taskDistributionChartOptions.yaxis"
              ></apx-chart>
            </mat-card-content>
          </mat-card>

          <!-- Upcoming schedule -->
          <mat-card
            appearance="filled"
            class="@container flex min-w-0 flex-col"
          >
            <mat-card-header>
              <div class="flex flex-auto items-center gap-x-2">
                <mat-icon
                  class="size-4"
                  svgIcon="calendar-clock"
                />
                <div class="font-medium tracking-tight">Upcoming schedule</div>
                <div class="ms-auto">
                  <button
                    class="tiny"
                    matIconButton
                    [matMenuTriggerFor]="scheduleMenu"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    class="min-w-40"
                    #scheduleMenu="matMenu"
                  >
                    <button mat-menu-item>Add event</button>
                    <button mat-menu-item>Refresh data</button>
                  </mat-menu>
                </div>
              </div>
            </mat-card-header>
            <mat-card-content
              class="grid grid-cols-4 items-center gap-x-4 gap-y-5"
            >
              @for (item of data.schedule; track item.title) {
                <!-- Date & time -->
                <div
                  class="flex flex-col items-center rounded-md bg-neutral-a3 px-2 py-1 whitespace-nowrap"
                >
                  <div class="text-sm text-neutral-a11 tabular-nums">
                    <span class="hidden @md:flex">{{
                      item.date | date: 'E, dd MMM'
                    }}</span>
                    <span class="@md:hidden">{{
                      item.date | date: 'MM/dd'
                    }}</span>
                  </div>
                  <div class="font-medium tracking-tight tabular-nums">
                    {{ item.date | date: 'HH:mm' }}
                  </div>
                </div>

                <!-- Location -->
                <div class="col-span-2">
                  <div class="truncate font-medium">{{ item.title }}</div>
                  @if (item.location; as location) {
                    <div class="flex items-center gap-x-1">
                      <mat-icon
                        class="size-3"
                        [svgIcon]="location.icon"
                      />
                      <div class="truncate text-neutral-a11">
                        {{ location.label }}
                      </div>
                    </div>
                  }
                </div>

                <!-- Attendees -->
                <div class="flex shrink-0 items-center justify-end -space-x-1">
                  @for (attendee of item.attendees; track attendee.name) {
                    <img
                      class="rounded-full object-cover ring-2 ring-white outline -outline-offset-1 outline-black-a3 dark:ring-neutral-2 dark:outline-white-a3"
                      [ngSrc]="attendee.photo"
                      width="24"
                      height="24"
                      [alt]="attendee.name"
                    />
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Budget -->
      <mat-card
        appearance="filled"
        class="flex flex-col"
      >
        <mat-card-header>
          <div class="flex flex-auto items-center gap-x-2">
            <mat-icon
              class="size-4"
              svgIcon="wallet"
            />
            <div class="font-medium tracking-tight">Budget</div>
            <div class="ms-auto">
              <button
                class="tiny"
                matIconButton
                [matMenuTriggerFor]="budgetMenu"
              >
                <mat-icon svgIcon="ellipsis-vertical" />
              </button>
              <mat-menu
                class="min-w-40"
                #budgetMenu="matMenu"
              >
                <button mat-menu-item>Export as CSV</button>
                <button mat-menu-item>Export as PDF</button>
                <button mat-menu-item>Export as Excel</button>
                <mat-divider />
                <button mat-menu-item>Refresh data</button>
              </mat-menu>
            </div>
          </div>
        </mat-card-header>
        <mat-card-content class="flex flex-auto flex-col p-0">
          <project-budget-table />
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class ProjectDashboard {
  // Dependencies
  private projectDashboardService = inject(ProjectDashboardService);
  private theming = inject(Theming);

  // Data
  private data = this.projectDashboardService.data;

  // State
  private issuesChartOptions: ApexOptions & {
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
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    colors: ['var(--color-primary-9)', 'var(--color-primary-a6)'],
    dataLabels: {
      enabled: false,
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
        borderRadius: 2,
        columnWidth: '40%',
      },
    },
    series: this.data.issues.chart.series,
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
      width: [2, 0],
    },
    tooltip: computed(() => ({
      theme: this.theming.isDark() ? 'dark' : 'light',
    })),
    xaxis: {
      axisBorder: {
        color: 'var(--color-neutral-a4)',
      },
      axisTicks: {
        color: 'var(--color-neutral-a4)',
      },
      categories: this.data.issues.chart.labels,
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
      show: false,
    },
  };

  private taskDistributionChartOptions: ApexOptions & {
    tooltip: Signal<ApexTooltip>;
  } = {
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
      type: 'polarArea',
      zoom: {
        enabled: false,
      },
    },
    colors: [
      'var(--color-primary-9)',
      'var(--color-primary-8)',
      'var(--color-primary-7)',
      'var(--color-primary-6)',
      'var(--color-primary-5)',
    ],
    fill: {
      opacity: 0.9,
    },
    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    labels: this.data.taskDistribution.chart.labels,
    legend: {
      show: true,
      position: 'bottom',
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeColor: 'var(--color-neutral-a4)',
        },
        spokes: {
          connectorColors: 'var(--color-neutral-a4)',
        },
      },
    },
    series: this.data.taskDistribution.chart.series,
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
    yaxis: {
      show: false,
    },
  };
}
