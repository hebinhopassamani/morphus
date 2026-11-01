import { Service, signal } from '@angular/core';
import { add, Duration, getISODay, isWeekend } from 'date-fns';
import { Agent, AGENTS } from '@/app/domains/admin/modules/agents/data/agents';
import { CUSTOMERS } from '@/app/domains/admin/modules/customers/data/customers';
import {
  BucketId,
  BUCKETS,
  Channel,
  CHANNELS,
  PRIORITIES,
  TicketPriority,
} from '@/app/domains/admin/modules/tickets/data/tickets';

export type ReportRange = 7 | 30 | 90;

export type Rating = 'good' | 'neutral' | 'bad';

export type ReportDay = {
  date: string;
  created: number;
  resolved: number;
  firstResponse: number;
  resolution: number;
  ratings: Record<Rating, number>;
  buckets: Record<BucketId, number>;
  channels: Record<Channel, number>;
  priorities: Record<TicketPriority, number>;
};

export type AgentReport = Agent & {
  resolved: number;
  firstResponse: number;
  satisfaction: number;
};

export type Feedback = {
  id: string;
  customerId: string;
  rating: Rating;
  comment: string;
  at: string;
};

export const RESPONSE_TARGET = 60;

export const RATINGS: {
  id: Rating;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    id: 'good',
    label: 'Good',
    icon: 'face-slightly-smiling',
    color: 'bg-green-9',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    icon: 'face-neutral',
    color: 'bg-neutral-a8',
  },
  {
    id: 'bad',
    label: 'Bad',
    icon: 'face-slightly-frowning',
    color: 'bg-neutral-a5',
  },
];

const now = new Date();
const at = (duration: Duration) => add(now, duration).toISOString();

// Seeded so server and client render the same numbers
const noise = (seed: number) => {
  const value = Math.sin(seed) * 10000;

  return value - Math.floor(value);
};

const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const score = (days: ReportDay[]) => {
  const sum = (value: (day: ReportDay) => number) =>
    days.reduce((total, day) => total + value(day), 0);

  return (
    (sum((day) => day.ratings.good) /
      sum((day) => day.ratings.good + day.ratings.neutral + day.ratings.bad)) *
    100
  );
};

const PROFILES: Record<
  string,
  { share: number; pace: number; satisfaction: number }
> = {
  'john-builder': { share: 0.06, pace: 1.2, satisfaction: 2.4 },
  'janis-considine': { share: 0.21, pace: 0.85, satisfaction: 1.6 },
  'marcus-feeney': { share: 0.17, pace: 1.1, satisfaction: -1.2 },
  'priya-raman': { share: 0.22, pace: 0.9, satisfaction: 0.8 },
  'noor-haddad': { share: 0.16, pace: 1.35, satisfaction: -2.1 },
  'clara-moreau': { share: 0.18, pace: 1, satisfaction: 0.3 },
};

// Monday backlog peak, resolutions catch up a day later
const WEEK = [
  { created: 1.25, resolved: 1.05 },
  { created: 1.1, resolved: 1.15 },
  { created: 1, resolved: 1.1 },
  { created: 0.95, resolved: 1 },
  { created: 0.85, resolved: 0.95 },
  { created: 0.4, resolved: 0.45 },
  { created: 0.35, resolved: 0.3 },
];

