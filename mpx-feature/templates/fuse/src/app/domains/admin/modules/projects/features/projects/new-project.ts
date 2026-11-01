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
  ProjectStatus,
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
  selector: 'projects-new-project',
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
          [formRoot]="newProjectForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>New project</div>
            <div buiDialogDescription>
              Give the project a name, an owner and a target date.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-4"
          >
            <mat-form-field class="w-full">
              <mat-label>Name</mat-label>
              <input
                matInput
                [formField]="newProjectForm.name"
              />
              <mat-error>
                @for (error of newProjectForm.name().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="newProjectForm.description"
              ></textarea>
            </mat-form-field>

            <div class="grid grid-cols-2 gap-4">
              <mat-form-field class="w-full">
                <mat-label>Status</mat-label>
                <mat-select [formField]="newProjectForm.status">
                  @for (status of statuses; track status.value) {
                    <mat-option [value]="status.value">
                      {{ status.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Priority</mat-label>
                <mat-select [formField]="newProjectForm.priority">
                  @for (priority of priorities; track priority.value) {
                    <mat-option [value]="priority.value">
                      {{ priority.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Lead</mat-label>
                <mat-select [formField]="newProjectForm.lead">
                  @for (lead of leads(); track lead.name) {
                    <mat-option [value]="lead">{{ lead.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Target date</mat-label>
                <input
                  matInput
                  [matDatepicker]="targetDatePicker"
                  [formField]="newProjectForm.targetDate"
                />
                <mat-datepicker-toggle
                  [for]="targetDatePicker"
                  matIconSuffix
                />
                <mat-datepicker #targetDatePicker />
                <mat-error>
                  @for (
                    error of newProjectForm.targetDate().errors();
                    track error
                  ) {
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
export class ProjectsNewProject {
  // Dependencies
  private projectsService = inject(ProjectsService);

  // Inputs / Outputs
  readonly open = model(false);

  // State
  private statuses: { value: ProjectStatus; label: string }[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'planned', label: 'Planned' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];
  private priorities: { value: ProjectPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  // Computed state
  private leads = computed(() => [
    ...new Map(
      this.projectsService
        .projects()
        .map((project) => [project.lead.name, project.lead])
    ).values(),
  ]);

  // Forms
  private newProjectFormModel = signal(this.defaults());
  private newProjectForm = form(
    this.newProjectFormModel,
    (schema) => {
      required(schema.name, { message: 'Name is required!' });
      required(schema.targetDate, { message: 'Target date is required!' });
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
      name: '',
      description: '',
      status: 'backlog' as ProjectStatus,
      priority: 'medium' as ProjectPriority,
      lead: this.leads()[0],
      targetDate: null as Date | null,
    };
  }
}
