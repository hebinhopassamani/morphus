import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  NOTE_LABELS,
  NoteLabelId,
  NotesService,
} from '@/app/domains/admin/modules/notes/data/notes';
import { NoteLabelTags } from '@/app/domains/admin/modules/notes/ui/tags';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type View = 'all' | 'reminders' | 'archived';

type ViewOption = {
  id: View;
  label: string;
};

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'all',
    label: 'All notes',
  },
  {
    id: 'reminders',
    label: 'Reminders',
  },
  {
    id: 'archived',
    label: 'Archived',
  },
];

@Component({
  selector: 'notes',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatPrefix,
    MatPseudoCheckbox,
    MatSuffix,
    NgOptimizedImage,
    NoteLabelTags,
    RouterLink,
    RouterOutlet,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Notes</div>
          <div class="text-neutral-a11 sm:text-lg">
            Quick notes, checklists and reminders for your day to day work.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="primary max-sm:icon-only"
            (click)="create()"
          >
            <mat-icon svgIcon="plus" />
            New note
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Search -->
        <mat-form-field class="w-full max-w-72">
          <mat-icon
            svgIcon="search"
            matIconPrefix
          />
          <input
            matInput
            placeholder="Search notes"
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

        <!-- Filters -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
        >
          <!-- View filter -->
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [value]="[view()]"
              (valueChange)="view.set($event[0] ?? view())"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="notes-view-filter"
              >
                <span class="font-medium">
                  View:
                  <span class="font-normal">{{ view().label }}</span>
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
                    aria-labelledby="notes-view-filter"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of viewOptions; track option.id) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.label"
                      >
                        <span class="flex-auto">{{ option.label }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Labels filter -->
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [(value)]="labelIds"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="notes-labels-filter"
              >
                <span class="font-medium">
                  Labels:
                  <span class="font-normal">{{ labelsLabel() }}</span>
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
                  <div
                    buiComboboxListbox
                    aria-labelledby="notes-labels-filter"
                    multi
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (label of labels; track label.id) {
                      <div
                        buiComboboxOption
                        [value]="label.id"
                        [label]="label.name"
                      >
                        <span
                          class="flex min-w-0 flex-auto items-center gap-x-2"
                        >
                          <div
                            class="size-2 shrink-0 rounded-full"
                            [class]="label.color"
                          ></div>
                          {{ label.name }}
                        </span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                  @if (labelIds().length) {
                    <mat-divider />
                    <button
                      matButton
                      class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                      (click)="labelIds.set([])"
                    >
                      <mat-icon svgIcon="x" />
                      Clear filter
                    </button>
                  }
                </div>
              </ng-template>
            </div>
          </div>

          @if (view() !== viewOptions[0] || labelIds().length) {
            <button
              matButton
              class="tertiary tiny"
              (click)="clearFilters()"
            >
              Clear all
            </button>
          }
        </div>

        @if (results().length) {
          <div class="flex flex-col gap-y-6 border-t border-neutral-a4 pt-3">
            @for (group of groups(); track group.label) {
              <div class="flex flex-col gap-y-3">
                @if (group.label) {
                  <div class="font-medium">{{ group.label }}</div>
                }
                <div class="@container">
                  <div
                    class="gap-4 space-y-4 @md:columns-2 @3xl:columns-3 @5xl:columns-4"
                  >
                    @for (note of group.notes; track note.id) {
                      <mat-card
                        class="flex cursor-pointer break-inside-avoid flex-col"
                        [routerLink]="note.id"
                      >
                        <mat-card-content class="flex flex-col gap-y-3">
                          @if (note.image) {
                            <div
                              class="relative aspect-video min-w-0 overflow-clip rounded-md"
                            >
                              <img
                                class="object-cover"
                                fill
                                [ngSrc]="note.image"
                                [alt]="note.title"
                              />
                            </div>
                          }
                          @if (note.title) {
                            <div class="font-medium">{{ note.title }}</div>
                          }
                          @if (note.content) {
                            <div class="line-clamp-3 whitespace-pre-line">
                              {{ note.content }}
                            </div>
                          }
                          @if (note.tasks.length) {
                            <div class="flex flex-col gap-y-1">
                              @for (task of note.tasks; track task.id) {
                                @if ($index < 3) {
                                  <div class="flex items-center gap-x-2">
                                    <mat-pseudo-checkbox
                                      [state]="
                                        task.completed ? 'checked' : 'unchecked'
                                      "
                                    />
                                    <div
                                      class="truncate"
                                      [class.text-neutral-a11]="task.completed"
                                      [class.line-through]="task.completed"
                                    >
                                      {{ task.content }}
                                    </div>
                                  </div>
                                }
                              }
                              @if (note.tasks.length > 3) {
                                <div class="text-sm text-neutral-a11">
                                  +{{ note.tasks.length - 3 }} more
                                </div>
                              }
                            </div>
                          }
                          @if (note.labelIds.length || note.reminder) {
                            <note-label-tags
                              [labels]="note.labelIds"
                              [reminder]="note.reminder"
                            />
                          }
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div
            class="flex flex-col items-center justify-center gap-y-2 border-t border-neutral-a4 py-10"
          >
            <mat-icon
              class="size-10"
              [svgIcon]="empty().icon"
            />
            <div class="text-center text-neutral-a11">
              {{ empty().text }}
            </div>
          </div>
        }
      </div>
    </div>

    <router-outlet />
  `,
})
export default class Notes {
  // Dependencies
  private notesService = inject(NotesService);
  private router = inject(Router);

  // State
  private viewOptions = VIEW_OPTIONS;
  private labels = NOTE_LABELS;
  private search = signal('');
  private view = signal(VIEW_OPTIONS[0]);
  private labelIds = signal<NoteLabelId[]>([]);

  // Computed state
  private results = computed(() => {
    const search = this.search().trim().toLowerCase();
    const view = this.view().id;
    const labelIds = this.labelIds();

    return this.notesService
      .notes()
      .filter(
        (note) =>
          note.archived === (view === 'archived') &&
          (view !== 'reminders' || !!note.reminder) &&
          (!search ||
            [
              note.title,
              note.content,
              ...note.tasks.map((task) => task.content),
            ]
              .join(' ')
              .toLowerCase()
              .includes(search)) &&
          (!labelIds.length ||
            labelIds.some((id) => note.labelIds.includes(id)))
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });
  private groups = computed(() => {
    const results = this.results();
    const pinned = results.filter((note) => note.pinned);
    const others = results.filter((note) => !note.pinned);

    return pinned.length
      ? [
          { label: 'Pinned', notes: pinned },
          { label: 'Others', notes: others },
        ].filter((group) => group.notes.length)
      : [{ label: '', notes: results }];
  });
  private labelsLabel = computed(() => {
    const labelIds = this.labelIds();

    if (labelIds.length > 1) {
      return `${labelIds.length} selected`;
    }

    return this.labels.find((label) => label.id === labelIds[0])?.name ?? 'Any';
  });
  private empty = computed(() => {
    if (this.search() || this.labelIds().length) {
      return { icon: 'search', text: 'No notes match this view.' };
    }

    if (this.view().id === 'archived') {
      return { icon: 'archive', text: 'No archived notes.' };
    }

    if (this.view().id === 'reminders') {
      return { icon: 'bell', text: 'No notes with reminders.' };
    }

    return { icon: 'sticky-note', text: 'No notes yet.' };
  });

  private create() {
    this.router.navigate(['/notes', this.notesService.create()]);
  }

  private clearFilters() {
    this.view.set(VIEW_OPTIONS[0]);
    this.labelIds.set([]);
  }
}
