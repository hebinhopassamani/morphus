import { Service, signal } from '@angular/core';

export type AgentRole = 'admin' | 'agent';

export type AgentStatus = 'online' | 'away' | 'offline';

export type Agent = {
  id: string;
  name: string;
  photo: string;
  email: string;
  title: string;
  role: AgentRole;
  status: AgentStatus;
};

export const ME: Agent = {
  id: 'john-builder',
  name: 'John Builder',
  photo: '/images/photos/john-builder.jpg',
  email: 'john@example.com',
  title: 'Head of Support',
  role: 'admin',
  status: 'online',
};

export const AGENTS: Agent[] = [
  ME,
  {
    id: 'janis-considine',
    name: 'Janis Considine',
    photo: '/images/photos/1qomnajv82pxv2laucaic.jpg',
    email: 'janis.considine@example.com',
    title: 'Support Lead',
    role: 'admin',
    status: 'online',
  },
  {
    id: 'marcus-feeney',
    name: 'Marcus Feeney',
    photo: '/images/photos/fpooxhjilh4pj36894qf4.jpg',
    email: 'marcus.feeney@example.com',
    title: 'Billing Specialist',
    role: 'agent',
    status: 'away',
  },
  {
    id: 'priya-raman',
    name: 'Priya Raman',
    photo: '/images/photos/5joz4hxgrw4ga36saknis.jpg',
    email: 'priya.raman@example.com',
    title: 'Product Specialist',
    role: 'agent',
    status: 'online',
  },
  {
    id: 'noor-haddad',
    name: 'Noor Haddad',
    photo: '/images/photos/eiee037twsnsxwp7a1zkj.jpg',
    email: 'noor.haddad@example.com',
    title: 'Support Engineer',
    role: 'agent',
    status: 'offline',
  },
  {
    id: 'clara-moreau',
    name: 'Clara Moreau',
    photo: '/images/photos/qzxtybs14pzdxhsxmt56d.jpg',
    email: 'clara.moreau@example.com',
    title: 'Support Specialist',
    role: 'agent',
    status: 'away',
  },
];

@Service()
export class AgentsService {
  // Data
  readonly agents = signal<Agent[]>(AGENTS);

  byId(id: string) {
    return this.agents().find((agent) => agent.id === id) ?? null;
  }

  setRole(id: string, role: AgentRole) {
    this.agents.update((agents) =>
      agents.map((agent) => (agent.id === id ? { ...agent, role } : agent))
    );
  }
}
