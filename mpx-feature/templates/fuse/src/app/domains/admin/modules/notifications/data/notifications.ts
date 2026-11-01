import { computed, inject, Service, signal } from '@angular/core';
import { add } from 'date-fns';
import { CustomersService } from '@/app/domains/admin/modules/customers/data/customers';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import { ProjectsService } from '@/app/domains/admin/modules/projects/data/projects';
import { TasksService } from '@/app/domains/admin/modules/tasks/data/tasks';

export type NotificationType =
  'orders' | 'tasks' | 'projects' | 'team' | 'billing' | 'security';

export type NotificationActor = {
  type: 'member' | 'customer';
  id: string;
};

export type NotificationTarget = {
  type:
    | 'orders'
    | 'customers'
    | 'invoices'
    | 'tasks'
    | 'projects'
    | 'members'
    | 'settings';
  id: string;
};

export type NotificationAction = {
  label: string;
  value: string;
  variant?: string;
};

type NotificationSeed = {
  id: string;
  type: NotificationType;
  icon: string;
  actor: NotificationActor | null;
  action: string;
  target: NotificationTarget | null;
  detail: string | null;
  title: string;
  description?: string;
  actions?: NotificationAction[];
  mention: boolean;
  read: boolean;
  date: string;
};

export type Notification = Omit<NotificationSeed, 'actor' | 'target'> & {
  actor: { name: string; photo?: string } | null;
  target: { label?: string; link: string[] } | null;
};

const now = new Date();
const at = (days: number, hours: number, minutes: number) =>
  add(now, { days, hours, minutes }).toISOString();

