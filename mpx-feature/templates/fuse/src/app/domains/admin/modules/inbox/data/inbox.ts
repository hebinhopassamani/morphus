import { computed, inject, Service, signal } from '@angular/core';
import { add, Duration } from 'date-fns';
import {
  Member,
  MembersService,
} from '@/app/domains/admin/modules/members/data/members';
import {
  CUSTOMERS,
  Customer,
  Order,
  OrdersService,
} from '@/app/domains/admin/modules/orders/data/orders';

export type Folder =
  | 'inbox'
  | 'snoozed'
  | 'sent'
  | 'scheduled'
  | 'drafts'
  | 'archive'
  | 'spam'
  | 'trash';

export type LabelId = 'orders' | 'suppliers' | 'billing' | 'team';

export type Mailbox = Folder | 'starred' | LabelId;

export type Contact = {
  name: string;
  email: string;
  photo?: string;
  colorClass?: string;
  icon?: string;
  customerId?: string;
};

export type Attachment = {
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet';
  size: string;
};

export type Message = {
  id: string;
  from: Contact;
  to: Contact[];
  date: string;
  body: string[];
  attachments: Attachment[];
};

export type Conversation = {
  id: string;
  subject: string;
  folder: Folder;
  labels: LabelId[];
  unread: boolean;
  starred: boolean;
  order: Order | null;
  messages: Message[];
};

type MessageSeed = Omit<Message, 'id' | 'attachments'> & {
  attachments?: Attachment[];
};

type ConversationSeed = Pick<Conversation, 'subject' | 'labels'> &
  Partial<Pick<Conversation, 'folder' | 'unread' | 'starred'>> & {
    order?: Order;
    messages: MessageSeed[];
  };

export const ME: Contact = {
  name: 'John Builder',
  email: 'john@example.com',
  photo: '/images/photos/john-builder.jpg',
};

export const ACCOUNTS: {
  id: string;
  name: string;
  email: string;
}[] = [
  {
    id: 'personal',
    name: ME.name,
    email: ME.email,
  },
  {
    id: 'support',
    name: 'Support',
    email: 'support@example.com',
  },
  {
    id: 'sales',
    name: 'Sales',
    email: 'sales@example.com',
  },
];

export const FOLDERS: {
  id: Folder | 'starred';
  name: string;
  icon: string;
  empty: string;
}[] = [
  {
    id: 'inbox',
    name: 'Inbox',
    icon: 'inbox',
    empty: 'You are all caught up.',
  },
  {
    id: 'starred',
    name: 'Starred',
    icon: 'star',
    empty: 'Star a conversation to keep it close.',
  },
  {
    id: 'snoozed',
    name: 'Snoozed',
    icon: 'alarm-clock',
    empty: 'No snoozed conversations.',
  },
  {
    id: 'sent',
    name: 'Sent',
    icon: 'send',
    empty: 'Nothing sent yet.',
  },
  {
    id: 'scheduled',
    name: 'Scheduled',
    icon: 'calendar-clock',
    empty: 'No scheduled messages.',
  },
  {
    id: 'drafts',
    name: 'Drafts',
    icon: 'square-dashed-text',
    empty: 'No drafts.',
  },
  {
    id: 'archive',
    name: 'Archive',
    icon: 'archive',
    empty: 'Archived conversations show up here.',
  },
  {
    id: 'spam',
    name: 'Spam',
    icon: 'octagon-alert',
    empty: 'No spam here.',
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: 'trash',
    empty: 'Trash is empty.',
  },
];

export const LABELS: {
  id: LabelId;
  name: string;
  color: string;
  tagClass: string;
  empty: string;
}[] = [
  {
    id: 'orders',
    name: 'Orders',
    color: 'bg-blue-9',
    tagClass: 'bg-blue-a3 text-blue-a11',
    empty: 'No conversations about orders.',
  },
  {
    id: 'suppliers',
    name: 'Suppliers',
    color: 'bg-amber-9',
    tagClass: 'bg-amber-a3 text-amber-a11',
    empty: 'No conversations with suppliers.',
  },
  {
    id: 'billing',
    name: 'Billing',
    color: 'bg-jade-9',
    tagClass: 'bg-jade-a3 text-jade-a11',
    empty: 'No billing conversations.',
  },
  {
    id: 'team',
    name: 'Team',
    color: 'bg-violet-9',
    tagClass: 'bg-violet-a3 text-violet-a11',
    empty: 'No conversations with the team.',
  },
];

const now = new Date();
const at = (days: number, hours: number) =>
  add(now, { days, hours }).toISOString();
