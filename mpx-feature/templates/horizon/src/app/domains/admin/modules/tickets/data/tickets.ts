import { computed, Service, signal } from '@angular/core';
import { add, Duration } from 'date-fns';
import { ME } from '@/app/domains/admin/modules/agents/data/agents';
import {
  CUSTOMERS,
  Customer,
} from '@/app/domains/admin/modules/customers/data/customers';

export type TicketStatus = 'open' | 'pending' | 'closed';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type Channel = 'email' | 'widget';

export type BucketId = string;

export type View =
  'mine' | 'unassigned' | 'urgent' | 'open' | 'pending' | 'closed';

export type Queue = View | BucketId;

export type Bucket = {
  id: BucketId;
  name: string;
  hue: string;
  color: string;
  tagClass: string;
  empty: string;
};

export type Author = {
  type: 'customer' | 'agent';
  id: string;
};

export type Message = {
  id: string;
  author: Author;
  at: string;
  body: string[];
  internal: boolean;
};

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: Channel;
  buckets: BucketId[];
  customerId: string;
  assigneeId: string | null;
  unread: boolean;
  createdAt: string;
  updatedAt: string;
  summary: string;
  followUp: string | null;
  messages: Message[];
};

type MessageSeed = Omit<Message, 'id' | 'internal'> &
  Partial<Pick<Message, 'internal'>>;

type TicketSeed = Omit<
  Ticket,
  'unread' | 'createdAt' | 'updatedAt' | 'followUp' | 'messages'
> &
  Partial<Pick<Ticket, 'unread' | 'followUp'>> & {
    messages: MessageSeed[];
  };

export const VIEWS: {
  id: View;
  name: string;
  icon: string;
  empty: string;
}[] = [
  {
    id: 'mine',
    name: 'Assigned to me',
    icon: 'circle-user-round',
    empty: 'Nothing assigned to you right now.',
  },
  {
    id: 'unassigned',
    name: 'Unassigned',
    icon: 'inbox',
    empty: 'Every ticket has an owner.',
  },
  {
    id: 'urgent',
    name: 'Urgent',
    icon: 'flag',
    empty: 'No urgent tickets.',
  },
  {
    id: 'open',
    name: 'Open',
    icon: 'circle-dot',
    empty: 'No open tickets.',
  },
  {
    id: 'pending',
    name: 'Pending',
    icon: 'hourglass',
    empty: 'No tickets waiting on customers.',
  },
  {
    id: 'closed',
    name: 'Closed',
    icon: 'circle-check',
    empty: 'Closed tickets show up here.',
  },
];

export const BUCKET_HUES: Record<string, { color: string; tagClass: string }> =
  {
    tomato: {
      color: 'bg-tomato-a9',
      tagClass: 'border-tomato-a6 bg-tomato-a3 text-tomato-a11',
    },
    orange: {
      color: 'bg-orange-a9',
      tagClass: 'border-orange-a6 bg-orange-a3 text-orange-a11',
    },
    amber: {
      color: 'bg-amber-a9',
      tagClass: 'border-amber-a6 bg-amber-a3 text-amber-a11',
    },
    jade: {
      color: 'bg-jade-a9',
      tagClass: 'border-jade-a6 bg-jade-a3 text-jade-a11',
    },
    cyan: {
      color: 'bg-cyan-a9',
      tagClass: 'border-cyan-a6 bg-cyan-a3 text-cyan-a11',
    },
    blue: {
      color: 'bg-blue-a9',
      tagClass: 'border-blue-a6 bg-blue-a3 text-blue-a11',
    },
    violet: {
      color: 'bg-violet-a9',
      tagClass: 'border-violet-a6 bg-violet-a3 text-violet-a11',
    },
    pink: {
      color: 'bg-pink-a9',
      tagClass: 'border-pink-a6 bg-pink-a3 text-pink-a11',
    },
  };

export const BUCKETS: Bucket[] = [
  {
    id: 'support',
    name: 'Support',
    hue: 'blue',
    color: 'bg-blue-a9',
    tagClass: 'border-blue-a6 bg-blue-a3 text-blue-a11',
    empty: 'No support tickets.',
  },
  {
    id: 'bugs',
    name: 'Bugs',
    hue: 'tomato',
    color: 'bg-tomato-a9',
    tagClass: 'border-tomato-a6 bg-tomato-a3 text-tomato-a11',
    empty: 'No bug reports.',
  },
  {
    id: 'features',
    name: 'Feature requests',
    hue: 'violet',
    color: 'bg-violet-a9',
    tagClass: 'border-violet-a6 bg-violet-a3 text-violet-a11',
    empty: 'No feature requests.',
  },
  {
    id: 'billing',
    name: 'Billing',
    hue: 'jade',
    color: 'bg-jade-a9',
    tagClass: 'border-jade-a6 bg-jade-a3 text-jade-a11',
    empty: 'No billing tickets.',
  },
];

export const STATUSES: {
  id: TicketStatus;
  label: string;
  color: string;
}[] = [
  {
    id: 'open',
    label: 'Open',
    color: 'bg-green-a9',
  },
  {
    id: 'pending',
    label: 'Pending',
    color: 'bg-amber-a9',
  },
  {
    id: 'closed',
    label: 'Closed',
    color: 'bg-neutral-a9',
  },
];

export const PRIORITIES: {
  id: TicketPriority;
  label: string;
  color?: string;
}[] = [
  {
    id: 'urgent',
    label: 'Urgent',
    color: 'text-red-a9',
  },
  {
    id: 'high',
    label: 'High',
    color: 'text-amber-a10',
  },
  {
    id: 'normal',
    label: 'Normal',
  },
  {
    id: 'low',
    label: 'Low',
    color: 'text-violet-a9',
  },
];

export const CHANNELS: {
  id: Channel;
  label: string;
  icon: string;
}[] = [
  {
    id: 'email',
    label: 'Email',
    icon: 'mail',
  },
  {
    id: 'widget',
    label: 'Widget',
    icon: 'message-circle',
  },
];

const now = new Date();
const at = (duration: Duration) => add(now, duration).toISOString();
const customer = ({ id }: Customer): Author => ({ type: 'customer', id });
const agent = (id: string): Author => ({ type: 'agent', id });

const {
  elena,
  daniel,
  samuel,
  hannah,
  owen,
  lucy,
  martin,
  aisha,
  grace,
  peter,
  sophie,
  jamal,
  yuki,
  tom,
} = CUSTOMERS;
const me = agent(ME.id);
const janis = agent('janis-considine');
const marcus = agent('marcus-feeney');
const priya = agent('priya-raman');
const noor = agent('noor-haddad');
const clara = agent('clara-moreau');