const DAYS: ReportDay[] = Array.from({ length: 180 }, (_, i) => {
  const date = add(now, { days: i - 179 });
  const weekend = isWeekend(date);
  const week = WEEK[getISODay(date) - 1];
  const trend = i / 179;
  const seed = i * 16;
  const volume = 45 * (0.9 + trend * 0.2);
  const created = Math.round(volume * week.created + noise(seed) * 8);
  const resolved = Math.round(
    volume * week.resolved * (0.98 + noise(seed + 1) * 0.16)
  );
  const rated = Math.round(resolved * 0.35);
  const bad = Math.round(rated * (0.02 + noise(seed + 2) * 0.04));
  const neutral = Math.round(rated * (0.03 + noise(seed + 3) * 0.06));
  const email = Math.round(created * (0.55 + noise(seed + 4) * 0.15));
  const urgent = Math.round(created * (0.03 + noise(seed + 11) * 0.03));
  const high = Math.round(created * (0.13 + noise(seed + 12) * 0.06));
  const low = Math.round(created * (0.12 + noise(seed + 13) * 0.06));

  return {
    date: date.toISOString(),
    created,
    resolved,
    firstResponse: Math.round(
      ((weekend ? 72 : 32) + noise(seed + 5) * 24) * (1.1 - trend * 0.2)
    ),
    resolution: Math.round(
      ((weekend ? 600 : 270) + noise(seed + 6) * 150) * (1.1 - trend * 0.2)
    ),
    ratings: { good: rated - neutral - bad, neutral, bad },
    buckets: {
      support: Math.round(created * (0.46 + noise(seed + 7) * 0.12)),
      bugs: Math.round(created * (0.14 + noise(seed + 8) * 0.06)),
      features: Math.round(created * (0.1 + noise(seed + 9) * 0.06)),
      billing: Math.round(created * (0.15 + noise(seed + 10) * 0.06)),
    },
    channels: { email, widget: created - email },
    priorities: { urgent, high, normal: created - urgent - high - low, low },
  };
});

export const FEEDBACK: Feedback[] = [
  {
    id: 'fb_1',
    customerId: CUSTOMERS.hannah.id,
    rating: 'good',
    comment:
      'Calendar sync is back and the fix was explained clearly. Thank you!',
    at: at({ hours: -3 }),
  },
  {
    id: 'fb_2',
    customerId: CUSTOMERS.owen.id,
    rating: 'neutral',
    comment:
      'Got there in the end, but it took three replies to reach the right person.',
    at: at({ hours: -20 }),
  },
  {
    id: 'fb_3',
    customerId: CUSTOMERS.lucy.id,
    rating: 'good',
    comment:
      'Priya walked our front desk through the new booking rules in minutes.',
    at: at({ days: -2 }),
  },
  {
    id: 'fb_4',
    customerId: CUSTOMERS.daniel.id,
    rating: 'bad',
    comment:
      'Still seeing double bookings after the workaround. Waiting on a real fix.',
    at: at({ days: -3 }),
  },
];

@Service()
export class ReportsService {
  // Data
  readonly feedback = signal<Feedback[]>(FEEDBACK);

  summary(range: ReportRange, offset = 0) {
    const start = DAYS.length - range * (offset + 1);
    const days = DAYS.slice(start, start + range);
    const sum = (value: (day: ReportDay) => number) =>
      days.reduce((total, day) => total + value(day), 0);
    const created = sum((day) => day.created);
    const resolved = sum((day) => day.resolved);
    const rated = sum(
      (day) => day.ratings.good + day.ratings.neutral + day.ratings.bad
    );
    const satisfaction = score(days);
    const firstResponse = median(days.map((day) => day.firstResponse));

    return {
      days,
      created,
      resolved,
      rated,
      firstResponse,
      resolution: median(days.map((day) => day.resolution)),
      satisfaction,
      // Trailing 7 day score keeps sparse daily ratings from jittering
      satisfactionTrend: days.map((day, index) => ({
        x: day.date,
        y: score(DAYS.slice(Math.max(0, start + index - 6), start + index + 1)),
      })),
      ratings: RATINGS.map((rating) => {
        const value = sum((day) => day.ratings[rating.id]);

        return { ...rating, value, percentage: (value / rated) * 100 };
      }),
      buckets: BUCKETS.map((bucket) => {
        const value = sum((day) => day.buckets[bucket.id]);

        return { ...bucket, value, percentage: (value / created) * 100 };
      }),
      channels: CHANNELS.map((channel) => {
        const value = sum((day) => day.channels[channel.id]);

        return { ...channel, value, percentage: (value / created) * 100 };
      }),
      priorities: PRIORITIES.map((priority) => {
        const value = sum((day) => day.priorities[priority.id]);

        return { ...priority, value, percentage: (value / created) * 100 };
      }),
      agents: AGENTS.map((agent): AgentReport => ({
        ...agent,
        resolved: Math.round(resolved * PROFILES[agent.id].share),
        firstResponse: Math.round(firstResponse * PROFILES[agent.id].pace),
        satisfaction: satisfaction + PROFILES[agent.id].satisfaction,
      })),
    };
  }
}