const after = (order: Order, duration: Duration) =>
  add(order.placedAt, duration).toISOString();
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TINTS: Record<string, string> = {
  [CUSTOMERS.maya.id]: 'bg-blue-a3 text-blue-a11',
  [CUSTOMERS.grace.id]: 'bg-pink-a3 text-pink-a11',
  [CUSTOMERS.lucas.id]: 'bg-cyan-a3 text-cyan-a11',
  [CUSTOMERS.noah.id]: 'bg-amber-a3 text-amber-a11',
  [CUSTOMERS.hannah.id]: 'bg-tomato-a3 text-tomato-a11',
  [CUSTOMERS.daniel.id]: 'bg-iris-a3 text-iris-a11',
  [CUSTOMERS.amara.id]: 'bg-tomato-a3 text-tomato-a11',
  [CUSTOMERS.mateo.id]: 'bg-teal-a3 text-teal-a11',
  [CUSTOMERS.chloe.id]: 'bg-pink-a3 text-pink-a11',
  [CUSTOMERS.priya.id]: 'bg-iris-a3 text-iris-a11',
  [CUSTOMERS.mia.id]: 'bg-violet-a3 text-violet-a11',
  [CUSTOMERS.nora.id]: 'bg-teal-a3 text-teal-a11',
  [CUSTOMERS.frontRange.id]: 'bg-blue-a3 text-blue-a11',
  [CUSTOMERS.samuel.id]: 'bg-cyan-a3 text-cyan-a11',
};

const SUPPLIERS = {
  summit: {
    name: 'Rachel Moore',
    email: 'rachel.moore@example.com',
    colorClass: 'bg-cyan-a3 text-cyan-a11',
  },
  driftless: {
    name: 'Owen Price',
    email: 'owen.price@example.com',
    colorClass: 'bg-teal-a3 text-teal-a11',
  },
  basecamp: {
    name: 'Lena Hartmann',
    email: 'lena.hartmann@example.com',
    colorClass: 'bg-amber-a3 text-amber-a11',
  },
};

const SENDERS = {
  dhl: {
    name: 'DHL Express',
    email: 'dhl.notifications@example.com',
    colorClass: 'bg-amber-a3 text-amber-a11',
    icon: 'truck',
  },
  ledgerline: {
    name: 'Ledgerline Payments',
    email: 'notifications@example.com',
    colorClass: 'bg-violet-a3 text-violet-a11',
    icon: 'credit-card',
  },
  brightwave: {
    name: 'Brightwave Media',
    email: 'hello@example.com',
    colorClass: 'bg-pink-a3 text-pink-a11',
  },
  expo: {
    name: 'Outdoor Retail Expo',
    email: 'events@example.com',
    colorClass: 'bg-tomato-a3 text-tomato-a11',
  },
  ledgerlineSupport: {
    name: 'Ledgerline Support',
    email: 'ledgerline.support@example.com',
    colorClass: 'bg-violet-a3 text-violet-a11',
  },
  trailRewards: {
    name: 'Trail Rewards',
    email: 'rewards@example.com',
    colorClass: 'bg-jade-a3 text-jade-a11',
  },
  rankboost: {
    name: 'RankBoost SEO',
    email: 'growth@example.com',
    colorClass: 'bg-orange-a3 text-orange-a11',
  },
};

const RETURN_LABEL: Attachment = {
  name: 'return-label.pdf',
  type: 'pdf',
  size: '46 KB',
};

