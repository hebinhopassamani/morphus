import { Component, inject, model, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
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
  selector: 'teams-new-team',
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
          [formRoot]="newTeamForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>New team</div>
            <div buiDialogDescription>
              Give the team a name, a color and a lead.
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
                [formField]="newTeamForm.name"
              />
              <mat-error>
                @for (error of newTeamForm.name().errors(); track error) {
                  {{ error.message }}
                }
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="newTeamForm.description"
              ></textarea>
            </mat-form-field>

            <div class="grid grid-cols-2 gap-4">
              <mat-form-field class="w-full">
                <mat-label>Color</mat-label>
                <mat-select [formField]="newTeamForm.colorClass">
                  @for (color of colors; track color.value) {
                    <mat-option [value]="color.value">
                      <div class="flex items-center gap-x-2">
                        <div
                          class="size-2.5 shrink-0 rounded-full"
                          [class]="color.value"
                        ></div>
                        {{ color.label }}
                      </div>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="w-full">
                <mat-label>Lead</mat-label>
                <mat-select [formField]="newTeamForm.leadId">
                  @for (member of members(); track member.id) {
                    <mat-option [value]="member.id">
                      {{ member.name }}
                    </mat-option>
                  }
                </mat-select>
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
export class TeamsNewTeam {
  // Dependencies
  private membersService = inject(MembersService);

  // Inputs / Outputs
  readonly open = model(false);

  // State
  private members = this.membersService.members;
  private colors: { value: string; label: string }[] = [
    { value: 'bg-sky-9', label: 'Sky' },
    { value: 'bg-crimson-9', label: 'Crimson' },
    { value: 'bg-violet-9', label: 'Violet' },
    { value: 'bg-jade-9', label: 'Jade' },
    { value: 'bg-amber-9', label: 'Amber' },
    { value: 'bg-orange-9', label: 'Orange' },
    { value: 'bg-iris-9', label: 'Iris' },
  ];

  // Forms
  private newTeamFormModel = signal(this.defaults());
  private newTeamForm = form(
    this.newTeamFormModel,
    (schema) => {
      required(schema.name, { message: 'Name is required!' });
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
      colorClass: this.colors[0].value,
      leadId: this.members()[0].id,
    };
  }
}
