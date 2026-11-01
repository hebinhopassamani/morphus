import { Service, signal } from '@angular/core';
import { add } from 'date-fns';

export type Channel = 'online' | 'pos' | 'marketplace';

export type PaymentStatus = 'paid' | 'partially-paid' | 'unpaid' | 'refunded';

export type FulfillmentStatus =
  'unfulfilled' | 'partially-fulfilled' | 'fulfilled' | 'returned';

export type LineItemStatus = 'unfulfilled' | 'fulfilled' | 'returned';

export type Address = {
  street: string;
  city: string;
  country: string;
};

export type PaymentMethod = {
  label: string;
  icon: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  since: string;
  address: Address;
  paymentMethod: PaymentMethod;
  taxRate: number;
};

export type Product = {
  sku: string;
  name: string;
  variant: string;
  icon: string;
  price: number;
};

export type LineItem = Product & {
  quantity: number;
  status: LineItemStatus;
};

export type ShippingMethod = {
  label: string;
  carrier: string | null;
  price: number;
  trackingPrefix: string | null;
};

export type Transaction = {
  id: string;
  kind: 'authorization' | 'sale' | 'refund';
  status: 'pending' | 'success';
  amount: number;
  date: string;
};

export type TimelineEntry = {
  id: string;
  type:
    'placed' | 'note' | 'payment' | 'flag' | 'shipment' | 'return' | 'refund';
  title: string;
  text: string;
  date: string;
};

export type Order = {
  id: string;
  placedAt: string;
  customer: Customer;
  channel: Channel;
  payment: PaymentStatus;
  fulfillment: FulfillmentStatus;
  flagged: boolean;
  items: LineItem[];
  itemCount: number;
  discountCode: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paid: number;
  refunded: number;
  balance: number;
  shippingMethod: ShippingMethod;
  shippingAddress: Address | null;
  billingAddress: Address;
  shippedAt: string | null;
  tracking: string | null;
  note: string | null;
  paymentMethod: PaymentMethod;
  transactions: Transaction[];
  returned: { reason: string; date: string } | null;
  timeline: TimelineEntry[];
};

type OrderSeed = {
  id: string;
  placedAt: string;
  customer: Customer;
  channel: Channel;
  payment: PaymentStatus;
  fulfillment: FulfillmentStatus;
  items: { product: Product; quantity: number; backordered?: boolean }[];
  shipping: ShippingMethod;
  discount?: { code: string; rate: number };
  shipTo?: Address;
  paymentMethod?: PaymentMethod;
  note?: string;
  flag?: string;
  returnReason?: string;
};

const now = new Date();
const at = (days: number, hours: number) =>
  add(now, { days, hours }).toISOString();
const round = (value: number) => Math.round(value * 100) / 100;
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const LINE_STATUS: Record<FulfillmentStatus, LineItemStatus> = {
  unfulfilled: 'unfulfilled',
  'partially-fulfilled': 'fulfilled',
  fulfilled: 'fulfilled',
  returned: 'returned',
};

const PAID_SHARE: Record<PaymentStatus, number> = {
  paid: 1,
  'partially-paid': 0.5,
  unpaid: 0,
  refunded: 1,
};

const PAYMENT_METHODS = {
  applePay: {
    label: 'Apple Pay',
    icon: 'wallet',
  },
  cash: {
    label: 'Cash',
    icon: 'banknote',
  },
  marketplace: {
    label: 'Marketplace payout',
    icon: 'shopping-bag',
  },
  paypal: {
    label: 'PayPal',
    icon: 'wallet',
  },
};

const SHIPPING_METHODS = {
  standard: {
    label: 'Standard',
    carrier: 'USPS Ground Advantage',
    price: 8,
    trackingPrefix: '94001118992230051',
  },
  free: {
    label: 'Free shipping',
    carrier: 'USPS Ground Advantage',
    price: 0,
    trackingPrefix: '94001118992230051',
  },
  express: {
    label: 'Express',
    carrier: 'UPS 2nd Day Air',
    price: 24,
    trackingPrefix: '1Z84F2X003204',
  },
  international: {
    label: 'International',
    carrier: 'DHL Express',
    price: 45,
    trackingPrefix: '42070',
  },
  pickup: {
    label: 'Store pickup',
    carrier: null,
    price: 0,
    trackingPrefix: null,
  },
  inStore: {
    label: 'In store',
    carrier: null,
    price: 0,
    trackingPrefix: null,
  },
};

const DISCOUNTS = {
  trailhead: {
    code: 'TRAILHEAD10',
    rate: 0.1,
  },
  welcome: {
    code: 'WELCOME15',
    rate: 0.15,
  },
  fallGear: {
    code: 'FALLGEAR20',
    rate: 0.2,
  },
};

