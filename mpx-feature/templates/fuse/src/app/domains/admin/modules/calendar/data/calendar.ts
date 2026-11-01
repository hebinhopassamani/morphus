import { computed, inject, Service, signal } from '@angular/core';
import { add, format, intervalToDuration, startOfWeek } from 'date-fns';
import { EventInput } from 'fullcalendar';
import { ProjectsService } from '@/app/domains/admin/modules/projects/data/projects';
import { TasksService } from '@/app/domains/admin/modules/tasks/data/tasks';

export type EventRecurrence = {
  freq: string;
  byweekday: string[];
};

export type CalendarEvent = {
  id: string;
  start: string;
  end: string;
  allDay: boolean;
  title: string;
  description: string;
  location: string;
  attendees: string[];
  recurrence: EventRecurrence | null;
};

export type CalendarEntryKind = 'milestone' | 'task' | 'event';

export type CalendarEntry = EventInput & {
  id: string;
  kind: CalendarEntryKind;
  projectId?: string;
};

const week = startOfWeek(new Date(), { weekStartsOn: 1 });

// Floating local time keeps recurring weekdays stable across time zones
const at = (day: number, time: string) =>
  `${format(add(week, { days: day }), 'yyyy-MM-dd')}T${time}`;

const EVENTS: CalendarEvent[] = [
  {
    id: 'daily-standup',
    start: at(-28, '09:30'),
    end: at(-28, '09:45'),
    allDay: false,
    title: 'Daily standup',
    description: 'Yesterday, today and blockers for the Harbor mobile squad.',
    location: 'Aurora, Floor 3',
    attendees: [
      'gloria-metz',
      'evan-gutmann',
      'nathan-kutch',
      'oscar-delgado',
      'theo-lindqvist',
      'nadia-farouk',
    ],
    recurrence: {
      freq: 'weekly',
      byweekday: ['mo', 'tu', 'we', 'th', 'fr'],
    },
  },
  {
    id: 'soc2-walkthrough',
    start: at(-13, '13:00'),
    end: at(-13, '14:00'),
    allDay: false,
    title: 'SOC 2 control walkthrough',
    description:
      'Walk through the access reviews and change management evidence.',
    location: 'Boardroom B',
    attendees: ['alexander-shields', 'ingrid-solberg', 'desmond-ayers'],
    recurrence: null,
  },
  {
    id: 'design-crit-onboarding-1',
    start: at(-12, '14:00'),
    end: at(-12, '15:00'),
    allDay: false,
    title: 'Design crit: onboarding flow',
    description: 'Feedback on the new welcome checklist and empty states.',
    location: 'Studio, Floor 2',
    attendees: [
      'leticia-yundt',
      'kelley-schimmel',
      'bianca-ferreira',
      'mei-tanaka',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-36-review',
    start: at(-11, '11:00'),
    end: at(-11, '12:00'),
    allDay: false,
    title: 'Sprint review: sprint 36',
    description:
      'Demo of the conflict resolution rules and the new session handling on device.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'alexander-shields',
      'evan-gutmann',
      'nathan-kutch',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-36-retro',
    start: at(-10, '15:00'),
    end: at(-10, '16:00'),
    allDay: false,
    title: 'Retro: sprint 36',
    description:
      'What slowed the conflict resolution work and what to keep for sprint 37.',
    location: 'Aurora, Floor 3',
    attendees: [
      'gloria-metz',
      'evan-gutmann',
      'dana-hermiston',
      'nathan-kutch',
      'oscar-delgado',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-37-planning',
    start: at(-7, '10:00'),
    end: at(-7, '11:30'),
    allDay: false,
    title: 'Sprint planning: sprint 37',
    description:
      'Scope the beta build, crash reporting and the remaining write queue edge cases.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'evan-gutmann',
      'nathan-kutch',
      'oscar-delgado',
      'theo-lindqvist',
    ],
    recurrence: null,
  },
  {
    id: 'one-on-one-kelley',
    start: at(-6, '14:00'),
    end: at(-6, '14:30'),
    allDay: false,
    title: '1:1 with Kelley Schimmel',
    description: 'Aurora 2.0 scope and design team capacity.',
    location: 'Studio, Floor 2',
    attendees: ['kelley-schimmel'],
    recurrence: null,
  },
  {
    id: 'release-v24-rc2',
    start: at(-5, '16:00'),
    end: at(-5, '16:30'),
    allDay: false,
    title: 'Release cut: v2.4 rc2',
    description: 'Cut rc2 from main, tag the build and hand it over to QA.',
    location: 'Video call',
    attendees: [
      'lowell-lind',
      'gloria-metz',
      'oscar-delgado',
      'theo-lindqvist',
    ],
    recurrence: null,
  },
  {
    id: 'one-on-one-gloria-1',
    start: at(-4, '10:30'),
    end: at(-4, '11:00'),
    allDay: false,
    title: '1:1 with Gloria Metz',
    description: 'Beta readiness, the Android hire and team load.',
    location: 'Video call',
    attendees: ['gloria-metz'],
    recurrence: null,
  },
  {
    id: 'postmortem-sync-latency',
    start: at(-3, '11:00'),
    end: at(-3, '12:00'),
    allDay: false,
    title: 'Postmortem: sync API latency',
    description:
      'Root cause and follow ups for the sync API slowdown during the rc2 rollout.',
    location: 'Video call',
    attendees: [
      'theo-lindqvist',
      'sofia-renner',
      'lowell-lind',
      'desmond-ayers',
    ],
    recurrence: null,
  },
  {
    id: 'q4-roadmap-review',
    start: at(0, '14:00'),
    end: at(0, '15:30'),
    allDay: false,
    title: 'Q4 roadmap review',
    description:
      'Confirm priorities for the quarter across mobile, billing, design and security.',
    location: 'Boardroom B',
    attendees: [
      'nadia-farouk',
      'gloria-metz',
      'marcus-feeney',
      'kelley-schimmel',
      'alexander-shields',
      'amara-okafor',
    ],
    recurrence: null,
  },
  {
    id: 'portal-analytics-demo',
    start: at(1, '13:00'),
    end: at(1, '13:45'),
    allDay: false,
    title: 'Portal analytics demo',
    description:
      'Walkthrough of the usage dashboards before they reach customers.',
    location: 'Video call',
    attendees: ['amara-okafor', 'noor-haddad', 'tobias-wehner', 'ray-kuhic'],
    recurrence: null,
  },
  {
    id: 'one-on-one-marcus',
    start: at(1, '15:00'),
    end: at(1, '15:30'),
    allDay: false,
    title: '1:1 with Marcus Feeney',
    description: 'Billing cutover timeline and the finance sign off.',
    location: 'Video call',
    attendees: ['marcus-feeney'],
    recurrence: null,
  },
  {
    id: 'design-crit-aurora',
    start: at(2, '14:00'),
    end: at(2, '15:00'),
    allDay: false,
    title: 'Design crit: Aurora 2.0 components',
    description:
      'Review of the new form controls, tokens and dark mode contrast.',
    location: 'Studio, Floor 2',
    attendees: [
      'kelley-schimmel',
      'rosalind-pike',
      'hugo-braun',
      'bianca-ferreira',
    ],
    recurrence: null,
  },
  {
    id: 'release-v24-rc3',
    start: at(2, '16:00'),
    end: at(2, '16:30'),
    allDay: false,
    title: 'Release cut: v2.4 rc3',
    description:
      'Cut rc3 with the beta fixes and push it to TestFlight and Play internal.',
    location: 'Video call',
    attendees: [
      'lowell-lind',
      'gloria-metz',
      'oscar-delgado',
      'theo-lindqvist',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-37-review',
    start: at(3, '11:00'),
    end: at(3, '12:00'),
    allDay: false,
    title: 'Sprint review: sprint 37',
    description:
      'Beta build walkthrough on TestFlight and Play internal, plus the crash reporting dashboards.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'alexander-shields',
      'evan-gutmann',
      'nathan-kutch',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-37-retro',
    start: at(4, '15:00'),
    end: at(4, '16:00'),
    allDay: false,
    title: 'Retro: sprint 37',
    description: 'Look back at the beta cut and the flaky sync tests.',
    location: 'Aurora, Floor 3',
    attendees: [
      'gloria-metz',
      'evan-gutmann',
      'dana-hermiston',
      'nathan-kutch',
      'oscar-delgado',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-38-planning',
    start: at(7, '10:00'),
    end: at(7, '11:30'),
    allDay: false,
    title: 'Sprint planning: sprint 38',
    description:
      'Plan the store submission, staged rollout and the release checklist.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'evan-gutmann',
      'nathan-kutch',
      'oscar-delgado',
      'theo-lindqvist',
    ],
    recurrence: null,
  },
  {
    id: 'one-on-one-alexander',
    start: at(8, '11:00'),
    end: at(8, '11:30'),
    allDay: false,
    title: '1:1 with Alexander Shields',
    description: 'SOC 2 evidence gaps and the auditor schedule.',
    location: 'Video call',
    attendees: ['alexander-shields'],
    recurrence: null,
  },
  {
    id: 'design-crit-onboarding-2',
    start: at(9, '14:00'),
    end: at(9, '15:00'),
    allDay: false,
    title: 'Design crit: onboarding flow',
    description: 'Second round on the invite step and the progress indicators.',
    location: 'Studio, Floor 2',
    attendees: [
      'leticia-yundt',
      'kelley-schimmel',
      'bianca-ferreira',
      'mei-tanaka',
    ],
    recurrence: null,
  },
  {
    id: 'one-on-one-gloria-2',
    start: at(10, '10:30'),
    end: at(10, '11:00'),
    allDay: false,
    title: '1:1 with Gloria Metz',
    description:
      'Release plan, the on call rotation after launch and growth goals.',
    location: 'Video call',
    attendees: ['gloria-metz'],
    recurrence: null,
  },
  {
    id: 'all-hands',
    start: at(11, '16:00'),
    end: at(11, '17:00'),
    allDay: false,
    title: 'Company all hands',
    description: 'Quarterly update, team demos and an open Q&A.',
    location: 'Atrium',
    attendees: [
      'nadia-farouk',
      'gloria-metz',
      'marcus-feeney',
      'kelley-schimmel',
      'alexander-shields',
      'amara-okafor',
      'janis-considine',
      'lowell-lind',
    ],
    recurrence: null,
  },
  {
    id: 'soc2-auditor-kickoff',
    start: at(14, '15:00'),
    end: at(14, '16:00'),
    allDay: false,
    title: 'SOC 2 auditor kickoff',
    description:
      'Kickoff with the audit firm on scope, the sampling period and evidence requests.',
    location: 'Video call',
    attendees: [
      'alexander-shields',
      'ingrid-solberg',
      'desmond-ayers',
      'theo-lindqvist',
    ],
    recurrence: null,
  },
  {
    id: 'one-on-one-leticia',
    start: at(15, '11:00'),
    end: at(15, '11:30'),
    allDay: false,
    title: '1:1 with Leticia Yundt',
    description: 'Onboarding research findings and next steps.',
    location: 'Video call',
    attendees: ['leticia-yundt'],
    recurrence: null,
  },
  {
    id: 'billing-cutover-rehearsal',
    start: at(15, '13:00'),
    end: at(15, '15:00'),
    allDay: false,
    title: 'Billing cutover rehearsal',
    description:
      'Dry run of the invoice migration against a production snapshot.',
    location: 'Video call',
    attendees: [
      'marcus-feeney',
      'dana-hermiston',
      'priya-raman',
      'sofia-renner',
    ],
    recurrence: null,
  },
  {
    id: 'release-v24-notes',
    start: at(16, '13:00'),
    end: at(16, '13:45'),
    allDay: false,
    title: 'Release notes review: v2.4',
    description:
      'Final pass on the store listing copy and in-app release notes.',
    location: 'Video call',
    attendees: ['mei-tanaka', 'nadia-farouk', 'gloria-metz'],
    recurrence: null,
  },
  {
    id: 'sprint-38-review',
    start: at(17, '11:00'),
    end: at(17, '12:00'),
    allDay: false,
    title: 'Sprint review: sprint 38',
    description: 'Release candidate review ahead of the go or no-go call.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'alexander-shields',
      'evan-gutmann',
      'nathan-kutch',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-38-retro',
    start: at(18, '15:00'),
    end: at(18, '16:00'),
    allDay: false,
    title: 'Retro: sprint 38',
    description: 'Wrap up the v2.4 release sprint.',
    location: 'Aurora, Floor 3',
    attendees: [
      'gloria-metz',
      'evan-gutmann',
      'nathan-kutch',
      'oscar-delgado',
      'theo-lindqvist',
    ],
    recurrence: null,
  },
  {
    id: 'sprint-39-planning',
    start: at(21, '10:00'),
    end: at(21, '11:30'),
    allDay: false,
    title: 'Sprint planning: sprint 39',
    description:
      'First sprint after v2.4, focused on tablet layouts and push notification groundwork.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'evan-gutmann',
      'nathan-kutch',
      'oscar-delgado',
      'kelley-schimmel',
    ],
    recurrence: null,
  },
  {
    id: 'release-v24-go',
    start: at(22, '14:00'),
    end: at(22, '14:45'),
    allDay: false,
    title: 'Go or no-go: v2.4',
    description:
      'Final call on crash rate, open blockers and support readiness before submission.',
    location: 'Boardroom B',
    attendees: [
      'gloria-metz',
      'nadia-farouk',
      'oscar-delgado',
      'lowell-lind',
      'janis-considine',
    ],
    recurrence: null,
  },
  {
    id: 'release-v24-submission',
    start: at(23, '10:00'),
    end: at(23, '11:00'),
    allDay: false,
    title: 'Store submission: v2.4',
    description:
      'Submit to the App Store and Google Play, then start the staged rollout.',
    location: 'Aurora, Floor 3',
    attendees: ['gloria-metz', 'evan-gutmann', 'nathan-kutch', 'oscar-delgado'],
    recurrence: null,
  },
  {
    id: 'design-crit-tablet',
    start: at(23, '14:00'),
    end: at(23, '15:00'),
    allDay: false,
    title: 'Design crit: tablet layouts',
    description: 'Early explorations of split view and the navigation rail.',
    location: 'Studio, Floor 2',
    attendees: [
      'kelley-schimmel',
      'leticia-yundt',
      'evan-gutmann',
      'nathan-kutch',
    ],
    recurrence: null,
  },
];

@Service()
export class CalendarService {
  // Dependencies
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);

  // Data
  readonly events = signal<CalendarEvent[]>(EVENTS);
  readonly entries = computed<CalendarEntry[]>(() => [
    ...this.projectsService.projects().flatMap((project) =>
      project.milestones.map((milestone): CalendarEntry => ({
        id: milestone.id,
        kind: 'milestone',
        projectId: project.id,
        title: milestone.title,
        start: milestone.dueDate,
        allDay: true,
      }))
    ),
    ...this.tasksService.tasks().map((task): CalendarEntry => ({
      id: task.key,
      kind: 'task',
      projectId: task.project.id,
      title: task.title,
      start: task.dueDate,
      allDay: true,
    })),
    ...this.events().map((event): CalendarEntry => ({
      id: event.id,
      kind: 'event',
      title: event.title,
      allDay: event.allDay,
      ...(event.recurrence
        ? {
            rrule: { ...event.recurrence, dtstart: event.start },
            duration: intervalToDuration({
              start: event.start,
              end: event.end,
            }),
          }
        : {
            start: event.start,
            end: event.end,
          }),
    })),
  ]);

  byId(id: string) {
    return this.events().find((event) => event.id === id) ?? null;
  }
}
