import { Service, signal } from '@angular/core';
import { add, Duration } from 'date-fns';
import { ME } from '@/app/domains/admin/modules/agents/data/agents';

export type HelpArticleStatus = 'draft' | 'published' | 'archived';

export type HelpCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type HelpArticle = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: HelpArticleStatus;
  authorId: string;
  views: number;
  updatedAt: string;
  createdAt: string;
};

type HelpArticleSeed = Omit<HelpArticle, 'body'> & {
  body: string[];
};

export const STATUSES: {
  id: HelpArticleStatus;
  label: string;
  badge: string;
}[] = [
  {
    id: 'draft',
    label: 'Draft',
    badge: 'border-neutral-a6 bg-neutral-a3 text-neutral-a11',
  },
  {
    id: 'published',
    label: 'Published',
    badge: 'border-green-a6 bg-green-a3 text-green-a11',
  },
  {
    id: 'archived',
    label: 'Archived',
    badge: 'border-amber-a6 bg-amber-a3 text-amber-a11',
  },
];

export const CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting started',
    description: 'Set up Tideline and take your first bookings.',
    icon: 'rocket',
  },
  {
    id: 'account-and-billing',
    name: 'Account and billing',
    description: 'Plans, invoices, deposits and your account.',
    icon: 'credit-card',
  },
  {
    id: 'tickets-and-channels',
    name: 'Tickets and channels',
    description: 'How customers reach support and how we respond.',
    icon: 'ticket',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect calendars, payments and your website.',
    icon: 'plug',
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Fixes for the most common problems.',
    icon: 'wrench',
  },
];

const now = new Date();
const at = (duration: Duration) => add(now, duration).toISOString();