const PRODUCTS = {
  merinoCrewCharcoal: {
    sku: 'MRN-CRW-CHR-M',
    name: 'Merino Crew Base Layer',
    variant: 'Charcoal / M',
    icon: 'shirt',
    price: 78,
  },
  merinoCrewSage: {
    sku: 'MRN-CRW-SGE-S',
    name: 'Merino Crew Base Layer',
    variant: 'Sage / S',
    icon: 'shirt',
    price: 78,
  },
  hikingSocksSlate: {
    sku: 'SCK-HKG-SLT-L',
    name: 'Merino Hiking Socks',
    variant: 'Slate / L',
    icon: 'footprints',
    price: 24,
  },
  hikingSocksRust: {
    sku: 'SCK-HKG-RST-M',
    name: 'Merino Hiking Socks',
    variant: 'Rust / M',
    icon: 'footprints',
    price: 24,
  },
  downJacketSpruce: {
    sku: 'JKT-DWN-SPR-M',
    name: 'Alpine Down Jacket',
    variant: 'Spruce / M',
    icon: 'snowflake',
    price: 289,
  },
  downJacketBlack: {
    sku: 'JKT-DWN-BLK-L',
    name: 'Alpine Down Jacket',
    variant: 'Black / L',
    icon: 'snowflake',
    price: 289,
  },
  daypackBlack: {
    sku: 'PCK-RDG-28-BLK',
    name: 'Ridgeline 28L Daypack',
    variant: 'Black',
    icon: 'backpack',
    price: 149,
  },
  daypackOchre: {
    sku: 'PCK-RDG-28-OCH',
    name: 'Ridgeline 28L Daypack',
    variant: 'Ochre',
    icon: 'backpack',
    price: 149,
  },
  bottleLarge: {
    sku: 'BTL-INS-32-GLC',
    name: 'Insulated Bottle 32 oz',
    variant: 'Glacier',
    icon: 'glass-water',
    price: 38,
  },
  bottleSmall: {
    sku: 'BTL-INS-20-STN',
    name: 'Insulated Bottle 20 oz',
    variant: 'Stone',
    icon: 'glass-water',
    price: 32,
  },
  rainShellOchre: {
    sku: 'SHL-RAN-OCH-S',
    name: 'Packable Rain Shell',
    variant: 'Ochre / S',
    icon: 'umbrella',
    price: 165,
  },
  rainShellNavy: {
    sku: 'SHL-RAN-NVY-L',
    name: 'Packable Rain Shell',
    variant: 'Navy / L',
    icon: 'umbrella',
    price: 165,
  },
  mugSet: {
    sku: 'MUG-CMP-STN-2',
    name: 'Enamel Camp Mug Set',
    variant: 'Stone / Set of 2',
    icon: 'coffee',
    price: 32,
  },
  trekkingPoles: {
    sku: 'POL-TRK-CRB',
    name: 'Carbon Trekking Poles',
    variant: 'Pair',
    icon: 'mountain',
    price: 139,
  },
  beanie: {
    sku: 'BNE-WOL-RST',
    name: 'Wool Beanie',
    variant: 'Rust',
    icon: 'shirt',
    price: 34,
  },
  duffel: {
    sku: 'DUF-TRV-45-OLV',
    name: 'Travel Duffel 45L',
    variant: 'Olive',
    icon: 'luggage',
    price: 179,
  },
  packingCubes: {
    sku: 'CUB-PCK-SND-3',
    name: 'Packing Cubes',
    variant: 'Sand / Set of 3',
    icon: 'box',
    price: 42,
  },
  headlamp: {
    sku: 'LMP-HDL-400',
    name: 'Headlamp 400',
    variant: 'Matte Black',
    icon: 'flashlight',
    price: 49,
  },
  hammock: {
    sku: 'HMK-UL-FRS',
    name: 'Ultralight Hammock',
    variant: 'Forest',
    icon: 'tent-tree',
    price: 89,
  },
  tent: {
    sku: 'TNT-2P-SND',
    name: 'Trailhead 2P Tent',
    variant: 'Sand',
    icon: 'tent',
    price: 429,
  },
  fleece: {
    sku: 'FLC-QZP-HGR-L',
    name: 'Fleece Quarter Zip',
    variant: 'Heather Gray / L',
    icon: 'shirt',
    price: 98,
  },
  trailShorts: {
    sku: 'SHT-HKG-KHK-32',
    name: 'Trail Shorts',
    variant: 'Khaki / 32',
    icon: 'shirt',
    price: 68,
  },
  stove: {
    sku: 'STV-CMP-TI',
    name: 'Titanium Camp Stove',
    variant: 'Titanium',
    icon: 'flame',
    price: 74,
  },
  cookset: {
    sku: 'CKW-CMP-2P',
    name: 'Camp Cookset',
    variant: '2 person',
    icon: 'cooking-pot',
    price: 58,
  },
  trailMap: {
    sku: 'MAP-PNW',
    name: 'Pacific Northwest Trail Map',
    variant: 'Waterproof',
    icon: 'map',
    price: 16,
  },
  compass: {
    sku: 'CMP-BRS',
    name: 'Baseplate Compass',
    variant: 'Brass',
    icon: 'compass',
    price: 46,
  },
};

