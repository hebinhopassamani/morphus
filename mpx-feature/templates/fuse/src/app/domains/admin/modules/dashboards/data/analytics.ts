import { Service } from '@angular/core';
import { format, sub } from 'date-fns';

export type AnalyticsRange = '30days' | '90days' | '12months';

@Service()
export class AnalyticsDashboardService {
  private now = new Date();

  // The 30 day range reads the tail of the quarter, so the ranges agree
  private dailyActiveUsers = [
    6980, 7120, 7045, 7210, 7168, 7092, 7264, 7331, 7205, 7288, 7402, 7356,
    7489, 7412, 7534, 7601, 7468, 7592, 7655, 7530, 7418, 7612, 7784, 7431,
    7906, 7702, 7588, 7845, 7920, 7796, 7684, 7912, 8046, 7903, 8120, 8214,
    8058, 7936, 8175, 8302, 8168, 8024, 8241, 8397, 8102, 7874, 8316, 8578,
    8449, 8217, 8104, 8352, 8490, 8286, 8145, 8398, 8562, 8431, 8274, 8506,
    8690, 8834, 8521, 8395, 8762, 9014, 8877, 8643, 9128, 8956, 8812, 9042,
    8908, 8734, 9086, 9215, 9048, 8894, 9162, 9307, 9128, 8974, 9203, 9347,
    9186, 9052, 9264, 9398, 9241, 9412,
  ];

