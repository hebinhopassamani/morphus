import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  ProjectHealth,
  ProjectStatus,
} from '@/app/domains/admin/modules/projects/data/projects';

@Component({
  selector: 'project-status-pill',
  imports: [MatIcon],
  host: {
    class: 'flex flex-auto',
  },
  template: `
    <div class="inline-flex items-center gap-x-1.5 text-sm leading-5">
      @switch (status()) {
        @case ('in-progress') {
          <mat-icon
            class="size-4 shrink-0 text-jade-a10"
            svgIcon="circle-dot"
          />
          <div>In progress</div>
        }
        @case ('planned') {
          <mat-icon
            class="size-4 shrink-0 text-blue-a10"
            svgIcon="circle"
          />
          <div>Planned</div>
        }
        @case ('paused') {
          <mat-icon
            class="size-4 shrink-0 text-amber-a10"
            svgIcon="circle-pause"
          />
          <div>Paused</div>
        }
        @case ('completed') {
          <mat-icon
            class="size-4 shrink-0 text-violet-a10"
            svgIcon="circle-check"
          />
          <div>Completed</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-neutral-a9"
            svgIcon="circle-dashed"
          />
          <div>Backlog</div>
        }
      }
    </div>
  `,
})
export class ProjectStatusPill {
  // Inputs / Outputs
  readonly status = input.required<ProjectStatus>();
}

@Component({
  selector: 'project-health-pill',
  imports: [MatIcon],
  host: {
    class: 'flex flex-auto',
  },
  template: `
    <div class="inline-flex items-center gap-x-1.5 text-sm leading-5">
      @switch (health()) {
        @case ('at-risk') {
          <mat-icon
            class="size-4 shrink-0 text-amber-a10"
            svgIcon="circle-alert"
          />
          <div>At risk</div>
        }
        @case ('off-track') {
          <mat-icon
            class="size-4 shrink-0 text-red-a10"
            svgIcon="circle-x"
          />
          <div>Off track</div>
        }
        @default {
          <mat-icon
            class="size-4 shrink-0 text-jade-a10"
            svgIcon="shield-check"
          />
          <div>On track</div>
        }
      }
    </div>
  `,
})
export class ProjectHealthPill {
  // Inputs / Outputs
  readonly health = input.required<ProjectHealth>();
}
