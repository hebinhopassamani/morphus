import { Service, signal } from '@angular/core';
import { add } from 'date-fns';

export type ImportType = 'customers' | 'orders' | 'invoices';

export type ImportStatus = 'completed' | 'partial' | 'failed' | 'running';

export type DuplicateHandling = 'skip' | 'update' | 'create';

export type ImportField = {
  id: string;
  label: string;
  required: boolean;
};

export type ImportColumn = {
  name: string;
  sample: string;
  target: string | null;
  matched: boolean;
};

export type ImportReason = {
  field: string;
  reason: string;
  values: string[];
};

export type ImportWarning = {
  text: string;
  count: number;
};

export type ImportTemplate = {
  type: ImportType;
  label: string;
  description: string;
  icon: string;
  match: string;
  fileName: string;
  size: number;
  rows: number;
  fields: ImportField[];
  columns: ImportColumn[];
  warnings: ImportWarning[];
  errors: Record<string, number>;
  matches: number;
};

export type DuplicateOption = {
  id: DuplicateHandling;
  label: string;
  description: string;
};

export type ImportMapping = {
  source: string;
  target: string | null;
};

export type ImportError = {
  row: number;
  field: string;
  value: string;
  reason: string;
};

export type Import = {
  id: string;
  fileName: string;
  type: ImportType;
  size: number;
  rows: number;
  status: ImportStatus;
  startedById: string;
  startedAt: string;
  duration: number | null;
  duplicates: DuplicateHandling;
  mapping: ImportMapping[];
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportError[];
};

type ImportSeed = {
  id: string;
  fileName: string;
  type: ImportType;
  size: number;
  rows: number;
  startedBy: string;
  startedAt: string;
  duration: number | null;
  duplicates: DuplicateHandling;
  matches: number;
  errors: Record<string, number>;
};

const ME = 'gloria-metz';

const KB = 1000;

const MB = 1000 * KB;

const now = new Date();
const days = (value: number) => add(now, { days: value }).toISOString();
const minutes = (value: number) => add(now, { minutes: value }).toISOString();

export const DUPLICATE_OPTIONS: DuplicateOption[] = [
  {
    id: 'skip',
    label: 'Skip',
    description: 'Keep existing records as they are.',
  },
  {
    id: 'update',
    label: 'Update existing',
    description: 'Overwrite matching records with the file values.',
  },
  {
    id: 'create',
    label: 'Create anyway',
    description: 'Add every row as a new record.',
  },
];

