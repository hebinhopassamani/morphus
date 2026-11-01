import { Service, signal } from '@angular/core';
import { add } from 'date-fns';

export type IntegrationStatus =
  'connected' | 'not-connected' | 'needs-attention';

export type IntegrationCategory =
  'ai' | 'payments' | 'shipping' | 'communication' | 'analytics' | 'developer';

export type IntegrationType =
  'rest-api' | 'mcp-server' | 'webhook' | 'oauth-app' | 'sdk';

export type IntegrationLevel = 'native' | 'verified' | 'community';

export type IntegrationAccess = 'read' | 'read-write';

export type IntegrationSetting = {
  id: string;
  label: string;
  enabled: boolean;
};

export type IntegrationEventKind =
  'success' | 'failure' | 'running' | 'neutral';

export type IntegrationEvent = {
  id: string;
  kind: IntegrationEventKind;
  title: string;
  date: string;
  text?: string;
};

export type IntegrationActivity = {
  id: string;
  icon: string;
  title: string;
  text: string;
  date: string;
};

export type Integration = {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  description: string;
  category: IntegrationCategory;
  types: IntegrationType[];
  level: IntegrationLevel;
  access: IntegrationAccess;
  status: IntegrationStatus;
  version: string;
  connectedBy?: string;
  connectedAt?: string;
  installs: number;
  addedAt: string;
  syncedAt: string | null;
  permissions: string[];
  apiKey?: string;
  webhookUrl?: string;
  models?: string[];
  model?: string;
  spendLimit?: number;
  serverUrl?: string;
  settings: IntegrationSetting[];
  events: IntegrationEvent[];
  assistantActivity?: IntegrationActivity[];
};

const now = new Date();
const at = (days: number, hours: number, minutes: number) =>
  add(now, { days, hours, minutes }).toISOString();

let eventId = 0;
const event = (
  kind: IntegrationEventKind,
  title: string,
  date: string,
  text?: string
): IntegrationEvent => ({ id: `evt_${++eventId}`, kind, title, date, text });