export const CUSTOMERS = {
  maya: {
    id: '1012',
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    phone: '+1 (503) 555-0142',
    since: at(-904, 0),
    address: {
      street: '1120 NW Couch St, Apt 4B',
      city: 'Portland, OR 97209',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 4821',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  grace: {
    id: '1023',
    name: 'Grace Kim',
    email: 'grace.kim@example.com',
    phone: '+1 (415) 555-0118',
    since: at(-420, 0),
    address: {
      street: '2241 Folsom St',
      city: 'San Francisco, CA 94110',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 2047',
      icon: 'credit-card',
    },
    taxRate: 0.08625,
  },
  ben: {
    id: '1010',
    name: 'Ben Carter',
    email: 'ben.carter@example.com',
    phone: '+1 (503) 555-0177',
    since: at(-1210, 0),
    address: {
      street: '3517 SE Division St',
      city: 'Portland, OR 97202',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.cash,
    taxRate: 0,
  },
  lucas: {
    id: '1043',
    name: 'Lucas Weber',
    email: 'lucas.weber@example.com',
    phone: '+49 89 5550 1427',
    since: at(-2, 0),
    address: {
      street: 'Schellingstraße 42',
      city: '80799 Munich',
      country: 'Germany',
    },
    paymentMethod: PAYMENT_METHODS.paypal,
    taxRate: 0,
  },
  sofia: {
    id: '1027',
    name: 'Sofia Ramirez',
    email: 'sofia.ramirez@example.com',
    phone: '+1 (512) 555-0163',
    since: at(-365, 0),
    address: {
      street: '1604 S Congress Ave',
      city: 'Austin, TX 78704',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Amex ending in 1009',
      icon: 'credit-card',
    },
    taxRate: 0.0825,
  },
  noah: {
    id: '1018',
    name: 'Noah Patel',
    email: 'noah.patel@example.com',
    phone: '+1 (312) 555-0134',
    since: at(-610, 0),
    address: {
      street: '2150 N Lincoln Ave',
      city: 'Chicago, IL 60614',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 3390',
      icon: 'credit-card',
    },
    taxRate: 0.1025,
  },
  hannah: {
    id: '1042',
    name: 'Hannah Berg',
    email: 'hannah.berg@example.com',
    phone: '+1 (206) 555-0191',
    since: at(-3, 0),
    address: {
      street: '4318 Fremont Ave N',
      city: 'Seattle, WA 98103',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.applePay,
    taxRate: 0.1035,
  },
  daniel: {
    id: '1020',
    name: 'Daniel Okafor',
    email: 'daniel.okafor@example.com',
    phone: '+1 (720) 555-0126',
    since: at(-530, 0),
    address: {
      street: '2900 Larimer St',
      city: 'Denver, CO 80205',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 5530',
      icon: 'credit-card',
    },
    taxRate: 0.0881,
  },
  tess: {
    id: '1014',
    name: 'Tess Hughes',
    email: 'tess.hughes@example.com',
    phone: '+1 (971) 555-0152',
    since: at(-780, 0),
    address: {
      street: '2725 SE Belmont St',
      city: 'Portland, OR 97214',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 6204',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  amara: {
    id: '1041',
    name: 'Amara Nwosu',
    email: 'amara.nwosu@example.com',
    phone: '+1 (404) 555-0108',
    since: at(-5, 0),
    address: {
      street: '1085 Euclid Ave NE',
      city: 'Atlanta, GA 30307',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Amex ending in 4417',
      icon: 'credit-card',
    },
    taxRate: 0.089,
  },
  isabella: {
    id: '1032',
    name: 'Isabella Rossi',
    email: 'isabella.rossi@example.com',
    phone: '+1 (718) 555-0149',
    since: at(-240, 0),
    address: {
      street: '185 Wythe Ave, Apt 3',
      city: 'Brooklyn, NY 11249',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.applePay,
    taxRate: 0.08875,
  },
  james: {
    id: '1029',
    name: 'James Walker',
    email: 'james.walker@example.com',
    phone: '+1 (615) 555-0185',
    since: at(-300, 0),
    address: {
      street: '410 Fatherland St',
      city: 'Nashville, TN 37206',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 2290',
      icon: 'credit-card',
    },
    taxRate: 0.0925,
  },
  mateo: {
    id: '1035',
    name: 'Mateo Silva',
    email: 'mateo.silva@example.com',
    phone: '+1 (305) 555-0170',
    since: at(-150, 0),
    address: {
      street: '4100 NE 2nd Ave',
      city: 'Miami, FL 33137',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 9124',
      icon: 'credit-card',
    },
    taxRate: 0.07,
  },
  chloe: {
    id: '1025',
    name: 'Chloé Dubois',
    email: 'chloe.dubois@example.com',
    phone: '+1 (514) 555-0187',
    since: at(-400, 0),
    address: {
      street: '5240 Avenue du Parc',
      city: 'Montreal, QC H2T 1S1',
      country: 'Canada',
    },
    paymentMethod: {
      label: 'Visa ending in 4410',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  priya: {
    id: '1033',
    name: 'Priya Raman',
    email: 'priya.raman@example.com',
    phone: '+1 (919) 555-0131',
    since: at(-200, 0),
    address: {
      street: '512 Glenwood Ave',
      city: 'Raleigh, NC 27603',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 3318',
      icon: 'credit-card',
    },
    taxRate: 0.0725,
  },
  zoe: {
    id: '1022',
    name: 'Zoe Martin',
    email: 'zoe.martin@example.com',
    phone: '+1 (801) 555-0156',
    since: at(-460, 0),
    address: {
      street: '870 E 900 S',
      city: 'Salt Lake City, UT 84105',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 8836',
      icon: 'credit-card',
    },
    taxRate: 0.0775,
  },
  mia: {
    id: '1037',
    name: 'Mia Thompson',
    email: 'mia.thompson@example.com',
    phone: '+1 (303) 555-0197',
    since: at(-95, 0),
    address: {
      street: '1730 Pearl St',
      city: 'Boulder, CO 80302',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 6603',
      icon: 'credit-card',
    },
    taxRate: 0.0886,
  },
  nora: {
    id: '1039',
    name: 'Nora Lindqvist',
    email: 'nora.lindqvist@example.com',
    phone: '+1 (604) 555-0122',
    since: at(-60, 0),
    address: {
      street: '1250 Granville St',
      city: 'Vancouver, BC V6Z 1M6',
      country: 'Canada',
    },
    paymentMethod: {
      label: 'Mastercard ending in 4486',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  liam: {
    id: '1016',
    name: "Liam O'Connell",
    email: 'liam.oconnell@example.com',
    phone: '+1 (617) 555-0164',
    since: at(-700, 0),
    address: {
      street: '48 Union Park',
      city: 'Boston, MA 02118',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 7712',
      icon: 'credit-card',
    },
    taxRate: 0.0625,
  },
  frontRange: {
    id: '1040',
    name: 'Front Range Guides',
    email: 'frontrange.guides@example.com',
    phone: '+1 (303) 555-0119',
    since: at(-25, 0),
    address: {
      street: '1122 Washington Ave',
      city: 'Golden, CO 80401',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Amex ending in 6071',
      icon: 'credit-card',
    },
    taxRate: 0.075,
  },
  ethan: {
    id: '1028',
    name: 'Ethan Nakamura',
    email: 'ethan.nakamura@example.com',
    phone: '+1 (808) 555-0139',
    since: at(-330, 0),
    address: {
      street: '1288 Ala Moana Blvd',
      city: 'Honolulu, HI 96814',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 1287',
      icon: 'credit-card',
    },
    taxRate: 0.045,
  },
  ava: {
    id: '1021',
    name: 'Ava Johansson',
    email: 'ava.johansson@example.com',
    phone: '+1 (612) 555-0175',
    since: at(-520, 0),
    address: {
      street: '3010 Hennepin Ave',
      city: 'Minneapolis, MN 55408',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 6658',
      icon: 'credit-card',
    },
    taxRate: 0.08025,
  },
  samuel: {
    id: '1031',
    name: 'Samuel Reyes',
    email: 'samuel.reyes@example.com',
    phone: '+1 (602) 555-0110',
    since: at(-260, 0),
    address: {
      street: '1020 N 3rd St',
      city: 'Phoenix, AZ 85004',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 7045',
      icon: 'credit-card',
    },
    taxRate: 0.086,
  },
  henry: {
    id: '1034',
    name: 'Henry Lawson',
    email: 'henry.lawson@example.com',
    phone: '+1 (802) 555-0145',
    since: at(-180, 0),
    address: {
      street: '162 Pine St',
      city: 'Burlington, VT 05401',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.paypal,
    taxRate: 0.07,
  },
  oliver: {
    id: '1011',
    name: 'Oliver Grant',
    email: 'oliver.grant@example.com',
    phone: '+1 (541) 555-0168',
    since: at(-1000, 0),
    address: {
      street: '1033 NW Bond St',
      city: 'Bend, OR 97703',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Amex ending in 3005',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  jack: {
    id: '1017',
    name: 'Jack Murphy',
    email: 'jack.murphy@example.com',
    phone: '+1 (907) 555-0192',
    since: at(-640, 0),
    address: {
      street: '711 W 4th Ave',
      city: 'Anchorage, AK 99501',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 9902',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  ella: {
    id: '1036',
    name: 'Ella Fischer',
    email: 'ella.fischer@example.com',
    phone: '+1 (608) 555-0137',
    since: at(-120, 0),
    address: {
      street: '302 State St',
      city: 'Madison, WI 53703',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.applePay,
    taxRate: 0.055,
  },
  elijah: {
    id: '1019',
    name: 'Elijah Brooks',
    email: 'elijah.brooks@example.com',
    phone: '+1 (828) 555-0158',
    since: at(-560, 0),
    address: {
      street: '76 Haywood St',
      city: 'Asheville, NC 28801',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.paypal,
    taxRate: 0.07,
  },
  william: {
    id: '1015',
    name: 'William Hayes',
    email: 'william.hayes@example.com',
    phone: '+1 (406) 555-0181',
    since: at(-720, 0),
    address: {
      street: '120 N Higgins Ave',
      city: 'Missoula, MT 59802',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 5521',
      icon: 'credit-card',
    },
    taxRate: 0,
  },
  kenji: {
    id: '1026',
    name: 'Kenji Watanabe',
    email: 'kenji.watanabe@example.com',
    phone: '+1 (619) 555-0144',
    since: at(-380, 0),
    address: {
      street: '3780 Park Blvd',
      city: 'San Diego, CA 92103',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 7318',
      icon: 'credit-card',
    },
    taxRate: 0.0775,
  },
  olivia: {
    id: '1024',
    name: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    phone: '+1 (843) 555-0127',
    since: at(-410, 0),
    address: {
      street: '254 King St',
      city: 'Charleston, SC 29401',
      country: 'United States',
    },
    paymentMethod: PAYMENT_METHODS.applePay,
    taxRate: 0.09,
  },
  marcus: {
    id: '1038',
    name: 'Marcus Hill',
    email: 'marcus.hill@example.com',
    phone: '+1 (313) 555-0161',
    since: at(-90, 0),
    address: {
      street: '1420 Woodward Ave',
      city: 'Detroit, MI 48226',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Visa ending in 3127',
      icon: 'credit-card',
    },
    taxRate: 0.06,
  },
  rosa: {
    id: '1030',
    name: 'Rosa Delgado',
    email: 'rosa.delgado@example.com',
    phone: '+1 (505) 555-0115',
    since: at(-300, 0),
    address: {
      street: '401 Central Ave NW',
      city: 'Albuquerque, NM 87102',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 1754',
      icon: 'credit-card',
    },
    taxRate: 0.07875,
  },
  peter: {
    id: '1013',
    name: 'Peter Novak',
    email: 'peter.novak@example.com',
    phone: '+1 (412) 555-0172',
    since: at(-800, 0),
    address: {
      street: '2010 Smallman St',
      city: 'Pittsburgh, PA 15222',
      country: 'United States',
    },
    paymentMethod: {
      label: 'Mastercard ending in 8840',
      icon: 'credit-card',
    },
    taxRate: 0.07,
  },
};

const SEEDS: OrderSeed[] = [
  {
    id: '10482',
    placedAt: at(0, -1),
    customer: CUSTOMERS.maya,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'unfulfilled',
    items: [
      { product: PRODUCTS.downJacketSpruce, quantity: 1 },
      { product: PRODUCTS.hikingSocksSlate, quantity: 2 },
    ],
    shipping: SHIPPING_METHODS.pickup,
    note: 'Picking up Saturday morning, it is a gift so please leave the receipt out.',
  },
  {
    id: '10481',
    placedAt: at(0, -3),
    customer: CUSTOMERS.grace,
    channel: 'online',
    payment: 'unpaid',
    fulfillment: 'unfulfilled',
    items: [
      { product: PRODUCTS.daypackOchre, quantity: 1 },
      { product: PRODUCTS.bottleLarge, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10480',
    placedAt: at(0, -5),
    customer: CUSTOMERS.ben,
    channel: 'pos',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.mugSet, quantity: 1 },
      { product: PRODUCTS.trailMap, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.inStore,
  },
  {
    id: '10479',
    placedAt: at(-1, -2),
    customer: CUSTOMERS.lucas,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'unfulfilled',
    items: [
      { product: PRODUCTS.tent, quantity: 1 },
      { product: PRODUCTS.hammock, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.international,
    flag: 'First order from a new account above $500, shipping internationally',
  },
  {
    id: '10478',
    placedAt: at(-1, -6),
    customer: CUSTOMERS.sofia,
    channel: 'marketplace',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.rainShellOchre, quantity: 1 }],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10477',
    placedAt: at(-1, -9),
    customer: CUSTOMERS.noah,
    channel: 'online',
    payment: 'partially-paid',
    fulfillment: 'unfulfilled',
    items: [
      { product: PRODUCTS.downJacketBlack, quantity: 2 },
      { product: PRODUCTS.beanie, quantity: 2 },
    ],
    shipping: SHIPPING_METHODS.express,
    shipTo: {
      street: '1800 W Montrose Ave',
      city: 'Chicago, IL 60613',
      country: 'United States',
    },
    note: 'Club order, our treasurer will pay the balance by Friday.',
  },
  {
    id: '10476',
    placedAt: at(-2, -3),
    customer: CUSTOMERS.hannah,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'partially-fulfilled',
    items: [
      { product: PRODUCTS.daypackBlack, quantity: 1 },
      { product: PRODUCTS.headlamp, quantity: 1 },
      { product: PRODUCTS.trekkingPoles, quantity: 1, backordered: true },
    ],
    shipping: SHIPPING_METHODS.free,
    discount: DISCOUNTS.welcome,
  },
  {
    id: '10475',
    placedAt: at(-2, -7),
    customer: CUSTOMERS.daniel,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.stove, quantity: 1 },
      { product: PRODUCTS.cookset, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10474',
    placedAt: at(-3, -1),
    customer: CUSTOMERS.tess,
    channel: 'pos',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.fleece, quantity: 1 },
      { product: PRODUCTS.hikingSocksRust, quantity: 3 },
    ],
    shipping: SHIPPING_METHODS.inStore,
  },
  {
    id: '10473',
    placedAt: at(-3, -6),
    customer: CUSTOMERS.amara,
    channel: 'online',
    payment: 'unpaid',
    fulfillment: 'unfulfilled',
    items: [
      { product: PRODUCTS.duffel, quantity: 1 },
      { product: PRODUCTS.packingCubes, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.free,
    flag: 'Three declined payment attempts on different cards',
  },
  {
    id: '10472',
    placedAt: at(-4, -2),
    customer: CUSTOMERS.isabella,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.merinoCrewSage, quantity: 2 }],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10471',
    placedAt: at(-4, -8),
    customer: CUSTOMERS.maya,
    channel: 'pos',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.bottleSmall, quantity: 2 }],
    shipping: SHIPPING_METHODS.inStore,
  },
  {
    id: '10470',
    placedAt: at(-6, -4),
    customer: CUSTOMERS.james,
    channel: 'marketplace',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.trekkingPoles, quantity: 1 },
      { product: PRODUCTS.trailMap, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10469',
    placedAt: at(-7, -3),
    customer: CUSTOMERS.mateo,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'unfulfilled',
    items: [{ product: PRODUCTS.hammock, quantity: 2, backordered: true }],
    shipping: SHIPPING_METHODS.standard,
    note: 'Please ship both hammocks in one box.',
  },
  {
    id: '10468',
    placedAt: at(-8, -5),
    customer: CUSTOMERS.chloe,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.downJacketSpruce, quantity: 1 }],
    shipping: SHIPPING_METHODS.international,
  },
  {
    id: '10467',
    placedAt: at(-10, -2),
    customer: CUSTOMERS.priya,
    channel: 'online',
    payment: 'partially-paid',
    fulfillment: 'partially-fulfilled',
    items: [
      { product: PRODUCTS.tent, quantity: 1 },
      { product: PRODUCTS.cookset, quantity: 1, backordered: true },
    ],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10466',
    placedAt: at(-12, -6),
    customer: CUSTOMERS.zoe,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.trailShorts, quantity: 2 },
      { product: PRODUCTS.hikingSocksSlate, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.standard,
    discount: DISCOUNTS.trailhead,
  },
  {
    id: '10465',
    placedAt: at(-17, -3),
    customer: CUSTOMERS.mia,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'returned',
    items: [{ product: PRODUCTS.rainShellOchre, quantity: 1 }],
    shipping: SHIPPING_METHODS.standard,
    returnReason: 'Runs small, exchanging for a medium',
  },
  {
    id: '10464',
    placedAt: at(-19, -4),
    customer: CUSTOMERS.nora,
    channel: 'online',
    payment: 'refunded',
    fulfillment: 'returned',
    items: [{ product: PRODUCTS.downJacketSpruce, quantity: 1 }],
    shipping: SHIPPING_METHODS.international,
    returnReason: 'Torn seam on the left sleeve',
  },
  {
    id: '10463',
    placedAt: at(-22, -1),
    customer: CUSTOMERS.liam,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.tent, quantity: 1 },
      { product: PRODUCTS.headlamp, quantity: 2 },
    ],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10462',
    placedAt: at(-24, -3),
    customer: CUSTOMERS.frontRange,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.merinoCrewCharcoal, quantity: 2 },
      { product: PRODUCTS.merinoCrewSage, quantity: 1 },
      { product: PRODUCTS.hikingSocksSlate, quantity: 4 },
      { product: PRODUCTS.hikingSocksRust, quantity: 4 },
      { product: PRODUCTS.fleece, quantity: 2 },
      { product: PRODUCTS.rainShellNavy, quantity: 2 },
      { product: PRODUCTS.rainShellOchre, quantity: 1 },
      { product: PRODUCTS.trailShorts, quantity: 2 },
      { product: PRODUCTS.beanie, quantity: 4 },
      { product: PRODUCTS.daypackBlack, quantity: 2 },
      { product: PRODUCTS.trekkingPoles, quantity: 2 },
      { product: PRODUCTS.headlamp, quantity: 4 },
      { product: PRODUCTS.compass, quantity: 2 },
      { product: PRODUCTS.trailMap, quantity: 4 },
      { product: PRODUCTS.stove, quantity: 1 },
      { product: PRODUCTS.cookset, quantity: 1 },
      { product: PRODUCTS.mugSet, quantity: 2 },
      { product: PRODUCTS.bottleLarge, quantity: 4 },
    ],
    shipping: SHIPPING_METHODS.free,
    note: 'Summer kits for our guide team, please label the boxes by size.',
  },
  {
    id: '10461',
    placedAt: at(-26, -5),
    customer: CUSTOMERS.ethan,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.rainShellNavy, quantity: 1 },
      { product: PRODUCTS.beanie, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.express,
  },
  {
    id: '10460',
    placedAt: at(-28, -3),
    customer: CUSTOMERS.grace,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.headlamp, quantity: 2 }],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10459',
    placedAt: at(-31, -2),
    customer: CUSTOMERS.maya,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.merinoCrewCharcoal, quantity: 2 }],
    shipping: SHIPPING_METHODS.standard,
    discount: DISCOUNTS.trailhead,
  },
  {
    id: '10458',
    placedAt: at(-33, -6),
    customer: CUSTOMERS.ava,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.merinoCrewCharcoal, quantity: 1 },
      { product: PRODUCTS.fleece, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10457',
    placedAt: at(-34, -3),
    customer: CUSTOMERS.samuel,
    channel: 'online',
    payment: 'refunded',
    fulfillment: 'returned',
    items: [{ product: PRODUCTS.bottleLarge, quantity: 3 }],
    shipping: SHIPPING_METHODS.standard,
    discount: DISCOUNTS.fallGear,
    returnReason: 'Lids leak when the bottles lie on their side',
  },
  {
    id: '10456',
    placedAt: at(-36, -1),
    customer: CUSTOMERS.henry,
    channel: 'marketplace',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.compass, quantity: 1 },
      { product: PRODUCTS.trailMap, quantity: 2 },
    ],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10455',
    placedAt: at(-38, -4),
    customer: CUSTOMERS.oliver,
    channel: 'pos',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.downJacketBlack, quantity: 1 }],
    shipping: SHIPPING_METHODS.inStore,
  },
  {
    id: '10454',
    placedAt: at(-39, -7),
    customer: CUSTOMERS.jack,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.downJacketBlack, quantity: 1 },
      { product: PRODUCTS.beanie, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.express,
  },
  {
    id: '10453',
    placedAt: at(-41, -2),
    customer: CUSTOMERS.kenji,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.packingCubes, quantity: 2 }],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10452',
    placedAt: at(-43, -5),
    customer: CUSTOMERS.ella,
    channel: 'marketplace',
    payment: 'refunded',
    fulfillment: 'returned',
    items: [{ product: PRODUCTS.daypackBlack, quantity: 1 }],
    shipping: SHIPPING_METHODS.standard,
    returnReason: 'Ordered the wrong color',
  },
  {
    id: '10451',
    placedAt: at(-44, -3),
    customer: CUSTOMERS.daniel,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.trekkingPoles, quantity: 1 },
      { product: PRODUCTS.hikingSocksSlate, quantity: 2 },
    ],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10450',
    placedAt: at(-46, -6),
    customer: CUSTOMERS.tess,
    channel: 'pos',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.stove, quantity: 1 },
      { product: PRODUCTS.mugSet, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.inStore,
  },
  {
    id: '10449',
    placedAt: at(-48, -2),
    customer: CUSTOMERS.elijah,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.daypackOchre, quantity: 1 }],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10448',
    placedAt: at(-49, -8),
    customer: CUSTOMERS.william,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.tent, quantity: 1 },
      { product: PRODUCTS.stove, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10447',
    placedAt: at(-51, -1),
    customer: CUSTOMERS.olivia,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.duffel, quantity: 1 }],
    shipping: SHIPPING_METHODS.free,
  },
  {
    id: '10446',
    placedAt: at(-52, -5),
    customer: CUSTOMERS.marcus,
    channel: 'marketplace',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.bottleSmall, quantity: 2 },
      { product: PRODUCTS.mugSet, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10445',
    placedAt: at(-54, -3),
    customer: CUSTOMERS.chloe,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.merinoCrewSage, quantity: 1 },
      { product: PRODUCTS.hikingSocksRust, quantity: 2 },
    ],
    shipping: SHIPPING_METHODS.international,
  },
  {
    id: '10444',
    placedAt: at(-55, -6),
    customer: CUSTOMERS.rosa,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [{ product: PRODUCTS.rainShellNavy, quantity: 1 }],
    shipping: SHIPPING_METHODS.standard,
  },
  {
    id: '10443',
    placedAt: at(-57, -2),
    customer: CUSTOMERS.ben,
    channel: 'pos',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.headlamp, quantity: 1 },
      { product: PRODUCTS.trailMap, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.inStore,
  },
  {
    id: '10442',
    placedAt: at(-59, -4),
    customer: CUSTOMERS.peter,
    channel: 'online',
    payment: 'paid',
    fulfillment: 'fulfilled',
    items: [
      { product: PRODUCTS.trekkingPoles, quantity: 1 },
      { product: PRODUCTS.hammock, quantity: 1 },
    ],
    shipping: SHIPPING_METHODS.free,
    discount: DISCOUNTS.welcome,
  },
];