export const IMPORT_TEMPLATES: Record<ImportType, ImportTemplate> = {
  customers: {
    type: 'customers',
    label: 'Customers',
    description: 'Contacts, addresses and marketing consent.',
    icon: 'users',
    match: 'email',
    fileName: 'customers-sample.csv',
    size: 38.4 * KB,
    rows: 248,
    fields: [
      { id: 'firstName', label: 'First name', required: true },
      { id: 'lastName', label: 'Last name', required: true },
      { id: 'email', label: 'Email', required: true },
      { id: 'phone', label: 'Phone', required: false },
      { id: 'company', label: 'Company', required: false },
      { id: 'street', label: 'Street', required: false },
      { id: 'city', label: 'City', required: false },
      { id: 'country', label: 'Country', required: false },
      { id: 'tags', label: 'Tags', required: false },
      { id: 'marketing', label: 'Accepts marketing', required: false },
    ],
    columns: [
      {
        name: 'First Name',
        sample: 'Avery',
        target: 'firstName',
        matched: true,
      },
      {
        name: 'Last Name',
        sample: 'Lindgren',
        target: 'lastName',
        matched: true,
      },
      {
        name: 'E-mail (primary)',
        sample: 'avery.lindgren@example.com',
        target: 'email',
        matched: false,
      },
      {
        name: 'Phone',
        sample: '+1 503 555 0142',
        target: 'phone',
        matched: true,
      },
      {
        name: 'Company',
        sample: 'Cascade Climbing Club',
        target: 'company',
        matched: true,
      },
      {
        name: 'Address 1',
        sample: '2210 NW Glisan St',
        target: 'street',
        matched: true,
      },
      { name: 'City', sample: 'Portland', target: 'city', matched: true },
      {
        name: 'Country',
        sample: 'United States',
        target: 'country',
        matched: true,
      },
      { name: 'Tags', sample: 'climbing, vip', target: 'tags', matched: true },
      {
        name: 'Accepts Marketing',
        sample: 'yes',
        target: 'marketing',
        matched: true,
      },
      {
        name: 'Customer Notes',
        sample: 'Prefers pickup in store',
        target: null,
        matched: false,
      },
    ],
    warnings: [
      { text: 'Phone numbers will be reformatted', count: 9 },
      { text: 'Country names will be converted to codes', count: 5 },
    ],
    errors: { email: 4, lastName: 2 },
    matches: 31,
  },
  orders: {
    type: 'orders',
    label: 'Orders',
    description: 'Past orders with line items, totals and channel.',
    icon: 'shopping-cart',
    match: 'order number',
    fileName: 'orders-sample.csv',
    size: 52.9 * KB,
    rows: 186,
    fields: [
      { id: 'orderNumber', label: 'Order number', required: true },
      { id: 'placedAt', label: 'Order date', required: true },
      { id: 'customerEmail', label: 'Customer email', required: true },
      { id: 'sku', label: 'SKU', required: true },
      { id: 'quantity', label: 'Quantity', required: true },
      { id: 'price', label: 'Unit price', required: true },
      { id: 'discountCode', label: 'Discount code', required: false },
      { id: 'shipping', label: 'Shipping', required: false },
      { id: 'tax', label: 'Tax', required: false },
      { id: 'total', label: 'Total', required: false },
      { id: 'channel', label: 'Channel', required: false },
    ],
    columns: [
      {
        name: 'Order #',
        sample: '10482',
        target: 'orderNumber',
        matched: true,
      },
      {
        name: 'Created At',
        sample: '09/14 10:32',
        target: 'placedAt',
        matched: true,
      },
      {
        name: 'Buyer',
        sample: 'noah.brennan@example.com',
        target: 'customerEmail',
        matched: false,
      },
      {
        name: 'Lineitem SKU',
        sample: 'PCK-RDG-28-BLK',
        target: 'sku',
        matched: true,
      },
      {
        name: 'Lineitem Qty',
        sample: '1',
        target: 'quantity',
        matched: true,
      },
      {
        name: 'Lineitem Price',
        sample: '89.00',
        target: 'price',
        matched: true,
      },
      {
        name: 'Discount Code',
        sample: 'TRAIL10',
        target: 'discountCode',
        matched: true,
      },
      {
        name: 'Shipping',
        sample: '6.95',
        target: 'shipping',
        matched: true,
      },
      { name: 'Taxes', sample: '7.12', target: 'tax', matched: true },
      { name: 'Total', sample: '94.17', target: 'total', matched: true },
      {
        name: 'Source',
        sample: 'web',
        target: 'channel',
        matched: false,
      },
      {
        name: 'Packing Notes',
        sample: 'Gift wrap',
        target: null,
        matched: false,
      },
    ],
    warnings: [{ text: 'Unknown discount codes will be ignored', count: 6 }],
    errors: { sku: 3, quantity: 1 },
    matches: 14,
  },
  invoices: {
    type: 'invoices',
    label: 'Invoices',
    description: 'Issued invoices with due dates and payments.',
    icon: 'receipt-text',
    match: 'invoice number',
    fileName: 'invoices-sample.csv',
    size: 12.6 * KB,
    rows: 74,
    fields: [
      { id: 'invoiceNumber', label: 'Invoice number', required: true },
      { id: 'orderNumber', label: 'Order number', required: true },
      { id: 'issuedAt', label: 'Issue date', required: true },
      { id: 'dueAt', label: 'Due date', required: true },
      { id: 'customerEmail', label: 'Customer email', required: true },
      { id: 'total', label: 'Amount', required: true },
      { id: 'paid', label: 'Amount paid', required: false },
      { id: 'status', label: 'Status', required: false },
      { id: 'currency', label: 'Currency', required: false },
    ],
    columns: [
      {
        name: 'Invoice No.',
        sample: 'INV-2031',
        target: 'invoiceNumber',
        matched: true,
      },
      {
        name: 'Order Ref',
        sample: '10482',
        target: 'orderNumber',
        matched: false,
      },
      {
        name: 'Issued',
        sample: '09/14',
        target: 'issuedAt',
        matched: true,
      },
      { name: 'Due', sample: '09/21', target: 'dueAt', matched: true },
      {
        name: 'Bill To Email',
        sample: 'noah.brennan@example.com',
        target: 'customerEmail',
        matched: true,
      },
      {
        name: 'Amount Due',
        sample: '94.17',
        target: 'total',
        matched: true,
      },
      { name: 'Paid', sample: '94.17', target: 'paid', matched: true },
      { name: 'Status', sample: 'paid', target: 'status', matched: true },
      {
        name: 'Currency',
        sample: 'USD',
        target: 'currency',
        matched: true,
      },
      {
        name: 'PO Number',
        sample: 'PO-7781',
        target: null,
        matched: false,
      },
    ],
    warnings: [{ text: 'Missing currency will default to USD', count: 7 }],
    errors: { orderNumber: 2 },
    matches: 5,
  },
};

