import { Service, signal } from '@angular/core';
import { add } from 'date-fns';

export type Plan = 'free' | 'team' | 'business';

export type Organization = {
  id: string;
  name: string;
  domain: string;
  plan: Plan;
  seats: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  photo?: string;
  organizationId: string | null;
  title: string;
  location: string;
  timezone: string;
  since: string;
  vip: boolean;
};

const now = new Date();
const days = (value: number) => add(now, { days: value }).toISOString();

export const ORGANIZATIONS = {
  harborline: {
    id: 'harborline',
    name: 'Harborline Dental',
    domain: 'harborline.example.com',
    plan: 'business',
    seats: 40,
  },
  meridian: {
    id: 'meridian',
    name: 'Meridian Consulting Group',
    domain: 'meridian.example.com',
    plan: 'business',
    seats: 60,
  },
  cedarPine: {
    id: 'cedar-pine',
    name: 'Cedar & Pine Law',
    domain: 'cedarpine.example.com',
    plan: 'business',
    seats: 25,
  },
  northfield: {
    id: 'northfield',
    name: 'Northfield Physio',
    domain: 'northfield.example.com',
    plan: 'team',
    seats: 12,
  },
  lumen: {
    id: 'lumen',
    name: 'Lumen Yoga Collective',
    domain: 'lumen.example.com',
    plan: 'team',
    seats: 6,
  },
  quarryLane: {
    id: 'quarry-lane',
    name: 'Quarry Lane Tutoring',
    domain: 'quarrylane.example.com',
    plan: 'free',
    seats: 1,
  },
  brightwater: {
    id: 'brightwater',
    name: 'Brightwater Veterinary',
    domain: 'brightwater.example.com',
    plan: 'business',
    seats: 30,
  },
  saltmarsh: {
    id: 'saltmarsh',
    name: 'Saltmarsh Coworking',
    domain: 'saltmarsh.example.com',
    plan: 'team',
    seats: 8,
  },
  fernhill: {
    id: 'fernhill',
    name: 'Fernhill Music School',
    domain: 'fernhill.example.com',
    plan: 'team',
    seats: 10,
  },
} satisfies Record<string, Organization>;

