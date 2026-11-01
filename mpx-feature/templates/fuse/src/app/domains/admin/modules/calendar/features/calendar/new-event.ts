import { Component, model, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerToggle,
} from '@angular/material/timepicker';
import { addHours, startOfHour } from 'date-fns';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogDescription,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@/app/ui/dialog';

@Component({
  selector: 'calendar-new-event',
  imports: [
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogDescription,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
    FormField,
    FormRoot,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormFieldModule,
    MatInput,
    MatSlideToggle,
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerToggle,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-lg"
      [(open)]="open"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="newEventForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>New event</div>
            <div buiDialogDescription>
              Schedule a meeting, review or any other team event.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <mat-form-field class="w-full">
              <mat-label>Title</mat-label>
              <input
                matInput
                [formField]="newEventForm.title"
              />
              <mat-error>
                @for (error of newEventForm.title().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <mat-slide-toggle [formField]="newEventForm.allDay">
              All day
            </mat-slide-toggle>

            <div class="flex gap-x-4">
              <mat-form-field class="flex-auto">
                <mat-label>Start</mat-label>
                <input
                  matInput
                  [matDatepicker]="startDatePicker"
                  [formField]="newEventForm.startDate"
                />
                <mat-datepicker-toggle
                  [for]="startDatePicker"
                  matIconSuffix
                />
                <mat-datepicker #startDatePicker />
              </mat-form-field>

              @if (!newEventFormModel().allDay) {
                <mat-form-field class="w-36">
                  <mat-label>Time</mat-label>
                  <input
                    matInput
                    [matTimepicker]="startTimePicker"
                    [formField]="newEventForm.startTime"
                  />
                  <mat-timepicker-toggle
                    [for]="startTimePicker"
                    matIconSuffix
                  />
                  <mat-timepicker #startTimePicker />
                </mat-form-field>
              }
            </div>

            <div class="flex gap-x-4">
              <mat-form-field class="flex-auto">
                <mat-label>End</mat-label>
                <input
                  matInput
                  [matDatepicker]="endDatePicker"
                  [formField]="newEventForm.endDate"
                />
                <mat-datepicker-toggle
                  [for]="endDatePicker"
                  matIconSuffix
                />
                <mat-datepicker #endDatePicker />
              </mat-form-field>

              @if (!newEventFormModel().allDay) {
                <mat-form-field class="w-36">
                  <mat-label>Time</mat-label>
                  <input
                    matInput
                    [matTimepicker]="endTimePicker"
                    [formField]="newEventForm.endTime"
                  />
                  <mat-timepicker-toggle
                    [for]="endTimePicker"
                    matIconSuffix
                  />
                  <mat-timepicker #endTimePicker />
                </mat-form-field>
              }
            </div>

            <mat-form-field class="w-full">
              <mat-label>Location</mat-label>
              <input
                matInput
                [formField]="newEventForm.location"
              />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="newEventForm.description"
              ></textarea>
            </mat-form-field>
          </div>

          <!-- Footer -->
          <div buiDialogFooter>
            <button
              matButton
              type="button"
              buiDialogClose
            >
              Cancel
            </button>
            <button
              matButton
              type="submit"
              class="primary"
            >
              Create
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class CalendarNewEvent {
  // Inputs / Outputs
  readonly open = model(false);

  // Forms
  private newEventFormModel = signal(this.defaults());
  private newEventForm = form(
    this.newEventFormModel,
    (schema) => {
      required(schema.title, { message: 'Title is required!' });
    },
    {
      submission: {
        action: async (field) => {
          field().reset(this.defaults());
          this.open.set(false);
        },
      },
    }
  );

  private defaults() {
    const start = startOfHour(addHours(new Date(), 1));

    return {
      title: '',
      allDay: false,
      startDate: start,
      startTime: start,
      endDate: addHours(start, 1),
      endTime: addHours(start, 1),
      location: '',
      description: '',
    };
  }
}
