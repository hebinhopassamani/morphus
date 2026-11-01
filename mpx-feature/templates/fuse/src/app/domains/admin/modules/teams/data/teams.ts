import { Service, signal } from '@angular/core';

export type Team = {
  id: string;
  name: string;
  description: string;
  colorClass: string;
  tagClass: string;
  leadId: string;
  projectIds: string[];
};

const TEAMS: Team[] = [
  {
    id: 'mobile',
    name: 'Mobile',
    description:
      'Ships the iOS and Android apps and the sync layer that keeps them working offline.',
    colorClass: 'bg-sky-9',
    tagClass: 'bg-sky-a3 text-sky-a11',
    leadId: 'gloria-metz',
    projectIds: ['harbor-mobile-v24', 'push-notifications', 'tablet-layouts'],
  },
  {
    id: 'design',
    name: 'Design',
    description:
      'Owns the Aurora design system and the first run experience across every surface.',
    colorClass: 'bg-crimson-9',
    tagClass: 'bg-crimson-a3 text-crimson-a11',
    leadId: 'kelley-schimmel',
    projectIds: [
      'aurora-design-system',
      'onboarding-redesign',
      'design-token-pipeline',
      'accessibility-audit',
    ],
  },
  {
    id: 'platform',
    name: 'Platform',
    description:
      'The public API, auth and the infrastructure every other team builds on.',
    colorClass: 'bg-violet-9',
    tagClass: 'bg-violet-a3 text-violet-a11',
    leadId: 'lowell-lind',
    projectIds: [
      'public-api-v3',
      'realtime-collab-beta',
      'edge-caching',
      'legacy-auth-sunset',
    ],
  },
  {
    id: 'data',
    name: 'Data',
    description:
      'Runs the warehouse, the analytics pipeline and search across the product.',
    colorClass: 'bg-jade-9',
    tagClass: 'bg-jade-a3 text-jade-a11',
    leadId: 'amara-okafor',
    projectIds: [
      'warehouse-migration',
      'portal-analytics',
      'search-relevance',
      'slack-app-v2',
    ],
  },
  {
    id: 'security',
    name: 'Security',
    description:
      'Compliance, access control and the audit trail enterprise customers ask about.',
    colorClass: 'bg-amber-9',
    tagClass: 'bg-amber-a3 text-amber-a11',
    leadId: 'alexander-shields',
    projectIds: [
      'soc2-readiness',
      'enterprise-sso',
      'audit-log-export',
      'data-retention-policies',
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue',
    description:
      'Billing, pricing and the numbers finance closes the books with.',
    colorClass: 'bg-orange-9',
    tagClass: 'bg-orange-a3 text-orange-a11',
    leadId: 'marcus-feeney',
    projectIds: [
      'billing-revamp',
      'sales-tax-engine',
      'pricing-experiments',
      'customer-health-scores',
    ],
  },
  {
    id: 'support',
    name: 'Support',
    description:
      'The help center, inbox automation and getting the product into new locales.',
    colorClass: 'bg-iris-9',
    tagClass: 'bg-iris-a3 text-iris-a11',
    leadId: 'janis-considine',
    projectIds: [
      'support-inbox-automation',
      'knowledge-base-rewrite',
      'eu-localization',
    ],
  },
];

@Service()
export class TeamsService {
  // Data
  readonly teams = signal<Team[]>(TEAMS);

  byId(id: string) {
    return this.teams().find((team) => team.id === id) ?? null;
  }
}
