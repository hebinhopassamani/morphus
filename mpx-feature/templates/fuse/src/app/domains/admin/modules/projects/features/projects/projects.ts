import { SelectionModel } from '@angular/cdk/collections';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  Project,
  ProjectsService,
} from '@/app/domains/admin/modules/projects/data/projects';
import { ProjectsBoard } from '@/app/domains/admin/modules/projects/features/projects/board';
import { ProjectsNewProject } from '@/app/domains/admin/modules/projects/features/projects/new-project';
import { ProjectsTable } from '@/app/domains/admin/modules/projects/features/projects/table';
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

type FilterId = 'status' | 'lead' | 'health' | 'label';

type Filter = {
  id: FilterId;
  label: string;
  search?: string;
};

type FilterOption = {
  value: string;
  label: string;
};

type View = 'table' | 'board';

@Component({
  selector: 'projects',
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
    FormsModule,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    ProjectsNewProject,
    ProjectsBoard,
    ProjectsTable,
    MatFormField,
    MatInput,
    MatPrefix,
  ],
  template: `
    <div
      class="mx-auto flex w-full flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Projects</div>
          <div class="text-neutral-a11 sm:text-lg">
            Everything the workspace is building, with owners and target dates.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="hidden sm:flex"
          >
            <mat-icon svgIcon="download" />
            Export
          </button>

          <button
            matButton
            class="primary hidden sm:flex"
            (click)="newProjectOpen.set(true)"
          >
            <mat-icon svgIcon="plus" />
            New project
          </button>

          <!-- Mobile actions -->
          <button
            matIconButton
            class="sm:hidden"
            [matMenuTriggerFor]="actionsMenu"
          >
            <mat-icon svgIcon="ellipsis-vertical" />
          </button>
          <mat-menu #actionsMenu>
            <button
              mat-menu-item
              (click)="newProjectOpen.set(true)"
            >
              <mat-icon svgIcon="plus" />
              New project
            </button>
            <mat-divider />
            <button mat-menu-item>
              <mat-icon svgIcon="download" />
              Export
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Views & Search -->
        <div class="flex items-center gap-x-2">
          <mat-button-toggle-group
            class="segmented"
            name="view"
            [value]="view()"
            (valueChange)="view.set($event)"
          >
            <mat-button-toggle value="table">
              <mat-icon svgIcon="table" />
              <span class="hidden sm:flex">Table</span>
            </mat-button-toggle>
            <mat-button-toggle value="board">
              <mat-icon svgIcon="kanban" />
              <span class="hidden sm:flex">Board</span>
            </mat-button-toggle>
          </mat-button-toggle-group>

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <!-- Search -->
          <mat-form-field class="w-full max-w-54">
            <input
              matInput
              placeholder="Search this view"
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
            />
            <mat-icon
              svgIcon="search"
              matIconPrefix
            />
          </mat-form-field>
        </div>

        <!-- Filters -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
        >
          @if (selection.hasValue()) {
            <div class="flex items-center gap-x-2">
              <div class="text-neutral-a11">
                {{ selection.selected.length }} selected
              </div>
              <button
                matButton
                class="tertiary tiny"
                (click)="selection.clear()"
              >
                Clear selection
              </button>
            </div>
          } @else {
            @for (filter of activeFilters(); track filter.id) {
              <div class="flex items-center rounded-lg bg-neutral-a3">
                <div
                  buiCombobox
                  class="w-fit"
                  [value]="selections()[filter.id]"
                  (valueChange)="setSelection(filter, $event)"
                  (expandedChange)="filterQuery.set('')"
                >
                  <button
                    matButton
                    class="tertiary tiny hover:bg-neutral-a4"
                    buiComboboxTrigger
                    [id]="'projects-' + filter.id + '-filter'"
                  >
                    <span class="font-medium">
                      {{ filter.label }}:
                      <span class="font-normal">
                        {{ selectionLabel(filter) }}
                      </span>
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
                      @if (filter.search) {
                        <input
                          buiComboboxSearch
                          autocomplete="off"
                          placeholder="Search {{ filter.search }}"
                          [value]="filterQuery()"
                          (input)="filterQuery.set(filterSearch.value)"
                          #filterSearch
                        />
                      }
                      <div
                        buiComboboxListbox
                        [attr.aria-labelledby]="
                          'projects-' + filter.id + '-filter'
                        "
                        multi
                        focusMode="activedescendant"
                        selectionMode="explicit"
                      >
                        @for (
                          option of filterResults()[filter.id];
                          track option.value
                        ) {
                          <div
                            buiComboboxOption
                            [value]="option.value"
                            [label]="option.label"
                          >
                            <span class="flex-auto">{{ option.label }}</span>
                            <span buiComboboxOptionIndicator></span>
                          </div>
                        } @empty {
                          <div buiComboboxEmpty>
                            No {{ filter.search }} found
                          </div>
                        }
                      </div>
                      @if (selections()[filter.id].length) {
                        <mat-divider />
                        <button
                          matButton
                          class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                          (click)="setSelection(filter, [])"
                        >
                          <mat-icon svgIcon="x" />
                          Clear filter
                        </button>
                      }
                    </div>
                  </ng-template>
                </div>
                <button
                  matIconButton
                  class="tertiary tiny hover:bg-neutral-a4"
                  (click)="removeFilter(filter)"
                >
                  <mat-icon svgIcon="x" />
                </button>
              </div>
            }

            @if (availableFilters().length) {
              <button
                matButton
                class="tertiary tiny"
                [matMenuTriggerFor]="addFilterMenu"
              >
                <mat-icon svgIcon="plus" />
                Add filter
              </button>
              <mat-menu
                class="min-w-40"
                #addFilterMenu="matMenu"
              >
                @for (filter of availableFilters(); track filter.id) {
                  <button
                    mat-menu-item
                    (click)="addFilter(filter)"
                  >
                    {{ filter.label }}
                  </button>
                }
              </mat-menu>
            }

            @if (hasFilters()) {
              <button
                matButton
                class="tertiary tiny"
                (click)="clearFilters()"
              >
                Clear all
              </button>
            }
          }

          <!-- Spacer -->
          <div class="flex-auto"></div>

          <!-- Customize -->
          <button
            matButton
            class="tertiary tiny"
            (click)="customizeOpen.set(true)"
          >
            <mat-icon svgIcon="sliders-horizontal" />
            Customize
          </button>
        </div>

        @if (view() === 'board') {
          <projects-board
            [projects]="filteredProjects()"
            [(customizeOpen)]="customizeOpen"
          />
        } @else {
          <projects-table
            [projects]="filteredProjects()"
            [selection]="selection"
            [(customizeOpen)]="customizeOpen"
          />
        }
      </div>
    </div>

    <!-- New project -->
    <projects-new-project [(open)]="newProjectOpen" />
  `,
})
export default class Projects {
  // Dependencies
  private projectsService = inject(ProjectsService);

