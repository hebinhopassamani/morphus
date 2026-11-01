import { Service } from '@angular/core';
import { add, set } from 'date-fns';

export type BudgetItem = {
  id: string;
  type: string;
  total: number;
  expensesAmount: number;
  expensesPercentage: number;
  remainingAmount: number;
  remainingPercentage: number;
};

@Service()
export class ProjectDashboardService {
  private now = new Date();

  // Data
  data = {
    summary: [
      {
        title: 'Tasks',
        icon: 'list-todo',
        value: 42,
        change: {
          value: -6,
          unit: '',
          period: 'since last week',
          up: false,
        },
      },
      {
        title: 'Overdue',
        icon: 'clock-alert',
        value: 9,
        change: {
          value: -4,
          unit: '',
          period: 'since last week',
          up: false,
        },
      },
      {
        title: 'Issues',
        icon: 'bug',
        value: 77,
        change: {
          value: 11,
          unit: '',
          period: 'since last week',
          up: true,
        },
      },
      {
        title: 'Features',
        icon: 'git-branch-plus',
        value: 23,
        change: {
          value: 5,
          unit: '',
          period: 'since last week',
          up: true,
        },
      },
    ],
    issues: {
      overview: [
        {
          label: 'Fixed',
          value: 124,
        },
        {
          label: "Won't fix",
          value: 28,
        },
        {
          label: 'Duplicate',
          value: 15,
        },
        {
          label: 'Needs triage',
          value: 31,
        },
        {
          label: 'In progress',
          value: 46,
        },
      ],
      total: 244,
      chart: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [
          {
            name: 'New',
            type: 'line',
            data: [31, 38, 26, 35, 24, 11, 13],
          },
          {
            name: 'Closed',
            type: 'column',
            data: [24, 29, 33, 28, 31, 12, 10],
          },
        ],
      },
    },
    aiSummary: {
      text: `178 issues were opened this week against 167 closed, leaving 77 open with 31 still waiting on triage. Bugs are 38.1% of the 42 open tasks and 9 of those tasks are overdue. Spend is at 69% of the $600,000 release budget, with engineering the largest draw. Clearing triage before the v2.4 release cut is the highest leverage move.`,
      suggestions: [
        'Draft sprint update',
        'Summarize blockers',
        'Suggest triage order',
      ],
    },
    taskDistribution: {
      chart: {
        labels: ['Feature', 'Bug', 'Chore', 'Documentation', 'Other'],
        series: [26.19, 38.1, 14.29, 11.9, 9.52],
      },
    },
    schedule: [
      {
        title: 'Daily standup',
        date: set(this.now, { hours: 9, minutes: 30 }),
        location: {
          label: 'Aurora, Floor 3',
          icon: 'map-pin',
        },
        attendees: [
          {
            name: 'Gloria Metz',
            photo: '/images/photos/kol3jpdula4mvn74wdnns.jpg',
          },
          {
            name: 'Evan Gutmann',
            photo: '/images/photos/i26glj5ogfrlo5mhggfx2.jpg',
          },
          {
            name: 'Nathan Kutch',
            photo: '/images/photos/4br10olncbmhtdk4j5vkd.jpg',
          },
        ],
      },
      {
        title: 'Design sync: onboarding flow',
        date: set(this.now, { hours: 14, minutes: 0 }),
        location: {
          label: 'Video call',
          icon: 'video',
        },
        attendees: [
          {
            name: 'Leticia Yundt',
            photo: '/images/photos/b21kuccvyjfrtqud8drc4.jpg',
          },
          {
            name: 'Kelley Schimmel',
            photo: '/images/photos/4ub7cws3f0mjgl5572khj.jpg',
          },
        ],
      },
      {
        title: 'Sprint review',
        date: set(add(this.now, { days: 1 }), { hours: 11, minutes: 0 }),
        location: {
          label: 'Boardroom B',
          icon: 'map-pin',
        },
        attendees: [
          {
            name: 'Alexander Shields',
            photo: '/images/photos/ot79dx7wxgnj6ixi0aszt.jpg',
          },
          {
            name: 'Gloria Metz',
            photo: '/images/photos/kol3jpdula4mvn74wdnns.jpg',
          },
        ],
      },
      {
        title: 'Release cut: v2.4 rc3',
        date: set(add(this.now, { days: 2 }), { hours: 16, minutes: 0 }),
        location: null,
        attendees: [
          {
            name: 'Lowell Lind',
            photo: '/images/photos/x05ipzq7r4helr3lzaatp.jpg',
          },
        ],
      },
      {
        title: '1:1 with Gloria Metz',
        date: set(add(this.now, { days: 3 }), { hours: 10, minutes: 30 }),
        location: {
          label: 'Video call',
          icon: 'video',
        },
        attendees: [
          {
            name: 'Gloria Metz',
            photo: '/images/photos/kol3jpdula4mvn74wdnns.jpg',
          },
        ],
      },
      {
        title: 'Retro: sprint 37',
        date: set(add(this.now, { days: 4 }), { hours: 15, minutes: 0 }),
        location: {
          label: 'Aurora, Floor 3',
          icon: 'map-pin',
        },
        attendees: [
          {
            name: 'Dana Hermiston',
            photo: '/images/photos/aqvge5v3422q14wmhihyf.jpg',
          },
          {
            name: 'Evan Gutmann',
            photo: '/images/photos/i26glj5ogfrlo5mhggfx2.jpg',
          },
        ],
      },
    ],
    budget: [
      {
        id: '1',
        type: 'Discovery',
        total: 48000,
        expensesAmount: 48000,
        expensesPercentage: 100,
        remainingAmount: 0,
        remainingPercentage: 0,
      },
      {
        id: '2',
        type: 'Design',
        total: 96000,
        expensesAmount: 82560,
        expensesPercentage: 86,
        remainingAmount: 13440,
        remainingPercentage: 14,
      },
      {
        id: '3',
        type: 'Engineering',
        total: 320000,
        expensesAmount: 237440,
        expensesPercentage: 74.2,
        remainingAmount: 82560,
        remainingPercentage: 25.8,
      },
      {
        id: '4',
        type: 'QA and release',
        total: 72000,
        expensesAmount: 29880,
        expensesPercentage: 41.5,
        remainingAmount: 42120,
        remainingPercentage: 58.5,
      },
      {
        id: '5',
        type: 'Marketing',
        total: 64000,
        expensesAmount: 17600,
        expensesPercentage: 27.5,
        remainingAmount: 46400,
        remainingPercentage: 72.5,
      },
    ],
  };
}
