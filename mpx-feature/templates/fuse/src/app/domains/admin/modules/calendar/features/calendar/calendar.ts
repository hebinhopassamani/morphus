import {
  afterRenderEffect,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  CalendarOptions,
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import listPlugin from '@fullcalendar/angular/list';
import classicThemePlugin from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { EventApi } from 'fullcalendar';
import { Media } from '@/app/core/media';
import {
  CalendarEntryKind,
  CalendarService,
} from '@/app/domains/admin/modules/calendar/data/calendar';
import { CalendarEventDetails } from '@/app/domains/admin/modules/calendar/features/calendar/event-details';
import { CalendarNewEvent } from '@/app/domains/admin/modules/calendar/features/calendar/new-event';
import { ProjectsService } from '@/app/domains/admin/modules/projects/data/projects';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxEmpty,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxSearch,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';
import { bui } from '@/app/ui/utils';

type View = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

type KindOption = {
  id: CalendarEntryKind;
  label: string;
  color: string;
};

const KIND_OPTIONS: KindOption[] = [
  {
    id: 'milestone',
    label: 'Milestones',
    color: 'bg-violet-9',
  },
  {
    id: 'task',
    label: 'Tasks',
    color: 'bg-blue-9',
  },
  {
    id: 'event',
    label: 'Events',
    color: 'bg-jade-9',
  },
];

const DEFAULT_KINDS: CalendarEntryKind[] = ['milestone', 'event'];

@Component({
  selector: 'calendar',
  encapsulation: ViewEncapsulation.None,
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxEmpty,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxSearch,
    BuiComboboxTrigger,
    CalendarEventDetails,
    CalendarNewEvent,
    FullCalendarModule,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatPseudoCheckbox,
  ],
  styleUrl: '../../styles/fullcalendar.css',
  host: {
    class: 'flex min-h-0 flex-auto',
  },
  template: `
    <div class="flex w-full flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Calendar</div>
          <div class="text-neutral-a11 sm:text-lg">
            Milestones, task due dates and team events across the workspace.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="primary"
            (click)="newEventOpen.set(true)"
          >
            <mat-icon svgIcon="plus" />
            New event
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Navigation & Views -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            matButton
            (click)="today()"
          >
            Today
          </button>
          <button
            matIconButton
            (click)="prev()"
          >
            <mat-icon svgIcon="chevron-left" />
          </button>
          <button
            matIconButton
            (click)="next()"
          >
            <mat-icon svgIcon="chevron-right" />
          </button>
          <div class="text-lg font-medium">{{ title() }}</div>

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <mat-button-toggle-group
            class="segmented"
            name="view"
            [value]="view()"
            (valueChange)="view.set($event)"
          >
            @if (isNarrow()) {
              <mat-button-toggle value="timeGridDay">Day</mat-button-toggle>
              <mat-button-toggle value="listWeek">List</mat-button-toggle>
            } @else {
              <mat-button-toggle value="dayGridMonth">Month</mat-button-toggle>
              <mat-button-toggle value="timeGridWeek">Week</mat-button-toggle>
              <mat-button-toggle value="timeGridDay">Day</mat-button-toggle>
            }
          </mat-button-toggle-group>
        </div>

        <!-- Filters -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
        >
          @for (option of kindOptions; track option.id) {
            <div class="flex items-center rounded-lg bg-neutral-a3">
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                [attr.aria-pressed]="kindFilter().includes(option.id)"
                (click)="toggleKind(option.id)"
              >
                <span class="flex items-center gap-x-1.5">
                  <span
                    class="size-2 rounded-full"
                    [class]="option.color"
                  ></span>
                  <span class="font-medium">{{ option.label }}</span>
                  @if (kindFilter().includes(option.id)) {
                    <mat-pseudo-checkbox
                      appearance="minimal"
                      state="checked"
                    />
                  }
                </span>
              </button>
            </div>
          }

          <mat-divider
            vertical
            class="h-5"
          />

          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [(value)]="projectFilter"
              (expandedChange)="projectQuery.set('')"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="calendar-project-filter"
              >
                <span class="font-medium">
                  Project:
                  <span class="font-normal">{{ projectLabel() }}</span>
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
                  class="max-w-64 min-w-40"
                >
                  <input
                    buiComboboxSearch
                    autocomplete="off"
                    placeholder="Search projects"
                    [value]="projectQuery()"
                    (input)="projectQuery.set(projectSearch.value)"
                    #projectSearch
                  />
                  <div
                    buiComboboxListbox
                    aria-labelledby="calendar-project-filter"
                    multi
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (project of projectResults(); track project.id) {
                      <div
                        buiComboboxOption
                        [value]="project.id"
                        [label]="project.name"
                      >
                        <span
                          class="flex min-w-0 flex-auto items-center gap-x-2"
                        >
                          {{ project.name }}
                        </span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    } @empty {
                      <div buiComboboxEmpty>No projects found</div>
                    }
                  </div>
                  @if (projectFilter().length) {
                    <mat-divider />
                    <button
                      matButton
                      class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                      (click)="projectFilter.set([])"
                    >
                      <mat-icon svgIcon="x" />
                      Clear filter
                    </button>
                  }
                </div>
              </ng-template>
            </div>
          </div>

          @if (hasFilters()) {
            <button
              matButton
              class="tertiary tiny"
              (click)="clearFilters()"
            >
              Clear all
            </button>
          }
        </div>
      </div>

      <!-- Calendar -->
      <div class="relative min-h-0 flex-auto">
        @defer {
          <full-calendar
            class="absolute inset-0"
            [options]="calendarOptions"
            [events]="entries()"
          />
        }
      </div>
    </div>

    <calendar-event-details [(entry)]="selectedEntry" />
    <calendar-new-event [(open)]="newEventOpen" />
  `,
})
export default class Calendar {
  // Dependencies
  private calendarService = inject(CalendarService);
  private media = inject(Media);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  // Queries
  readonly fullCalendar = viewChild(FullCalendarComponent);