const seedConversations = (
  orders: Order[],
  members: Member[]
): Conversation[] => {
  // Orders are newest first, so this is the customer's latest order
  const orderOf = (customer: Customer) =>
    orders.find((order) => order.customer === customer)!;
  const customer = (order: Order): Contact => ({
    name: order.customer.name,
    email: order.customer.email,
    colorClass: TINTS[order.customer.id],
    customerId: order.customer.id,
  });
  const member = (id: string): Contact => {
    const { name, email, photo } = members.find((item) => item.id === id)!;

    return { name, email, photo };
  };

  const maya = orderOf(CUSTOMERS.maya);
  const grace = orderOf(CUSTOMERS.grace);
  const lucas = orderOf(CUSTOMERS.lucas);
  const noah = orderOf(CUSTOMERS.noah);
  const hannah = orderOf(CUSTOMERS.hannah);
  const daniel = orderOf(CUSTOMERS.daniel);
  const amara = orderOf(CUSTOMERS.amara);
  const mateo = orderOf(CUSTOMERS.mateo);
  const chloe = orderOf(CUSTOMERS.chloe);
  const priya = orderOf(CUSTOMERS.priya);
  const mia = orderOf(CUSTOMERS.mia);
  const nora = orderOf(CUSTOMERS.nora);
  const frontRange = orderOf(CUSTOMERS.frontRange);
  const samuel = orderOf(CUSTOMERS.samuel);

  const janis = member('janis-considine');
  const marcus = member('marcus-feeney');
  const nadia = member('nadia-farouk');
  const kelley = member('kelley-schimmel');
  const ingrid = member('ingrid-solberg');

  const payout = orders
    .filter(
      (order) => order.placedAt >= at(-8, 0) && order.placedAt < at(-1, 0)
    )
    .reduce((sum, order) => sum + order.paid, 0);
  const balances = orders
    .filter((order) => order.balance > 0)
    .map(
      (order) =>
        `#${order.id} ${order.customer.name}: ${usd.format(order.balance)}`
    );

  const seeds: ConversationSeed[] = [
    {
      subject: 'Gift wrap for my pickup order',
      labels: ['orders'],
      unread: true,
      order: maya,
      messages: [
        {
          from: customer(maya),
          to: [ME],
          date: after(maya, { minutes: 10 }),
          body: [
            'Hi there,',
            `I just placed order #${maya.id} for pickup. It is a birthday gift for my brother, so could you gift wrap the jacket and socks together?`,
            'Thanks so much,\nMaya',
          ],
        },
        {
          from: ME,
          to: [customer(maya)],
          date: after(maya, { minutes: 25 }),
          body: [
            'Hi Maya,',
            'Happy to. We will wrap everything in one box and leave the receipt out, as you noted. Your order will be waiting at the front counter.',
            'John\nFuse Outdoor Co.',
          ],
        },
        {
          from: customer(maya),
          to: [ME],
          date: after(maya, { minutes: 40 }),
          body: ['Perfect, thank you! See you Saturday morning.'],
        },
      ],
    },
    {
      subject: 'Was I charged for my order?',
      labels: ['orders', 'billing'],
      unread: true,
      order: grace,
      messages: [
        {
          from: customer(grace),
          to: [ME],
          date: after(grace, { minutes: 35 }),
          body: [
            'Hello,',
            `I placed order #${grace.id} for the Ridgeline daypack and a 32 oz bottle. My banking app shows a pending charge of ${usd.format(grace.total)}, but the confirmation email says the order is unpaid. Was I charged or not?`,
            'Grace Kim',
          ],
        },
      ],
    },
    {
      subject: `Confirming your order #${lucas.id}`,
      labels: ['orders'],
      unread: true,
      order: lucas,
      messages: [
        {
          from: ME,
          to: [customer(lucas)],
          date: after(lucas, { hours: 3 }),
          body: [
            'Hi Lucas,',
            `Thank you for your order. Since this is your first order with us and it ships to Germany, we confirm a few details before it leaves the warehouse. Could you reply to confirm that you placed order #${lucas.id} and that the shipping address in Munich is correct?`,
            'John\nFuse Outdoor Co.',
          ],
        },
        {
          from: customer(lucas),
          to: [ME],
          date: after(lucas, { hours: 9 }),
          body: [
            'Hi John,',
            'Yes, that was me, and the address is correct. I need the tent and the hammock for a trip to the Dolomites at the end of the month, so please let me know if you need anything else.',
            'Best,\nLucas',
          ],
        },
      ],
    },
    {
      subject: 'Invoice for the club order balance',
      labels: ['orders', 'billing'],
      starred: true,
      order: noah,
      messages: [
        {
          from: customer(noah),
          to: [ME],
          date: after(noah, { hours: 1 }),
          body: [
            'Hi,',
            `Our hiking club just placed order #${noah.id}. We paid half up front, and our treasurer will cover the rest. Could you send an invoice for the remaining balance so she has something to file?`,
            'Thanks,\nNoah Patel',
          ],
        },
        {
          from: ME,
          to: [customer(noah)],
          date: after(noah, { hours: 4 }),
          body: [
            'Hi Noah,',
            `The invoice for the remaining ${usd.format(noah.balance)} is attached. Your treasurer can pay it by card from the link in the PDF, and the order ships by ${noah.shippingMethod.carrier} as soon as it clears.`,
            'John',
          ],
          attachments: [
            {
              name: `order-${noah.id}-invoice.pdf`,
              type: 'pdf',
              size: '84 KB',
            },
          ],
        },
        {
          from: customer(noah),
          to: [ME],
          date: after(noah, { hours: 6 }),
          body: [
            'Got it, forwarded to our treasurer. Thanks for the quick turnaround!',
          ],
        },
      ],
    },
    {
      subject: 'Trekking poles missing from my package',
      labels: ['orders'],
      order: hannah,
      messages: [
        {
          from: customer(hannah),
          to: [ME],
          date: after(hannah, { hours: 22 }),
          body: [
            'Hello,',
            `The shipping confirmation for order #${hannah.id} lists the daypack and the headlamp, but not the Carbon Trekking Poles. Did they get left out?`,
            'Hannah Berg',
          ],
        },
        {
          from: ME,
          to: [customer(hannah)],
          date: after(hannah, { days: 1, hours: 1 }),
          body: [
            'Hi Hannah,',
            'Nothing was left out. The trekking poles are on backorder, so we shipped the rest of your order right away. Our supplier is sending a restock this week, and your poles will go out the day it arrives, with no extra shipping charge.',
            'John',
          ],
        },
        {
          from: customer(hannah),
          to: [ME],
          date: after(hannah, { days: 1, hours: 3 }),
          body: [
            'That works, thanks. My trip is not until next month, so no rush.',
          ],
        },
      ],
    },
    {
      subject: 'Card keeps getting declined',
      labels: ['orders', 'billing'],
      order: amara,
      messages: [
        {
          from: customer(amara),
          to: [ME],
          date: after(amara, { hours: 1 }),
          body: [
            'Hi,',
            'I tried to pay for the duffel and packing cubes three times with three different cards, and every attempt was declined. My bank says the cards are fine. Is something wrong with your checkout?',
            'Amara',
          ],
        },
        {
          from: ME,
          to: [customer(amara)],
          date: after(amara, { hours: 5 }),
          body: [
            'Hi Amara,',
            'Sorry for the trouble. The declines came back from the card issuer, so our checkout never saw a reason. I have sent a secure payment link to this address, and it also accepts PayPal if you would rather skip the card.',
            `We are holding order #${amara.id} in the meantime, so your items stay reserved.`,
            'John',
          ],
        },
      ],
    },
    {
      subject: `Update on order #${mateo.id}?`,
      labels: ['orders'],
      unread: true,
      order: mateo,
      messages: [
        {
          from: customer(mateo),
          to: [ME],
          date: at(-1, -4),
          body: [
            'Hi,',
            'I ordered two Ultralight Hammocks last week and have not received a shipping email yet. Is there an update? We are hoping to use them on a trip next weekend.',
            'Mateo Silva',
          ],
        },
      ],
    },
    {
      subject: 'When will the cookset ship?',
      folder: 'snoozed',
      labels: ['orders', 'billing'],
      order: priya,
      messages: [
        {
          from: customer(priya),
          to: [ME],
          date: at(-6, -5),
          body: [
            'Hi John,',
            'The tent arrived and it is great. The confirmation said the Camp Cookset would follow later. Do you know when it will ship? I would also like to pay the remaining balance once it does, if that is okay.',
            'Priya',
          ],
        },
        {
          from: ME,
          to: [customer(priya)],
          date: at(-6, -2),
          body: [
            'Hi Priya,',
            `Glad you like the tent! The cookset is on backorder with our supplier, and we expect it next week. Paying the remaining ${usd.format(priya.balance)} when it ships is completely fine, and we will email you a payment link that day.`,
            'John',
          ],
        },
      ],
    },
    {
      subject: 'Exchange for a medium rain shell',
      labels: ['orders'],
      order: mia,
      messages: [
        {
          from: customer(mia),
          to: [ME],
          date: at(-14, -4),
          body: [
            'Hi,',
            'I love the Packable Rain Shell, but the small is tight across the shoulders. Could I exchange it for a medium in the same Ochre color?',
            'Mia Thompson',
          ],
        },
        {
          from: ME,
          to: [customer(mia)],
          date: at(-14, -1),
          body: [
            'Hi Mia,',
            'Of course. A prepaid return label is attached. Drop the small off at any USPS location, and we will ship the medium as soon as the return arrives.',
            'John',
          ],
          attachments: [RETURN_LABEL],
        },
        {
          from: customer(mia),
          to: [ME],
          date: at(-5, -6),
          body: ['Dropped it off today. Thanks for making this easy!'],
        },
        {
          from: ME,
          to: [customer(mia)],
          date: after(mia, { days: 16, hours: 2 }),
          body: [
            'Hi Mia,',
            'Your return just arrived, and the medium is on its way. You will get a tracking email shortly.',
            'John',
          ],
        },
      ],
    },
    {
      subject: 'Torn seam on my down jacket',
      folder: 'archive',
      labels: ['orders', 'billing'],
      order: nora,
      messages: [
        {
          from: customer(nora),
          to: [ME],
          date: at(-12, -3),
          body: [
            'Hello,',
            'The left sleeve of my Alpine Down Jacket split along the seam after two wears, and feathers are coming out. A photo is attached. Can I return it for a refund?',
            'Nora Lindqvist',
          ],
          attachments: [
            {
              name: 'sleeve-seam.jpg',
              type: 'image',
              size: '2.4 MB',
            },
          ],
        },
        {
          from: ME,
          to: [customer(nora)],
          date: at(-12, -1),
          body: [
            'Hi Nora,',
            'I am sorry about that, it should never happen this early. A prepaid DHL return label is attached, and we will refund you in full as soon as the jacket arrives.',
            'John',
          ],
          attachments: [RETURN_LABEL],
        },
        {
          from: customer(nora),
          to: [ME],
          date: at(-10, -5),
          body: ['Shipped it back today. Thanks for the quick reply.'],
        },
        {
          from: ME,
          to: [customer(nora)],
          date: after(nora, { days: 17, hours: 1 }),
          body: [
            'Hi Nora,',
            `The jacket arrived, and your refund of ${usd.format(nora.refunded)} is on its way to your ${nora.paymentMethod.label}. It usually shows up within five business days.`,
            'John',
          ],
        },
        {
          from: customer(nora),
          to: [ME],
          date: at(-2, -1),
          body: ['Got it, thank you. I will be back for fall gear.'],
        },
      ],
    },
    {
      subject: 'Leaking bottle lids',
      folder: 'archive',
      labels: ['orders'],
      order: samuel,
      messages: [
        {
          from: customer(samuel),
          to: [ME],
          date: at(-21, -2),
          body: [
            'Hi,',
            'All three of my 32 oz bottles leak when they lie on their side in my pack, even with the lids screwed on tight. Is this a known issue?',
            'Samuel Reyes',
          ],
        },
        {
          from: ME,
          to: [customer(samuel)],
          date: at(-21, 0),
          body: [
            'Hi Samuel,',
            'Thanks for letting us know, and sorry for the mess. We have heard the same from a couple of customers and raised it with the maker. Please send the bottles back with the attached label, and we will refund you in full.',
            'John',
          ],
          attachments: [RETURN_LABEL],
        },
        {
          from: ME,
          to: [customer(samuel)],
          date: after(samuel, { days: 17, hours: 1 }),
          body: [
            'Hi Samuel,',
            `Your bottles arrived, and we refunded ${usd.format(samuel.refunded)} to your ${samuel.paymentMethod.label}.`,
            'John',
          ],
        },
      ],
    },
    {
      subject: 'Outfitting our guide team',
      labels: ['orders'],
      starred: true,
      order: frontRange,
      messages: [
        {
          from: customer(frontRange),
          to: [ME],
          date: at(-27, -4),
          body: [
            'Hello,',
            'We run guided hikes out of Golden, Colorado, and want to outfit our guide team for the summer season: base layers, rain shells, packs, poles and some camp kitchen gear, a few dozen items in all. Do you offer wholesale pricing or anything for team orders?',
            'Erin Walsh\nOperations, Front Range Guides',
          ],
        },
        {
          from: ME,
          to: [customer(frontRange)],
          date: at(-27, -1),
          body: [
            'Hi Erin,',
            'Thanks for reaching out. We do not have a wholesale program, but for a team order this size we ship free and can label every box by size, so your guides can grab their own. Our current catalog is attached.',
            'John\nFuse Outdoor Co.',
          ],
          attachments: [
            {
              name: 'product-catalog.pdf',
              type: 'pdf',
              size: '3.2 MB',
            },
          ],
        },
        {
          from: customer(frontRange),
          to: [ME],
          date: at(-26, -3),
          body: [
            'That works for us. The attached sheet has sizes for each guide. We will place the order online in the next few days.',
            'Erin',
          ],
          attachments: [
            {
              name: 'guide-team-sizes.xlsx',
              type: 'spreadsheet',
              size: '18 KB',
            },
          ],
        },
        {
          from: ME,
          to: [customer(frontRange)],
          date: after(frontRange, { hours: 1 }),
          body: [
            'Hi Erin,',
            `Order #${frontRange.id} came through, ${frontRange.itemCount} items in all. We will pack by size and send tracking as soon as it ships.`,
            'John',
          ],
        },
        {
          from: customer(frontRange),
          to: [ME],
          date: after(frontRange, { days: 6 }),
          body: [
            'Hi John,',
            'Everything arrived, and the labeled boxes made handing out the kits easy. The team is thrilled. We will be in touch about fall gear.',
            'Erin',
          ],
        },
      ],
    },
    {
      subject: 'Fuel canisters for the camp stove',
      labels: ['orders'],
      order: daniel,
      messages: [
        {
          from: customer(daniel),
          to: [ME],
          date: at(0, -9),
          body: [
            'Hi,',
            'The Titanium Camp Stove arrived and looks great. Which fuel canisters does it take, and do you sell them? I could not find them on the site.',
            'Daniel Okafor',
          ],
        },
        {
          from: ME,
          to: [customer(daniel)],
          date: at(0, -8),
          body: [
            'Hi Daniel,',
            'It takes any standard threaded isobutane canister, the kind most outdoor shops carry. We only sell them in store, since carriers will not ship fuel. Enjoy the stove!',
            'John',
          ],
        },
      ],
    },
    {
      subject: 'Duties on my jacket delivery',
      labels: ['orders', 'billing'],
      order: chloe,
      messages: [
        {
          from: customer(chloe),
          to: [ME],
          date: at(-5, -4),
          body: [
            'Hello,',
            'DHL is asking me to pay import duties before they deliver my Alpine Down Jacket. Is that expected? I did not see anything about it at checkout.',
            'Chloé Dubois',
          ],
        },
        {
          from: ME,
          to: [customer(chloe)],
          date: at(-5, -1),
          body: [
            'Hi Chloé,',
            'Yes, international orders ship with duties due on delivery, and the carrier collects them on behalf of Canadian customs. I am sorry it was not clearer at checkout. We are adding a note to the cart for international orders so it does not catch anyone else off guard.',
            'John',
          ],
        },
      ],
    },
    {
      subject: 'Restock: Carbon Trekking Poles',
      labels: ['suppliers'],
      unread: true,
      messages: [
        {
          from: ME,
          to: [SUPPLIERS.summit],
          date: at(-4, -3),
          body: [
            'Hi Rachel,',
            'We are out of the Carbon Trekking Poles and have customers waiting on backorders. Could you ship 24 pairs this week?',
            'John\nFuse Outdoor Co.',
          ],
        },
        {
          from: SUPPLIERS.summit,
          to: [ME],
          date: at(-1, -6),
          body: [
            'Hi John,',
            'All 24 pairs shipped today by freight. The packing list is attached, and they should reach Portland within five business days.',
            'Rachel Moore\nSummit Trail Supply',
          ],
          attachments: [
            {
              name: 'packing-list.pdf',
              type: 'pdf',
              size: '112 KB',
            },
          ],
        },
      ],
    },
    {
      subject: 'Ultralight Hammocks back in stock',
      labels: ['suppliers'],
      unread: true,
      messages: [
        {
          from: SUPPLIERS.driftless,
          to: [ME],
          date: at(0, -7),
          body: [
            'Hi John,',
            'Good news: the Ultralight Hammock in Forest is back in stock, and your standing order of 12 ships Monday.',
            'Owen Price\nDriftless Hammock Co.',
          ],
        },
      ],
    },
    {
      subject: 'Purchase order: Camp Cookset',
      folder: 'snoozed',
      labels: ['suppliers'],
      messages: [
        {
          from: ME,
          to: [SUPPLIERS.basecamp],
          date: at(-9, -4),
          body: [
            'Hi Lena,',
            'Attached is our purchase order for 20 Camp Cooksets (2 person). We have a couple of customers on backorder, so the sooner the better.',
            'John\nFuse Outdoor Co.',
          ],
          attachments: [
            {
              name: 'purchase-order.pdf',
              type: 'pdf',
              size: '96 KB',
            },
          ],
        },
        {
          from: SUPPLIERS.basecamp,
          to: [ME],
          date: at(-8, -6),
          body: [
            'Hi John,',
            'Thanks, order confirmed. These should leave our warehouse within a week.',
            'Lena Hartmann\nBasecamp Cookware',
          ],
        },
        {
          from: SUPPLIERS.basecamp,
          to: [ME],
          date: at(-3, -2),
          body: [
            'Hi John,',
            'Sorry for the delay on your cooksets. The lids from our factory came in late, so the new ship date is next Wednesday. I will send tracking as soon as they leave.',
            'Lena',
          ],
        },
      ],
    },
    {
      subject: `Shipment ${chloe.tracking} held at customs`,
      labels: ['orders'],
      order: chloe,
      messages: [
        {
          from: SENDERS.dhl,
          to: [ME],
          date: at(-6, -2),
          body: [
            'Your shipment is being held at customs in Canada.',
            `Waybill: ${chloe.tracking}\nReceiver: ${chloe.customer.name}, ${chloe.customer.address.city}`,
            'Import duties and taxes must be paid by the receiver before delivery. We have contacted the receiver with payment instructions. No action is required from the shipper.',
            'DHL Express',
          ],
        },
      ],
    },
    {
      subject: 'Your payout is on its way',
      labels: ['billing'],
      messages: [
        {
          from: SENDERS.ledgerline,
          to: [ME],
          date: at(0, -10),
          body: [
            `A payout of ${usd.format(payout)} is on its way to your linked bank account.`,
            'It covers card payments captured over the past week and should arrive within two business days.',
            'Ledgerline Payments',
          ],
        },
      ],
    },
    {
      subject: `Payment declined for order #${amara.id}`,
      labels: ['billing'],
      order: amara,
      messages: [
        {
          from: SENDERS.ledgerline,
          to: [ME],
          date: after(amara, { minutes: 20 }),
          body: [
            `Three payment attempts for order #${amara.id} were declined by the card issuer.`,
            `Amount: ${usd.format(amara.total)}\nCustomer: ${amara.customer.name} (${amara.customer.email})`,
            'Repeated declines on different cards can be a sign of card testing. Review the order before you capture payment or ship.',
            'Ledgerline Payments',
          ],
        },
      ],
    },
    {
      subject: `Refund processed for order #${nora.id}`,
      folder: 'archive',
      labels: ['billing'],
      order: nora,
      messages: [
        {
          from: SENDERS.ledgerline,
          to: [ME],
          date: after(nora, { days: 17 }),
          body: [
            `A refund of ${usd.format(nora.refunded)} to ${nora.customer.name} for order #${nora.id} has been processed.`,
            'Funds usually reach the customer within five to ten business days.',
            'Ledgerline Payments',
          ],
        },
      ],
    },
    {
      subject: 'Rain shell sizing',
      labels: ['team'],
      messages: [
        {
          from: janis,
          to: [ME],
          date: at(-1, -9),
          body: [
            'Hi John,',
            `Another sizing exchange on the Packable Rain Shell came in from ${mia.customer.name}, and customers keep asking whether it runs small. Could we add a sizing note to the product page?`,
            'Janis',
          ],
        },
        {
          from: ME,
          to: [janis],
          date: at(-1, -6),
          body: [
            'Good idea, it does run about half a size small. Go ahead and draft the note, and Nadia can publish it.',
          ],
        },
        {
          from: janis,
          to: [ME],
          date: at(-1, 2),
          body: [
            'Done. The note is live on the product page, and I added it to our support macros too.',
          ],
        },
      ],
    },
    {
      subject: 'Open balances',
      labels: ['team', 'billing'],
      unread: true,
      starred: true,
      messages: [
        {
          from: marcus,
          to: [ME],
          date: at(0, -4),
          body: [
            'Hi John,',
            'These orders still carry a balance:',
            balances.join('\n'),
            'The full breakdown is attached. Should I send reminders, or would you rather reach out yourself?',
            'Marcus',
          ],
          attachments: [
            {
              name: 'open-balances.xlsx',
              type: 'spreadsheet',
              size: '24 KB',
            },
          ],
        },
      ],
    },
    {
      subject: 'Fall launch plan',
      labels: ['team'],
      messages: [
        {
          from: nadia,
          to: [ME],
          date: at(-6, -4),
          body: [
            'Hi John,',
            'For the fall launch, I would like to bring back FALLGEAR20 for the first two weeks, along with a homepage feature on the fleece and the rain shells. The draft plan is in the shared folder. Any concerns?',
            'Nadia',
          ],
        },
        {
          from: ME,
          to: [nadia],
          date: at(-6, -1),
          body: [
            'Looks good. Let us leave the down jackets out of the discount, since they sell well at full price.',
          ],
        },
        {
          from: nadia,
          to: [ME],
          date: at(-5, -5),
          body: [
            'Makes sense. I excluded the jackets and scheduled the launch email for the first Monday of the month.',
          ],
        },
      ],
    },
    {
      subject: 'New down jacket photos',
      labels: ['team'],
      messages: [
        {
          from: kelley,
          to: [ME],
          date: at(0, -6),
          body: [
            'Hi John,',
            'Here are the new product photos for the Alpine Down Jacket in Spruce and Black. We shot outdoors this time, so the colors are much truer.',
            'Kelley',
          ],
          attachments: [
            {
              name: 'down-jacket-spruce.jpg',
              type: 'image',
              size: '3.1 MB',
            },
            {
              name: 'down-jacket-black.jpg',
              type: 'image',
              size: '2.8 MB',
            },
          ],
        },
        {
          from: ME,
          to: [kelley],
          date: at(0, -5),
          body: [
            'These look great. Let us use the Spruce shot as the hero image for the fall launch.',
          ],
        },
      ],
    },
    {
      subject: `Hold on order #${lucas.id}`,
      labels: ['team', 'orders'],
      order: lucas,
      messages: [
        {
          from: ingrid,
          to: [ME],
          date: after(lucas, { hours: 2 }),
          body: [
            'Hi John,',
            `Order #${lucas.id} from ${lucas.customer.name} was flagged: it is a first order above $500 from a new account, shipping to Germany. I have put it on hold until we confirm with the customer.`,
            'Ingrid',
          ],
        },
        {
          from: ME,
          to: [ingrid],
          date: after(lucas, { hours: 3 }),
          body: [
            'Thanks, Ingrid. I just emailed him to confirm, and I will release the hold once he replies.',
          ],
        },
      ],
    },
    {
      subject: `Gift wrap for order #${maya.id}`,
      folder: 'sent',
      labels: ['team'],
      order: maya,
      messages: [
        {
          from: ME,
          to: [janis],
          date: after(maya, { minutes: 30 }),
          body: [
            'Hi Janis,',
            `${maya.customer.name} is picking up order #${maya.id} on Saturday morning. It is a gift, so please wrap the jacket and socks together and leave the receipt out.`,
            'Thanks,\nJohn',
          ],
        },
      ],
    },
    {
      subject: 'Our fall catalog',
      folder: 'sent',
      labels: [],
      messages: [
        {
          from: ME,
          to: [customer(frontRange)],
          date: at(-4, -2),
          body: [
            'Hi Erin,',
            'Our fall catalog is attached, in case your team needs layers for the shoulder season. The same free shipping and labeled boxes apply to any team order.',
            'John\nFuse Outdoor Co.',
          ],
          attachments: [
            {
              name: 'fall-catalog.pdf',
              type: 'pdf',
              size: '4.6 MB',
            },
          ],
        },
      ],
    },
    {
      subject: `Re: Update on order #${mateo.id}?`,
      folder: 'drafts',
      labels: ['orders'],
      order: mateo,
      messages: [
        {
          from: ME,
          to: [customer(mateo)],
          date: at(0, -2),
          body: [
            'Hi Mateo,',
            'Good news: our hammock supplier ships the restock on Monday, and both of your hammocks will go out in one box as soon as it arrives.',
          ],
        },
      ],
    },
    {
      subject: 'Re: Was I charged for my order?',
      folder: 'drafts',
      labels: ['orders', 'billing'],
      order: grace,
      messages: [
        {
          from: ME,
          to: [customer(grace)],
          date: at(0, -1),
          body: [
            'Hi Grace,',
            `The pending ${usd.format(grace.total)} is a card authorization, not a charge. It becomes a charge when your order ships, and you will get a receipt then.`,
          ],
        },
      ],
    },
    {
      subject: `Balance reminder for order #${noah.id}`,
      folder: 'scheduled',
      labels: ['orders', 'billing'],
      order: noah,
      messages: [
        {
          from: ME,
          to: [customer(noah)],
          date: at(1, 2),
          body: [
            'Hi Noah,',
            `A friendly reminder that ${usd.format(noah.balance)} is still open on order #${noah.id}. Your treasurer can pay it by card from the link in the invoice, and the order ships as soon as it clears.`,
            'John\nFuse Outdoor Co.',
          ],
        },
      ],
    },
    {
      subject: 'Purchase order: Carbon Trekking Poles',
      folder: 'scheduled',
      labels: ['suppliers'],
      messages: [
        {
          from: ME,
          to: [SUPPLIERS.summit],
          date: at(3, 1),
          body: [
            'Hi Rachel,',
            'Attached is our purchase order for 36 pairs of Carbon Trekking Poles ahead of the fall season. Could you confirm a ship date when you get a chance?',
            'John\nFuse Outdoor Co.',
          ],
          attachments: [
            {
              name: 'purchase-order.pdf',
              type: 'pdf',
              size: '94 KB',
            },
          ],
        },
      ],
    },
    {
      subject: 'Action required: verify your payout account',
      folder: 'spam',
      labels: [],
      unread: true,
      messages: [
        {
          from: SENDERS.ledgerlineSupport,
          to: [ME],
          date: at(0, -3),
          body: [
            'Dear merchant,',
            'Your payouts have been paused because we could not verify your bank account. Sign in within 24 hours to confirm your details, or your account will be suspended.',
            'Ledgerline Support',
          ],
        },
      ],
    },
    {
      subject: 'You have earned a $500 gear voucher',
      folder: 'spam',
      labels: [],
      unread: true,
      messages: [
        {
          from: SENDERS.trailRewards,
          to: [ME],
          date: at(-2, -5),
          body: [
            'Congratulations!',
            'Your store was selected for an exclusive $500 outdoor gear voucher. Claim it today by completing a short survey.',
            'Trail Rewards',
          ],
        },
      ],
    },
    {
      subject: 'Page one on Google in 30 days',
      folder: 'spam',
      labels: [],
      messages: [
        {
          from: SENDERS.rankboost,
          to: [ME],
          date: at(-7, -2),
          body: [
            'Hi,',
            'I noticed your outdoor store is missing from the first page for several high value keywords. Our team guarantees page one rankings in 30 days or your money back.',
            'The RankBoost team',
          ],
        },
      ],
    },
    {
      subject: 'Grow your outdoor brand this fall',
      folder: 'trash',
      labels: [],
      messages: [
        {
          from: SENDERS.brightwave,
          to: [ME],
          date: at(-5, -3),
          body: [
            'Hi there,',
            'Brands like yours are reaching thousands of hikers with sponsored posts on our partner channels. Book a call this week and get your first campaign at half price.',
            'The Brightwave Media team',
          ],
        },
      ],
    },
    {
      subject: 'Early bird booths for Outdoor Retail Expo',
      folder: 'trash',
      labels: [],
      messages: [
        {
          from: SENDERS.expo,
          to: [ME],
          date: at(-9, -6),
          body: [
            'Booth registration for next spring is open, and early bird pricing ends this month.',
            'Reserve your space today to get listed in the exhibitor guide.',
            'Outdoor Retail Expo',
          ],
        },
      ],
    },
  ];

  return seeds.map((seed, index): Conversation => {
    const id = String(index + 1);

    return {
      folder: 'inbox',
      unread: false,
      starred: false,
      order: null,
      ...seed,
      id,
      messages: seed.messages.map((message, i) => ({
        attachments: [],
        ...message,
        id: `${id}-${i + 1}`,
      })),
    };
  });
};