export const IMPORT_REASONS: Record<
  ImportType,
  Record<string, ImportReason>
> = {
  customers: {
    email: {
      field: 'Email',
      reason: 'Invalid email address',
      values: [
        'jordan.lee@example',
        'maya.ortiz@',
        'sam.wells@example,com',
        'hollis@@example.com',
      ],
    },
    lastName: {
      field: 'Last name',
      reason: 'Required value is missing',
      values: [''],
    },
    phone: {
      field: 'Phone',
      reason: 'Phone number is too short',
      values: ['555-01', '4471', '90 12'],
    },
    country: {
      field: 'Country',
      reason: 'Unknown country',
      values: ['Untied States', 'Kanada', 'Deutschlnd'],
    },
  },
  orders: {
    sku: {
      field: 'SKU',
      reason: 'Product not found',
      values: ['PCK-RDG-30-BLK', 'JKT-DWN-SPR-XXL', 'SCK-HKG-SLT'],
    },
    quantity: {
      field: 'Quantity',
      reason: 'Must be a whole number',
      values: ['1.5', 'two', '-1'],
    },
    price: {
      field: 'Unit price',
      reason: 'Invalid amount',
      values: ['$129,00', 'free'],
    },
  },
  invoices: {
    orderNumber: {
      field: 'Order number',
      reason: 'Order not found',
      values: ['9921', '10433', '8812', '10007'],
    },
    dueAt: {
      field: 'Due date',
      reason: 'Invalid date',
      values: ['31/06', '13/02', 'next Friday'],
    },
    total: {
      field: 'Amount',
      reason: 'Invalid amount',
      values: ['1.240,00', 'n/a'],
    },
  },
};

const SEEDS: ImportSeed[] = [
  {
    id: 'imp-1014',
    fileName: 'shopify-orders-export.csv',
    type: 'orders',
    size: 1.4 * MB,
    rows: 1860,
    startedBy: ME,
    startedAt: minutes(-4),
    duration: null,
    duplicates: 'skip',
    matches: 0,
    errors: {},
  },
  {
    id: 'imp-1013',
    fileName: 'newsletter-signups.csv',
    type: 'customers',
    size: 61.8 * KB,
    rows: 412,
    startedBy: 'kelley-schimmel',
    startedAt: days(-1),
    duration: 18,
    duplicates: 'skip',
    matches: 37,
    errors: {},
  },
  {
    id: 'imp-1012',
    fileName: 'wholesale-invoices-q3.xlsx',
    type: 'invoices',
    size: 48.2 * KB,
    rows: 86,
    startedBy: 'leticia-yundt',
    startedAt: days(-3),
    duration: 9,
    duplicates: 'update',
    matches: 6,
    errors: { orderNumber: 4, dueAt: 1 },
  },
  {
    id: 'imp-1011',
    fileName: 'trade-show-leads.csv',
    type: 'customers',
    size: 19.6 * KB,
    rows: 128,
    startedBy: 'bianca-ferreira',
    startedAt: days(-6),
    duration: 7,
    duplicates: 'create',
    matches: 11,
    errors: { email: 6, lastName: 2 },
  },
  {
    id: 'imp-1010',
    fileName: 'marketplace-orders.csv',
    type: 'orders',
    size: 488 * KB,
    rows: 640,
    startedBy: ME,
    startedAt: days(-9),
    duration: 52,
    duplicates: 'update',
    matches: 52,
    errors: {},
  },
  {
    id: 'imp-1009',
    fileName: 'loyalty-members.xlsx',
    type: 'customers',
    size: 412 * KB,
    rows: 2315,
    startedBy: 'kelley-schimmel',
    startedAt: days(-14),
    duration: 96,
    duplicates: 'update',
    matches: 418,
    errors: { email: 9, country: 3 },
  },
  {
    id: 'imp-1008',
    fileName: 'net-30-accounts.csv',
    type: 'invoices',
    size: 4.1 * KB,
    rows: 22,
    startedBy: 'leticia-yundt',
    startedAt: days(-17),
    duration: 3,
    duplicates: 'skip',
    matches: 0,
    errors: { orderNumber: 18, total: 4 },
  },
  {
    id: 'imp-1007',
    fileName: 'pop-up-store-sales.csv',
    type: 'orders',
    size: 161 * KB,
    rows: 214,
    startedBy: 'hugo-braun',
    startedAt: days(-23),
    duration: 21,
    duplicates: 'skip',
    matches: 12,
    errors: {},
  },
  {
    id: 'imp-1006',
    fileName: 'legacy-crm-contacts.csv',
    type: 'customers',
    size: 1.1 * MB,
    rows: 3980,
    startedBy: ME,
    startedAt: days(-31),
    duration: 184,
    duplicates: 'skip',
    matches: 611,
    errors: { email: 14, phone: 5, lastName: 3 },
  },
  {
    id: 'imp-1005',
    fileName: 'summer-orders-backfill.csv',
    type: 'orders',
    size: 9.8 * KB,
    rows: 14,
    startedBy: 'hugo-braun',
    startedAt: days(-38),
    duration: 2,
    duplicates: 'skip',
    matches: 0,
    errors: { sku: 9, quantity: 5 },
  },
  {
    id: 'imp-1004',
    fileName: 'invoices-july.csv',
    type: 'invoices',
    size: 53.7 * KB,
    rows: 318,
    startedBy: 'rosalind-pike',
    startedAt: days(-46),
    duration: 24,
    duplicates: 'update',
    matches: 24,
    errors: {},
  },
  {
    id: 'imp-1003',
    fileName: 'pro-deal-applicants.csv',
    type: 'customers',
    size: 8.9 * KB,
    rows: 57,
    startedBy: 'bianca-ferreira',
    startedAt: days(-58),
    duration: 4,
    duplicates: 'create',
    matches: 0,
    errors: {},
  },
  {
    id: 'imp-1002',
    fileName: 'wholesale-reorders.xlsx',
    type: 'orders',
    size: 74.3 * KB,
    rows: 96,
    startedBy: 'rosalind-pike',
    startedAt: days(-74),
    duration: 11,
    duplicates: 'skip',
    matches: 8,
    errors: { price: 2 },
  },
  {
    id: 'imp-1001',
    fileName: 'archived-invoices.csv',
    type: 'invoices',
    size: 203 * KB,
    rows: 1204,
    startedBy: 'priya-raman',
    startedAt: days(-97),
    duration: 71,
    duplicates: 'skip',
    matches: 88,
    errors: {},
  },
];