  // Data
  data = {
    ranges: {
      '30days': {
        activeUsers: this.trend(
          'Daily active users',
          this.dailyActiveUsers.slice(-30),
          'days'
        ),
        highlights: [
          {
            label: 'Monthly active users',
            value: '24,317',
            change: {
              value: 3.1,
              unit: '%',
              period: 'vs previous 30 days',
              up: true,
            },
          },
          {
            label: 'Stickiness (WAU/MAU)',
            value: '55.4%',
            change: {
              value: 1.2,
              unit: ' pts',
              period: 'vs previous 30 days',
              up: true,
            },
          },
          {
            label: 'Avg. session length',
            value: '18m 42s',
            change: {
              value: 4.4,
              unit: '%',
              period: 'vs previous 30 days',
              up: true,
            },
          },
        ],
        kpis: [
          {
            title: 'New sign-ups',
            icon: 'user-plus',
            value: 1284,
            change: {
              value: 9.5,
              unit: '%',
              period: 'vs previous 30 days',
              up: true,
            },
            series: [
              {
                name: 'New sign-ups',
                data: [
                  98, 104, 96, 112, 107, 101, 115, 109, 103, 118, 110, 111,
                ],
              },
            ],
          },
          {
            title: 'Messages sent',
            icon: 'message-square',
            value: 512640,
            change: {
              value: 5.3,
              unit: '%',
              period: 'vs previous 30 days',
              up: true,
            },
            series: [
              {
                name: 'Messages sent',
                data: [
                  39820, 41260, 40180, 43110, 42560, 41980, 44230, 43690, 42870,
                  45120, 44310, 43510,
                ],
              },
            ],
          },
          {
            title: 'Files shared',
            icon: 'files',
            value: 38714,
            change: {
              value: -3.7,
              unit: '%',
              period: 'vs previous 30 days',
              up: false,
            },
            series: [
              {
                name: 'Files shared',
                data: [
                  3410, 3352, 3298, 3240, 3186, 3264, 3172, 3118, 3205, 3094,
                  3021, 3354,
                ],
              },
            ],
          },
        ],
        insights: [
          {
            icon: 'trending-up',
            text: 'Monthly active users reached 24,317, up 3.1% on the previous 30 days, and weekly actives hit 13,472 for a stickiness of 55.4%.',
          },
          {
            icon: 'triangle-alert',
            text: 'Files shared slipped 3.7% to 38,714 while messages sent grew 5.3% to 512,640, so teams are talking more and sharing less.',
          },
          {
            icon: 'lightbulb',
            text: 'Six workspaces produce 31.5% of the 482,760 sessions in the period, so one enterprise renewal moves the topline more than all 1,284 sign-ups.',
          },
        ],
        signUpSources: [
          { label: 'Direct', value: 412, percentage: 32.1 },
          { label: 'Invitations', value: 386, percentage: 30.1 },
          { label: 'Google', value: 271, percentage: 21.1 },
          { label: 'Referrals', value: 142, percentage: 11.1 },
          { label: 'Other', value: 73, percentage: 5.7 },
        ],
        signUpsTotal: 1284,
      },
      '90days': {
        activeUsers: this.trend(
          'Daily active users',
          this.dailyActiveUsers,
          'days'
        ),
        highlights: [
          {
            label: 'Monthly active users',
            value: '24,317',
            change: {
              value: 10.8,
              unit: '%',
              period: 'vs previous 90 days',
              up: true,
            },
          },
          {
            label: 'Stickiness (WAU/MAU)',
            value: '55.4%',
            change: {
              value: 3.6,
              unit: ' pts',
              period: 'vs previous 90 days',
              up: true,
            },
          },
          {
            label: 'Avg. session length',
            value: '18m 42s',
            change: {
              value: 8.7,
              unit: '%',
              period: 'vs previous 90 days',
              up: true,
            },
          },
        ],
        kpis: [
          {
            title: 'New sign-ups',
            icon: 'user-plus',
            value: 3512,
            change: {
              value: 16.1,
              unit: '%',
              period: 'vs previous 90 days',
              up: true,
            },
            series: [
              {
                name: 'New sign-ups',
                data: [
                  228, 236, 243, 251, 258, 264, 271, 278, 282, 290, 298, 303,
                  310,
                ],
              },
            ],
          },
          {
            title: 'Messages sent',
            icon: 'message-square',
            value: 1438900,
            change: {
              value: 13.1,
              unit: '%',
              period: 'vs previous 90 days',
              up: true,
            },
            series: [
              {
                name: 'Messages sent',
                data: [
                  100200, 102400, 103800, 105600, 107900, 109300, 111500,
                  113200, 114800, 117600, 118900, 119700, 114000,
                ],
              },
            ],
          },
          {
            title: 'Files shared',
            icon: 'files',
            value: 118206,
            change: {
              value: 5.0,
              unit: '%',
              period: 'vs previous 90 days',
              up: true,
            },
            series: [
              {
                name: 'Files shared',
                data: [
                  9420, 9380, 9510, 9240, 9180, 9320, 9060, 8940, 9120, 8860,
                  8720, 8640, 8816,
                ],
              },
            ],
          },
        ],
        insights: [
          {
            icon: 'trending-up',
            text: 'Active users are up 10.8% over the quarter to 24,317, on 3,512 sign-ups and 1,438,900 messages sent in Harbor.',
          },
          {
            icon: 'triangle-alert',
            text: 'Automations reaches only 26.7% of active teams against 78.4% for Boards, the widest adoption gap in the suite.',
          },
          {
            icon: 'lightbulb',
            text: 'Week 1 retention climbed from 44% to 49% across the last eight cohorts, about 11 more accounts kept per weekly cohort.',
          },
        ],
        signUpSources: [
          { label: 'Direct', value: 1128, percentage: 32.1 },
          { label: 'Invitations', value: 1044, percentage: 29.7 },
          { label: 'Google', value: 748, percentage: 21.3 },
          { label: 'Referrals', value: 397, percentage: 11.3 },
          { label: 'Other', value: 195, percentage: 5.6 },
        ],
        signUpsTotal: 3512,
      },
      '12months': {
        activeUsers: this.trend(
          'Monthly active users',
          [
            15842, 16730, 17418, 18096, 18842, 19510, 20284, 21073, 21946,
            22864, 23591, 24317,
          ],
          'months'
        ),
        highlights: [
          {
            label: 'Monthly active users',
            value: '24,317',
            change: {
              value: 53.5,
              unit: '%',
              period: 'vs previous 12 months',
              up: true,
            },
          },
          {
            label: 'Stickiness (WAU/MAU)',
            value: '55.4%',
            change: {
              value: 6.5,
              unit: ' pts',
              period: 'vs previous 12 months',
              up: true,
            },
          },
          {
            label: 'Avg. session length',
            value: '18m 42s',
            change: {
              value: 18.4,
              unit: '%',
              period: 'vs previous 12 months',
              up: true,
            },
          },
        ],
        kpis: [
          {
            title: 'New sign-ups',
            icon: 'user-plus',
            value: 12412,
            change: {
              value: 54.3,
              unit: '%',
              period: 'vs previous 12 months',
              up: true,
            },
            series: [
              {
                name: 'New sign-ups',
                data: [
                  878, 902, 928, 954, 982, 1008, 1032, 1058, 1158, 1094, 1134,
                  1284,
                ],
              },
            ],
          },
          {
            title: 'Messages sent',
            icon: 'message-square',
            value: 4735640,
            change: {
              value: 57.5,
              unit: '%',
              period: 'vs previous 12 months',
              up: true,
            },
            series: [
              {
                name: 'Messages sent',
                data: [
                  302400, 318600, 334800, 351200, 367500, 383900, 400200,
                  416600, 432900, 449300, 465600, 512640,
                ],
              },
            ],
          },
          {
            title: 'Files shared',
            icon: 'files',
            value: 424964,
            change: {
              value: 39.1,
              unit: '%',
              period: 'vs previous 12 months',
              up: true,
            },
            series: [
              {
                name: 'Files shared',
                data: [
                  28420, 29860, 31240, 32680, 34150, 35420, 36880, 38240, 39560,
                  40180, 39620, 38714,
                ],
              },
            ],
          },
        ],
        insights: [
          {
            icon: 'trending-up',
            text: 'Monthly active users grew 53.5% over the year, from 15,842 to 24,317, and messages sent passed 4.7 million.',
          },
          {
            icon: 'triangle-alert',
            text: 'Seats outpaced usage: 31,035 seats now cover 24,317 monthly actives, leaving 21.6% of them idle.',
          },
          {
            icon: 'lightbulb',
            text: 'Invitations brought 3,652 of the 12,412 sign-ups, 29.4% of the year and second only to direct traffic.',
          },
        ],
        signUpSources: [
          { label: 'Direct', value: 3978, percentage: 32.1 },
          { label: 'Invitations', value: 3652, percentage: 29.4 },
          { label: 'Google', value: 2718, percentage: 21.9 },
          { label: 'Referrals', value: 1356, percentage: 10.9 },
          { label: 'Other', value: 708, percentage: 5.7 },
        ],
        signUpsTotal: 12412,
      },
    },
    featureAdoption: {
      teams: 1862,
      chart: {
        labels: [
          'Boards',
          'Channels',
          'Docs',
          'Calendar',
          'Mail',
          'Automations',
        ],
        series: [
          {
            name: 'Active teams',
            data: [78.4, 71.2, 63.5, 54.8, 41.3, 26.7],
          },
        ],
      },
    },
    platforms: {
      breakdown: [
        { label: 'Mac', value: 198932 },
        { label: 'Windows', value: 154483 },
        { label: 'iOS', value: 82069 },
        { label: 'Android', value: 47276 },
      ],
      total: 482760,
    },
    plans: {
      breakdown: [
        { label: 'Free', value: 8240 },
        { label: 'Pro', value: 12930 },
        { label: 'Enterprise', value: 9865 },
      ],
      total: 31035,
    },
    retention: {
      total: 1787,
      chart: {
        labels: [
          'Week 0',
          'Week 1',
          'Week 2',
          'Week 3',
          'Week 4',
          'Week 5',
          'Week 6',
          'Week 7',
        ],
        series: [
          {
            name: format(sub(this.now, { weeks: 16 }), 'MMM d'),
            data: [100, 44, 36, 32, 30, 28, 27, 26],
          },
          {
            name: format(sub(this.now, { weeks: 15 }), 'MMM d'),
            data: [100, 44, 37, 33, 30, 29, 27, 26],
          },
          {
            name: format(sub(this.now, { weeks: 14 }), 'MMM d'),
            data: [100, 45, 37, 33, 31, 29, 28, 27],
          },
          {
            name: format(sub(this.now, { weeks: 13 }), 'MMM d'),
            data: [100, 45, 38, 34, 32, 30, 29, 28],
          },
          {
            name: format(sub(this.now, { weeks: 12 }), 'MMM d'),
            data: [100, 46, 38, 34, 32, 31, 29, 28],
          },
          {
            name: format(sub(this.now, { weeks: 11 }), 'MMM d'),
            data: [100, 47, 39, 35, 33, 31, 30, 29],
          },
          {
            name: format(sub(this.now, { weeks: 10 }), 'MMM d'),
            data: [100, 48, 40, 36, 34, 32, 31, 30],
          },
          {
            name: format(sub(this.now, { weeks: 9 }), 'MMM d'),
            data: [100, 49, 41, 37, 35, 33, 32, 31],
          },
        ],
      },
    },
    workspaces: [
      {
        name: 'Fernwood Labs',
        members: 412,
        sessions: 38214,
        change: {
          value: 12.4,
          up: true,
        },
      },
      {
        name: 'Cobalt Health',
        members: 386,
        sessions: 31905,
        change: {
          value: 8.1,
          up: true,
        },
      },
      {
        name: 'Lantern Logistics',
        members: 298,
        sessions: 26447,
        change: {
          value: -3.2,
          up: false,
        },
      },
      {
        name: 'Ridgeline Media',
        members: 264,
        sessions: 22183,
        change: {
          value: 5.6,
          up: true,
        },
      },
      {
        name: 'Halcyon Robotics',
        members: 217,
        sessions: 18962,
        change: {
          value: 2.4,
          up: true,
        },
      },
      {
        name: 'Pinehurst Legal',
        members: 185,
        sessions: 14508,
        change: {
          value: -1.8,
          up: false,
        },
      },
    ],
    aiSuggestions: [
      'Explain the drop',
      'Draft a retention plan',
      'Compare with last quarter',
    ],
  };

  // Trend points run back from today, so their dates follow the range step
  private trend(name: string, values: number[], step: 'days' | 'months') {
    return [
      {
        name,
        data: values.map((value, index) => {
          const back = values.length - 1 - index;

          return {
            x: format(
              sub(
                this.now,
                step === 'days' ? { days: back } : { months: back }
              ),
              'dd MMM yy'
            ),
            y: value,
          };
        }),
      },
    ];
  }
}