export const contactOf = (conversation: Conversation) => {
  const [first] = conversation.messages;

  return first.from === ME ? first.to[0] : first.from;
};

@Service()
export class InboxService {
  // Dependencies
  private membersService = inject(MembersService);
  private ordersService = inject(OrdersService);

  // Data
  readonly conversations = signal<Conversation[]>(
    seedConversations(
      this.ordersService.orders(),
      this.membersService.members()
    )
  );
  readonly unread = computed(
    () =>
      this.conversations().filter(
        (conversation) => conversation.folder === 'inbox' && conversation.unread
      ).length
  );

  byId(id: string) {
    return (
      this.conversations().find((conversation) => conversation.id === id) ??
      null
    );
  }

  setUnread(id: string, unread: boolean) {
    this.update(id, (conversation) => ({ ...conversation, unread }));
  }

  toggleStar(id: string) {
    this.update(id, (conversation) => ({
      ...conversation,
      starred: !conversation.starred,
    }));
  }

  move(id: string, folder: Folder) {
    this.update(id, (conversation) => ({ ...conversation, folder }));
  }

  toggleLabel(id: string, label: LabelId) {
    this.update(id, (conversation) => ({
      ...conversation,
      labels: conversation.labels.includes(label)
        ? conversation.labels.filter((item) => item !== label)
        : [...conversation.labels, label],
    }));
  }

