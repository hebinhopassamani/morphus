import { Service, signal } from '@angular/core';

export type NotificationAction = {
  label: string;
  value: string;
  variant?: string;
};

export type Notification = {
  id: string;
  icon: string;
  actor: { name: string; photo?: string } | null;
  target: { link: string[] } | null;
  title: string;
  description?: string;
  actions?: NotificationAction[];
  mention: boolean;
  read: boolean;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'ntf_k4pz8rd2qa',
    icon: 'user-check',
    actor: {
      name: 'Gloria Metz',
      photo: '/images/photos/kol3jpdula4mvn74wdnns.jpg',
    },
    target: { link: ['/tickets'] },
    title: 'Ticket assigned to you',
    description:
      'Gloria assigned "Calendar sync stopped after password reset".',
    actions: [{ label: 'View', value: 'view', variant: 'primary' }],
    mention: false,
    read: false,
  },
  {
    id: 'ntf_w7hn3cx5vb',
    icon: 'clock-alert',
    actor: null,
    target: { link: ['/tickets'] },
    title: 'SLA at risk',
    description:
      'First response on "Double bookings on team calendar" is due in 15 minutes.',
    actions: [{ label: 'Open', value: 'open', variant: 'primary' }],
    mention: false,
    read: false,
  },
  {
    id: 'ntf_r2fj9tm6ke',
    icon: 'message-square-reply',
    actor: {
      name: 'Evan Gutmann',
      photo: '/images/photos/i26glj5ogfrlo5mhggfx2.jpg',
    },
    target: { link: ['/tickets'] },
    title: 'Customer replied',
    description: 'Reminder emails still go out an hour late after the update.',
    mention: false,
    read: false,
  },
  {
    id: 'ntf_c8ys4wq1ld',
    icon: 'at-sign',
    actor: {
      name: 'Lowell Lind',
      photo: '/images/photos/x05ipzq7r4helr3lzaatp.jpg',
    },
    target: { link: ['/tickets'] },
    title: 'Mentioned in an internal note',
    description:
      'Can you check the seat count on this account before we reply?',
    mention: true,
    read: false,
  },
  {
    id: 'ntf_h3xa6nd8rj',
    icon: 'arrow-right-left',
    actor: { name: 'Alton Rutherford' },
    target: null,
    title: 'Handoff request',
    description:
      'Alton wants to hand over "Stripe payouts missing on invoices".',
    actions: [
      { label: 'Accept', value: 'accept', variant: 'primary' },
      { label: 'Decline', value: 'decline' },
    ],
    mention: false,
    read: false,
  },
  {
    id: 'ntf_m5vb7gk3pz',
    icon: 'star',
    actor: { name: 'Lance Parisian' },
    target: null,
    title: 'New satisfaction rating',
    description:
      'Lance rated "Zoom integration missing meeting links" as Great.',
    mention: false,
    read: true,
  },
  {
    id: 'ntf_t9qd2hx6wn',
    icon: 'chart-column',
    actor: null,
    target: { link: ['/reports'] },
    title: 'Weekly report is ready',
    description:
      '312 tickets solved with a median first response of 42 minutes.',
    mention: false,
    read: true,
  },
];

@Service()
export class NotificationsService {
  // Data
  private readonly entries = signal<Notification[]>(NOTIFICATIONS);
  readonly notifications = this.entries.asReadonly();

  setRead(id: string, read: boolean) {
    this.entries.update((entries) =>
      entries.map((entry) => (entry.id === id ? { ...entry, read } : entry))
    );
  }

  markAllRead() {
    this.entries.update((entries) =>
      entries.map((entry) => ({ ...entry, read: true }))
    );
  }

  resolve(id: string) {
    this.entries.update((entries) =>
      entries.map((entry) =>
        entry.id === id ? { ...entry, read: true, actions: undefined } : entry
      )
    );
  }
}