export const CUSTOMERS = {
  elena: {
    id: '2041',
    name: 'Elena Vasquez',
    email: 'elena.vasquez@example.com',
    photo: '/images/photos/k85quhiyz9a1zcz9sxj3q.jpg',
    organizationId: ORGANIZATIONS.harborline.id,
    title: 'Practice Manager',
    location: 'Austin, United States',
    timezone: 'America/Chicago',
    since: days(-812),
    vip: true,
  },
  daniel: {
    id: '2047',
    name: 'Daniel Brooks',
    email: 'daniel.brooks@example.com',
    photo: '/images/photos/d6l6k0erazgtowytjkz6u.jpg',
    organizationId: ORGANIZATIONS.harborline.id,
    title: 'IT Administrator',
    location: 'Austin, United States',
    timezone: 'America/Chicago',
    since: days(-640),
    vip: false,
  },
  samuel: {
    id: '2053',
    name: 'Samuel Ortiz',
    email: 'samuel.ortiz@example.com',
    photo: '/images/photos/p73mldwg6lpticdnfgryy.jpg',
    organizationId: ORGANIZATIONS.meridian.id,
    title: 'Operations Director',
    location: 'Chicago, United States',
    timezone: 'America/Chicago',
    since: days(-1021),
    vip: true,
  },
  hannah: {
    id: '2058',
    name: 'Hannah Reed',
    email: 'hannah.reed@example.com',
    photo: '/images/photos/n67qrx4tch0n9yhstgqfq.jpg',
    organizationId: ORGANIZATIONS.meridian.id,
    title: 'Executive Assistant',
    location: 'Chicago, United States',
    timezone: 'America/Chicago',
    since: days(-455),
    vip: false,
  },
  owen: {
    id: '2062',
    name: 'Owen Fletcher',
    email: 'owen.fletcher@example.com',
    photo: '/images/photos/gbvj3tj22nwuihpgko902.jpg',
    organizationId: ORGANIZATIONS.cedarPine.id,
    title: 'Office Administrator',
    location: 'Boston, United States',
    timezone: 'America/New_York',
    since: days(-733),
    vip: true,
  },
  lucy: {
    id: '2066',
    name: 'Lucy Tran',
    email: 'lucy.tran@example.com',
    organizationId: ORGANIZATIONS.cedarPine.id,
    title: 'Paralegal',
    location: 'Boston, United States',
    timezone: 'America/New_York',
    since: days(-388),
    vip: false,
  },
  martin: {
    id: '2071',
    name: 'Martin Keller',
    email: 'martin.keller@example.com',
    photo: '/images/photos/9clm0emqhroqnmfr2ftzv.jpg',
    organizationId: ORGANIZATIONS.northfield.id,
    title: 'Clinic Owner',
    location: 'Denver, United States',
    timezone: 'America/Denver',
    since: days(-561),
    vip: false,
  },
  aisha: {
    id: '2075',
    name: 'Aisha Bello',
    email: 'aisha.bello@example.com',
    photo: '/images/photos/yg1g453wjflwtdwrq3sxa.jpg',
    organizationId: ORGANIZATIONS.northfield.id,
    title: 'Front Desk Lead',
    location: 'Denver, United States',
    timezone: 'America/Denver',
    since: days(-274),
    vip: false,
  },
  grace: {
    id: '2080',
    name: 'Grace Holloway',
    email: 'grace.holloway@example.com',
    photo: '/images/photos/8dscdy675p03e984k3bio.jpg',
    organizationId: ORGANIZATIONS.lumen.id,
    title: 'Studio Director',
    location: 'Portland, United States',
    timezone: 'America/Los_Angeles',
    since: days(-367),
    vip: false,
  },
  peter: {
    id: '2084',
    name: 'Peter Lindgren',
    email: 'peter.lindgren@example.com',
    organizationId: ORGANIZATIONS.quarryLane.id,
    title: 'Founder',
    location: 'Minneapolis, United States',
    timezone: 'America/Chicago',
    since: days(-48),
    vip: false,
  },
  sophie: {
    id: '2089',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@example.com',
    organizationId: null,
    title: 'Photographer',
    location: 'Montreal, Canada',
    timezone: 'America/Toronto',
    since: days(-226),
    vip: false,
  },
  jamal: {
    id: '2093',
    name: 'Jamal Carter',
    email: 'jamal.carter@example.com',
    organizationId: null,
    title: 'Personal Trainer',
    location: 'Atlanta, United States',
    timezone: 'America/New_York',
    since: days(-189),
    vip: false,
  },
  yuki: {
    id: '2097',
    name: 'Yuki Sato',
    email: 'yuki.sato@example.com',
    photo: '/images/photos/pl8wjbsdooqi8hnxc8u7t.jpg',
    organizationId: null,
    title: 'Career Coach',
    location: 'Seattle, United States',
    timezone: 'America/Los_Angeles',
    since: days(-312),
    vip: false,
  },
  tom: {
    id: '2102',
    name: 'Tom Gallagher',
    email: 'tom.gallagher@example.com',
    organizationId: null,
    title: 'Piano Teacher',
    location: 'Dublin, Ireland',
    timezone: 'Europe/Dublin',
    since: days(-21),
    vip: false,
  },
  nora: {
    id: '2106',
    name: 'Nora Whitfield',
    email: 'nora.whitfield@example.com',
    organizationId: ORGANIZATIONS.brightwater.id,
    title: 'Hospital Manager',
    location: 'Raleigh, United States',
    timezone: 'America/New_York',
    since: days(-905),
    vip: true,
  },
  ravi: {
    id: '2111',
    name: 'Ravi Mehta',
    email: 'ravi.mehta@example.com',
    organizationId: ORGANIZATIONS.brightwater.id,
    title: 'Systems Coordinator',
    location: 'Raleigh, United States',
    timezone: 'America/New_York',
    since: days(-598),
    vip: false,
  },
  clara: {
    id: '2115',
    name: 'Clara Jensen',
    email: 'clara.jensen@example.com',
    organizationId: ORGANIZATIONS.brightwater.id,
    title: 'Reception Lead',
    location: 'Charlotte, United States',
    timezone: 'America/New_York',
    since: days(-142),
    vip: false,
  },
  marcus: {
    id: '2120',
    name: 'Marcus Bell',
    email: 'marcus.bell@example.com',
    organizationId: ORGANIZATIONS.saltmarsh.id,
    title: 'Community Manager',
    location: 'San Diego, United States',
    timezone: 'America/Los_Angeles',
    since: days(-410),
    vip: false,
  },
  ivy: {
    id: '2124',
    name: 'Ivy Chen',
    email: 'ivy.chen@example.com',
    organizationId: ORGANIZATIONS.saltmarsh.id,
    title: 'Operations Lead',
    location: 'San Diego, United States',
    timezone: 'America/Los_Angeles',
    since: days(-96),
    vip: false,
  },
  felix: {
    id: '2129',
    name: 'Felix Moreau',
    email: 'felix.moreau@example.com',
    organizationId: ORGANIZATIONS.fernhill.id,
    title: 'School Director',
    location: 'Toronto, Canada',
    timezone: 'America/Toronto',
    since: days(-677),
    vip: true,
  },
  rosa: {
    id: '2133',
    name: 'Rosa Delgado',
    email: 'rosa.delgado@example.com',
    organizationId: ORGANIZATIONS.fernhill.id,
    title: 'Scheduling Coordinator',
    location: 'Toronto, Canada',
    timezone: 'America/Toronto',
    since: days(-250),
    vip: false,
  },
  benjamin: {
    id: '2138',
    name: 'Benjamin Hart',
    email: 'benjamin.hart@example.com',
    organizationId: ORGANIZATIONS.meridian.id,
    title: 'Senior Consultant',
    location: 'Chicago, United States',
    timezone: 'America/Chicago',
    since: days(-333),
    vip: false,
  },
  leah: {
    id: '2142',
    name: 'Leah Abrams',
    email: 'leah.abrams@example.com',
    organizationId: ORGANIZATIONS.harborline.id,
    title: 'Dental Hygienist',
    location: 'Austin, United States',
    timezone: 'America/Chicago',
    since: days(-120),
    vip: false,
  },
  theo: {
    id: '2147',
    name: 'Theo Nakamura',
    email: 'theo.nakamura@example.com',
    organizationId: ORGANIZATIONS.lumen.id,
    title: 'Yoga Instructor',
    location: 'Portland, United States',
    timezone: 'America/Los_Angeles',
    since: days(-6),
    vip: false,
  },
  maya: {
    id: '2151',
    name: 'Maya Patel',
    email: 'maya.patel@example.com',
    organizationId: ORGANIZATIONS.cedarPine.id,
    title: 'Associate Attorney',
    location: 'Boston, United States',
    timezone: 'America/New_York',
    since: days(-505),
    vip: true,
  },
  henry: {
    id: '2156',
    name: 'Henry Walsh',
    email: 'henry.walsh@example.com',
    organizationId: ORGANIZATIONS.northfield.id,
    title: 'Physical Therapist',
    location: 'Denver, United States',
    timezone: 'America/Denver',
    since: days(-199),
    vip: false,
  },
  gabriel: {
    id: '2160',
    name: 'Gabriel Costa',
    email: 'gabriel.costa@example.com',
    organizationId: null,
    title: 'Wedding Planner',
    location: 'Miami, United States',
    timezone: 'America/New_York',
    since: days(-164),
    vip: false,
  },
  emma: {
    id: '2165',
    name: 'Emma Novak',
    email: 'emma.novak@example.com',
    organizationId: null,
    title: 'Massage Therapist',
    location: 'Phoenix, United States',
    timezone: 'America/Phoenix',
    since: days(-26),
    vip: false,
  },
  oliver: {
    id: '2169',
    name: 'Oliver Grant',
    email: 'oliver.grant@example.com',
    organizationId: null,
    title: 'Driving Instructor',
    location: 'Manchester, United Kingdom',
    timezone: 'Europe/London',
    since: days(-288),
    vip: false,
  },
  zara: {
    id: '2174',
    name: 'Zara Ahmed',
    email: 'zara.ahmed@example.com',
    organizationId: null,
    title: 'Nutritionist',
    location: 'Sydney, Australia',
    timezone: 'Australia/Sydney',
    since: days(-12),
    vip: false,
  },
} satisfies Record<string, Customer>;

@Service()
export class CustomersService {
  // Data
  readonly organizations = signal<Organization[]>(Object.values(ORGANIZATIONS));
  readonly customers = signal<Customer[]>(Object.values(CUSTOMERS));

  byId(id: string) {
    return this.customers().find((customer) => customer.id === id) ?? null;
  }

  organizationById(id: string) {
    return (
      this.organizations().find((organization) => organization.id === id) ??
      null
    );
  }
}
