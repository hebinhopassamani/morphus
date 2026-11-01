import { Service, signal } from '@angular/core';
import { add } from 'date-fns';

export type NoteLabelId =
  'ideas' | 'meetings' | 'follow-up' | 'research' | 'personal';

export type NoteTask = {
  id: string;
  content: string;
  completed: boolean;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tasks: NoteTask[];
  image: string | null;
  reminder: string | null;
  labelIds: NoteLabelId[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

type NoteSeed = Partial<Omit<Note, 'tasks'>> & {
  createdAt: string;
  tasks?: [string, boolean][];
};

export const NOTE_LABELS: {
  id: NoteLabelId;
  name: string;
  color: string;
}[] = [
  {
    id: 'ideas',
    name: 'Ideas',
    color: 'bg-amber-9',
  },
  {
    id: 'meetings',
    name: 'Meetings',
    color: 'bg-blue-9',
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    color: 'bg-red-9',
  },
  {
    id: 'research',
    name: 'Research',
    color: 'bg-violet-9',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: 'bg-jade-9',
  },
];

const now = new Date();
const days = (value: number) => add(now, { days: value }).toISOString();
const hours = (value: number) => add(now, { hours: value }).toISOString();

let noteId = 0;
let taskId = 0;

const createTask = (content: string, completed = false): NoteTask => ({
  id: `task_${++taskId}`,
  content,
  completed,
});

const createNote = (seed: NoteSeed): Note => ({
  id: `note_${++noteId}`,
  title: seed.title ?? '',
  content: seed.content ?? '',
  tasks: (seed.tasks ?? []).map(([content, completed]) =>
    createTask(content, completed)
  ),
  image: seed.image ?? null,
  reminder: seed.reminder ?? null,
  labelIds: seed.labelIds ?? [],
  pinned: !!seed.pinned,
  archived: !!seed.archived,
  createdAt: seed.createdAt,
  updatedAt: seed.updatedAt ?? seed.createdAt,
});

const SEEDS: NoteSeed[] = [
  {
    title: 'Q4 operations priorities',
    tasks: [
      ['Lock the Sales tax engine rollout date with Revenue', true],
      ['Sign off on the Localization: EU launch budget', true],
      ['Hire a second support lead before peak season', false],
      ['Move Support inbox automation into beta', false],
      ['Review warehouse SLAs with the 3PL', false],
      ['Close out the SOC 2 Type II readiness gaps', false],
    ],
    labelIds: ['meetings'],
    pinned: true,
    createdAt: days(-12),
    updatedAt: hours(-3),
  },
  {
    title: 'Weekly sync with Gloria',
    content:
      'Harbor Mobile App v2.4 is on track for the store review. Offline banner states still need a copy pass from Mei. Gloria wants a decision on the tablet layouts by Friday so the Mobile team can plan the next sprint.',
    image: '/images/notes/indigo-ripples.svg',
    labelIds: ['meetings', 'follow-up'],
    reminder: days(2),
    pinned: true,
    createdAt: days(-6),
    updatedAt: hours(-20),
  },
  {
    title: 'Holiday shipping cutoffs',
    content:
      'Standard ground: December 16.\nExpedited: December 19.\nExpress: December 21.\n\nPost the dates on the storefront banner and add them to the Lifecycle email program sends.',
    reminder: days(5),
    pinned: true,
    createdAt: days(-3),
  },
  {
    title: 'Front Range Guides wholesale order',
    content:
      'They want 40 Trailhead 2P Tents and 60 Ridgeline 28L Daypacks before their spring guide training. Ask Amara for net 30 terms and confirm the freight quote with the 3PL.',
    labelIds: ['follow-up'],
    reminder: days(1),
    createdAt: days(-2),
  },
  {
    title: 'Down jacket returns',
    content:
      'Returns on the Alpine Down Jacket are up again, mostly size swaps. Pull the reasons from the last 90 days and check whether the size chart on the product page matches the new factory spec.',
    labelIds: ['research'],
    createdAt: days(-9),
    updatedAt: days(-4),
  },
  {
    title: 'Packing list: Cascades trip',
    tasks: [
      ['Packable Rain Shell', true],
      ['Headlamp 400 and spare batteries', true],
      ['Titanium Camp Stove', false],
      ['Merino Hiking Socks, three pairs', false],
      ['Pacific Northwest Trail Map', false],
    ],
    labelIds: ['personal'],
    createdAt: days(-15),
    updatedAt: days(-1),
  },
  {
    content:
      'Bundle idea: Enamel Camp Mug Set plus Camp Cookset at 15% off for first time campers. Could run it with the Workspace templates launch email.',
    labelIds: ['ideas'],
    createdAt: days(-1),
  },
  {
    title: 'New support lead',
    content:
      'Ray recommended a candidate from his last team. Intro call is set, headshot and bio go to Kelley for the team page once the offer is signed.',
    labelIds: ['follow-up'],
    createdAt: days(-4),
  },
  {
    title: 'Peak season staffing',
    tasks: [
      ['Post seasonal roles for the warehouse', true],
      ['Confirm overtime budget with finance', true],
      ['Draft the support rotation for December', true],
      ['Schedule training for temporary agents', false],
      ['Order extra Packing Cubes for gift sets', false],
      ['Set up the holiday macros in the support inbox', false],
      ['Share the on call calendar with Theo', false],
    ],
    labelIds: ['meetings'],
    reminder: days(-2),
    createdAt: days(-20),
    updatedAt: days(-2),
  },
  {
    title: 'Customer call: Maya Chen',
    content:
      'Long time customer, asked about repair options for her daypack strap. She would buy a repair kit if we sold one. Worth a look for the Ridgeline line next year.',
    labelIds: ['ideas', 'research'],
    createdAt: days(-7),
  },
  {
    title: 'Team offsite',
    content:
      'Amara pitched a two day offsite at the lodge near Mount Hood in March. Budget is approved, dates still open.',
    image: '/images/notes/jade-arches.svg',
    labelIds: ['meetings', 'personal'],
    reminder: days(14),
    createdAt: days(-10),
    updatedAt: days(-8),
  },
  {
    title: 'Vendor scorecard',
    content:
      'Score suppliers on on time delivery, defect rate and response time every quarter. Hugo can pull the delivery data from the order history. Start with the three biggest suppliers and share the first draft at the ops review.',
    labelIds: ['research'],
    createdAt: days(-18),
    updatedAt: days(-11),
  },
  {
    content: 'Call the 3PL about the damaged pallet from order #10479.',
    labelIds: ['follow-up'],
    createdAt: hours(-5),
  },
  {
    title: 'Book recommendations',
    tasks: [
      ['The Goal by Eliyahu Goldratt', true],
      ['An Elegant Puzzle by Will Larson', false],
      ['Let My People Go Surfing by Yvon Chouinard', false],
    ],
    labelIds: ['personal'],
    createdAt: days(-30),
    updatedAt: days(-14),
  },
  {
    title: 'Partner portal with Lowell',
    content:
      'Let wholesale partners like Front Range Guides reorder from past orders, download invoices and see stock levels for their usual items. Lowell will check what the Public API v3 already covers.',
    image: '/images/notes/crimson-tiles.svg',
    labelIds: ['ideas'],
    createdAt: days(-24),
    updatedAt: days(-16),
  },
  {
    title: 'Spring catalog shoot',
    content:
      'Shoot wrapped. Final selects are uploaded to Files. Credit the photographers on the lookbook page.',
    labelIds: ['meetings'],
    archived: true,
    createdAt: days(-60),
    updatedAt: days(-45),
  },
  {
    title: 'Sales tax engine kickoff',
    tasks: [
      ['Collect nexus states from finance', true],
      ['Pick the tax provider', true],
      ['Agree on the cutover plan with Revenue', true],
    ],
    labelIds: ['meetings'],
    archived: true,
    createdAt: days(-75),
    updatedAt: days(-52),
  },
  {
    title: 'Old warehouse lease',
    content:
      'Lease ends in June. Moving everything to the new 3PL saved about 18% on fulfillment. Keep the contact for the landlord, alex.morgan@example.com, in case we need short term storage.',
    archived: true,
    createdAt: days(-120),
    updatedAt: days(-90),
  },
];

@Service()
export class NotesService {
  // Data
  readonly notes = signal<Note[]>(SEEDS.map(createNote));

  byId(id: string) {
    return this.notes().find((note) => note.id === id) ?? null;
  }

  create() {
    const note = createNote({ createdAt: new Date().toISOString() });
    this.notes.update((notes) => [note, ...notes]);
    return note.id;
  }

  update(id: string, changes: Partial<Note>) {
    this.notes.update((notes) =>
      notes.map((note) =>
        note.id === id
          ? { ...note, ...changes, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }

  pin(id: string, pinned: boolean) {
    this.update(id, { pinned, archived: false });
  }

  archive(id: string, archived: boolean) {
    this.update(id, { archived, pinned: false });
  }

  toggleLabel(id: string, label: NoteLabelId) {
    const labelIds = this.byId(id)!.labelIds;

    this.update(id, {
      labelIds: labelIds.includes(label)
        ? labelIds.filter((item) => item !== label)
        : [...labelIds, label],
    });
  }

  addTask(id: string) {
    this.update(id, {
      tasks: [...this.byId(id)!.tasks, createTask('')],
    });
  }

  updateTask(id: string, taskId: string, changes: Partial<NoteTask>) {
    this.update(id, {
      tasks: this.byId(id)!.tasks.map((task) =>
        task.id === taskId ? { ...task, ...changes } : task
      ),
    });
  }

  removeTask(id: string, taskId: string) {
    this.update(id, {
      tasks: this.byId(id)!.tasks.filter((task) => task.id !== taskId),
    });
  }

  delete(id: string) {
    this.notes.update((notes) => notes.filter((note) => note.id !== id));
  }
}
