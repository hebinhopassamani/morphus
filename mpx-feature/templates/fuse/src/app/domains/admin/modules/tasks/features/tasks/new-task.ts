import { Component, computed, inject, model, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  ProjectPriority,
  ProjectsService,
} from '@/app/domains/admin/modules/projects/data/projects';
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
  selector: 'tasks-new-task',
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
    MatOption,
    MatSelect,
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
          [formRoot]="newTaskForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>New task</div>
            <div buiDialogDescription>
              Describe the work, pick a project and set who owns it.
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
                [formField]="newTaskForm.title"
              />
              <mat-error>
                @for (error of newTaskForm.title().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="newTaskForm.description"
              ></textarea>
            </mat-form-field>

            <div class="grid grid-cols-2 gap-4">
              <mat-form-field class="w-full">
                <mat-label>Project</mat-label>
                <mat-select [formField]="newTaskForm.project">
                  @for (project of projects(); track project.id) {
                    <mat-option [value]="project.id">
                      {{ project.name }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Assignee</mat-label>
                <mat-select [formField]="newTaskForm.assignee">
                  @for (assignee of assignees(); track assignee.name) {
                    <mat-option [value]="assignee">
                      {{ assignee.name }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Priority</mat-label>
                <mat-select [formField]="newTaskForm.priority">
                  @for (priority of priorities; track priority.value) {
                    <mat-option [value]="priority.value">
                      {{ priority.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Due date</mat-label>
                <input
                  matInput
                  [matDatepicker]="dueDatePicker"
                  [formField]="newTaskForm.dueDate"
                />
                <mat-datepicker-toggle
                  [for]="dueDatePicker"
                  matIconSuffix
                />
                <mat-datepicker #dueDatePicker />
                <mat-error>
                  @for (error of newTaskForm.dueDate().errors(); track error) {
                    {{ error.message }}
                  }
                </mat-error>
              </mat-form-field>
            </div>
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
export class TasksNewTask {
  // Dependencies
  private projectsService = inject(ProjectsService);

  // Inputs / Outputs
  readonly open = model(false);

  // State
  private projects = this.projectsService.projects;
  private priorities: { value: ProjectPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  // Computed state
  private assignees = computed(() => [
    ...new Map(
      this.projects()
        .flatMap((project) => project.members)
        .map((member) => [member.name, member])
    ).values(),
  ]);

  // Forms
  private newTaskFormModel = signal(this.defaults());
  private newTaskForm = form(
    this.newTaskFormModel,
    (schema) => {
      required(schema.title, { message: 'Title is required!' });
      required(schema.dueDate, { message: 'Due date is required!' });
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
    return {
      title: '',
      description: '',
      project: this.projects()[0].id,
      assignee: this.assignees()[0],
      priority: 'medium' as ProjectPriority,
      dueDate: null as Date | null,
    };
  }
}