const INTEGRATIONS: Integration[] = [
  // AI
  {
    id: 'claude',
    name: 'Claude',
    icon: 'sparkles',
    colorClass: 'bg-orange-a3 text-orange-a11',
    description: 'Write product descriptions and answer gear questions.',
    category: 'ai',
    types: ['rest-api'],
    level: 'native',
    access: 'read',
    status: 'connected',
    version: 'API 2023-06-01',
    connectedBy: 'gloria-metz',
    connectedAt: at(-40, 0, 0),
    installs: 4820,
    addedAt: at(-40, 0, 0),
    syncedAt: at(0, 0, -6),
    permissions: ['Read products', 'Read reviews'],
    apiKey: 'sk-ant-xxxxxxxxxxxxxxxx',
    models: ['Claude Sonnet 4.5', 'Claude Opus 4.1', 'Claude Haiku 4.5'],
    model: 'Claude Sonnet 4.5',
    spendLimit: 250,
    settings: [
      { id: 'descriptions', label: 'Product descriptions', enabled: true },
      { id: 'reviews', label: 'Review summaries', enabled: true },
      { id: 'support', label: 'Support reply drafts', enabled: false },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -6), 'for 312 products'),
      event('success', 'Model changed', at(-3, -2, 0), 'to Claude Sonnet 4.5'),
      event('success', 'Key rotated', at(-12, -4, 0)),
      event('success', 'Connected', at(-40, 0, 0)),
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'brain-circuit',
    colorClass: 'bg-gray-a3 text-gray-a11',
    description: 'Generate copy and tag catalog images with GPT models.',
    category: 'ai',
    types: ['rest-api', 'sdk'],
    level: 'verified',
    access: 'read',
    status: 'not-connected',
    version: 'API v1',
    installs: 3910,
    addedAt: at(-120, 0, 0),
    syncedAt: null,
    permissions: ['Read products'],
    apiKey: 'sk-proj-xxxxxxxxxxxxxxxx',
    models: ['GPT-5', 'GPT-5 mini'],
    model: 'GPT-5 mini',
    spendLimit: 100,
    settings: [
      { id: 'descriptions', label: 'Product descriptions', enabled: true },
      { id: 'images', label: 'Image tagging', enabled: false },
    ],
    events: [
      event('neutral', 'Disconnected', at(-18, -3, 0)),
      event(
        'failure',
        'Sync failed',
        at(-19, -1, 0),
        'because the monthly spend limit was reached'
      ),
      event('success', 'Connected', at(-110, 0, 0)),
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: 'sparkle',
    colorClass: 'bg-blue-a3 text-blue-a11',
    description: 'Translate listings for international storefronts.',
    category: 'ai',
    types: ['rest-api'],
    level: 'community',
    access: 'read',
    status: 'not-connected',
    version: 'API v1beta',
    installs: 1240,
    addedAt: at(-9, 0, 0),
    syncedAt: null,
    permissions: ['Read products'],
    apiKey: 'AIzaxxxxxxxxxxxxxxxx',
    models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
    model: 'Gemini 2.5 Flash',
    spendLimit: 50,
    settings: [
      { id: 'translations', label: 'Listing translations', enabled: true },
    ],
    events: [
      event(
        'failure',
        'Connection failed',
        at(-2, -5, 0),
        'because the API key was rejected'
      ),
    ],
  },
  {
    id: 'assistant-access',
    name: 'AI assistant access',
    icon: 'bot',
    colorClass: 'bg-violet-a3 text-violet-a11',
    description: 'Let AI assistants work with your shop over MCP.',
    category: 'ai',
    types: ['mcp-server'],
    level: 'native',
    access: 'read-write',
    status: 'connected',
    version: 'MCP 2025-06-18',
    connectedBy: 'evan-gutmann',
    connectedAt: at(-5, 0, 0),
    installs: 2160,
    addedAt: at(-5, 0, 0),
    syncedAt: at(0, 0, -2),
    permissions: [
      'Read orders',
      'Read customers',
      'Read invoices',
      'Create invoices',
      'Update order status',
    ],
    serverUrl: 'https://shop.example.com/mcp',
    settings: [
      { id: 'read-orders', label: 'Read orders', enabled: true },
      { id: 'read-customers', label: 'Read customers', enabled: true },
      { id: 'read-invoices', label: 'Read invoices', enabled: true },
      { id: 'create-invoices', label: 'Create invoices', enabled: false },
      { id: 'update-orders', label: 'Update order status', enabled: true },
      { id: 'read-inventory', label: 'Read inventory', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -2), 'for 6 capabilities'),
      event(
        'success',
        'Capability turned off',
        at(-2, -6, 0),
        'Create invoices'
      ),
      event('success', 'Connected', at(-5, 0, 0)),
    ],
    assistantActivity: [
      {
        id: 'act_4',
        icon: 'truck',
        title: 'Claude',
        text: 'marked order #10478 as shipped',
        date: at(0, 0, -2),
      },
      {
        id: 'act_3',
        icon: 'shopping-cart',
        title: 'Claude',
        text: 'read 14 orders placed this week',
        date: at(0, -1, -15),
      },
      {
        id: 'act_2',
        icon: 'users-round',
        title: 'ChatGPT',
        text: 'looked up the customer on order #10465',
        date: at(0, -5, 0),
      },
      {
        id: 'act_1',
        icon: 'receipt-text',
        title: 'Claude',
        text: 'read invoice INV-2042',
        date: at(-1, -3, 0),
      },
    ],
  },

  // Payments
  {
    id: 'stripe',
    name: 'Stripe',
    icon: 'credit-card',
    colorClass: 'bg-indigo-a3 text-indigo-a11',
    description: 'Accept cards and wallets at checkout.',
    category: 'payments',
    types: ['rest-api', 'webhook', 'sdk'],
    level: 'verified',
    access: 'read-write',
    status: 'connected',
    version: 'API 2025-09-30',
    connectedBy: 'gloria-metz',
    connectedAt: at(-400, 0, 0),
    installs: 9640,
    addedAt: at(-400, 0, 0),
    syncedAt: at(0, 0, -1),
    permissions: ['Read orders', 'Create refunds', 'Update payment status'],
    apiKey: 'sk_test_xxxxxxxxxxxxxxxx',
    webhookUrl: 'https://shop.example.com/webhooks/stripe',
    settings: [
      { id: 'payments', label: 'Payments', enabled: true },
      { id: 'refunds', label: 'Refunds', enabled: true },
      { id: 'disputes', label: 'Disputes', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -1), 'for 48 payments'),
      event(
        'failure',
        'Webhook delivery failed',
        at(-4, -2, 0),
        'and succeeded on retry'
      ),
      event('success', 'Key rotated', at(-30, 0, 0)),
      event('success', 'Connected', at(-400, 0, 0)),
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'wallet',
    colorClass: 'bg-blue-a3 text-blue-a11',
    description: 'Offer PayPal and Venmo at checkout.',
    category: 'payments',
    types: ['oauth-app', 'webhook'],
    level: 'verified',
    access: 'read-write',
    status: 'connected',
    version: 'REST API v2',
    connectedBy: 'nathan-kutch',
    connectedAt: at(-380, 0, 0),
    installs: 7210,
    addedAt: at(-380, 0, 0),
    syncedAt: at(0, 0, -12),
    permissions: ['Read orders', 'Update payment status'],
    webhookUrl: 'https://shop.example.com/webhooks/paypal',
    settings: [
      { id: 'payments', label: 'Payments', enabled: true },
      { id: 'refunds', label: 'Refunds', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -12), 'for 17 payments'),
      event('success', 'Authorization renewed', at(-60, 0, 0)),
      event('success', 'Connected', at(-380, 0, 0)),
    ],
  },
  {
    id: 'klarna',
    name: 'Klarna',
    icon: 'shopping-bag',
    colorClass: 'bg-pink-a3 text-pink-a11',
    description: 'Split big gear purchases into four payments.',
    category: 'payments',
    types: ['rest-api', 'webhook'],
    level: 'verified',
    access: 'read-write',
    status: 'not-connected',
    version: 'Payments API v1',
    installs: 2870,
    addedAt: at(-60, 0, 0),
    syncedAt: null,
    permissions: ['Read orders', 'Update payment status'],
    apiKey: 'klarna_test_xxxxxxxxxxxx',
    webhookUrl: 'https://shop.example.com/webhooks/klarna',
    settings: [
      { id: 'payments', label: 'Payments', enabled: true },
      { id: 'refunds', label: 'Refunds', enabled: true },
    ],
    events: [
      event('neutral', 'Disconnected', at(-21, 0, 0)),
      event('success', 'Connected', at(-55, 0, 0)),
    ],
  },
  {
    id: 'square',
    name: 'Square',
    icon: 'store',
    colorClass: 'bg-slate-a3 text-slate-a11',
    description: 'Sync in-store sales from the flagship shop.',
    category: 'payments',
    types: ['oauth-app', 'rest-api'],
    level: 'community',
    access: 'read',
    status: 'not-connected',
    version: 'API 2025-09-24',
    installs: 1530,
    addedAt: at(-200, 0, 0),
    syncedAt: null,
    permissions: ['Read orders', 'Read inventory'],
    settings: [
      { id: 'sales', label: 'In-store sales', enabled: true },
      { id: 'inventory', label: 'Inventory counts', enabled: false },
    ],
    events: [
      event('neutral', 'Disconnected', at(-80, 0, 0)),
      event('success', 'Connected', at(-190, 0, 0)),
    ],
  },

  // Shipping
  {
    id: 'ups',
    name: 'UPS',
    icon: 'truck',
    colorClass: 'bg-brown-a3 text-brown-a11',
    description: 'Buy labels and track ground shipments.',
    category: 'shipping',
    types: ['rest-api', 'webhook'],
    level: 'verified',
    access: 'read-write',
    status: 'needs-attention',
    version: 'API v2409',
    connectedBy: 'oscar-delgado',
    connectedAt: at(-350, 0, 0),
    installs: 6120,
    addedAt: at(-350, 0, 0),
    syncedAt: at(-2, -4, 0),
    permissions: ['Read orders', 'Create shipments', 'Update tracking'],
    apiKey: 'ups_xxxxxxxxxxxxxxxx',
    webhookUrl: 'https://shop.example.com/webhooks/ups',
    settings: [
      { id: 'labels', label: 'Shipping labels', enabled: true },
      { id: 'tracking', label: 'Tracking updates', enabled: true },
    ],
    events: [
      event(
        'failure',
        'Sync failed',
        at(0, -1, -20),
        'because the API key expired'
      ),
      event('success', 'Sync completed', at(-2, -4, 0), 'for 36 shipments'),
      event('success', 'Key rotated', at(-180, 0, 0)),
      event('success', 'Connected', at(-350, 0, 0)),
    ],
  },
  {
    id: 'fedex',
    name: 'FedEx',
    icon: 'package',
    colorClass: 'bg-purple-a3 text-purple-a11',
    description: 'Express shipping for time sensitive orders.',
    category: 'shipping',
    types: ['rest-api'],
    level: 'verified',
    access: 'read-write',
    status: 'not-connected',
    version: 'API v1',
    installs: 4380,
    addedAt: at(-300, 0, 0),
    syncedAt: null,
    permissions: ['Read orders', 'Create shipments'],
    apiKey: 'fedex_xxxxxxxxxxxxxxxx',
    settings: [
      { id: 'labels', label: 'Shipping labels', enabled: true },
      { id: 'tracking', label: 'Tracking updates', enabled: true },
    ],
    events: [
      event('neutral', 'Disconnected', at(-45, 0, 0)),
      event('success', 'Connected', at(-290, 0, 0)),
    ],
  },
  {
    id: 'usps',
    name: 'USPS',
    icon: 'mailbox',
    colorClass: 'bg-sky-a3 text-sky-a11',
    description: 'Ship small items like headlamps and socks for less.',
    category: 'shipping',
    types: ['rest-api'],
    level: 'native',
    access: 'read-write',
    status: 'connected',
    version: 'API v3',
    connectedBy: 'oscar-delgado',
    connectedAt: at(-500, 0, 0),
    installs: 5590,
    addedAt: at(-500, 0, 0),
    syncedAt: at(0, 0, -25),
    permissions: ['Read orders', 'Create shipments', 'Update tracking'],
    apiKey: 'usps_xxxxxxxxxxxxxxxx',
    settings: [
      { id: 'labels', label: 'Shipping labels', enabled: true },
      { id: 'tracking', label: 'Tracking updates', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -25), 'for 22 shipments'),
      event('success', 'Key rotated', at(-90, 0, 0)),
      event('success', 'Connected', at(-500, 0, 0)),
    ],
  },
  {
    id: 'shipstation',
    name: 'ShipStation',
    icon: 'boxes',
    colorClass: 'bg-green-a3 text-green-a11',
    description: 'Compare carrier rates and batch print labels.',
    category: 'shipping',
    types: ['oauth-app', 'webhook'],
    level: 'community',
    access: 'read-write',
    status: 'not-connected',
    version: 'API v2',
    installs: 2040,
    addedAt: at(-14, 0, 0),
    syncedAt: null,
    permissions: ['Read orders', 'Update order status'],
    webhookUrl: 'https://shop.example.com/webhooks/shipstation',
    settings: [
      { id: 'orders', label: 'New orders', enabled: true },
      { id: 'shipments', label: 'Shipments', enabled: true },
    ],
    events: [
      event(
        'failure',
        'Connection failed',
        at(-6, -2, 0),
        'because authorization was canceled'
      ),
    ],
  },

  // Communication
  {
    id: 'postmark',
    name: 'Postmark',
    icon: 'mail',
    colorClass: 'bg-yellow-a3 text-yellow-a11',
    description: 'Send order confirmations and shipping emails.',
    category: 'communication',
    types: ['rest-api', 'webhook'],
    level: 'verified',
    access: 'read',
    status: 'connected',
    version: 'API v1',
    connectedBy: 'kelley-schimmel',
    connectedAt: at(-260, 0, 0),
    installs: 3460,
    addedAt: at(-260, 0, 0),
    syncedAt: at(0, 0, -3),
    permissions: ['Read orders', 'Read customers'],
    apiKey: 'pm_xxxxxxxxxxxxxxxx',
    webhookUrl: 'https://shop.example.com/webhooks/postmark',
    settings: [
      { id: 'confirmations', label: 'Order confirmations', enabled: true },
      { id: 'shipping', label: 'Shipping updates', enabled: true },
      { id: 'bounces', label: 'Bounce reports', enabled: false },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -3), 'for 64 emails'),
      event('success', 'Webhook URL updated', at(-14, 0, 0)),
      event('success', 'Connected', at(-260, 0, 0)),
    ],
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    icon: 'megaphone',
    colorClass: 'bg-jade-a3 text-jade-a11',
    description: 'Email campaigns for new arrivals and trail season.',
    category: 'communication',
    types: ['rest-api', 'oauth-app'],
    level: 'verified',
    access: 'read',
    status: 'connected',
    version: 'API 2025-07-15',
    connectedBy: 'leticia-yundt',
    connectedAt: at(-240, 0, 0),
    installs: 5170,
    addedAt: at(-240, 0, 0),
    syncedAt: at(0, -1, 0),
    permissions: ['Read customers', 'Read orders', 'Read products'],
    settings: [
      { id: 'customers', label: 'Customer profiles', enabled: true },
      { id: 'orders', label: 'Placed orders', enabled: true },
      { id: 'carts', label: 'Abandoned carts', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, -1, 0), 'for 1,284 profiles'),
      event('success', 'Authorization renewed', at(-40, 0, 0)),
      event('success', 'Connected', at(-240, 0, 0)),
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'hash',
    colorClass: 'bg-plum-a3 text-plum-a11',
    description: 'Post big orders and low stock alerts to channels.',
    category: 'communication',
    types: ['oauth-app', 'webhook'],
    level: 'native',
    access: 'read',
    status: 'connected',
    version: 'Web API',
    connectedBy: 'bianca-ferreira',
    connectedAt: at(-450, 0, 0),
    installs: 6840,
    addedAt: at(-450, 0, 0),
    syncedAt: at(0, 0, -40),
    permissions: ['Read orders', 'Read inventory'],
    webhookUrl: 'https://shop.example.com/webhooks/slack',
    settings: [
      { id: 'orders', label: 'Orders above $500', enabled: true },
      { id: 'stock', label: 'Low stock alerts', enabled: true },
      { id: 'returns', label: 'Return requests', enabled: false },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -40), 'for 3 channels'),
      event('success', 'Channel added', at(-9, 0, 0), '#low-stock'),
      event('success', 'Connected', at(-450, 0, 0)),
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    icon: 'message-square-text',
    colorClass: 'bg-red-a3 text-red-a11',
    description: 'Text customers when their order ships.',
    category: 'communication',
    types: ['rest-api', 'webhook'],
    level: 'community',
    access: 'read',
    status: 'needs-attention',
    version: 'API 2010-04-01',
    connectedBy: 'leticia-yundt',
    connectedAt: at(-90, 0, 0),
    installs: 1890,
    addedAt: at(-90, 0, 0),
    syncedAt: at(-1, -6, 0),
    permissions: ['Read orders', 'Read customers'],
    apiKey: 'AC_xxxxxxxxxxxxxxxx',
    webhookUrl: 'https://shop.example.com/webhooks/twilio',
    settings: [
      { id: 'shipping', label: 'Shipping texts', enabled: true },
      { id: 'delivery', label: 'Delivery reports', enabled: true },
    ],
    events: [
      event(
        'failure',
        'Delivery reports failed',
        at(0, -3, 0),
        'because the webhook URL in Twilio is out of date'
      ),
      event('success', 'Sync completed', at(-1, -6, 0), 'for 52 texts'),
      event('success', 'Connected', at(-90, 0, 0)),
    ],
  },
  {
    id: 'intercom',
    name: 'Intercom',
    icon: 'messages-square',
    colorClass: 'bg-cyan-a3 text-cyan-a11',
    description: 'Live chat with order history beside every conversation.',
    category: 'communication',
    types: ['oauth-app'],
    level: 'verified',
    access: 'read',
    status: 'not-connected',
    version: 'API 2.13',
    installs: 2650,
    addedAt: at(-30, 0, 0),
    syncedAt: null,
    permissions: ['Read customers', 'Read orders'],
    settings: [
      { id: 'customers', label: 'Customer profiles', enabled: true },
      { id: 'orders', label: 'Order history', enabled: true },
    ],
    events: [
      event('neutral', 'Disconnected', at(-12, 0, 0)),
      event('success', 'Connected', at(-28, 0, 0)),
    ],
  },

  // Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    icon: 'chart-column',
    colorClass: 'bg-amber-a3 text-amber-a11',
    description: 'Track storefront traffic and checkout conversion.',
    category: 'analytics',
    types: ['oauth-app'],
    level: 'verified',
    access: 'read',
    status: 'connected',
    version: 'GA4 Data API',
    connectedBy: 'hugo-braun',
    connectedAt: at(-600, 0, 0),
    installs: 8930,
    addedAt: at(-600, 0, 0),
    syncedAt: at(0, -2, 0),
    permissions: ['Read orders', 'Read products'],
    settings: [
      { id: 'purchases', label: 'Purchase events', enabled: true },
      { id: 'carts', label: 'Cart events', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, -2, 0), 'for 9,410 events'),
      event('success', 'Authorization renewed', at(-120, 0, 0)),
      event('success', 'Connected', at(-600, 0, 0)),
    ],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    icon: 'chart-line',
    colorClass: 'bg-iris-a3 text-iris-a11',
    description: 'Funnels from first visit to repeat purchase.',
    category: 'analytics',
    types: ['rest-api', 'sdk'],
    level: 'verified',
    access: 'read',
    status: 'not-connected',
    version: 'API v2',
    installs: 2310,
    addedAt: at(-150, 0, 0),
    syncedAt: null,
    permissions: ['Read orders', 'Read customers'],
    apiKey: 'mp_xxxxxxxxxxxxxxxx',
    settings: [
      { id: 'purchases', label: 'Purchase events', enabled: true },
      { id: 'signups', label: 'Account signups', enabled: true },
    ],
    events: [
      event('neutral', 'Disconnected', at(-33, 0, 0)),
      event('success', 'Connected', at(-140, 0, 0)),
    ],
  },
  {
    id: 'segment',
    name: 'Segment',
    icon: 'git-merge',
    colorClass: 'bg-grass-a3 text-grass-a11',
    description: 'Send shop events to every tool in your stack.',
    category: 'analytics',
    types: ['rest-api', 'webhook', 'sdk'],
    level: 'verified',
    access: 'read',
    status: 'connected',
    version: 'Tracking API v1',
    connectedBy: 'hugo-braun',
    connectedAt: at(-180, 0, 0),
    installs: 3120,
    addedAt: at(-180, 0, 0),
    syncedAt: at(0, 0, -8),
    permissions: ['Read orders', 'Read customers', 'Read products'],
    apiKey: 'seg_xxxxxxxxxxxxxxxx',
    webhookUrl: 'https://shop.example.com/webhooks/segment',
    settings: [
      { id: 'orders', label: 'Order events', enabled: true },
      { id: 'customers', label: 'Customer traits', enabled: true },
      { id: 'products', label: 'Product views', enabled: false },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -8), 'for 2,736 events'),
      event(
        'failure',
        'Sync failed',
        at(-6, -3, 0),
        'because Segment timed out'
      ),
      event('success', 'Key rotated', at(-60, 0, 0)),
      event('success', 'Connected', at(-180, 0, 0)),
    ],
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    icon: 'mouse-pointer-click',
    colorClass: 'bg-tomato-a3 text-tomato-a11',
    description: 'Heatmaps for product pages and size guides.',
    category: 'analytics',
    types: ['sdk'],
    level: 'community',
    access: 'read',
    status: 'not-connected',
    version: 'SDK 6.2.0',
    installs: 980,
    addedAt: at(-3, 0, 0),
    syncedAt: null,
    permissions: ['Read products'],
    settings: [{ id: 'pages', label: 'Page recordings', enabled: true }],
    events: [
      event(
        'failure',
        'Connection failed',
        at(-1, -4, 0),
        'because the site ID was not found'
      ),
    ],
  },

  // Developer
  {
    id: 'webhooks',
    name: 'Webhooks',
    icon: 'webhook',
    colorClass: 'bg-teal-a3 text-teal-a11',
    description: 'Notify your own services when shop data changes.',
    category: 'developer',
    types: ['webhook'],
    level: 'native',
    access: 'read',
    status: 'connected',
    version: 'Payload v3',
    connectedBy: 'nathan-kutch',
    connectedAt: at(-700, 0, 0),
    installs: 4410,
    addedAt: at(-700, 0, 0),
    syncedAt: at(0, 0, -4),
    permissions: ['Read orders', 'Read customers', 'Read inventory'],
    webhookUrl: 'https://hooks.example.com/shop-events',
    settings: [
      { id: 'orders', label: 'Order created', enabled: true },
      { id: 'fulfillment', label: 'Order fulfilled', enabled: true },
      { id: 'customers', label: 'Customer created', enabled: false },
      { id: 'stock', label: 'Inventory changed', enabled: true },
    ],
    events: [
      event('success', 'Sync completed', at(0, 0, -4), 'for 128 deliveries'),
      event(
        'failure',
        'Delivery failed',
        at(-2, -1, 0),
        'with a 503 from hooks.example.com'
      ),
      event('success', 'Event added', at(-20, 0, 0), 'Inventory changed'),
      event('success', 'Connected', at(-700, 0, 0)),
    ],
  },
  {
    id: 'rest-api-keys',
    name: 'REST API keys',
    icon: 'key-round',
    colorClass: 'bg-gold-a3 text-gold-a11',
    description: 'Create keys for scripts and internal tools.',
    category: 'developer',
    types: ['rest-api'],
    level: 'native',
    access: 'read-write',
    status: 'connected',
    version: 'API v2',
    connectedBy: 'evan-gutmann',
    connectedAt: at(-700, 0, 0),
    installs: 3780,
    addedAt: at(-700, 0, 0),
    syncedAt: at(0, -3, 0),
    permissions: ['Read orders', 'Update orders', 'Read products'],
    apiKey: 'fuse_xxxxxxxxxxxxxxxx',
    settings: [
      { id: 'orders', label: 'Orders', enabled: true },
      { id: 'products', label: 'Products', enabled: true },
      { id: 'customers', label: 'Customers', enabled: false },
    ],
    events: [
      event('success', 'Sync completed', at(0, -3, 0), 'for 2 keys'),
      event('success', 'Key rotated', at(-25, 0, 0)),
      event('success', 'Connected', at(-700, 0, 0)),
    ],
  },
  {
    id: 'storefront-sdk',
    name: 'Storefront SDK',
    icon: 'code-xml',
    colorClass: 'bg-primary-a3 text-primary-a11',
    description: 'Build a custom storefront on top of your catalog.',
    category: 'developer',
    types: ['sdk', 'rest-api'],
    level: 'native',
    access: 'read',
    status: 'not-connected',
    version: 'SDK 4.2.0',
    installs: 1620,
    addedAt: at(-20, 0, 0),
    syncedAt: null,
    permissions: ['Read products', 'Read inventory'],
    apiKey: 'sf_xxxxxxxxxxxxxxxx',
    settings: [
      { id: 'products', label: 'Products', enabled: true },
      { id: 'inventory', label: 'Inventory', enabled: true },
    ],
    events: [
      event('neutral', 'Disconnected', at(-10, 0, 0)),
      event('success', 'Connected', at(-18, 0, 0)),
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'git-branch',
    colorClass: 'bg-neutral-a3 text-neutral-a11',
    description: 'Deploy theme changes from a repository.',
    category: 'developer',
    types: ['oauth-app', 'webhook'],
    level: 'community',
    access: 'read-write',
    status: 'not-connected',
    version: 'REST API 2022-11-28',
    installs: 870,
    addedAt: at(-7, 0, 0),
    syncedAt: null,
    permissions: ['Update theme files'],
    webhookUrl: 'https://shop.example.com/webhooks/github',
    settings: [{ id: 'pushes', label: 'Pushes to main', enabled: true }],
    events: [
      event(
        'failure',
        'Connection failed',
        at(-3, -6, 0),
        'because the repository was not found'
      ),
    ],
  },
];