const SEEDS: TicketSeed[] = [
  {
    id: '4226',
    subject: 'Calendar sync stopped after password change',
    status: 'open',
    priority: 'urgent',
    channel: 'email',
    buckets: ['bugs'],
    customerId: elena.id,
    assigneeId: null,
    unread: true,
    summary:
      'Elena is stressed because new bookings stopped reaching her dentists calendars this morning. She has a full schedule today and is worried about patients showing up to empty chairs.',
    followUp:
      'The password change disconnected Tideline from your calendar provider. If you reconnect it under Settings, then Calendars, the bookings from today will sync to each dentist right away. Could you let me know once they show up?',
    messages: [
      {
        author: customer(elena),
        at: at({ minutes: -12 }),
        body: [
          'Hi,',
          'Since this morning none of our new bookings are showing up in the calendars of our dentists. Our IT team rotated passwords last night, which is the only thing that changed on our side.',
          'Bookings still appear in Tideline, so patients are getting confirmations, but the dentists work from their own calendars and cannot see them.',
          'We have a full day ahead. Can someone help right away?',
          'Elena Vasquez\nHarborline Dental',
        ],
      },
    ],
  },
  {
    id: '4225',
    subject: 'Booking widget not loading on our website',
    status: 'open',
    priority: 'high',
    channel: 'widget',
    buckets: ['bugs'],
    customerId: grace.id,
    assigneeId: null,
    unread: true,
    summary:
      'Grace says the booking widget shows a blank box on the class page of her studio. She is calm but class signups are her main revenue, so she needs it back quickly.',
    followUp:
      "Could you send me the address of your class schedule page? A new cookie banner can block the widget until visitors accept it, so I'd like to check how it's set up on your site.",
    messages: [
      {
        author: customer(grace),
        at: at({ minutes: -40 }),
        body: [
          'Hello! The booking widget on our class schedule page just shows an empty white box today. It worked fine yesterday.',
          'I have not changed anything in Tideline. Our web designer did add a cookie banner over the weekend, could that be related?',
          'Grace',
        ],
      },
    ],
  },
  {
    id: '4224',
    subject: 'Clients cannot pay deposits at checkout',
    status: 'open',
    priority: 'urgent',
    channel: 'widget',
    buckets: ['billing', 'bugs'],
    customerId: aisha.id,
    assigneeId: ME.id,
    unread: true,
    summary:
      'Aisha says new clients get an error when paying the deposit for a first assessment, so those bookings never go through. She is at the front desk with clients calling and needs a quick workaround.',
    followUp:
      "We've found the cause: your payment account was disconnected when your bank details changed on Friday, so every deposit is declined. Reconnecting it under Integrations will clear the error, and until then you can turn off deposits for first assessments so new clients can still book.",
    messages: [
      {
        author: customer(aisha),
        at: at({ minutes: -55 }),
        body: [
          'Hi, new clients are getting a "payment could not be processed" message when they pay the deposit for a first assessment. The booking never goes through.',
          'Returning clients without a deposit can book fine. We have had three calls about it already this morning.',
          'Aisha\nNorthfield Physio',
        ],
      },
      {
        author: me,
        at: at({ minutes: -45 }),
        body: [
          'Hi Aisha,',
          'I am sorry about this, especially with the phones ringing. I am looking into it now with our billing team and will get back to you as soon as we know more.',
          'If a client calls in the meantime, your front desk can book the assessment for them directly and collect the deposit at the visit.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(aisha),
        at: at({ minutes: -20 }),
        body: [
          'Quick update: I tried booking myself with a different card and got the same error. Is there anything I can do on our side while you look?',
          'Aisha',
        ],
      },
      {
        author: marcus,
        at: at({ minutes: -8 }),
        internal: true,
        body: [
          'Their payment account was disconnected on Friday after they changed bank details, so every new charge is declined. Deposits are the only online charges they take, which is why returning clients are fine. Reconnecting under Integrations fixes it.',
        ],
      },
    ],
  },
  {
    id: '4223',
    subject: 'Invoice shows 64 seats, we only have 60',
    status: 'open',
    priority: 'high',
    channel: 'email',
    buckets: ['billing'],
    customerId: samuel.id,
    assigneeId: ME.id,
    unread: true,
    summary:
      'Samuel is frustrated that the latest invoice charges for four more seats than Meridian uses. He is a long time customer and expects a corrected invoice before his finance team closes the month.',
    followUp:
      "I've sent you a corrected invoice for 60 seats. The extra four were invitations from September that were never accepted, and pending invites count as seats, so I've removed them from your account.",
    messages: [
      {
        author: customer(samuel),
        at: at({ hours: -2, minutes: -10 }),
        body: [
          'Hello,',
          'Our October invoice bills us for 64 seats on the Business plan. We have exactly 60 people on the account and nobody new joined this month.',
          'Our finance team closes the books on Friday, so I need a corrected invoice before then.',
          'Thanks,\nSamuel Ortiz\nMeridian Consulting Group',
        ],
      },
      {
        author: marcus,
        at: at({ hours: -1, minutes: -25 }),
        internal: true,
        body: [
          'Checked billing. They have four pending invites from September that were never accepted, and invites count as seats. Happy to issue the credit if you confirm with Samuel.',
        ],
      },
    ],
  },
  {
    id: '4222',
    subject: 'Clients getting double booked on Tuesdays',
    status: 'open',
    priority: 'urgent',
    channel: 'email',
    buckets: ['bugs'],
    customerId: martin.id,
    assigneeId: ME.id,
    unread: true,
    summary:
      'Martin is upset after two clients showed up for the same Tuesday slot again. He has shared the affected bookings and is waiting on a fix before the schedule for next week fills up.',
    followUp:
      "I'm checking whether the Tuesday availability overrides for your therapists overlap their weekly hours, since that would let the same slot be booked twice. I'll get back to you today with what I find.",
    messages: [
      {
        author: customer(martin),
        at: at({ hours: -4 }),
        body: [
          'Hi,',
          'For the third week in a row, two clients were booked into the same 9:00 slot with the same therapist on Tuesday.',
          'It only happens on Tuesdays. Every other day works as expected.',
          'This is embarrassing in front of our clients. What is going on?',
          'Martin Keller\nNorthfield Physio',
        ],
      },
      {
        author: me,
        at: at({ hours: -3, minutes: -20 }),
        body: [
          'Hi Martin,',
          'I am sorry about this, I know how awkward it is at the front desk. Could you send me the names of the two bookings from this Tuesday? I will trace how both were allowed into the same slot.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(martin),
        at: at({ hours: -2, minutes: -45 }),
        body: [
          'Both were with Anna at 9:00. One was booked online and the other by our front desk on Monday afternoon.',
          'Martin',
        ],
      },
    ],
  },
  {
    id: '4221',
    subject: 'Class pack credits not used when members book',
    status: 'open',
    priority: 'high',
    channel: 'email',
    buckets: ['bugs'],
    customerId: grace.id,
    assigneeId: ME.id,
    summary:
      'Grace noticed that members on class packs can book without a credit being used, so some have taken more classes than they paid for. She is calm but wants the balances corrected before her monthly report.',
    followUp:
      "Bookings made from phones now use a class pack credit again. I've corrected the affected balances and attached the list of members whose credits were adjusted, in case you'd like to let them know.",
    messages: [
      {
        author: customer(grace),
        at: at({ hours: -5 }),
        body: [
          'Hello,',
          'Some of our members on 10 class packs are booking classes without a credit being used. One member has taken 13 classes on a 10 class pack.',
          'It seems to have started last week. Could you check what is happening and help us fix the balances?',
          'Grace\nLumen Yoga Collective',
        ],
      },
      {
        author: me,
        at: at({ hours: -4 }),
        body: [
          'Hi Grace,',
          'Thanks for spotting this. Could you tell me how the affected members booked, on a phone or a computer? That will help me narrow it down.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(grace),
        at: at({ hours: -2, minutes: -30 }),
        body: [
          'All of the ones I checked booked on their phones, from the schedule page on our website.',
          'Grace',
        ],
      },
    ],
  },
  {
    id: '4220',
    subject: 'Reminder emails not going out',
    status: 'open',
    priority: 'high',
    channel: 'email',
    buckets: ['bugs'],
    customerId: elena.id,
    assigneeId: 'janis-considine',
    summary:
      'Elena reports that patients stopped receiving reminder emails a few days ago, and no-shows went up. She is patient but this is her second open issue today.',
    followUp:
      'Your reminder template is fixed and reminders are going out again. If you like, I can also resend reminders for the appointments tomorrow so nobody misses theirs.',
    messages: [
      {
        author: customer(elena),
        at: at({ hours: -6 }),
        body: [
          'Hi,',
          'Our patients have not been getting their 24 hour reminder emails since Thursday. We had four no-shows yesterday, which is unusual for us.',
          'Reminders are turned on and nothing changed in our settings as far as I can tell.',
          'Elena',
        ],
      },
      {
        author: janis,
        at: at({ hours: -5, minutes: -30 }),
        internal: true,
        body: [
          'Their reminder template references a custom field that was deleted on Thursday, so sends fail silently. Restored the field, reminders resume with the next batch.',
        ],
      },
      {
        author: janis,
        at: at({ hours: -5 }),
        body: [
          'Hi Elena,',
          'Thank you for flagging this. We found the cause and reminders are going out again starting with the appointments tomorrow. I will confirm once the next batch has been delivered.',
          'Janis\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4219',
    subject: 'Group sessions for exam prep classes',
    status: 'open',
    priority: 'low',
    channel: 'widget',
    buckets: ['features'],
    customerId: peter.id,
    assigneeId: ME.id,
    unread: true,
    summary:
      'Peter wants several students to book the same exam prep class, with a cap on seats. He is excited about growing his tutoring business and asks whether this works on the Free plan.',
    followUp:
      "Group sessions are part of the Team plan. Once you upgrade, open your event type, turn on Group booking and set the maximum number of students to six, and the slot will close as soon as it's full.",
    messages: [
      {
        author: customer(peter),
        at: at({ hours: -7 }),
        body: [
          'Hi! I am starting small exam prep classes in the spring, up to six students per session. Can several students book the same slot, and can I stop it at six?',
          'I am still on the Free plan, so let me know if I would need to upgrade.',
          'Peter\nQuarry Lane Tutoring',
        ],
      },
    ],
  },
  {
    id: '4218',
    subject: 'How do we set up single sign-on?',
    status: 'open',
    priority: 'normal',
    channel: 'email',
    buckets: ['support'],
    customerId: owen.id,
    assigneeId: null,
    unread: true,
    summary:
      'Owen wants to turn on single sign-on for the whole firm before their security review. He is organized and asks for a clear checklist he can hand to his identity provider admin.',
    followUp:
      "I've attached our single sign-on setup guide, and your identity provider admin can find our metadata at https://sso.example.com/metadata for the setup. I'm also happy to join a short call with them to get it done before your review.",
    messages: [
      {
        author: customer(owen),
        at: at({ hours: -9 }),
        body: [
          'Hello,',
          'We are on the Business plan and would like everyone at Cedar & Pine to sign in to Tideline with our identity provider.',
          'Could you send the steps and anything our admin needs from your side? We have a security review at the end of the month and would like this done before then.',
          'Best,\nOwen Fletcher',
        ],
      },
    ],
  },
  {
    id: '4217',
    subject: 'Feature request: buffers for recurring sessions',
    status: 'open',
    priority: 'low',
    channel: 'widget',
    buckets: ['features'],
    customerId: yuki.id,
    assigneeId: null,
    unread: true,
    summary:
      'Yuki would like a buffer after recurring coaching sessions, which today only applies to one-off bookings. She is happy with Tideline overall and is sharing an idea, not a complaint.',
    messages: [
      {
        author: customer(yuki),
        at: at({ days: -1 }),
        body: [
          'Hi! Small request: I set a 15 minute buffer after each session, but it does not apply to my recurring weekly clients. They end up booked back to back.',
          'Would love to see buffers work for recurring sessions too.',
          'Yuki',
        ],
      },
    ],
  },
  {
    id: '4216',
    subject: 'Intake form answers missing from bookings',
    status: 'open',
    priority: 'high',
    channel: 'email',
    buckets: ['bugs'],
    customerId: owen.id,
    assigneeId: ME.id,
    unread: true,
    summary:
      'Owen reports that intake answers are missing on consultation bookings made from the Cedar & Pine website, so attorneys go into meetings unprepared. He has been helpful with examples, but it happened again this morning and his patience is wearing thin.',
    followUp:
      "The fix for answers from your website form is now live, and I've restored the answers on the two new bookings from this morning. I'm sorry for the extra checks this put on your team.",
    messages: [
      {
        author: customer(owen),
        at: at({ days: -1, hours: -2 }),
        body: [
          'Hello,',
          'Several consultation bookings from yesterday have empty intake answers. The clients tell us they filled in the form, and our attorneys rely on those answers to prepare.',
          'Not every booking is affected, which makes it hard to see a pattern. Could you take a look?',
          'Best,\nOwen Fletcher\nCedar & Pine Law',
        ],
      },
      {
        author: me,
        at: at({ days: -1 }),
        body: [
          'Hi Owen,',
          'Thank you for the report, I know how much your attorneys depend on those answers. Could you send me two or three of the affected bookings? The client names and dates are enough.',
          'In the meantime, the answers are stored with each booking request, so nothing should be lost for good.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(owen),
        at: at({ hours: -20 }),
        body: [
          'Here are three from yesterday: Rivera at 10:00, Okafor at 13:30 and Lindqvist at 16:00. All three booked through the form on our website, if that helps.',
          'Owen',
        ],
      },
      {
        author: noor,
        at: at({ hours: -17 }),
        internal: true,
        body: [
          'All three came through the embedded form. Answers are in the request log but never copied to the booking when a required question is left at its default value. Fix is in review, should ship tomorrow morning.',
        ],
      },
      {
        author: me,
        at: at({ hours: -16 }),
        body: [
          'Hi Owen,',
          'We found the cause. Bookings made through the form on your website lose their answers when a required question is left at its default value. A fix is going out tomorrow morning.',
          'I can copy the answers for the three bookings you sent into their booking details today, so your attorneys have them before the meetings.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(owen),
        at: at({ hours: -15 }),
        body: ['Yes please, that would be a big help.', 'Owen'],
      },
      {
        author: customer(owen),
        at: at({ minutes: -35 }),
        body: [
          'Hi John,',
          'Thanks for restoring those. Unfortunately it happened again this morning with two new bookings, so I assume the fix is not live yet?',
          'Our partners have asked me to check every booking by hand until this is solved, which is not sustainable. Please let me know when we can rely on the form again.',
          'Owen',
        ],
      },
    ],
  },
  {
    id: '4215',
    subject: 'API token expired without warning',
    status: 'open',
    priority: 'high',
    channel: 'email',
    buckets: ['support', 'bugs'],
    customerId: daniel.id,
    assigneeId: ME.id,
    summary:
      'The integration between Harborline and their practice management system broke overnight because an API token expired. Daniel is technical and annoyed there was no expiry notice.',
    followUp:
      'You can create a new token under Settings, then API, and choose No expiry. Expiry notices now go to every admin on the account, so your team will hear about it in time if you ever set one.',
    messages: [
      {
        author: customer(daniel),
        at: at({ days: -1, hours: -3 }),
        body: [
          'Hi,',
          'Our sync between Tideline and our practice system stopped at midnight. The logs show 401 errors, and the API token page says the token expired yesterday.',
          'I do not remember setting an expiry, and nobody on our team got an email about it. Can you confirm how expiry works and whether we can get a warning next time?',
          'Daniel Brooks\nIT, Harborline Dental',
        ],
      },
      {
        author: me,
        at: at({ days: -1, hours: -1 }),
        internal: true,
        body: [
          'Tokens created before the July release default to 12 months. Expiry emails go to the token creator, who left Harborline in the spring.',
        ],
      },
    ],
  },
  {
    id: '4214',
    subject: 'Password reset email never arrives',
    status: 'open',
    priority: 'normal',
    channel: 'widget',
    buckets: ['support'],
    customerId: tom.id,
    assigneeId: null,
    unread: true,
    summary:
      'Tom is locked out of his account and has requested three reset emails with no luck. He is new to Tideline and a little anxious about missing lesson bookings.',
    followUp:
      "I checked our email log and the reset emails were delivered, so they may be in your spam folder. If you can't find them there, let me know and I'll send a fresh link another way.",
    messages: [
      {
        author: customer(tom),
        at: at({ days: -1, hours: -6 }),
        body: [
          'Hello, I cannot log in and the password reset email never shows up. I have tried three times today.',
          'My students book lessons through my page, so I need to see my calendar. Thanks for any help.',
          'Tom',
        ],
      },
    ],
  },
  {
    id: '4213',
    subject: 'Reschedule link opens an error page',
    status: 'open',
    priority: 'normal',
    channel: 'widget',
    buckets: ['bugs'],
    customerId: yuki.id,
    assigneeId: ME.id,
    summary:
      'Clients of Yuki get an error page from the reschedule link in their confirmation email, so they text her to move sessions. She has been patient while we narrowed it down and is using the calendar workaround until the fix ships.',
    followUp:
      'The fix for reschedule links on recurring sessions is now live, and the links your clients already have work again. Thank you for your patience while we sorted it out.',
    messages: [
      {
        author: customer(yuki),
        at: at({ days: -1, hours: -8 }),
        body: [
          'Hi! A few clients told me the reschedule link in their confirmation email opens an error page. They end up texting me to move their session, which is a bit chaotic.',
          'Cancel links seem to work fine.',
          'Yuki',
        ],
      },
      {
        author: me,
        at: at({ days: -1, hours: -7 }),
        body: [
          'Hi Yuki,',
          'Sorry about that. Could you forward one of the confirmations with a broken link? I would like to see which booking it points to.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(yuki),
        at: at({ days: -1, hours: -6 }),
        body: [
          'Forwarded one just now. It is for a recurring weekly client, if that matters. My one-off sessions might be fine, I am not sure.',
          'Yuki',
        ],
      },
      {
        author: priya,
        at: at({ days: -1, hours: -3 }),
        internal: true,
        body: [
          'Reproduced. Reschedule links for recurring bookings point to the series instead of the single session, and the series page has no reschedule view. Fix is planned for this week. Workaround: move the session from her calendar view.',
        ],
      },
      {
        author: me,
        at: at({ days: -1, hours: -2 }),
        body: [
          'Hi Yuki,',
          'Thank you, that example was exactly what we needed. The link breaks only for recurring sessions, which matches what you saw. Our product team is fixing it this week.',
          'Until then, if a recurring client needs to move a session, you can drag it to a new time in your calendar view and they will get an updated confirmation automatically.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(yuki),
        at: at({ hours: -20 }),
        body: [
          'That workaround is fine for now, thanks! Will clients who already have the broken link get a new email once it is fixed, or should I tell them myself?',
          'Yuki',
        ],
      },
      {
        author: me,
        at: at({ hours: -19 }),
        body: [
          'Hi Yuki,',
          'The fix updates existing links too, so the emails your clients already have will start working on their own. No need to contact them.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(yuki),
        at: at({ hours: -3, minutes: -30 }),
        body: [
          'One client just tried her link again and it still shows the error, so I guess the fix is not out yet. I will keep using the calendar for now.',
          'Yuki',
        ],
      },
    ],
  },
  {
    id: '4212',
    subject: 'Times are an hour off for some clients',
    status: 'pending',
    priority: 'normal',
    channel: 'widget',
    buckets: ['bugs'],
    customerId: sophie.id,
    assigneeId: ME.id,
    summary:
      'Sophie says some clients see shoot times an hour off from what she offers. She is confused rather than upset and is gathering examples for us.',
    followUp:
      'It sounds like those clients were booking from another time zone. If you turn on Show times in visitor time zone under Booking page, each client will see the time in their own zone.',
    messages: [
      {
        author: customer(sophie),
        at: at({ days: -2, hours: -4 }),
        body: [
          'Hi, a couple of clients told me my booking page showed 10:00 but their confirmation said 11:00. Others have no issue.',
          'Is there a time zone setting I am missing?',
          'Sophie',
        ],
      },
      {
        author: me,
        at: at({ days: -2 }),
        body: [
          'Hi Sophie,',
          'Thanks for reaching out. Do you know where the affected clients were booking from? If you can forward one of their confirmation emails, I can compare it with your page settings.',
          'John\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4211',
    subject: 'Switching to annual billing',
    status: 'open',
    priority: 'normal',
    channel: 'email',
    buckets: ['billing'],
    customerId: hannah.id,
    assigneeId: ME.id,
    summary:
      'Hannah wants Meridian moved from monthly to annual billing for their new fiscal year. She is organized and needs a quote for 60 seats that matches the purchase order her finance team approved.',
    followUp:
      "I've attached the annual quote for 60 seats with MCG-2207 in the reference field. The switch to annual billing takes effect on your next renewal date, so nothing is charged twice.",
    messages: [
      {
        author: customer(hannah),
        at: at({ days: -2, hours: -5 }),
        body: [
          'Hello,',
          'Our finance team would like to move Meridian to annual billing starting with our new fiscal year. Could you send a quote for 60 seats on the Business plan?',
          'They also need the quote to reference our purchase order number, which I will send once it is approved.',
          'Kind regards,\nHannah Reed\nMeridian Consulting Group',
        ],
      },
      {
        author: me,
        at: at({ days: -2, hours: -2 }),
        body: [
          'Hi Hannah,',
          'Happy to help with that. Annual billing on the Business plan comes with two months free compared to paying monthly, and the switch takes effect on your next renewal date so nothing is charged twice.',
          'I will prepare the quote as soon as I have the purchase order number.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(hannah),
        at: at({ days: -1, hours: -4 }),
        body: [
          'Thank you, John. The purchase order number is MCG-2207.',
          'One more question: Samuel mentioned an invoice problem with extra seats this month. Will that be sorted before the annual quote, so we do not pay for 64 seats for a whole year?',
          'Hannah',
        ],
      },
      {
        author: marcus,
        at: at({ days: -1, hours: -2 }),
        internal: true,
        body: [
          'Same account as the seat issue Samuel raised. Once the four pending invites are revoked, the quote pulls 60 seats automatically. Happy to draft it with the PO in the reference field.',
        ],
      },
      {
        author: me,
        at: at({ days: -1, hours: -1 }),
        body: [
          'Hi Hannah,',
          'Good catch. The four extra seats are pending invites, and we are removing them as part of the corrected invoice for Samuel. Your annual quote will be based on 60 seats.',
          'You will have the quote by tomorrow, with MCG-2207 in the reference field.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(hannah),
        at: at({ hours: -1, minutes: -50 }),
        body: [
          'Perfect, thank you. Our finance team would like to approve it this week, so the sooner the better.',
          'Hannah',
        ],
      },
    ],
  },
  {
    id: '4210',
    subject: 'Security and compliance documents for our review',
    status: 'pending',
    priority: 'normal',
    channel: 'email',
    buckets: ['support'],
    customerId: samuel.id,
    assigneeId: 'janis-considine',
    summary:
      'Samuel needs our security overview and data processing terms for the annual vendor review at Meridian. He is polite and on a deadline set by his compliance team.',
    followUp:
      "Our legal team has countersigned the data processing agreement, and I've attached it here. That completes the documents for your vendor review.",
    messages: [
      {
        author: customer(samuel),
        at: at({ days: -3 }),
        body: [
          'Hello,',
          'Our compliance team is running its annual vendor review. Could you share your latest security overview, a list of subprocessors and a signed data processing agreement?',
          'We need everything by the 20th.',
          'Samuel',
        ],
      },
      {
        author: janis,
        at: at({ days: -2, hours: -8 }),
        body: [
          'Hi Samuel,',
          'I have attached our security overview and the current subprocessor list. Our legal team is countersigning the data processing agreement and I will send it as soon as it is back.',
          'Janis\nTideline Support',
        ],
      },
      {
        author: janis,
        at: at({ days: -2, hours: -7 }),
        internal: true,
        body: [
          'DPA request sent to legal. They usually turn these around in two business days.',
        ],
      },
    ],
  },
  {
    id: '4209',
    subject: 'Receipts need our business name and address',
    status: 'pending',
    priority: 'normal',
    channel: 'email',
    buckets: ['billing'],
    customerId: jamal.id,
    assigneeId: ME.id,
    summary:
      'Jamal needs receipts that show his business name and address for his accountant. He is matter of fact about it and only needs the last three receipts reissued.',
    followUp:
      "Your business name and address are saved, and I've attached your last three receipts reissued with them. Every new receipt will include them from now on.",
    messages: [
      {
        author: customer(jamal),
        at: at({ days: -3, hours: -2 }),
        body: [
          'Hi,',
          'My accountant says the Tideline receipts only show my name and email. She needs my business name and address on them for my taxes.',
          'Can you update them going forward and resend the last three?',
          'Jamal Carter',
        ],
      },
      {
        author: me,
        at: at({ days: -2, hours: -20 }),
        body: [
          'Hi Jamal,',
          'You can add your business name and address under Billing, then Invoice details, and every new receipt will include them. Once they are saved, reply here and I will reissue your last three receipts.',
          'John\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4208',
    subject: 'Matching our booking page to our brand',
    status: 'pending',
    priority: 'low',
    channel: 'email',
    buckets: ['support'],
    customerId: grace.id,
    assigneeId: 'priya-raman',
    summary:
      'Grace wants the booking page to use the colors and font of her studio. She is enthusiastic and has already uploaded her logo.',
    messages: [
      {
        author: customer(grace),
        at: at({ days: -4 }),
        body: [
          'Hi there,',
          'I uploaded our logo, but the booking page is still blue and white. Can I change the colors and the font to match our studio?',
          'Grace\nLumen Yoga Collective',
        ],
      },
      {
        author: priya,
        at: at({ days: -3, hours: -20 }),
        body: [
          'Hi Grace,',
          'Yes! Head to Booking page, then Appearance. You can set an accent color and pick from a few fonts there. Let me know how it looks once you have tried it.',
          'Priya\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4207',
    subject: 'Lessons of different lengths on one page',
    status: 'pending',
    priority: 'normal',
    channel: 'widget',
    buckets: ['support'],
    customerId: tom.id,
    assigneeId: ME.id,
    summary:
      'Tom wants students to choose between 30 and 60 minute piano lessons from a single booking page, each with its own price. He is new to Tideline and is testing the setup we walked him through.',
    followUp:
      "How did the test bookings go? Your students should now see both lesson lengths with their own prices. If anything looks off, I'm happy to review your event type settings with you.",
    messages: [
      {
        author: customer(tom),
        at: at({ days: -4, hours: -3 }),
        body: [
          'Hi, some of my piano students want 30 minute lessons and others want a full hour. Right now my page only offers one length.',
          'Is there a way to let them choose? Sorry if this is obvious, I am still learning my way around.',
          'Tom',
        ],
      },
      {
        author: me,
        at: at({ days: -4, hours: -1 }),
        body: [
          'Hi Tom,',
          'Not obvious at all, happy to help. Open your lesson event type, go to Duration and turn on Multiple durations. Tick 30 and 60 minutes, and students pick one when they book.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(tom),
        at: at({ days: -3, hours: -20 }),
        body: [
          'Thanks! I found it, but the hour costs the same as the half hour. Can each length have its own price?',
          'Tom',
        ],
      },
      {
        author: me,
        at: at({ days: -3, hours: -18 }),
        body: [
          'Hi Tom,',
          'Yes. Once payments are connected, each duration gets its own price field right under the duration list. Connect your payment account under Integrations first and the fields will appear.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(tom),
        at: at({ days: -1, hours: -10 }),
        body: [
          'Payments are connected now. I will set the prices tonight and try a test booking for each length before I share the page with my students.',
          'Tom',
        ],
      },
    ],
  },
  {
    id: '4206',
    subject: 'Exporting all bookings to a spreadsheet',
    status: 'pending',
    priority: 'normal',
    channel: 'email',
    buckets: ['support'],
    customerId: hannah.id,
    assigneeId: 'noor-haddad',
    summary:
      'Hannah needs a full year of client meetings exported for a board report. The default export only covered 90 days, so she is waiting on a larger file from us.',
    messages: [
      {
        author: customer(hannah),
        at: at({ days: -5 }),
        body: [
          'Hello,',
          'I need every booking from the last 12 months in a spreadsheet for a board report. The export button only gives me the last 90 days.',
          'Is there a way to get the full year?',
          'Hannah Reed',
        ],
      },
      {
        author: noor,
        at: at({ days: -4, hours: -18 }),
        body: [
          'Hi Hannah,',
          'You can pick a custom date range in Reports, then Export, which goes back as far as you need. Once you have the file, could you let me know if it covers everything?',
          'Noor\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4205',
    subject: 'Charged twice this month',
    status: 'pending',
    priority: 'high',
    channel: 'email',
    buckets: ['billing'],
    customerId: jamal.id,
    assigneeId: 'marcus-feeney',
    summary:
      'Jamal sees two charges for his monthly plan and is unhappy, since he runs a small business on a tight budget. A refund is underway and he is waiting for it to land.',
    followUp:
      "The refund for the duplicate charge has posted and should now be on your statement. I'm sorry again for the trouble.",
    messages: [
      {
        author: customer(jamal),
        at: at({ days: -6 }),
        body: [
          'Hi,',
          'My card was charged twice for Tideline on the 1st. Same amount, a few minutes apart. Please refund one of them.',
          'Jamal Carter',
        ],
      },
      {
        author: marcus,
        at: at({ days: -5, hours: -22 }),
        internal: true,
        body: [
          'Payment retry fired after a timeout and both attempts succeeded. Refunded the second charge.',
        ],
      },
      {
        author: marcus,
        at: at({ days: -5, hours: -21 }),
        body: [
          'Hi Jamal,',
          'You are right, and I am sorry about that. I have refunded the second charge today. It usually takes 5 to 10 business days to show up on your statement.',
          'Marcus\nTideline Billing',
        ],
      },
    ],
  },
  {
    id: '4204',
    subject: 'Video meeting links missing from confirmations',
    status: 'pending',
    priority: 'high',
    channel: 'email',
    buckets: ['bugs'],
    customerId: lucy.id,
    assigneeId: ME.id,
    summary:
      'Confirmations for client consultations at Cedar & Pine went out without video meeting links, and two clients could not join. Lucy has reconnected the video meeting integration and is testing it.',
    followUp:
      "Did your test booking include the video meeting link? If it did, everything is working again and I'll close this ticket.",
    messages: [
      {
        author: customer(lucy),
        at: at({ days: -7 }),
        body: [
          'Hello,',
          'Our confirmation emails for remote consultations no longer include the video meeting link. Two clients could not join their calls this week.',
          'The integration still shows as connected in our settings.',
          'Lucy Tran\nCedar & Pine Law',
        ],
      },
      {
        author: me,
        at: at({ days: -6, hours: -20 }),
        body: [
          'Hi Lucy,',
          'Sorry for the trouble. The connection to the video meeting integration had expired on our side even though it still showed as connected. Could you disconnect and reconnect it under Integrations, then make a test booking?',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(lucy),
        at: at({ days: -6, hours: -18 }),
        body: [
          'Done, I reconnected it. I will book a test consultation tomorrow morning and let you know.',
          'Lucy',
        ],
      },
    ],
  },
  {
    id: '4203',
    subject: 'Round robin for our front desk team',
    status: 'closed',
    priority: 'low',
    channel: 'widget',
    buckets: ['features'],
    customerId: aisha.id,
    assigneeId: 'priya-raman',
    summary:
      'Aisha asked for new client bookings to be shared evenly across therapists. Round robin already exists, so she was pleased once she found it.',
    messages: [
      {
        author: customer(aisha),
        at: at({ days: -8 }),
        body: [
          'Hi! Can new clients be assigned to whichever therapist has the fewest bookings that week? Right now everyone picks the same two people.',
          'Aisha',
        ],
      },
      {
        author: priya,
        at: at({ days: -7, hours: -22 }),
        body: [
          'Hi Aisha,',
          'Good news, that is round robin and it is included in your plan. Open the event type, choose Round robin under Hosts, and pick balanced distribution.',
          'Priya\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4202',
    subject: 'Remove the seat of a former employee',
    status: 'closed',
    priority: 'normal',
    channel: 'email',
    buckets: ['billing'],
    customerId: hannah.id,
    assigneeId: 'marcus-feeney',
    summary:
      'Hannah wanted a departed consultant removed so Meridian stops paying for the seat. The seat was removed and the next invoice was prorated.',
    messages: [
      {
        author: customer(hannah),
        at: at({ days: -9 }),
        body: [
          'Hello,',
          'One of our consultants left last week. Can you remove her seat and make sure we are not billed for it going forward?',
          'Hannah',
        ],
      },
      {
        author: marcus,
        at: at({ days: -8, hours: -21 }),
        body: [
          'Hi Hannah,',
          'Done. The seat is removed and her bookings were reassigned to Samuel, as listed in your admin settings. Your next invoice will be prorated.',
          'Marcus\nTideline Billing',
        ],
      },
    ],
  },
  {
    id: '4201',
    subject: 'Calendar provider keeps disconnecting',
    status: 'closed',
    priority: 'high',
    channel: 'email',
    buckets: ['bugs'],
    customerId: martin.id,
    assigneeId: ME.id,
    summary:
      'The therapists at Northfield had to reconnect their calendars every few days. The cause was a security policy on his side, and he was relieved once it was sorted.',
    messages: [
      {
        author: customer(martin),
        at: at({ days: -10, hours: -6 }),
        body: [
          'Hi,',
          'Our therapists keep getting a message that their calendar is disconnected. They reconnect it and a few days later it happens again.',
          'Martin',
        ],
      },
      {
        author: me,
        at: at({ days: -10, hours: -4 }),
        internal: true,
        body: [
          'Logs show the calendar provider revoking access every 72 hours. Looks like an admin session policy on their account.',
        ],
      },
      {
        author: me,
        at: at({ days: -10, hours: -3 }),
        body: [
          'Hi Martin,',
          'Your calendar provider is set to revoke app access every three days, which disconnects Tideline. Your admin can add Tideline as a trusted app to stop this.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(martin),
        at: at({ days: -9 }),
        body: [
          'That was it. Our IT person added the exception and everything has stayed connected since. Thanks!',
          'Martin',
        ],
      },
    ],
  },
  {
    id: '4200',
    subject: 'New booking alerts in our chat app',
    status: 'closed',
    priority: 'low',
    channel: 'email',
    buckets: ['support'],
    customerId: owen.id,
    assigneeId: 'noor-haddad',
    summary:
      'Owen wanted new consultation bookings posted to a channel in the firm chat. He set up the chat integration with our guide and confirmed it works.',
    messages: [
      {
        author: customer(owen),
        at: at({ days: -11 }),
        body: [
          'Hello,',
          'Is there a way to post new consultation bookings to a channel in our team chat? The partners would like to see them as they come in.',
          'Owen',
        ],
      },
      {
        author: noor,
        at: at({ days: -10, hours: -20 }),
        body: [
          'Hi Owen,',
          'Yes, connect the chat integration under Integrations and choose the channel for new bookings. Here is our setup guide: https://help.example.com/chat-integration',
          'Noor\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4199',
    subject: 'Password reset link says it expired',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['support'],
    customerId: sophie.id,
    assigneeId: 'clara-moreau',
    summary:
      'The reset link for Sophie expired before she opened it. A fresh link solved it right away.',
    messages: [
      {
        author: customer(sophie),
        at: at({ days: -12 }),
        body: [
          'Hi, I clicked the reset link this morning and it says it expired. Can you send me a new one?',
          'Sophie',
        ],
      },
      {
        author: clara,
        at: at({ days: -11, hours: -23 }),
        body: [
          'Hi Sophie,',
          'Reset links are valid for one hour, so it timed out. I just sent you a fresh one, it should be in your inbox now.',
          'Clara\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4198',
    subject: 'Data processing agreement for our records',
    status: 'closed',
    priority: 'normal',
    channel: 'email',
    buckets: ['support'],
    customerId: elena.id,
    assigneeId: 'janis-considine',
    summary:
      'Elena needed a signed data processing agreement for the patient privacy records at Harborline. She received it within two days and was happy with the turnaround.',
    messages: [
      {
        author: customer(elena),
        at: at({ days: -15 }),
        body: [
          'Hello,',
          'For our patient privacy records, we need a signed data processing agreement with Tideline. Could you send one over?',
          'Elena',
        ],
      },
      {
        author: janis,
        at: at({ days: -13, hours: -4 }),
        body: [
          'Hi Elena,',
          'Attached is our data processing agreement, countersigned by our legal team. Let me know if your compliance officer needs anything else.',
          'Janis\nTideline Support',
        ],
      },
      {
        author: customer(elena),
        at: at({ days: -13 }),
        body: ['Received, thank you Janis!'],
      },
    ],
  },
  {
    id: '4197',
    subject: 'Is round robin available on the Free plan?',
    status: 'closed',
    priority: 'low',
    channel: 'widget',
    buckets: ['features', 'billing'],
    customerId: peter.id,
    assigneeId: 'clara-moreau',
    summary:
      'Peter is growing his tutoring business and asked about round robin on the Free plan. He understood it needs the Team plan and plans to upgrade once he hires a second tutor.',
    messages: [
      {
        author: customer(peter),
        at: at({ days: -16 }),
        body: [
          'Hi, I am hiring a second tutor soon. Can I use round robin on the Free plan, or do I need to upgrade?',
          'Peter',
        ],
      },
      {
        author: clara,
        at: at({ days: -15, hours: -22 }),
        body: [
          'Hi Peter,',
          'Round robin is part of the Team plan, since it needs more than one host. When you add your second tutor, you can upgrade from Billing and set it up in a few minutes.',
          'Clara\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4196',
    subject: 'Booking page shows the wrong time zone',
    status: 'closed',
    priority: 'normal',
    channel: 'email',
    buckets: ['bugs'],
    customerId: daniel.id,
    assigneeId: ME.id,
    summary:
      'Daniel noticed the Harborline booking page listed times in Eastern time instead of Central. A location setting was the cause and he fixed it himself.',
    messages: [
      {
        author: customer(daniel),
        at: at({ days: -17, hours: -5 }),
        body: [
          'Hi,',
          'Our booking page shows times in Eastern time, but our office is in Austin. Patients are picking slots an hour off.',
          'Daniel',
        ],
      },
      {
        author: me,
        at: at({ days: -17, hours: -3 }),
        internal: true,
        body: [
          'The Austin location has its time zone set to New York. Probably copied from a template location.',
        ],
      },
      {
        author: me,
        at: at({ days: -17, hours: -2 }),
        body: [
          'Hi Daniel,',
          'The Austin location is set to Eastern time under Locations. Switching it to Central will update the booking page right away.',
          'John\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4195',
    subject: 'Refund for unused seats',
    status: 'closed',
    priority: 'normal',
    channel: 'email',
    buckets: ['billing'],
    customerId: samuel.id,
    assigneeId: 'marcus-feeney',
    summary:
      'Samuel asked for a credit after Meridian downsized a team mid-cycle. He accepted a prorated credit on the next invoice.',
    messages: [
      {
        author: customer(samuel),
        at: at({ days: -19 }),
        body: [
          'Hello,',
          'We removed 8 seats in the middle of the billing cycle after a team restructure. Can we get a refund for the unused time?',
          'Samuel',
        ],
      },
      {
        author: marcus,
        at: at({ days: -18, hours: -20 }),
        body: [
          'Hi Samuel,',
          'We do not refund to the card mid-cycle, but I have added a prorated credit for the 8 seats. It will be applied to your next invoice automatically.',
          'Marcus\nTideline Billing',
        ],
      },
      {
        author: customer(samuel),
        at: at({ days: -18 }),
        body: ['That works for us. Thanks, Marcus.'],
      },
    ],
  },
  {
    id: '4194',
    subject: 'Our logo in reminder emails',
    status: 'closed',
    priority: 'low',
    channel: 'email',
    buckets: ['features'],
    customerId: lucy.id,
    assigneeId: 'priya-raman',
    summary:
      'Lucy asked to show the firm logo in reminder emails. Priya logged the request for the product team and Lucy was fine with waiting.',
    messages: [
      {
        author: customer(lucy),
        at: at({ days: -20 }),
        body: [
          'Hi,',
          'Could our logo appear at the top of reminder emails, the same way it does on the booking page?',
          'Lucy',
        ],
      },
      {
        author: priya,
        at: at({ days: -19, hours: -21 }),
        body: [
          'Hi Lucy,',
          'Not yet, but it is a great idea and I have passed it to our product team. I will let you know when branded reminder emails are available.',
          'Priya\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4193',
    subject: 'Booking widget blank on phones',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['bugs'],
    customerId: yuki.id,
    assigneeId: 'noor-haddad',
    summary:
      'The booking widget for Yuki did not render on phones after a website theme update. A fix for the embed code solved it and she thanked the team.',
    messages: [
      {
        author: customer(yuki),
        at: at({ days: -21, hours: -3 }),
        body: [
          'Hi, my booking widget works on my laptop but shows nothing on my phone. A few clients have mentioned it.',
          'Yuki',
        ],
      },
      {
        author: noor,
        at: at({ days: -21 }),
        body: [
          'Hi Yuki,',
          'Your new website theme sets a fixed height on the widget container, which hides it on small screens. If you replace the embed code with the latest version from Booking page, then Share, it will size itself.',
          'Noor\nTideline Support',
        ],
      },
      {
        author: customer(yuki),
        at: at({ days: -20, hours: -18 }),
        body: ['Swapped it in and it works on my phone now. Thank you!'],
      },
    ],
  },
  {
    id: '4192',
    subject: 'Adding a new attorney to our consultation page',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['support'],
    customerId: owen.id,
    assigneeId: 'clara-moreau',
    summary:
      'Owen wanted a new associate to appear on the consultation page with her own availability. Clara walked him through inviting her and adding her as a host.',
    messages: [
      {
        author: customer(owen),
        at: at({ days: -24 }),
        body: [
          'Hello, a new associate joins us on Monday. How do I add her to our consultation page so clients can book time with her?',
          'Owen',
        ],
      },
      {
        author: clara,
        at: at({ days: -23, hours: -21 }),
        body: [
          'Hi Owen,',
          'Invite her from Team, then add her as a host on the consultation event type. Once she connects her calendar, her open hours will show up on the page automatically.',
          'Clara\nTideline Support',
        ],
      },
      {
        author: customer(owen),
        at: at({ days: -23, hours: -18 }),
        body: ['She is set up and already has two bookings. Thank you!'],
      },
    ],
  },
  {
    id: '4191',
    subject: 'Waitlist notifications sent twice',
    status: 'closed',
    priority: 'high',
    channel: 'widget',
    buckets: ['bugs'],
    customerId: aisha.id,
    assigneeId: 'noor-haddad',
    summary:
      'Clients on the Northfield waitlist got two emails for every opening, and some showed up for the same slot. Noor found a duplicated automation and Aisha confirmed it stopped.',
    messages: [
      {
        author: customer(aisha),
        at: at({ days: -27 }),
        body: [
          'Hi, clients on our waitlist are getting two emails every time a slot opens up. Yesterday two of them arrived for the same appointment.',
          'Aisha\nNorthfield Physio',
        ],
      },
      {
        author: noor,
        at: at({ days: -26, hours: -20 }),
        body: [
          'Hi Aisha,',
          'Your account had two copies of the waitlist automation, one created during setup and one added later. I have turned off the older one, so each opening now sends a single email.',
          'Noor\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4190',
    subject: 'New billing contact for Meridian',
    status: 'closed',
    priority: 'low',
    channel: 'widget',
    buckets: ['billing'],
    customerId: samuel.id,
    assigneeId: 'marcus-feeney',
    summary:
      'Samuel asked for invoices to go to the new accounts payable inbox at Meridian. Marcus updated the billing contact the same day.',
    messages: [
      {
        author: customer(samuel),
        at: at({ days: -31 }),
        body: [
          'Hi, please send our invoices to ap@meridian.example.com from now on instead of my address.',
          'Samuel',
        ],
      },
      {
        author: marcus,
        at: at({ days: -30, hours: -22 }),
        body: [
          'Hi Samuel,',
          'Done. Invoices and payment receipts will go to ap@meridian.example.com starting with the next billing cycle, and you will stay copied on renewal notices.',
          'Marcus\nTideline Billing',
        ],
      },
    ],
  },
  {
    id: '4189',
    subject: 'Booking a series of classes at once',
    status: 'closed',
    priority: 'low',
    channel: 'widget',
    buckets: ['features'],
    customerId: grace.id,
    assigneeId: 'priya-raman',
    summary:
      'Grace asked whether members could book a full six week course in one go. Priya showed her the course option for event types and Grace set up her first series.',
    messages: [
      {
        author: customer(grace),
        at: at({ days: -34 }),
        body: [
          'Hi! We are launching a six week beginner course. Can members book all six classes at once instead of one at a time?',
          'Grace',
        ],
      },
      {
        author: priya,
        at: at({ days: -33, hours: -21 }),
        body: [
          'Hi Grace,',
          'Yes, create the event type as a course and add the six dates. Members book the whole series in one step and get a single confirmation with every date.',
          'Priya\nTideline Support',
        ],
      },
      {
        author: customer(grace),
        at: at({ days: -33, hours: -17 }),
        body: ['Perfect, the course is live and filling up already.'],
      },
    ],
  },
  {
    id: '4188',
    subject: 'Booking meetings on behalf of the partners',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['support'],
    customerId: hannah.id,
    assigneeId: ME.id,
    summary:
      'Hannah needed to book client meetings directly into the calendars of the Meridian partners. She was given scheduling access for each partner and was happy with the setup.',
    messages: [
      {
        author: customer(hannah),
        at: at({ days: -38 }),
        body: [
          'Hello, I schedule meetings for three of our partners. Is there a way for me to book into their calendars without logging in as them?',
          'Hannah',
        ],
      },
      {
        author: me,
        at: at({ days: -37, hours: -22 }),
        body: [
          'Hi Hannah,',
          'Each partner can give you scheduling access under Team, then Permissions. You will then see their calendars in your dashboard and can book on their behalf, and they still get the confirmations.',
          'John\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4187',
    subject: 'Duplicate client records after import',
    status: 'closed',
    priority: 'high',
    channel: 'email',
    buckets: ['bugs'],
    customerId: owen.id,
    assigneeId: 'noor-haddad',
    summary:
      'An import of the Cedar & Pine client list created duplicates for clients who already had bookings. Noor merged the records and Owen confirmed the client history was intact.',
    messages: [
      {
        author: customer(owen),
        at: at({ days: -45 }),
        body: [
          'Hello,',
          'We imported our client list yesterday and now many clients appear twice, once with their bookings and once without. Our staff are not sure which record to use.',
          'Owen Fletcher\nCedar & Pine Law',
        ],
      },
      {
        author: noor,
        at: at({ days: -44, hours: -19 }),
        body: [
          'Hi Owen,',
          'The import matched clients by name instead of email, so existing clients were added again. I have merged 212 duplicates into the original records and kept every booking and note.',
          'Noor\nTideline Support',
        ],
      },
      {
        author: customer(owen),
        at: at({ days: -44, hours: -16 }),
        body: [
          'Checked a few of them and everything looks right. Thanks, Noor.',
        ],
      },
    ],
  },
  {
    id: '4186',
    subject: 'Adding a new therapist to the schedule',
    status: 'closed',
    priority: 'normal',
    channel: 'email',
    buckets: ['support'],
    customerId: aisha.id,
    assigneeId: 'clara-moreau',
    summary:
      'Aisha wanted a new therapist bookable for follow-ups only while she finished onboarding. Clara explained how to limit her to selected event types.',
    messages: [
      {
        author: customer(aisha),
        at: at({ days: -52 }),
        body: [
          'Hi,',
          'A new therapist starts next week. For her first month she should only take follow-up appointments, not first assessments. Can we set that up?',
          'Aisha',
        ],
      },
      {
        author: clara,
        at: at({ days: -51, hours: -21 }),
        body: [
          'Hi Aisha,',
          'Add her as a host on the follow-up event type only. She will not appear for first assessments until you add her there as well.',
          'Clara\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4185',
    subject: 'Consultants signed out and unable to log in',
    status: 'closed',
    priority: 'urgent',
    channel: 'email',
    buckets: ['bugs'],
    customerId: samuel.id,
    assigneeId: ME.id,
    summary:
      'Every consultant at Meridian was signed out after a plan change and could not log back in. Access was restored within the hour and Samuel thanked the team for the fast response.',
    messages: [
      {
        author: customer(samuel),
        at: at({ days: -60 }),
        body: [
          'Hello,',
          'All of our consultants were signed out this morning and nobody can log back in. We have client meetings all day and cannot see our schedules.',
          'Please treat this as urgent.',
          'Samuel Ortiz\nMeridian Consulting Group',
        ],
      },
      {
        author: me,
        at: at({ days: -59, hours: -23 }),
        body: [
          'Hi Samuel,',
          'Your plan change this morning reset the allowed login methods on the account. I have restored them, and your team can sign in again right away. I am sorry for the disruption.',
          'John\nTideline Support',
        ],
      },
      {
        author: customer(samuel),
        at: at({ days: -59, hours: -22 }),
        body: ['Everyone is back in. Thank you for the quick turnaround.'],
      },
    ],
  },
  {
    id: '4184',
    subject: 'Upgrading the studio to the Team plan',
    status: 'closed',
    priority: 'normal',
    channel: 'email',
    buckets: ['billing'],
    customerId: grace.id,
    assigneeId: 'marcus-feeney',
    summary:
      'Grace asked what the Team plan would cost for six instructors and how the switch would be billed. She upgraded after Marcus explained the prorated charge.',
    messages: [
      {
        author: customer(grace),
        at: at({ days: -68 }),
        body: [
          'Hello,',
          'We now have six instructors and would like everyone to have their own schedule. What would the Team plan cost us, and when would we be charged?',
          'Grace\nLumen Yoga Collective',
        ],
      },
      {
        author: marcus,
        at: at({ days: -67, hours: -20 }),
        body: [
          'Hi Grace,',
          'The Team plan is billed per seat, so six instructors would be six seats. If you upgrade today, you pay a prorated amount for the rest of this month and the full price from your next billing date.',
          'Marcus\nTideline Billing',
        ],
      },
      {
        author: customer(grace),
        at: at({ days: -67, hours: -15 }),
        body: ['Thanks, Marcus. We just upgraded.'],
      },
    ],
  },
  {
    id: '4183',
    subject: 'Shared calendar view for assistants',
    status: 'closed',
    priority: 'low',
    channel: 'email',
    buckets: ['features'],
    customerId: hannah.id,
    assigneeId: 'priya-raman',
    summary:
      'Hannah asked for a single view showing the calendars of several partners side by side. Priya logged the request and pointed her to the team calendar in the meantime.',
    messages: [
      {
        author: customer(hannah),
        at: at({ days: -75 }),
        body: [
          'Hello,',
          'It would help a lot to see the calendars of all the partners I support side by side, so I can find a time that works for everyone.',
          'Hannah',
        ],
      },
      {
        author: priya,
        at: at({ days: -74, hours: -20 }),
        body: [
          'Hi Hannah,',
          'Thank you for the idea, I have shared it with our product team. In the meantime, the team calendar under Schedule lets you pick several people and shows their bookings together.',
          'Priya\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4182',
    subject: 'Updating the clinic card on file',
    status: 'closed',
    priority: 'low',
    channel: 'email',
    buckets: ['billing'],
    customerId: aisha.id,
    assigneeId: 'marcus-feeney',
    summary:
      'Aisha needed to replace the expiring clinic card before the next renewal. Marcus showed her where to update it and confirmed the new card was saved.',
    messages: [
      {
        author: customer(aisha),
        at: at({ days: -88 }),
        body: [
          'Hi, the clinic card on file expires this month. Martin asked me to update it, but I cannot find where to do that.',
          'Aisha',
        ],
      },
      {
        author: marcus,
        at: at({ days: -87, hours: -21 }),
        body: [
          'Hi Aisha,',
          'Card details are under Billing, then Payment method. I have also given you billing access, since that page is only visible to admins by default.',
          'Marcus\nTideline Billing',
        ],
      },
      {
        author: customer(aisha),
        at: at({ days: -87, hours: -18 }),
        body: ['Updated, thank you!'],
      },
    ],
  },
  {
    id: '4181',
    subject: 'Keep client notes visible to attorneys only',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['features'],
    customerId: owen.id,
    assigneeId: 'janis-considine',
    summary:
      'Owen wanted client notes hidden from front desk staff for confidentiality. Janis explained that note visibility follows team roles and helped him set up a restricted role.',
    messages: [
      {
        author: customer(owen),
        at: at({ days: -110 }),
        body: [
          'Hello, our front desk can see the notes attorneys add to client bookings. For confidentiality, can we limit notes to attorneys only?',
          'Owen',
        ],
      },
      {
        author: janis,
        at: at({ days: -109, hours: -20 }),
        body: [
          'Hi Owen,',
          'Note visibility follows team roles. If you create a Front desk role under Team, then Roles, and turn off View notes, your front desk can still manage bookings without seeing any notes.',
          'Janis\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4180',
    subject: 'Hide internal meetings from our booking page',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['features'],
    customerId: samuel.id,
    assigneeId: 'priya-raman',
    summary:
      'Samuel wanted internal meeting types bookable by staff but hidden from clients. Priya showed him the secret event type setting and he was glad it already existed.',
    messages: [
      {
        author: customer(samuel),
        at: at({ days: -140 }),
        body: [
          'Hi, we use Tideline for internal reviews too, but those meeting types show up on our public page. Can we hide them from clients?',
          'Samuel',
        ],
      },
      {
        author: priya,
        at: at({ days: -139, hours: -21 }),
        body: [
          'Hi Samuel,',
          'Mark those event types as Secret in their settings. They disappear from the public page, but anyone with the direct link can still book them.',
          'Priya\nTideline Support',
        ],
      },
      {
        author: customer(samuel),
        at: at({ days: -139, hours: -19 }),
        body: ['Exactly what we needed, thanks.'],
      },
    ],
  },
  {
    id: '4179',
    subject: 'Setting up our first class schedule',
    status: 'closed',
    priority: 'normal',
    channel: 'widget',
    buckets: ['support'],
    customerId: grace.id,
    assigneeId: ME.id,
    summary:
      'Grace had just signed up and wanted her weekly class timetable on the booking page. She followed the setup steps and published the schedule the same day.',
    messages: [
      {
        author: customer(grace),
        at: at({ days: -190 }),
        body: [
          'Hi! We just signed up. We run about twenty classes a week. What is the quickest way to get them all on our booking page?',
          'Grace',
        ],
      },
      {
        author: me,
        at: at({ days: -189, hours: -22 }),
        body: [
          'Hi Grace,',
          'Welcome to Tideline! Create one event type per class style, then add the weekly times under Recurring slots. Your booking page will show the full timetable as soon as you publish.',
          'John\nTideline Support',
        ],
      },
    ],
  },
  {
    id: '4178',
    subject: 'Invoice addressed to the wrong office',
    status: 'closed',
    priority: 'high',
    channel: 'email',
    buckets: ['billing'],
    customerId: hannah.id,
    assigneeId: 'marcus-feeney',
    summary:
      'The Meridian invoice listed an old office address, so their finance team could not process it. Marcus reissued it with the correct address and Hannah confirmed it was paid.',
    messages: [
      {
        author: customer(hannah),
        at: at({ days: -260 }),
        body: [
          'Hello,',
          'Our latest invoice shows the address of an office we closed last year, and our finance team cannot process it. Could you reissue it with our current address?',
          'Hannah Reed\nMeridian Consulting Group',
        ],
      },
      {
        author: marcus,
        at: at({ days: -259, hours: -21 }),
        body: [
          'Hi Hannah,',
          'I have updated the billing address and attached the reissued invoice. Future invoices will use the new address automatically.',
          'Marcus\nTideline Billing',
        ],
      },
      {
        author: customer(hannah),
        at: at({ days: -258 }),
        body: ['Thank you, it has been paid.'],
      },
    ],
  },
];

export const TICKETS: Ticket[] = SEEDS.map((seed): Ticket => ({
  unread: false,
  followUp: null,
  ...seed,
  createdAt: seed.messages[0].at,
  updatedAt: seed.messages[seed.messages.length - 1].at,
  messages: seed.messages.map((message, i) => ({
    internal: false,
    ...message,
    id: `${seed.id}-${i + 1}`,
  })),
}));

export const inQueue = (ticket: Ticket, queue: Queue) => {
  switch (queue) {
    case 'mine':
      return ticket.assigneeId === ME.id && ticket.status !== 'closed';
    case 'unassigned':
      return ticket.assigneeId === null && ticket.status !== 'closed';
    case 'urgent':
      return ticket.priority === 'urgent' && ticket.status !== 'closed';
    case 'open':
    case 'pending':
    case 'closed':
      return ticket.status === queue;
    default:
      return ticket.buckets.includes(queue);
  }
};

@Service()
export class TicketsService {
  // Data
  readonly tickets = signal<Ticket[]>(TICKETS);
  readonly buckets = signal<Bucket[]>(BUCKETS);
  readonly counts = computed(
    () =>
      Object.fromEntries(
        [...VIEWS, ...this.buckets()].map(({ id }) => [
          id,
          this.tickets().filter((ticket) => inQueue(ticket, id)).length,
        ])
      ) as Record<Queue, number>
  );

  byId(id: string) {
    return this.tickets().find((ticket) => ticket.id === id) ?? null;
  }

  byCustomer(customerId: string) {
    return this.tickets().filter((ticket) => ticket.customerId === customerId);
  }

  setUnread(id: string, unread: boolean) {
    this.update(id, (ticket) => ({ ...ticket, unread }));
  }

  setStatus(id: string, status: TicketStatus) {
    this.update(id, (ticket) => ({ ...ticket, status }));
  }

  setPriority(id: string, priority: TicketPriority) {
    this.update(id, (ticket) => ({ ...ticket, priority }));
  }

  setBuckets(id: string, buckets: BucketId[]) {
    this.update(id, (ticket) => ({ ...ticket, buckets }));
  }

  assign(id: string, assigneeId: string | null) {
    this.update(id, (ticket) => ({ ...ticket, assigneeId }));
  }

  reply(id: string, body: string, internal: boolean) {
    const message: Message = {
      id: crypto.randomUUID(),
      author: me,
      at: new Date().toISOString(),
      body: body.split(/\n\s*\n/),
      internal,
    };

    this.update(id, (ticket) => ({
      ...ticket,
      updatedAt: message.at,
      messages: [...ticket.messages, message],
    }));
  }

  createBucket(bucket: Pick<Bucket, 'name' | 'hue'>) {
    const created: Bucket = {
      id: crypto.randomUUID(),
      ...bucket,
      ...BUCKET_HUES[bucket.hue],
      empty: `No ${bucket.name.toLowerCase()} tickets.`,
    };

    this.buckets.update((buckets) => [...buckets, created]);

    return created;
  }

  updateBucket(id: string, patch: Pick<Bucket, 'name' | 'hue'>) {
    this.buckets.update((buckets) =>
      buckets.map((bucket) =>
        bucket.id === id
          ? {
              ...bucket,
              ...patch,
              ...BUCKET_HUES[patch.hue],
              empty: `No ${patch.name.toLowerCase()} tickets.`,
            }
          : bucket
      )
    );
  }

  removeBucket(id: string) {
    this.buckets.update((buckets) =>
      buckets.filter((bucket) => bucket.id !== id)
    );

    this.tickets.update((tickets) =>
      tickets.map((ticket) => ({
        ...ticket,
        buckets: ticket.buckets.filter((bucketId) => bucketId !== id),
      }))
    );
  }

  private update(id: string, fn: (ticket: Ticket) => Ticket) {
    this.tickets.update((tickets) =>
      tickets.map((ticket) => (ticket.id === id ? fn(ticket) : ticket))
    );
  }
}