  // State
  private kindOptions = KIND_OPTIONS;
  private isNarrow = this.media.match(`(width < 48rem)`);
  private view = linkedSignal<View>(() =>
    this.isNarrow() ? 'listWeek' : 'dayGridMonth'
  );
  private title = signal('');
  private kindFilter = signal(DEFAULT_KINDS);
  private projectFilter = signal<string[]>([]);
  private projectQuery = signal('');
  private selectedEntry = signal<EventApi | null>(null);
  private newEventOpen = signal(false);
  private calendarOptions: CalendarOptions = {
    plugins: [
      rrulePlugin,
      classicThemePlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    initialView: this.view(),
    headerToolbar: false,
    height: '100%',
    borderless: true,
    nowIndicator: true,
    firstDay: 1,
    fixedWeekCount: true,
    dayMaxEvents: 3,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
    datesSet: ({ view }) => this.title.set(view.title),
    eventClick: ({ event }) => {
      if (event.extendedProps['kind'] === 'task') {
        this.router.navigate(['/tasks', event.id]);
        return;
      }

      this.selectedEntry.set(event);
    },

    // All day styles
    allDayHeaderInnerClass: bui('text-sm'),
    allDayDividerClass: bui('h-px border-0 border-t p-0'),

    // Slot header styles
    slotHeaderInnerClass: bui('text-sm'),

    // Day header styles
    dayHeaderClass: (state) =>
      bui('border-0', state.inPopover && 'bg-white p-3 pb-1 dark:bg-neutral-3'),
    dayHeaderInnerClass: (state) =>
      bui('text-sm text-neutral-a11', !state.inPopover && 'pb-1'),

    // Day cell styles
    dayCellClass: (state) =>
      bui(
        !state.inPopover && 'bg-transparent',
        state.inPopover && 'bg-white dark:bg-neutral-3'
      ),
    dayCellTopInnerClass: (state) =>
      bui(
        'm-1 flex size-5 items-center justify-center rounded-sm text-sm',
        'text-neutral-a12',
        state.isOther && 'text-neutral-a8',
        state.isToday && 'bg-primary text-primary-contrast'
      ),
    dayCellInnerClass: bui('*:border-0'),

    // Common event styles
    eventClass: ({ event }) =>
      bui(
        'cursor-pointer border-0 p-0',
        `calendar-${event.extendedProps['kind']}`
      ),
    eventInnerClass: bui('flex items-center gap-x-1'),
    eventTimeClass: bui('px-0 text-xs font-medium'),
    eventTitleClass: bui('truncate px-0 text-xs font-normal'),

    // Block event styles
    blockEventClass: bui(
      'bg-(--fc-event-color) text-(--fc-event-contrast-color)'
    ),

    // List event styles
    listItemEventClass: bui('mx-1 mb-0.5 rounded-sm text-neutral-12'),
    listItemEventInnerClass: bui('px-1.5 py-px'),
    listItemEventBeforeClass: bui('border-(--calendar-dot)'),

    // Row event styles
    rowEventClass: (state) =>
      bui(
        'mx-0 mb-0.5',
        state.isStart && 'ms-1 rounded-s-sm',
        state.isEnd && 'me-1 rounded-e-sm'
      ),
    rowEventInnerClass: bui('px-1.5 py-px'),

    // Column event styles
    columnEventTimeClass: bui('w-full truncate'),
    columnEventTitleClass: bui('w-full truncate'),

    // Common 'more' link styles
    moreLinkClass: bui('border-0 underline-offset-2 hover:underline'),

    // Common popover styles
    popoverClass: bui('overflow-hidden rounded-md shadow-lg'),
    popoverCloseClass: bui('end-3 top-2.5 size-4'),
  };

  // Computed state
  private projects = computed(() =>
    [...this.projectsService.projects()].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  );
  private projectResults = computed(() =>
    this.projects().filter((project) =>
      project.name.toLowerCase().includes(this.projectQuery().toLowerCase())
    )
  );
  private entries = computed(() =>
    this.calendarService
      .entries()
      .filter(
        (entry) =>
          this.kindFilter().includes(entry.kind) &&
          (!this.projectFilter().length ||
            !entry.projectId ||
            this.projectFilter().includes(entry.projectId))
      )
  );
  private hasFilters = computed(
    () =>
      this.kindFilter().length !== DEFAULT_KINDS.length ||
      this.kindFilter().some((kind) => !DEFAULT_KINDS.includes(kind)) ||
      this.projectFilter().length > 0
  );
  private projectLabel = computed(() => {
    const values = this.projectFilter();

    if (values.length > 1) {
      return `${values.length} selected`;
    }

    return this.projectsService.byId(values[0])?.name ?? 'Any';
  });

  constructor() {
    afterRenderEffect(() => {
      this.fullCalendar()?.getApi().changeView(this.view());
    });
  }

  private today() {
    this.fullCalendar()?.getApi().today();
  }

  private prev() {
    this.fullCalendar()?.getApi().prev();
  }

  private next() {
    this.fullCalendar()?.getApi().next();
  }

  private toggleKind(kind: CalendarEntryKind) {
    this.kindFilter.update((kinds) =>
      kinds.includes(kind)
        ? kinds.filter((item) => item !== kind)
        : [...kinds, kind]
    );
  }

  private clearFilters() {
    this.kindFilter.set(DEFAULT_KINDS);
    this.projectFilter.set([]);
  }
}
