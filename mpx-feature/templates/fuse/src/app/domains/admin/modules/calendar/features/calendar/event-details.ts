import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { EventApi } from 'fullcalendar';
import { CalendarService } from '@/app/domains/admin/modules/calendar/data/calendar';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import {
  Project,
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
  selector: 'calendar-event-details',
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
    DatePipe,
    MatButton,
    MatIcon,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    <div
      buiDialog
      class="w-full max-w-lg"
      [open]="!!entry()"
      (closed)="entry.set(null)"
    >
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div
          buiDialogContent
          class="max-w-none"
        >
          @if (entry(); as entry) {
            @if (entry.extendedProps['kind'] === 'milestone') {
              @if (
                projectsService.byId(entry.extendedProps['projectId']);
                as project
              ) {
                <!-- Header -->
                <div buiDialogHeader>
                  <div buiDialogTitle>{{ entry.title }}</div>
                  <div buiDialogDescription>
                    Due {{ entry.start | date: 'MMMM d, y' }}
                  </div>
                </div>

                <!-- Body -->
                <div
                  buiDialogBody
                  class="flex flex-col"
                >
                  <div
                    class="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3"
                  >
                    <div class="text-neutral-a11">Project</div>
                    <div>
                      <a
                        class="hover:underline"
                        [routerLink]="['/projects', project.id]"
                      >
                        {{ project.name }}
                      </a>
                    </div>

                    <div class="text-neutral-a11">State</div>
                    <div
                      class="inline-flex items-center gap-x-1.5 text-sm leading-5"
                    >
                      @switch (milestoneState(project, entry.id)) {
                        @case ('done') {
                          <mat-icon
                            class="size-4 shrink-0 text-jade-11"
                            svgIcon="circle-check"
                          />
                          Done
                        }
                        @case ('current') {
                          <mat-icon
                            class="size-4 shrink-0 text-blue-11"
                            svgIcon="circle-dot"
                          />
                          Current
                        }
                        @default {
                          <mat-icon
                            class="size-4 shrink-0 text-neutral-a8"
                            svgIcon="circle-dashed"
                          />
                          Upcoming
                        }
                      }
                    </div>
                  </div>
                </div>
              }
            } @else {
              @if (calendarService.byId(entry.id); as event) {
                <!-- Header -->
                <div buiDialogHeader>
                  <div buiDialogTitle>{{ entry.title }}</div>
                  <div buiDialogDescription>
                    {{ entry.start | date: 'EEEE, MMMM d, h:mm a' }} to
                    {{ entry.end | date: 'h:mm a' }}
                  </div>
                </div>

                <!-- Body -->
                <div
                  buiDialogBody
                  class="flex flex-col gap-y-6"
                >
                  <div>{{ event.description }}</div>

                  <div
                    class="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3"
                  >
                    <div class="text-neutral-a11">Location</div>
                    <div>{{ event.location }}</div>

                    <div class="text-neutral-a11">Attendees</div>
                    <div class="flex items-center -space-x-1">
                      @for (id of event.attendees; track id) {
                        @if (membersService.byId(id); as member) {
                          <img
                            class="rounded-full object-cover ring-2 ring-white outline -outline-offset-1 outline-black-a3 dark:ring-neutral-3 dark:outline-white-a3"
                            width="24"
                            height="24"
                            [ngSrc]="member.photo"
                            [alt]="member.name"
                            [matTooltip]="member.name"
                          />
                        }
                      }
                    </div>
                  </div>
                </div>
              }
            }

            <!-- Footer -->
            <div buiDialogFooter>
              <button
                matButton
                type="button"
                buiDialogClose
              >
                Close
              </button>
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export class CalendarEventDetails {
  // Dependencies
  private calendarService = inject(CalendarService);
  private membersService = inject(MembersService);
  private projectsService = inject(ProjectsService);

  // Inputs / Outputs
  readonly entry = model<EventApi | null>(null);

  private milestoneState(project: Project, id: string) {
    return project.milestones.find((milestone) => milestone.id === id)?.state;
  }
}
