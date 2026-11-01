import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPseudoCheckbox } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerToggle,
} from '@angular/material/timepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import {
  differenceInMinutes,
  formatDistanceToNowStrict,
  getHours,
  getMinutes,
  isValid,
  set,
  startOfTomorrow,
} from 'date-fns';
import {
  NOTE_LABELS,
  NotesService,
} from '@/app/domains/admin/modules/notes/data/notes';
import { NoteLabelTags } from '@/app/domains/admin/modules/notes/ui/tags';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@/app/ui/dialog';
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
} from '@/app/ui/popover';

@Component({
  selector: 'note',
  imports: [
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
    BuiPopover,
    BuiPopoverClose,
    BuiPopoverContent,
    BuiPopoverPortal,
    BuiPopoverTrigger,
    CdkTextareaAutosize,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormFieldModule,
    MatIcon,
    MatIconButton,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPseudoCheckbox,
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerToggle,
    MatTooltip,
    NgOptimizedImage,
    NoteLabelTags,
  ],
  host: {
    class: 'hidden size-0 opacity-0',
  },
  template: `
    <div
      buiDialog
      class="w-full max-w-lg"
      [(open)]="open"
      (closed)="handleClose()"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div
          buiDialogContent
          class="max-w-none"
        >
          @if (note(); as note) {
            <!-- Header -->
            <div
              buiDialogHeader
              class="flex-row items-center gap-x-0.5"
            >
              <input
                buiDialogTitle
                class="min-w-0 flex-auto bg-transparent outline-none"
                aria-label="Title"
                placeholder="Title"
                [ngModel]="note.title"
                (ngModelChange)="
                  notesService.update(note.id, { title: $event })
                "
              />
              <button
                matIconButton
                class="small"
                [matTooltip]="note.pinned ? 'Unpin' : 'Pin'"
                (click)="notesService.pin(note.id, !note.pinned)"
              >
                <mat-icon [svgIcon]="note.pinned ? 'pin-off' : 'pin'" />
              </button>
              <button
                matIconButton
                buiDialogClose
                class="small"
                matTooltip="Close"
              >
                <mat-icon svgIcon="x" />
              </button>
            </div>

            <!-- Body -->
            <div
              buiDialogBody
              class="flex flex-col gap-y-4"
            >
              @if (note.image) {
                <div
                  class="relative aspect-video shrink-0 overflow-clip rounded-md"
                >
                  <img
                    class="object-cover"
                    fill
                    [ngSrc]="note.image"
                    [alt]="note.title"
                  />
                  <button
                    matButton
                    class="small absolute end-2 top-2"
                    matTooltip="Remove image"
                    (click)="notesService.update(note.id, { image: null })"
                  >
                    <mat-icon svgIcon="image-minus" />
                  </button>
                </div>
              }

              <textarea
                class="resize-none bg-transparent outline-none"
                cdkTextareaAutosize
                aria-label="Note"
                placeholder="Take a note"
                [ngModel]="note.content"
                (ngModelChange)="
                  notesService.update(note.id, { content: $event })
                "
              ></textarea>

              <!-- Checklist -->
              @if (note.tasks.length) {
                <div class="flex flex-col gap-y-1.5">
                  @for (task of note.tasks; track task.id) {
                    <div class="flex items-center gap-x-1">
                      <mat-checkbox
                        [checked]="task.completed"
                        (change)="
                          notesService.updateTask(note.id, task.id, {
                            completed: $event.checked,
                          })
                        "
                      />
                      <input
                        class="min-w-0 flex-auto bg-transparent outline-none"
                        aria-label="List item"
                        placeholder="List item"
                        [class.text-neutral-a11]="task.completed"
                        [class.line-through]="task.completed"
                        [ngModel]="task.content"
                        (ngModelChange)="
                          notesService.updateTask(note.id, task.id, {
                            content: $event,
                          })
                        "
                      />
                      <button
                        matIconButton
                        class="tiny"
                        matTooltip="Remove item"
                        (click)="notesService.removeTask(note.id, task.id)"
                      >
                        <mat-icon svgIcon="x" />
                      </button>
                    </div>
                  }
                  <button
                    matButton
                    class="link ms-0.5 self-start"
                    (click)="notesService.addTask(note.id)"
                  >
                    <mat-icon svgIcon="plus" />
                    Add item
                  </button>
                </div>
              }

              <!-- Reminder -->
              @if (note.reminder) {
                <div class="flex gap-x-4">
                  <mat-form-field class="flex-auto">
                    <mat-label>Reminder</mat-label>
                    <input
                      matInput
                      [matDatepicker]="reminderDatePicker"
                      [ngModel]="note.reminder"
                      (ngModelChange)="
                        setReminder(note.id, $event, note.reminder)
                      "
                    />
                    <mat-datepicker-toggle
                      [for]="reminderDatePicker"
                      matIconSuffix
                    />
                    <mat-datepicker #reminderDatePicker />
                  </mat-form-field>

                  <mat-form-field class="w-36">
                    <mat-label>Time</mat-label>
                    <input
                      matInput
                      [matTimepicker]="reminderTimePicker"
                      [ngModel]="note.reminder"
                      (ngModelChange)="setReminder(note.id, $event)"
                    />
                    <mat-timepicker-toggle
                      [for]="reminderTimePicker"
                      matIconSuffix
                    />
                    <mat-timepicker #reminderTimePicker />
                  </mat-form-field>
                </div>
              }

              @if (note.labelIds.length) {
                <note-label-tags [labels]="note.labelIds" />
              }
            </div>

            <!-- Footer -->
            <div
              buiDialogFooter
              class="justify-start gap-x-0.5"
            >
              <button
                matIconButton
                class="small"
                matTooltip="Labels"
                [matMenuTriggerFor]="labelMenu"
              >
                <mat-icon svgIcon="tag" />
              </button>
              @if (note.tasks.length) {
                <div
                  buiPopover
                  position="top-start"
                >
                  <button
                    matIconButton
                    buiPopoverTrigger
                    class="small"
                    matTooltip="Remove checklist"
                  >
                    <mat-icon svgIcon="list-x" />
                  </button>
                  <ng-template buiPopoverPortal>
                    <div
                      buiPopoverContent
                      class="[--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"
                    >
                      <div class="font-medium">Remove checklist?</div>
                      <div class="text-neutral-a11">
                        This removes all items from this note.
                      </div>
                      <div class="mt-3 flex items-center justify-end gap-x-1.5">
                        <button
                          matButton
                          buiPopoverClose
                          class="tertiary small"
                        >
                          Cancel
                        </button>
                        <button
                          matButton
                          class="primary destructive small"
                          (click)="notesService.update(note.id, { tasks: [] })"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </ng-template>
                </div>
              } @else {
                <button
                  matIconButton
                  class="small"
                  matTooltip="Add checklist"
                  (click)="notesService.addTask(note.id)"
                >
                  <mat-icon svgIcon="list-checks" />
                </button>
              }
              @if (note.reminder) {
                <div
                  buiPopover
                  position="top-start"
                >
                  <button
                    matIconButton
                    buiPopoverTrigger
                    class="small"
                    matTooltip="Remove reminder"
                  >
                    <mat-icon svgIcon="bell-off" />
                  </button>
                  <ng-template buiPopoverPortal>
                    <div
                      buiPopoverContent
                      class="[--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"
                    >
                      <div class="font-medium">Remove reminder?</div>
                      <div class="text-neutral-a11">
                        This removes the reminder from this note.
                      </div>
                      <div class="mt-3 flex items-center justify-end gap-x-1.5">
                        <button
                          matButton
                          buiPopoverClose
                          class="tertiary small"
                        >
                          Cancel
                        </button>
                        <button
                          matButton
                          class="primary destructive small"
                          (click)="
                            notesService.update(note.id, { reminder: null })
                          "
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </ng-template>
                </div>
              } @else {
                <button
                  matIconButton
                  class="small"
                  matTooltip="Add reminder"
                  (click)="addReminder(note.id)"
                >
                  <mat-icon svgIcon="bell-plus" />
                </button>
              }
              <button
                matIconButton
                class="small"
                [matTooltip]="note.archived ? 'Unarchive' : 'Archive'"
                (click)="notesService.archive(note.id, !note.archived)"
              >
                <mat-icon
                  [svgIcon]="note.archived ? 'archive-restore' : 'archive'"
                />
              </button>
              <button
                matIconButton
                class="small"
                matTooltip="Delete"
                (click)="notesService.delete(note.id)"
              >
                <mat-icon svgIcon="trash" />
              </button>
              <div class="ms-auto text-sm text-neutral-a11">
                Edited {{ relativeDate(note.updatedAt) }}
              </div>
            </div>

            <mat-menu #labelMenu>
              @for (label of labels; track label.id) {
                <button
                  mat-menu-item
                  (click)="notesService.toggleLabel(note.id, label.id)"
                >
                  <mat-pseudo-checkbox
                    appearance="minimal"
                    [state]="
                      note.labelIds.includes(label.id) ? 'checked' : 'unchecked'
                    "
                  />
                  <span class="ms-1">{{ label.name }}</span>
                </button>
              }
            </mat-menu>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export default class NoteDialog {
  // Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notesService = inject(NotesService);

  // Inputs / Outputs
  readonly id = input.required<string>();

  // State
  private open = signal(false);
  private labels = NOTE_LABELS;

  // Computed state
  private note = computed(() => this.notesService.byId(this.id()));

  constructor() {
    afterNextRender(() => {
      this.open.set(true);
    });

    effect(() => {
      if (!this.note()) {
        this.handleClose();
      }
    });
  }

  private relativeDate(date: string) {
    return differenceInMinutes(new Date(), date) < 1
      ? 'just now'
      : formatDistanceToNowStrict(date, { addSuffix: true });
  }

  private addReminder(id: string) {
    this.notesService.update(id, {
      reminder: set(startOfTomorrow(), { hours: 9 }).toISOString(),
    });
  }

  private setReminder(id: string, date: Date | null, time?: string) {
    if (date && isValid(date)) {
      this.notesService.update(id, {
        reminder: (time
          ? set(date, { hours: getHours(time), minutes: getMinutes(time) })
          : date
        ).toISOString(),
      });
    }
  }

  private handleClose() {
    const note = this.note();

    if (
      note &&
      !note.title &&
      !note.content &&
      !note.tasks.length &&
      !note.labelIds.length &&
      !note.reminder
    ) {
      this.notesService.delete(note.id);
    }

    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