const SEEDS: HelpArticleSeed[] = [
  {
    id: '1001',
    categoryId: 'getting-started',
    title: 'Set up your booking page',
    slug: 'set-up-your-booking-page',
    excerpt:
      'Publish the page your clients use to book, with your services, hours and team.',
    status: 'published',
    authorId: ME.id,
    views: 4820,
    createdAt: at({ days: -210 }),
    updatedAt: at({ days: -12 }),
    body: [
      'Your booking page is where clients pick a service, choose a time and confirm their visit. It takes about ten minutes to set up.',
      '## Before you start',
      '- Add your business hours under **Settings**, then **Hours**.\n- Invite the team members who take bookings.\n- Create at least one event type.',
      '## Publish your page',
      '1. Open **Booking page** from the sidebar.\n2. Upload your logo and pick a brand color.\n3. Choose which event types to show.\n4. Select **Publish**.',
      'Your page is live at an address like this one:',
      '```\nhttps://book.example.com/harborline-dental\n```',
      'Share the link in your email signature, on social media or embed it on your website with the [booking widget](https://help.example.com/embed-the-booking-widget).',
    ],
  },
  {
    id: '1002',
    categoryId: 'getting-started',
    title: 'Create your first event type',
    slug: 'create-your-first-event-type',
    excerpt:
      'Event types describe what clients can book: a checkup, a class or a consultation.',
    status: 'published',
    authorId: 'priya-raman',
    views: 3105,
    createdAt: at({ days: -205 }),
    updatedAt: at({ days: -30 }),
    body: [
      'An event type is anything a client can book with you. Each one has its own duration, price and team members.',
      '## Create an event type',
      '1. Go to **Event types** and select **New event type**.\n2. Give it a clear name, like _New patient checkup_.\n3. Set the duration and the buffer time between visits.\n4. Assign the team members who offer it.',
      '## Good to know',
      '- Clients only see event types that have at least one team member.\n- Buffer time is not shown to clients, it only blocks the calendar.\n- You can hide an event type without deleting it.',
      'Every event type gets its own link, so you can send clients straight to it:',
      '```\nhttps://book.example.com/harborline-dental/checkup\n```',
    ],
  },
  {
    id: '1003',
    categoryId: 'account-and-billing',
    title: 'Update your billing details',
    slug: 'update-your-billing-details',
    excerpt:
      'Change the address, tax number or email address that appear on your invoices.',
    status: 'published',
    authorId: 'marcus-feeney',
    views: 1240,
    createdAt: at({ days: -150 }),
    updatedAt: at({ days: -40 }),
    body: [
      'Invoices use the billing details on file at the moment they are issued. Update them before your next renewal so your finance team can process the invoice right away.',
      '## Change your details',
      '1. Open **Settings**, then **Billing**.\n2. Select **Edit** next to _Billing details_.\n3. Update the address, tax number or invoice email.\n4. Select **Save**.',
      '## Past invoices',
      'Changes apply to future invoices only. If a past invoice shows an old address, contact us and we will reissue it. Mention the invoice number in your message:',
      '```\nINV-2026-0142\n```',
    ],
  },
  {
    id: '1004',
    categoryId: 'account-and-billing',
    title: 'Change or cancel your plan',
    slug: 'change-or-cancel-your-plan',
    excerpt:
      'Move between Free, Team and Business, or cancel your subscription at any time.',
    status: 'published',
    authorId: 'marcus-feeney',
    views: 2210,
    createdAt: at({ days: -180 }),
    updatedAt: at({ days: -60 }),
    body: [
      'You can change your plan at any time. Upgrades take effect right away, downgrades at the end of your billing period.',
      '## Upgrade or downgrade',
      '1. Open **Settings**, then **Billing**.\n2. Select **Change plan**.\n3. Pick the new plan and confirm.',
      '## Cancel your subscription',
      '- Your booking page stays online until the end of the billing period.\n- Upcoming bookings are kept and you can export them.\n- You can reactivate within 90 days without losing data.',
      'To export your bookings before you leave, use the export link in **Settings**, then **Data**:',
      '```\nhttps://app.example.com/settings/data/export\n```',
    ],
  },
  {
    id: '1005',
    categoryId: 'account-and-billing',
    title: 'Take deposits for appointments',
    slug: 'take-deposits-for-appointments',
    excerpt: 'Ask new clients for a deposit when they book to reduce no-shows.',
    status: 'draft',
    authorId: 'marcus-feeney',
    views: 0,
    createdAt: at({ days: -6 }),
    updatedAt: at({ days: -1 }),
    body: [
      'Deposits are collected when a client books and deducted from the final price of the visit.',
      '## Turn on deposits',
      '1. Connect a payment account under **Integrations**.\n2. Open an event type and select **Payments**.\n3. Choose a fixed amount or a percentage of the price.',
      '## Who pays a deposit',
      '- Everyone, or only new clients.\n- Refunds follow your cancellation policy.\n- Deposits show up in your payouts two business days later.',
    ],
  },
  {
    id: '1006',
    categoryId: 'tickets-and-channels',
    title: 'Contact support',
    slug: 'contact-support',
    excerpt: 'Reach our team by email or from the chat bubble inside Tideline.',
    status: 'published',
    authorId: 'janis-considine',
    views: 1930,
    createdAt: at({ days: -200 }),
    updatedAt: at({ days: -20 }),
    body: [
      'Our support team answers every request, usually within a few hours on business days.',
      '## Ways to reach us',
      '- **Chat:** select the chat bubble in the bottom corner of Tideline.\n- **Email:** write to support@example.com from the address on your account.',
      '## Help us help you faster',
      '1. Describe what you expected and what happened instead.\n2. Add the booking or invoice number if there is one.\n3. Attach a screenshot when something looks wrong.',
      'If you write from a different address, include your booking page link so we can find your account:',
      '```\nhttps://book.example.com/your-business\n```',
    ],
  },
  {
    id: '1007',
    categoryId: 'tickets-and-channels',
    title: 'Phone support hours',
    slug: 'phone-support-hours',
    excerpt: 'Phone support has been replaced by chat and email.',
    status: 'archived',
    authorId: 'janis-considine',
    views: 2480,
    createdAt: at({ days: -420 }),
    updatedAt: at({ days: -120 }),
    body: [
      'We no longer offer phone support. Chat and email reach the same team and keep a written record of every answer.',
      '## Where to go instead',
      '- Use the chat bubble inside Tideline for quick questions.\n- Email support@example.com for anything that needs attachments.',
    ],
  },
  {
    id: '1008',
    categoryId: 'integrations',
    title: 'Connect your calendar',
    slug: 'connect-your-calendar',
    excerpt:
      'Sync bookings to the calendar of each team member and block times they are busy.',
    status: 'published',
    authorId: 'noor-haddad',
    views: 5310,
    createdAt: at({ days: -190 }),
    updatedAt: at({ days: -8 }),
    body: [
      'A connected calendar works both ways: new bookings appear in it, and busy times in it are blocked on your booking page.',
      '## Connect a calendar',
      '1. Open **Settings**, then **Calendars**.\n2. Select **Connect calendar** and sign in with your calendar provider.\n3. Choose which calendars to check for conflicts.\n4. Pick the calendar that receives new bookings.',
      '## Things to check',
      '- Each team member connects their own calendar.\n- Changing your calendar password disconnects it, see [Calendar sync stopped](https://help.example.com/calendar-sync-stopped-after-a-password-change).\n- All day events do not block bookings unless you turn that on.',
      'Bookings sync with this title format, which you can change in the same settings page:',
      '```\n{event_type} with {client_name}\n```',
    ],
  },
  {
    id: '1009',
    categoryId: 'integrations',
    title: 'Embed the booking widget',
    slug: 'embed-the-booking-widget',
    excerpt: 'Let clients book from your own website without leaving the page.',
    status: 'published',
    authorId: 'noor-haddad',
    views: 3870,
    createdAt: at({ days: -170 }),
    updatedAt: at({ days: -15 }),
    body: [
      'The booking widget shows your booking page inside your website. It works with any site builder that lets you add HTML.',
      '## Add the widget',
      '1. Open **Booking page**, then **Share**.\n2. Select **Embed** and copy the snippet.\n3. Paste it where the widget should appear on your site.',
      '```html\n<div data-tideline="harborline-dental"></div>\n<script src="https://widget.example.com/v2/embed.js" async></script>\n```',
      '## Customize it',
      '- Set `data-event-type` to open a single event type.\n- Set `data-theme="dark"` on dark websites.\n- The widget follows the brand color of your booking page.',
    ],
  },
  {
    id: '1010',
    categoryId: 'integrations',
    title: 'Send bookings to other apps with webhooks',
    slug: 'send-bookings-to-other-apps-with-webhooks',
    excerpt:
      'Notify your own systems whenever a booking is created, moved or canceled.',
    status: 'draft',
    authorId: 'noor-haddad',
    views: 0,
    createdAt: at({ days: -9 }),
    updatedAt: at({ hours: -5 }),
    body: [
      'Webhooks send a request to an address you choose every time something happens to a booking.',
      '## Create a webhook',
      '1. Open **Settings**, then **Integrations**.\n2. Select **New webhook** and enter your endpoint.\n3. Choose the events to send.',
      '## Payload',
      'Every request carries a JSON body like this one:',
      '```json\n{\n  "event": "booking.created",\n  "booking": {\n    "id": "bk_8f2a",\n    "eventType": "checkup",\n    "start": "2026-10-08T09:00:00Z",\n    "client": { "email": "elena@example.com" }\n  }\n}\n```',
      '- Respond with a `2xx` status within ten seconds.\n- Failed requests are retried for up to 24 hours.',
    ],
  },
  {
    id: '1011',
    categoryId: 'integrations',
    title: 'Legacy calendar feeds',
    slug: 'legacy-calendar-feeds',
    excerpt:
      'Read only calendar feeds, replaced by two way calendar connections.',
    status: 'archived',
    authorId: 'noor-haddad',
    views: 410,
    createdAt: at({ days: -400 }),
    updatedAt: at({ days: -90 }),
    body: [
      'Calendar feeds were a read only way to see bookings in another calendar. They are replaced by [calendar connections](https://help.example.com/connect-your-calendar), which also block busy times.',
      '## Existing feeds',
      'Feeds created before the change keep working until the end of the year. They use addresses like this one:',
      '```\nhttps://feeds.example.com/ical/harborline-dental.ics\n```',
      '- New feeds can no longer be created.\n- Switch to a calendar connection to keep your bookings in sync.',
    ],
  },
  {
    id: '1012',
    categoryId: 'troubleshooting',
    title: 'Calendar sync stopped after a password change',
    slug: 'calendar-sync-stopped-after-a-password-change',
    excerpt: 'Reconnect your calendar when new bookings stop showing up in it.',
    status: 'published',
    authorId: ME.id,
    views: 640,
    createdAt: at({ days: -2 }),
    updatedAt: at({ minutes: -45 }),
    body: [
      'Changing the password of your calendar account signs Tideline out of it. Bookings are still taken, but they no longer reach the calendar.',
      '## Reconnect your calendar',
      '1. Open **Settings**, then **Calendars**.\n2. Find the calendar marked _Disconnected_.\n3. Select **Reconnect** and sign in again.',
      'Bookings made while the calendar was disconnected sync within a few minutes.',
      '## Still not syncing?',
      '- Check that the right calendar is selected for new bookings.\n- Ask your IT team whether third party access is allowed.\n- Send us the sync error shown on the calendar card, it looks like this:',
      '```\nsync_error: invalid_grant (token revoked)\n```',
    ],
  },
  {
    id: '1013',
    categoryId: 'troubleshooting',
    title: 'The booking widget shows a blank box',
    slug: 'the-booking-widget-shows-a-blank-box',
    excerpt:
      'Cookie banners and content blockers can stop the widget from loading.',
    status: 'published',
    authorId: 'priya-raman',
    views: 1120,
    createdAt: at({ days: -60 }),
    updatedAt: at({ days: -5 }),
    body: [
      'When the widget shows an empty box, something on your website is usually blocking the script.',
      '## Common causes',
      '- A cookie banner that holds back scripts until visitors accept.\n- A content blocker or security plugin on your site.\n- The snippet was pasted twice on the same page.',
      '## Allow the widget in your cookie banner',
      'Mark the widget script as necessary so it loads before consent. Most cookie tools read an attribute like this one:',
      '```html\n<script src="https://widget.example.com/v2/embed.js" data-cookie-category="necessary" async></script>\n```',
      'If the box is still empty, send us the address of the page and we will take a look.',
    ],
  },
  {
    id: '1014',
    categoryId: 'troubleshooting',
    title: 'Deposits are declined at checkout',
    slug: 'deposits-are-declined-at-checkout',
    excerpt:
      'Reconnect your payment account when every deposit fails with the same error.',
    status: 'draft',
    authorId: 'marcus-feeney',
    views: 0,
    createdAt: at({ hours: -20 }),
    updatedAt: at({ hours: -2 }),
    body: [
      'If every client sees _payment could not be processed_, your payment account is most likely disconnected. This happens when your bank details change.',
      '## Fix it',
      '1. Open **Settings**, then **Integrations**.\n2. Select **Reconnect** on your payment account.\n3. Confirm your bank details with your payment provider.',
      '## While you fix it',
      '- Turn off deposits for new clients so they can still book.\n- Collect the deposit at the visit instead.',
    ],
  },
];

