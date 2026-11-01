import { Component, model, signal } from '@angular/core';
import {
  applyEach,
  email,
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { MemberRole } from '@/app/domains/admin/modules/members/data/members';
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
  selector: 'members-invite-members',
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
    MatDivider,
    MatFormFieldModule,
    MatIcon,
    MatIconButton,
    MatInput,
    MatOption,
    MatSelect,
    MatTooltip,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-lg"
      [(open)]="open"
      [autoFocus]="undefined"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <form
          buiDialogContent
          class="max-w-none"
          [formRoot]="inviteMembersForm"
        >
          <!-- Header -->
          <div buiDialogHeader>
            <div buiDialogTitle>Invite members</div>
            <div buiDialogDescription>
              Add the people you want to invite and pick a role for each.
            </div>
          </div>

          <!-- Body -->
          <div
            buiDialogBody
            class="flex flex-col gap-y-5"
          >
            <!-- Invites -->
            <div class="flex flex-col gap-y-4">
              <div class="flex flex-col gap-y-3">
                @for (
                  invite of inviteMembersForm.invites;
                  track invite;
                  let index = $index
                ) {
                  <div class="flex items-start gap-x-3">
                    <mat-form-field class="flex-auto">
                      <input
                        matInput
                        type="email"
                        placeholder="name@example.com"
                        [formField]="invite.email"
                      />
                      <mat-error>
                        @for (error of invite.email().errors(); track error) {
                          {{ error.message }}
                        }
                      </mat-error>
                    </mat-form-field>

                    <!-- Role selection -->
                    <mat-form-field class="w-32">
                      <mat-select [formField]="invite.role">
                        <mat-option value="owner">Owner</mat-option>
                        <mat-option value="admin">Admin</mat-option>
                        <mat-option value="member">Member</mat-option>
                      </mat-select>
                    </mat-form-field>

                    @if (inviteMembersForm.invites.length > 1) {
                      <button
                        matIconButton
                        type="button"
                        (click)="removeInvite(index)"
                      >
                        <mat-icon svgIcon="x" />
                      </button>
                    }
                  </div>
                }
              </div>

              <button
                matButton
                type="button"
                class="link small self-start"
                (click)="addInvite()"
              >
                <mat-icon svgIcon="plus" />
                Add another
              </button>
            </div>

            <mat-divider />

            <!-- Invitation link -->
            <div class="flex flex-col">
              <div class="text-lg font-medium">Or share an invitation link</div>
              <div class="mt-0.5 text-neutral-a11">
                Anyone who opens it joins the workspace as a member.
              </div>
              <mat-form-field class="mt-3 w-full">
                <input
                  matInput
                  type="text"
                  readonly
                  [value]="invitationLink"
                />
                <button
                  matIconButton
                  matIconSuffix
                  type="button"
                  matTooltip="Copy to clipboard"
                >
                  <mat-icon svgIcon="copy" />
                </button>
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
              Send invites
            </button>
          </div>
        </form>
      </ng-template>
    </div>
  `,
})
export class MembersInviteMembers {
  // Inputs / Outputs
  readonly open = model(false);

  // State
  private invitationLink = 'https://fuse.example.com/join/8f3k2';

  // Forms
  private inviteMembersFormModel = signal(this.defaults());
  private inviteMembersForm = form(
    this.inviteMembersFormModel,
    (schema) => {
      applyEach(schema.invites, (invite) => {
        required(invite.email, {
          message: 'Email is required!',
          when: ({ pathKeys }) => pathKeys()[1] === '0',
        });
        email(invite.email, { message: 'Please enter a valid email address.' });
      });
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

  private addInvite() {
    this.inviteMembersFormModel.update((model) => ({
      invites: [...model.invites, this.invite()],
    }));
  }

  private removeInvite(index: number) {
    this.inviteMembersFormModel.update((model) => ({
      invites: model.invites.filter((_, i) => i !== index),
    }));
  }

  private invite() {
    return {
      email: '',
      role: 'member' as MemberRole,
    };
  }

  private defaults() {
    return {
      invites: [this.invite()],
    };
  }
}