// Interleaves reasons so failing rows spread through the file like real data
const createErrors = (
  type: ImportType,
  rows: number,
  counts: Record<string, number>
): ImportError[] => {
  const failures = Object.entries(counts)
    .flatMap(([key, count]) =>
      Array.from({ length: count }, (_, index) => ({
        reason: IMPORT_REASONS[type][key],
        index,
        order: (index + 0.5) / count,
      }))
    )
    .sort((a, b) => a.order - b.order);

  return failures.map(({ reason, index }, position) => ({
    row: 2 + Math.floor((position * rows) / failures.length),
    field: reason.field,
    value: reason.values[index % reason.values.length],
    reason: reason.reason,
  }));
};

const createImport = (seed: ImportSeed, mapping: ImportMapping[]): Import => {
  const errors = createErrors(seed.type, seed.rows, seed.errors);
  const running = seed.duration === null;
  const failed = running ? 0 : errors.length;
  const matched = running ? 0 : seed.matches;
  const updated = seed.duplicates === 'update' ? matched : 0;
  const skipped = seed.duplicates === 'skip' ? matched : 0;

  return {
    id: seed.id,
    fileName: seed.fileName,
    type: seed.type,
    size: seed.size,
    rows: seed.rows,
    status: running
      ? 'running'
      : failed === seed.rows
        ? 'failed'
        : failed
          ? 'partial'
          : 'completed',
    startedById: seed.startedBy,
    startedAt: seed.startedAt,
    duration: seed.duration,
    duplicates: seed.duplicates,
    mapping,
    imported: running ? 0 : seed.rows - failed - updated - skipped,
    updated,
    skipped,
    failed,
    errors: running ? [] : errors,
  };
};

const templateMapping = (type: ImportType) =>
  IMPORT_TEMPLATES[type].columns.map((column) => ({
    source: column.name,
    target: column.target,
  }));

@Service()
export class ImportsService {
  // Data
  readonly imports = signal<Import[]>(
    SEEDS.map((seed) => createImport(seed, templateMapping(seed.type)))
  );

  byId(id: string) {
    return this.imports().find((item) => item.id === id) ?? null;
  }

  start(
    template: ImportTemplate,
    duplicates: DuplicateHandling,
    mapping: ImportMapping[]
  ) {
    const item = createImport(
      {
        id: crypto.randomUUID(),
        fileName: template.fileName,
        type: template.type,
        size: template.size,
        rows: template.rows,
        startedBy: ME,
        startedAt: new Date().toISOString(),
        duration: 4,
        duplicates,
        matches: template.matches,
        errors: template.errors,
      },
      mapping
    );

    this.imports.update((imports) => [item, ...imports]);

    return item.id;
  }

  remove(id: string) {
    this.imports.update((imports) => imports.filter((item) => item.id !== id));
  }
}