export const ARTICLES: HelpArticle[] = SEEDS.map((seed) => ({
  ...seed,
  body: seed.body.join('\n\n'),
}));

@Service()
export class HelpCenterService {
  // Data
  readonly categories = signal<HelpCategory[]>(CATEGORIES);
  readonly articles = signal<HelpArticle[]>(ARTICLES);

  byId(id: string) {
    return this.articles().find((article) => article.id === id) ?? null;
  }

  byCategory(categoryId: string) {
    return this.articles().filter(
      (article) => article.categoryId === categoryId
    );
  }

  categoryById(id: string) {
    return this.categories().find((category) => category.id === id) ?? null;
  }

  create(article: Partial<HelpArticle>) {
    const createdAt = new Date().toISOString();
    const created: HelpArticle = {
      id: crypto.randomUUID(),
      categoryId: CATEGORIES[0].id,
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      status: 'draft',
      authorId: ME.id,
      views: 0,
      createdAt,
      updatedAt: createdAt,
      ...article,
    };

    this.articles.update((articles) => [created, ...articles]);

    return created;
  }

  update(id: string, patch: Partial<HelpArticle>) {
    this.articles.update((articles) =>
      articles.map((article) =>
        article.id === id
          ? { ...article, ...patch, updatedAt: new Date().toISOString() }
          : article
      )
    );
  }

  setStatus(id: string, status: HelpArticleStatus) {
    this.update(id, { status });
  }

  remove(id: string) {
    this.articles.update((articles) =>
      articles.filter((article) => article.id !== id)
    );
  }

  createCategory(category: Pick<HelpCategory, 'name' | 'icon'>) {
    const created: HelpCategory = {
      id: crypto.randomUUID(),
      description: '',
      ...category,
    };

    this.categories.update((categories) => [...categories, created]);

    return created;
  }

  updateCategory(id: string, patch: Pick<HelpCategory, 'name' | 'icon'>) {
    this.categories.update((categories) =>
      categories.map((category) =>
        category.id === id ? { ...category, ...patch } : category
      )
    );
  }

  removeCategory(id: string) {
    this.categories.update((categories) =>
      categories.filter((category) => category.id !== id)
    );

    const [fallback] = this.categories();

    this.articles.update((articles) =>
      articles.map((article) =>
        article.categoryId === id
          ? { ...article, categoryId: fallback.id }
          : article
      )
    );
  }
}