  reply(id: string, body: string) {
    this.update(id, (conversation) => ({
      ...conversation,
      messages: [
        ...conversation.messages,
        this.message([contactOf(conversation)], body),
      ],
    }));
  }

  send(to: string, subject: string, body: string) {
    const contact = this.conversations()
      .flatMap((conversation) => conversation.messages)
      .flatMap((message) => [message.from, ...message.to])
      .find((item) => item.email === to) ?? {
      name: to,
      email: to,
      colorClass: 'bg-neutral-a3 text-neutral-a11',
    };

    this.conversations.update((conversations) => [
      {
        id: crypto.randomUUID(),
        subject,
        folder: 'sent',
        labels: [],
        unread: false,
        starred: false,
        order: null,
        messages: [this.message([contact], body)],
      },
      ...conversations,
    ]);
  }

  private message(to: Contact[], body: string): Message {
    return {
      id: crypto.randomUUID(),
      from: ME,
      to,
      date: new Date().toISOString(),
      body: body.split(/\n\s*\n/),
      attachments: [],
    };
  }

  private update(id: string, fn: (conversation: Conversation) => Conversation) {
    this.conversations.update((conversations) =>
      conversations.map((conversation) =>
        conversation.id === id ? fn(conversation) : conversation
      )
    );
  }
}
