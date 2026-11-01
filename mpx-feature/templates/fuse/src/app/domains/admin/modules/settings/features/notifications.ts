import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'settings-notifications',
  imports: [MatCheckbox, MatDivider],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div class="flex flex-auto flex-col gap-y-10">
      <!-- Activity -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Activity</div>
          <div class="text-neutral-a11">
            When teammates reach out to you directly.
          </div>
        </div>

        <div class="flex flex-col gap-6 sm:col-span-2">
          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">Conversations</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Mentions</div>
                <div class="text-sm text-neutral-a11">
                  Someone mentions you in a comment or an update.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Direct messages</div>
                <div class="text-sm text-neutral-a11">
                  A teammate messages you directly.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>Comments</div>
                <div class="text-sm text-neutral-a11">
                  Someone replies to a thread you started or joined.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>Reactions</div>
                <div class="text-sm text-neutral-a11">
                  Someone reacts to a comment or an update you posted.
                </div>
              </mat-checkbox>
            </div>
          </div>

          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">Tasks</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>Assignments</div>
                <div class="text-sm text-neutral-a11">
                  A task or a project is assigned to you.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Review requests</div>
                <div class="text-sm text-neutral-a11">
                  Someone asks you to review a task before it is closed.
                </div>
              </mat-checkbox>
            </div>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Projects -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Projects</div>
          <div class="text-neutral-a11">
            Changes to the projects you lead or follow.
          </div>
        </div>

        <div class="flex flex-col gap-6 sm:col-span-2">
          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">Progress</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>Status changes</div>
                <div class="text-sm text-neutral-a11">
                  A project moves to a new status or its health changes.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Milestones</div>
                <div class="text-sm text-neutral-a11">
                  A milestone is reached or its target date moves.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Due dates</div>
                <div class="text-sm text-neutral-a11">
                  A milestone or a task is due within the next two days.
                </div>
              </mat-checkbox>
            </div>
          </div>

          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">People</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>New members</div>
                <div class="text-sm text-neutral-a11">
                  Someone joins a project you are part of.
                </div>
              </mat-checkbox>
            </div>
          </div>

          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">Files</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Shared with you</div>
                <div class="text-sm text-neutral-a11">
                  Someone gives you access to a file or a folder.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>New versions</div>
                <div class="text-sm text-neutral-a11">
                  Someone uploads a new version of a file you follow.
                </div>
              </mat-checkbox>
            </div>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <mat-divider />

      <!-- Email digests -->
      <section class="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-lg font-semibold">Email digests</div>
          <div class="text-neutral-a11">
            A recap of the workspace sent to your inbox.
          </div>
        </div>

        <div class="flex flex-col gap-6 sm:col-span-2">
          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">Summaries</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
              >
                <div>Daily summary</div>
                <div class="text-sm text-neutral-a11">
                  What changed in your projects since yesterday.
                </div>
              </mat-checkbox>

              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Weekly report</div>
                <div class="text-sm text-neutral-a11">
                  Progress, shipped work and upcoming deadlines every Monday.
                </div>
              </mat-checkbox>
            </div>
          </div>

          <!-- Group -->
          <div class="flex flex-col">
            <div class="font-medium">Product news</div>
            <div class="mt-3 flex flex-col gap-y-4">
              <!-- Option -->
              <mat-checkbox
                class="[&_.mdc-checkbox]:mt-0.5 [&>.mdc-form-field]:items-start"
                checked
              >
                <div>Product updates</div>
                <div class="text-sm text-neutral-a11">
                  New features and improvements to the app.
                </div>
              </mat-checkbox>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export default class SettingsNotifications {}