  // State
  private projects = this.projectsService.projects;
  private view = signal<View>('table');
  private search = signal('');
  private customizeOpen = signal(false);
  private newProjectOpen = signal(false);
  private filters: Filter[] = [
    {
      id: 'status',
      label: 'Status',
    },
    {
      id: 'lead',
      label: 'Lead',
      search: 'leads',
    },
    {
      id: 'health',
      label: 'Health',
    },
    {
      id: 'label',
      label: 'Label',
      search: 'labels',
    },
  ];
  private activeFilters = signal<Filter[]>(this.filters.slice(0, 2));
  private selections = signal<Record<FilterId, string[]>>({
    status: [],
    lead: [],
    health: [],
    label: [],
  });
  private filterQuery = signal('');
  private selection = new SelectionModel<Project>(true, []);

  // Computed state
  private availableFilters = computed(() =>
    this.filters.filter((filter) => !this.activeFilters().includes(filter))
  );
  private hasFilters = computed(() => this.activeFilters().length > 0);
  private filterOptions = computed<Record<FilterId, FilterOption[]>>(() => {
    const projects = this.projects();

    return {
      status: [
        { value: 'backlog', label: 'Backlog' },
        { value: 'planned', label: 'Planned' },
        { value: 'in-progress', label: 'In progress' },
        { value: 'paused', label: 'Paused' },
        { value: 'completed', label: 'Completed' },
      ],
      health: [
        { value: 'on-track', label: 'On track' },
        { value: 'at-risk', label: 'At risk' },
        { value: 'off-track', label: 'Off track' },
      ],
      lead: [...new Set(projects.map((project) => project.lead.name))]
        .sort()
        .map((name) => ({ value: name, label: name })),
      label: [...new Set(projects.flatMap((project) => project.labels))]
        .sort()
        .map((label) => ({ value: label, label })),
    };
  });
  private filterResults = computed(
    () =>
      Object.fromEntries(
        Object.entries(this.filterOptions()).map(([id, options]) => [
          id,
          options.filter((option) =>
            option.label
              .toLowerCase()
              .includes(this.filterQuery().toLowerCase())
          ),
        ])
      ) as Record<FilterId, FilterOption[]>
  );
  private filteredProjects = computed(() => {
    const search = this.search().trim().toLowerCase();
    const selections = this.selections();

    return this.projects().filter(
      (project) =>
        (!search ||
          project.name.toLowerCase().includes(search) ||
          project.lead.name.toLowerCase().includes(search) ||
          project.labels.some((label) => label.includes(search))) &&
        this.filters.every(
          (filter) =>
            !selections[filter.id].length ||
            this.matches(project, filter.id, selections[filter.id])
        )
    );
  });

  /**
   * Whether a project satisfies the values picked for a filter.
   * @param project
   * @param id
   * @param values
   */
  private matches(project: Project, id: FilterId, values: string[]) {
    if (id === 'lead') {
      return values.includes(project.lead.name);
    }

    if (id === 'label') {
      return project.labels.some((label) => values.includes(label));
    }

    return values.includes(project[id]);
  }

  private addFilter(filter: Filter) {
    this.activeFilters.update((filters) => [...filters, filter]);
  }

  private removeFilter(filter: Filter) {
    this.activeFilters.update((filters) =>
      filters.filter((item) => item !== filter)
    );
    this.selections.update((selections) => ({
      ...selections,
      [filter.id]: [],
    }));
  }

  private clearFilters() {
    this.activeFilters.set([]);
    this.selections.set({
      status: [],
      lead: [],
      health: [],
      label: [],
    });
  }

  private setSelection(filter: Filter, values: string[]) {
    this.selections.update((selections) => ({
      ...selections,
      [filter.id]: values,
    }));
  }

  private selectionLabel(filter: Filter) {
    const values = this.selections()[filter.id];

    if (!values.length) {
      return 'Any';
    }

    if (values.length > 2) {
      return `${values.length} selected`;
    }

    const options = this.filterOptions()[filter.id];

    return values
      .map(
        (value) =>
          options.find((option) => option.value === value)?.label ?? value
      )
      .join(', ');
  }
}