const NOTIFICATIONS: NotificationSeed[] = [
  {
    id: 'ntf_g8ws3kd1mz',
    type: 'team',
    icon: 'message-square',
    actor: { type: 'member', id: 'gloria-metz' },
    action: 'sent you a message',
    target: null,
    detail: 'Hey, are we still on for the meeting later today?',
    title: 'New message from Gloria',
    description: 'Hey, are we still on for the meeting later today?',
    mention: false,
    read: false,
    date: at(0, 0, -2),
  },
  {
    id: 'ntf_q2fb7tn4xc',
    type: 'projects',
    icon: 'folder',
    actor: null,
    action: '3 new tasks were added to',
    target: { type: 'projects', id: 'harbor-mobile-v24' },
    detail: null,
    title: 'Harbor Mobile App v2.4 updated',
    description: '3 new tasks were added to your board.',
    mention: false,
    read: true,
    date: at(0, 0, -10),
  },
  {
    id: 'ntf_v5kd9rj2hw',
    type: 'tasks',
    icon: 'message-square',
    actor: { type: 'member', id: 'evan-gutmann' },
    action: 'commented on',
    target: { type: 'tasks', id: 'harbor-mobile-v24-t1' },
    detail: 'Tested on a slow connection, the queue now drains in order.',
    title: 'New comment on task',
    description:
      'Evan commented on "Replay queued mutations after token refresh".',
    actions: [{ label: 'View', value: 'view', variant: 'primary' }],
    mention: false,
    read: false,
    date: at(0, -1, 0),
  },
  {
    id: 'ntf_m7tc2qx8ld',
    type: 'team',
    icon: 'user-plus',
    actor: { type: 'member', id: 'kelley-schimmel' },
    action: 'invited you to join the Design team',
    target: null,
    detail: null,
    title: 'Invitation to join team',
    description: 'You’ve been invited to join the "Design" team.',
    actions: [
      { label: 'Accept', value: 'accept', variant: 'primary' },
      { label: 'Decline', value: 'decline' },
    ],
    mention: false,
    read: false,
    date: at(0, -2, 0),
  },
  {
    id: 'ntf_a3hr8wv5pn',
    type: 'projects',
    icon: 'key-round',
    actor: { type: 'member', id: 'alexander-shields' },
    action: 'requested access to',
    target: { type: 'projects', id: 'portal-analytics' },
    detail: null,
    title: 'Access request',
    description: 'Alexander requested access to "Customer portal analytics".',
    actions: [
      { label: 'Approve', value: 'approve', variant: 'primary' },
      { label: 'Reject', value: 'reject' },
    ],
    mention: false,
    read: false,
    date: at(0, -3, 0),
  },
  {
    id: 'ntf_s9dk4mf1yt',
    type: 'security',
    icon: 'server',
    actor: null,
    action: 'Server maintenance is scheduled for tomorrow at 2:00 AM',
    target: null,
    detail: null,
    title: 'Server downtime scheduled',
    description: 'Maintenance planned for tomorrow at 02:00 AM.',
    mention: false,
    read: false,
    date: at(0, -5, 0),
  },
  {
    id: 'ntf_f6pu1ze7qj',
    type: 'projects',
    icon: 'file',
    actor: null,
    action: 'Q2-report.pdf was added to',
    target: { type: 'projects', id: 'warehouse-migration' },
    detail: null,
    title: 'File uploaded',
    description: '“Q2-report.pdf” has been added to your files.',
    actions: [{ label: 'Open', value: 'open', variant: 'primary' }],
    mention: false,
    read: false,
    date: at(0, -8, 0),
  },
  {
    id: 'ntf_w1ox5nb9rc',
    type: 'team',
    icon: 'user-plus',
    actor: { type: 'member', id: 'oscar-delgado' },
    action: 'started following your work',
    target: null,
    detail: null,
    title: 'New follower',
    description: 'Oscar started following your work.',
    mention: false,
    read: false,
    date: at(0, -12, 0),
  },
  {
    id: 'ntf_7k2m9xq4rd',
    type: 'tasks',
    icon: 'at-sign',
    actor: { type: 'member', id: 'leticia-yundt' },
    action: 'mentioned you in',
    target: { type: 'tasks', id: 'harbor-mobile-v24-t3' },
    detail:
      '@John can you check the retry copy against the error states before I hand this to QA?',
    title: 'You were mentioned',
    description: 'Leticia mentioned you in a task comment.',
    mention: true,
    read: false,
    date: at(0, -12, -40),
  },
  {
    id: 'ntf_p3vn8wz1ac',
    type: 'billing',
    icon: 'banknote',
    actor: null,
    action: 'Payment received for',
    target: { type: 'invoices', id: 'INV-2042' },
    detail: null,
    title: 'Payment received',
    description: 'Invoice INV-2042 was paid in full.',
    mention: false,
    read: false,
    date: at(0, -13, -30),
  },
  {
    id: 'ntf_e6hy2tq9lb',
    type: 'orders',
    icon: 'shopping-cart',
    actor: { type: 'customer', id: '1012' },
    action: 'placed order',
    target: { type: 'orders', id: '10482' },
    detail: null,
    title: 'New order #10482',
    mention: false,
    read: false,
    date: at(0, -14, 0),
  },
  {
    id: 'ntf_c1rj5mw8ze',
    type: 'tasks',
    icon: 'message-square',
    actor: { type: 'member', id: 'nathan-kutch' },
    action: 'commented on',
    target: { type: 'tasks', id: 'harbor-mobile-v24-t4' },
    detail:
      'Symbols upload fine on the Android lane now, iOS still times out after the archive step.',
    title: 'New comment on task',
    description: 'Nathan commented on a task you follow.',
    mention: false,
    read: false,
    date: at(0, -15, -20),
  },
  {
    id: 'ntf_u9bd4kx7sn',
    type: 'orders',
    icon: 'shopping-cart',
    actor: { type: 'customer', id: '1023' },
    action: 'placed order',
    target: { type: 'orders', id: '10481' },
    detail: 'Awaiting payment',
    title: 'New order #10481',
    description: 'Awaiting payment from the customer.',
    mention: false,
    read: false,
    date: at(0, -16, 0),
  },
  {
    id: 'ntf_w4fq7ny2hp',
    type: 'tasks',
    icon: 'list-todo',
    actor: { type: 'member', id: 'gloria-metz' },
    action: 'assigned you',
    target: { type: 'tasks', id: 'harbor-mobile-v24-t4' },
    detail: null,
    title: 'Task assigned to you',
    mention: false,
    read: true,
    date: at(0, -17, -35),
  },
  {
    id: 'ntf_m8ts3vc6jq',
    type: 'projects',
    icon: 'folder-kanban',
    actor: { type: 'member', id: 'amara-okafor' },
    action: 'paused',
    target: { type: 'projects', id: 'warehouse-migration' },
    detail: 'Waiting on the vendor contract renewal before the next cutover.',
    title: 'Project paused',
    description: 'Data warehouse migration is on hold.',
    mention: false,
    read: true,
    date: at(0, -19, -10),
  },
  {
    id: 'ntf_y4gl6sa2ev',
    type: 'tasks',
    icon: 'file-chart-line',
    actor: null,
    action: 'You completed 12 tasks this week',
    target: null,
    detail: 'Nice work.',
    title: 'Weekly summary',
    description: 'You completed 12 tasks this week. Nice work.',
    mention: false,
    read: true,
    date: at(-1, 0, 0),
  },
  {
    id: 'ntf_h2xz6pr9ue',
    type: 'orders',
    icon: 'triangle-alert',
    actor: null,
    action: 'Review needed on order',
    target: { type: 'orders', id: '10479' },
    detail:
      'First order from a new account above $500, shipping internationally',
    title: 'Order #10479 needs review',
    description: 'First order from a new account above $500.',
    mention: false,
    read: false,
    date: at(-1, -2, 0),
  },
  {
    id: 'ntf_q5lc1dy8wm',
    type: 'orders',
    icon: 'user-plus',
    actor: null,
    action: 'New customer',
    target: { type: 'customers', id: '1043' },
    detail: null,
    title: 'New customer signed up',
    mention: false,
    read: true,
    date: at(-1, -2, -5),
  },
  {
    id: 'ntf_z7gw4bn2ka',
    type: 'orders',
    icon: 'undo-2',
    actor: { type: 'customer', id: '1037' },
    action: 'requested a return for order',
    target: { type: 'orders', id: '10465' },
    detail: 'Runs small, exchanging for a medium',
    title: 'Return requested',
    description: 'Order #10465 is being exchanged for a medium.',
    mention: false,
    read: false,
    date: at(-1, -3, 0),
  },
  {
    id: 'ntf_r3jk8se5vx',
    type: 'tasks',
    icon: 'at-sign',
    actor: { type: 'member', id: 'marcus-feeney' },
    action: 'mentioned you in',
    target: { type: 'tasks', id: 'billing-revamp-t3' },
    detail:
      '@John the ledger reconcile needs to land before we can trust these numbers.',
    title: 'You were mentioned',
    description: 'Marcus mentioned you in a task comment.',
    mention: true,
    read: false,
    date: at(-1, -4, -40),
  },
  {
    id: 'ntf_b6ny9qa3tf',
    type: 'orders',
    icon: 'shopping-cart',
    actor: { type: 'customer', id: '1027' },
    action: 'placed order',
    target: { type: 'orders', id: '10478' },
    detail: null,
    title: 'New order #10478',
    mention: false,
    read: true,
    date: at(-1, -6, 0),
  },
  {
    id: 'ntf_f1vm7hz4cr',
    type: 'billing',
    icon: 'banknote',
    actor: null,
    action: 'Deposit received for',
    target: { type: 'invoices', id: 'INV-2037' },
    detail: null,
    title: 'Deposit received',
    description: 'A deposit was paid on invoice INV-2037.',
    mention: false,
    read: true,
    date: at(-1, -8, -59),
  },
  {
    id: 'ntf_k8nq3cu6bi',
    type: 'security',
    icon: 'shield',
    actor: null,
    action: 'Your password was changed',
    target: { type: 'settings', id: 'security' },
    detail: null,
    title: 'Password changed',
    description: 'Your password was updated successfully.',
    mention: false,
    read: true,
    date: at(-2, 0, 0),
  },
  {
    id: 'ntf_t8pd2wl6xe',
    type: 'tasks',
    icon: 'circle-x',
    actor: { type: 'member', id: 'lowell-lind' },
    action: 'flagged as blocked',
    target: { type: 'tasks', id: 'billing-revamp-t4' },
    detail: 'Waiting on the EU VAT wording from finance.',
    title: 'Task blocked',
    description: 'Lowell flagged a task as blocked.',
    mention: false,
    read: true,
    date: at(-2, -1, -15),
  },
  {
    id: 'ntf_k4sa9rm1qy',
    type: 'team',
    icon: 'user-plus',
    actor: { type: 'member', id: 'janis-considine' },
    action: 'invited',
    target: { type: 'members', id: 'clara-moreau' },
    detail: 'Support team',
    title: 'New member invited',
    description: 'Clara Moreau was invited to the Support team.',
    mention: false,
    read: false,
    date: at(-2, -2, 0),
  },
  {
    id: 'ntf_y2hc6tv8bn',
    type: 'billing',
    icon: 'undo-2',
    actor: null,
    action: 'Refund issued for order',
    target: { type: 'orders', id: '10464' },
    detail: 'Torn seam on the left sleeve',
    title: 'Refund issued',
    description: 'Order #10464 was refunded.',
    mention: false,
    read: true,
    date: at(-2, -4, 0),
  },
  {
    id: 'ntf_d9qe3xk7ws',
    type: 'tasks',
    icon: 'circle-check',
    actor: { type: 'member', id: 'priya-raman' },
    action: 'completed',
    target: { type: 'tasks', id: 'billing-revamp-t2' },
    detail: null,
    title: 'Task completed',
    mention: false,
    read: true,
    date: at(-2, -5, -30),
  },
  {
    id: 'ntf_n5wr1fj9pz',
    type: 'billing',
    icon: 'circle-alert',
    actor: null,
    action: 'Payment overdue on',
    target: { type: 'invoices', id: 'INV-2027' },
    detail: 'Due 7 days after the order was placed',
    title: 'Payment overdue',
    description: 'Invoice INV-2027 is 7 days past due.',
    mention: false,
    read: false,
    date: at(-3, -2, 0),
  },
  {
    id: 'ntf_a7mx4ub2gd',
    type: 'team',
    icon: 'user-plus',
    actor: { type: 'member', id: 'lowell-lind' },
    action: 'invited',
    target: { type: 'members', id: 'emmett-hamill' },
    detail: 'Platform team',
    title: 'New member invited',
    description: 'Emmett Hamill was invited to the Platform team.',
    mention: false,
    read: true,
    date: at(-3, -3, 0),
  },
  {
    id: 'ntf_g3kt8nc5ye',
    type: 'orders',
    icon: 'credit-card',
    actor: null,
    action: 'Payment declined on order',
    target: { type: 'orders', id: '10473' },
    detail: 'Three declined payment attempts on different cards',
    title: 'Payment declined',
    description: 'Order #10473 had three declined attempts.',
    mention: false,
    read: true,
    date: at(-3, -6, 0),
  },
  {
    id: 'ntf_s6bf2qh9mv',
    type: 'projects',
    icon: 'at-sign',
    actor: { type: 'member', id: 'kelley-schimmel' },
    action: 'mentioned you in',
    target: { type: 'projects', id: 'aurora-design-system' },
    detail: '@John can the codemod ship with the next release candidate?',
    title: 'You were mentioned',
    description: 'Kelley mentioned you in a project update.',
    mention: true,
    read: true,
    date: at(-4, -1, -20),
  },
  {
    id: 'ntf_x1zp7vd4hk',
    type: 'tasks',
    icon: 'list-todo',
    actor: { type: 'member', id: 'hugo-braun' },
    action: 'assigned you',
    target: { type: 'tasks', id: 'onboarding-redesign-t4' },
    detail: null,
    title: 'Task assigned to you',
    mention: false,
    read: true,
    date: at(-4, -3, -45),
  },
  {
    id: 'ntf_l8cu5ga1rt',
    type: 'projects',
    icon: 'triangle-alert',
    actor: null,
    action: 'Health changed to at risk on',
    target: { type: 'projects', id: 'enterprise-sso' },
    detail:
      'SCIM provisioning tests are failing against two identity providers.',
    title: 'Project at risk',
    description: 'Enterprise SSO and SCIM health changed to at risk.',
    mention: false,
    read: true,
    date: at(-5, -2, 0),
  },
  {
    id: 'ntf_v2ej9sw6qa',
    type: 'team',
    icon: 'user-plus',
    actor: { type: 'member', id: 'kelley-schimmel' },
    action: 'invited',
    target: { type: 'members', id: 'mei-tanaka' },
    detail: 'Design team',
    title: 'New member invited',
    description: 'Mei Tanaka was invited to the Design team.',
    mention: false,
    read: true,
    date: at(-6, -1, 0),
  },
  {
    id: 'ntf_o4ry1mk8cz',
    type: 'security',
    icon: 'log-in',
    actor: null,
    action: 'New sign-in from Windows PC',
    target: { type: 'settings', id: 'security' },
    detail: 'Edge · Denver, United States',
    title: 'New sign-in from Windows PC',
    description: 'Edge in Denver, United States.',
    mention: false,
    read: false,
    date: at(-6, 0, 0),
  },
  {
    id: 'ntf_i7dg3pt5xn',
    type: 'projects',
    icon: 'circle-check',
    actor: { type: 'member', id: 'janis-considine' },
    action: 'marked as completed',
    target: { type: 'projects', id: 'support-inbox-automation' },
    detail: null,
    title: 'Project completed',
    mention: false,
    read: true,
    date: at(-8, -4, 0),
  },
  {
    id: 'ntf_j9wn6ec2ub',
    type: 'security',
    icon: 'log-in',
    actor: null,
    action: 'New sign-in from iPad Air',
    target: { type: 'settings', id: 'security' },
    detail: 'Safari · San Antonio, United States',
    title: 'New sign-in from iPad Air',
    mention: false,
    read: true,
    date: at(-9, 0, 0),
  },
  {
    id: 'ntf_h5ub8yr3lq',
    type: 'tasks',
    icon: 'message-square',
    actor: { type: 'member', id: 'evan-gutmann' },
    action: 'commented on',
    target: { type: 'tasks', id: 'harbor-mobile-v24-t1' },
    detail:
      'Verified on a flaky network profile, queued edits replay cleanly after refresh.',
    title: 'New comment on task',
    description: 'Evan commented on a task you follow.',
    mention: false,
    read: true,
    date: at(-11, -5, 0),
  },
  {
    id: 'ntf_c3mq7zf1we',
    type: 'tasks',
    icon: 'at-sign',
    actor: { type: 'member', id: 'leticia-yundt' },
    action: 'mentioned you in',
    target: { type: 'tasks', id: 'aurora-design-system-t4' },
    detail: '@John which props should the usage pages document as deprecated?',
    title: 'You were mentioned',
    description: 'Leticia mentioned you in a task comment.',
    mention: true,
    read: true,
    date: at(-13, -2, 0),
  },
  {
    id: 'ntf_e8tk2xv6ap',
    type: 'billing',
    icon: 'receipt-text',
    actor: null,
    action: 'Receipt for AI credits · 5,000',
    target: { type: 'settings', id: 'billing' },
    detail: '$40.00 paid with Visa ending in 4242',
    title: 'Receipt for AI credits',
    mention: false,
    read: true,
    date: at(-39, 0, 0),
  },
];