const ORDERS = SEEDS.map((seed): Order => {
  const items = seed.items.map(
    ({ product, quantity, backordered }): LineItem => ({
      ...product,
      quantity,
      status: backordered ? 'unfulfilled' : LINE_STATUS[seed.fulfillment],
    })
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippedCount = items
    .filter((item) => item.status !== 'unfulfilled')
    .reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = round(subtotal * (seed.discount?.rate ?? 0));
  const tax = round((subtotal - discount) * seed.customer.taxRate);
  const total = round(subtotal - discount + seed.shipping.price + tax);
  const paid = round(total * PAID_SHARE[seed.payment]);
  const refunded = seed.payment === 'refunded' ? total : 0;
  const pending = seed.payment === 'unpaid';
  const paymentMethod =
    seed.paymentMethod ??
    (seed.channel === 'marketplace'
      ? PAYMENT_METHODS.marketplace
      : seed.customer.paymentMethod);
  const shippedAt =
    seed.fulfillment === 'unfulfilled'
      ? null
      : add(seed.placedAt, {
          hours: seed.shipping.carrier ? 20 : 0,
        }).toISOString();
  const tracking =
    shippedAt && seed.shipping.trackingPrefix
      ? `${seed.shipping.trackingPrefix}${seed.id}`
      : null;
  const paidAt = add(seed.placedAt, { minutes: 1 }).toISOString();
  const returned = seed.returnReason
    ? {
        reason: seed.returnReason,
        date: add(seed.placedAt, { days: 16 }).toISOString(),
      }
    : null;
  const refundedAt = add(seed.placedAt, { days: 17 }).toISOString();

  return {
    id: seed.id,
    placedAt: seed.placedAt,
    customer: seed.customer,
    channel: seed.channel,
    payment: seed.payment,
    fulfillment: seed.fulfillment,
    flagged: !!seed.flag,
    items,
    itemCount,
    discountCode: seed.discount?.code ?? null,
    subtotal,
    discount,
    shipping: seed.shipping.price,
    tax,
    total,
    paid,
    refunded,
    balance: round(total - paid),
    shippingMethod: seed.shipping,
    shippingAddress: seed.shipping.carrier
      ? (seed.shipTo ?? seed.customer.address)
      : null,
    billingAddress: seed.customer.address,
    shippedAt,
    tracking,
    note: seed.note ?? null,
    paymentMethod,
    transactions: [
      {
        id: `txn_${seed.id}01`,
        kind: pending ? 'authorization' : 'sale',
        status: pending ? 'pending' : 'success',
        amount: pending ? total : paid,
        date: paidAt,
      },
      ...(refunded
        ? [
            {
              id: `txn_${seed.id}02`,
              kind: 'refund' as const,
              status: 'success' as const,
              amount: refunded,
              date: refundedAt,
            },
          ]
        : []),
    ],
    returned,
    timeline: [
      ...(refunded
        ? [
            {
              id: `${seed.id}-refund`,
              type: 'refund' as const,
              title: 'Refund issued',
              text: `${usd.format(refunded)} to ${paymentMethod.label}`,
              date: refundedAt,
            },
          ]
        : []),
      ...(returned
        ? [
            {
              id: `${seed.id}-return`,
              type: 'return' as const,
              title: 'Return received',
              text: returned.reason,
              date: returned.date,
            },
          ]
        : []),
      ...(shippedAt
        ? [
            {
              id: `${seed.id}-shipment`,
              type: 'shipment' as const,
              title: !seed.shipping.carrier
                ? 'Fulfilled in store'
                : shippedCount < itemCount
                  ? `${shippedCount} of ${itemCount} items shipped`
                  : 'Items shipped',
              text: tracking
                ? `${seed.shipping.carrier}, tracking ${tracking}`
                : 'Handed over at the counter',
              date: shippedAt,
            },
          ]
        : []),
      ...(seed.flag
        ? [
            {
              id: `${seed.id}-flag`,
              type: 'flag' as const,
              title: 'Flagged for review',
              text: seed.flag,
              date: paidAt,
            },
          ]
        : []),
      {
        id: `${seed.id}-payment`,
        type: 'payment',
        title: pending
          ? 'Payment pending'
          : seed.payment === 'partially-paid'
            ? 'Deposit captured'
            : 'Payment captured',
        text: `${usd.format(pending ? total : paid)} on ${paymentMethod.label}`,
        date: paidAt,
      },
      ...(seed.note
        ? [
            {
              id: `${seed.id}-note`,
              type: 'note' as const,
              title: 'Customer note',
              text: seed.note,
              date: seed.placedAt,
            },
          ]
        : []),
      {
        id: `${seed.id}-placed`,
        type: 'placed',
        title: 'Order placed',
        text: `by ${seed.customer.name}`,
        date: seed.placedAt,
      },
    ],
  };
});

@Service()
export class OrdersService {
  // Data
  readonly orders = signal<Order[]>(ORDERS);

  byId(id: string) {
    return this.orders().find((order) => order.id === id) ?? null;
  }
}