@Service()
export class IntegrationsService {
  // Data
  readonly integrations = signal<Integration[]>(INTEGRATIONS);

  byId(id: string) {
    return (
      this.integrations().find((integration) => integration.id === id) ?? null
    );
  }

  connect(integration: Integration) {
    const date = new Date().toISOString();

    this.update(integration.id, {
      status: 'connected',
      connectedBy: 'john-builder',
      connectedAt: date,
      syncedAt: date,
      events: [
        event(
          'success',
          integration.status === 'needs-attention'
            ? 'Reconnected'
            : 'Connected',
          date
        ),
        ...integration.events,
      ],
    });
  }

  disconnect(integration: Integration) {
    this.update(integration.id, {
      status: 'not-connected',
      connectedBy: undefined,
      connectedAt: undefined,
      syncedAt: null,
      events: [
        event('neutral', 'Disconnected', new Date().toISOString()),
        ...integration.events,
      ],
    });
  }

  sync(integration: Integration) {
    const running = event(
      'running',
      'Sync in progress',
      new Date().toISOString()
    );

    this.update(integration.id, { events: [running, ...integration.events] });

    setTimeout(() => {
      const date = new Date().toISOString();

      this.integrations.update((integrations) =>
        integrations.map((item) =>
          item.id === integration.id
            ? {
                ...item,
                syncedAt: date,
                events: item.events.map((entry) =>
                  entry.id === running.id
                    ? {
                        ...entry,
                        kind: 'success',
                        title: 'Sync completed',
                        date,
                      }
                    : entry
                ),
              }
            : item
        )
      );
    }, 1500);
  }

  clearHistory(id: string) {
    this.update(id, { events: [] });
  }

  toggle(id: string, settingId: string) {
    this.integrations.update((integrations) =>
      integrations.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              settings: integration.settings.map((setting) =>
                setting.id === settingId
                  ? { ...setting, enabled: !setting.enabled }
                  : setting
              ),
            }
          : integration
      )
    );
  }

  update(id: string, changes: Partial<Integration>) {
    this.integrations.update((integrations) =>
      integrations.map((integration) =>
        integration.id === id ? { ...integration, ...changes } : integration
      )
    );
  }
}