@Service()
export class NotificationsService {
  // Dependencies
  private customersService = inject(CustomersService);
  private membersService = inject(MembersService);
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);

  // Data
  private readonly entries = signal<NotificationSeed[]>(NOTIFICATIONS);
  readonly notifications = computed(() =>
    this.entries().map((entry): Notification => ({
      ...entry,
      actor: entry.actor && this.actor(entry.actor),
      target: entry.target && this.target(entry.target),
    }))
  );

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

  remove(id: string) {
    this.entries.update((entries) =>
      entries.filter((entry) => entry.id !== id)
    );
  }

  private actor(actor: NotificationActor) {
    return actor.type === 'member'
      ? this.membersService.byId(actor.id)
      : this.customersService.byId(actor.id);
  }

  private target(target: NotificationTarget): Notification['target'] {
    switch (target.type) {
      case 'orders':
        return { label: `#${target.id}`, link: ['/orders', target.id] };
      case 'invoices':
        return { label: target.id, link: ['/invoices', target.id] };
      case 'customers': {
        const customer = this.customersService.byId(target.id);
        return (
          customer && {
            label: customer.name,
            link: ['/customers', customer.id],
          }
        );
      }
      case 'members': {
        const member = this.membersService.byId(target.id);
        return member && { label: member.name, link: ['/members', member.id] };
      }
      case 'projects': {
        const project = this.projectsService.byId(target.id);
        return (
          project && { label: project.name, link: ['/projects', project.id] }
        );
      }
      case 'tasks': {
        // Task routes use the generated key, the id stays stable
        const task =
          this.tasksService.tasks().find((item) => item.id === target.id) ??
          null;
        return task && { label: task.title, link: ['/tasks', task.key] };
      }
      case 'settings':
        return { link: ['/settings', target.id] };
    }
  }
}
