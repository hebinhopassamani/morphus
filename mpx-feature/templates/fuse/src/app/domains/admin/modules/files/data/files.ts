import { computed, inject, Service, signal } from '@angular/core';
import { add, max } from 'date-fns';
import {
  Member,
  MembersService,
} from '@/app/domains/admin/modules/members/data/members';
import {
  Person,
  Project,
  ProjectsService,
} from '@/app/domains/admin/modules/projects/data/projects';

export type FileKind =
  | 'folder'
  | 'image'
  | 'video'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'archive'
  | 'other';

export type FileActivity = {
  id: string;
  icon: string;
  memberId: string;
  text: string;
  date: string;
};

export type FileItem = {
  id: string;
  parentId: string | null;
  name: string;
  kind: FileKind;
  size: number;
  count: number;
  ownerId: string;
  sharedWith: string[];
  createdAt: string;
  modifiedAt: string;
  starred: boolean;
  trashed: boolean;
  preview?: string;
  activity: FileActivity[];
};

export type FileCategory = {
  id: string;
  label: string;
  kinds: FileKind[];
  colorClass: string;
};

type FileSeed = {
  id?: string;
  name: string;
  owner: string;
  createdAt: string;
  modifiedAt?: string;
  size?: number;
  starred?: boolean;
  trashed?: boolean;
  preview?: string;
  sharedWith?: string[];
  children?: FileSeed[];
};

export const FILE_KINDS: Record<
  FileKind,
  { label: string; icon: string; colorClass: string }
> = {
  folder: {
    label: 'Folder',
    icon: 'folder',
    colorClass: 'bg-neutral-a3 *:text-amber-a11',
  },
  image: {
    label: 'Image',
    icon: 'file-image',
    colorClass: 'bg-neutral-a3 *:text-violet-a11',
  },
  video: {
    label: 'Video',
    icon: 'file-video-camera',
    colorClass: 'bg-neutral-a3 *:text-pink-a11',
  },
  pdf: {
    label: 'PDF',
    icon: 'file-text',
    colorClass: 'bg-neutral-a3 *:text-blue-a11',
  },
  document: {
    label: 'Document',
    icon: 'file-text',
    colorClass: 'bg-neutral-a3 *:text-blue-a11',
  },
  spreadsheet: {
    label: 'Spreadsheet',
    icon: 'file-spreadsheet',
    colorClass: 'bg-neutral-a3 *:text-blue-a11',
  },
  presentation: {
    label: 'Presentation',
    icon: 'presentation',
    colorClass: 'bg-neutral-a3 *:text-blue-a11',
  },
  archive: {
    label: 'Archive',
    icon: 'file-archive',
    colorClass: 'bg-neutral-a3 *:text-brown-a11',
  },
  other: {
    label: 'File',
    icon: 'file',
    colorClass: 'bg-neutral-a3 text-neutral-a11',
  },
};

export const FILE_CATEGORIES: FileCategory[] = [
  {
    id: 'images',
    label: 'Images',
    kinds: ['image'],
    colorClass: 'bg-violet-9',
  },
  {
    id: 'documents',
    label: 'Documents',
    kinds: ['pdf', 'document', 'spreadsheet', 'presentation'],
    colorClass: 'bg-blue-9',
  },
  {
    id: 'video',
    label: 'Video',
    kinds: ['video'],
    colorClass: 'bg-pink-9',
  },
  {
    id: 'archives',
    label: 'Archives',
    kinds: ['archive'],
    colorClass: 'bg-brown-9',
  },
  {
    id: 'other',
    label: 'Other',
    kinds: ['other'],
    colorClass: 'bg-neutral-9',
  },
];

const EXTENSIONS: Record<string, FileKind> = {
  jpg: 'image',
  png: 'image',
  svg: 'image',
  mp4: 'video',
  mov: 'video',
  pdf: 'pdf',
  docx: 'document',
  xlsx: 'spreadsheet',
  csv: 'spreadsheet',
  pptx: 'presentation',
  zip: 'archive',
};

const KB = 1e3;
const MB = 1e6;
const GB = 1e9;

const ME = 'gloria-metz';

const now = new Date();
const days = (value: number) => add(now, { days: value }).toISOString();
const hours = (value: number) => add(now, { hours: value }).toISOString();

let itemId = 0;
let activityId = 0;

const activity = (
  icon: string,
  memberId: string,
  text: string,
  date: string
): FileActivity => ({
  id: `activity_${++activityId}`,
  icon,
  memberId,
  text,
  date,
});

const noun = (kind: FileKind) => (kind === 'folder' ? 'folder' : 'file');

const createItem = (
  seed: FileSeed,
  parentId: string | null,
  sharedWith: string[]
): FileItem => {
  const kind = seed.children
    ? 'folder'
    : (EXTENSIONS[seed.name.split('.').pop() ?? ''] ?? 'other');
  const modifiedAt = seed.modifiedAt ?? seed.createdAt;
  const shared = (seed.sharedWith ?? sharedWith).filter(
    (id) => id !== seed.owner
  );

  return {
    id: seed.id ?? `file_${++itemId}`,
    parentId,
    name: seed.name,
    kind,
    size: seed.size ?? 0,
    count: 0,
    ownerId: seed.owner,
    sharedWith: shared,
    createdAt: seed.createdAt,
    modifiedAt,
    starred: !!seed.starred,
    trashed: !!seed.trashed,
    preview: seed.preview,
    activity: [
      ...(seed.trashed
        ? [
            activity(
              'trash',
              seed.owner,
              `moved the ${noun(kind)} to trash`,
              modifiedAt
            ),
          ]
        : modifiedAt !== seed.createdAt
          ? [
              activity(
                'upload',
                shared[0] ?? seed.owner,
                'uploaded a new version',
                modifiedAt
              ),
            ]
          : []),
      kind === 'folder'
        ? activity(
            'folder-plus',
            seed.owner,
            'created the folder',
            seed.createdAt
          )
        : activity('upload', seed.owner, 'uploaded the file', seed.createdAt),
    ],
  };
};

const flatten = (
  seeds: FileSeed[],
  parentId: string | null,
  sharedWith: string[]
): FileItem[] =>
  seeds.flatMap((seed) => {
    const entry = createItem(seed, parentId, sharedWith);
    return [
      entry,
      ...flatten(seed.children ?? [], entry.id, [
        entry.ownerId,
        ...entry.sharedWith,
      ]),
    ];
  });

const PROJECT_FILES: Record<string, FileSeed[]> = {
  'harbor-mobile-v24': [
    {
      name: 'Release plan v2.4.pdf',
      owner: 'gloria-metz',
      createdAt: days(-80),
      modifiedAt: hours(-3),
      size: 1.8 * MB,
      starred: true,
    },
    {
      name: 'Release plan v2.3.pdf',
      owner: 'gloria-metz',
      createdAt: days(-84),
      modifiedAt: days(-6),
      size: 1.6 * MB,
      trashed: true,
    },
    {
      name: 'Sync protocol RFC.docx',
      owner: 'evan-gutmann',
      createdAt: days(-72),
      modifiedAt: days(-9),
      size: 412 * KB,
    },
    {
      name: 'Offline states.fig',
      owner: 'kelley-schimmel',
      createdAt: days(-61),
      modifiedAt: days(-2),
      size: 24.5 * MB,
    },
    {
      name: 'Screens',
      owner: 'nathan-kutch',
      createdAt: days(-40),
      children: [
        {
          name: 'Home offline.png',
          owner: 'kelley-schimmel',
          createdAt: days(-38),
          size: 1.4 * MB,
        },
        {
          name: 'Sync conflict sheet.png',
          owner: 'kelley-schimmel',
          createdAt: days(-31),
          modifiedAt: days(-4),
          size: 980 * KB,
        },
        {
          name: 'Settings dark.png',
          owner: 'theo-lindqvist',
          createdAt: days(-19),
          size: 1.1 * MB,
        },
      ],
    },
    {
      name: 'App Store preview.mp4',
      owner: 'leticia-yundt',
      createdAt: days(-12),
      size: 186 * MB,
    },
  ],
  'billing-revamp': [
    {
      name: 'Pricing engine design.pdf',
      owner: 'marcus-feeney',
      createdAt: days(-60),
      modifiedAt: days(-14),
      size: 2.3 * MB,
    },
    {
      name: 'Cutover runbook.docx',
      owner: 'lowell-lind',
      createdAt: days(-33),
      modifiedAt: hours(-7),
      size: 230 * KB,
    },
    {
      name: 'Ledger reconciliation.xlsx',
      owner: 'dana-hermiston',
      createdAt: days(-41),
      modifiedAt: days(-1),
      size: 3.4 * MB,
      starred: true,
    },
  ],
  'onboarding-redesign': [
    {
      name: 'Funnel audit.pdf',
      owner: 'leticia-yundt',
      createdAt: days(-44),
      size: 5.1 * MB,
    },
    {
      name: 'Experiment brief.docx',
      owner: 'bianca-ferreira',
      createdAt: days(-30),
      modifiedAt: days(-3),
      size: 145 * KB,
    },
    {
      name: 'Usability sessions',
      owner: 'hugo-braun',
      createdAt: days(-21),
      children: [
        {
          name: 'Session 01.mp4',
          owner: 'hugo-braun',
          createdAt: days(-20),
          size: 1.24 * GB,
        },
        {
          name: 'Session 02.mp4',
          owner: 'hugo-braun',
          createdAt: days(-18),
          size: 1.31 * GB,
        },
        {
          name: 'Session notes.docx',
          owner: 'janis-considine',
          createdAt: days(-18),
          modifiedAt: days(-16),
          size: 98 * KB,
        },
      ],
    },
  ],
  'aurora-design-system': [
    {
      name: 'Token naming conventions.docx',
      owner: 'kelley-schimmel',
      createdAt: days(-115),
      modifiedAt: days(-20),
      size: 210 * KB,
    },
    {
      name: 'Aurora 2.0 component library.fig',
      owner: 'felix-nowak',
      createdAt: days(-110),
      modifiedAt: hours(-9),
      size: 96.4 * MB,
      starred: true,
    },
    {
      name: 'Contrast audit results.xlsx',
      owner: 'rosalind-pike',
      createdAt: days(-52),
      size: 640 * KB,
    },
    {
      name: 'Icon set.zip',
      owner: 'bianca-ferreira',
      createdAt: days(-47),
      modifiedAt: days(-8),
      size: 38.2 * MB,
    },
  ],
  'portal-analytics': [
    {
      name: 'Metric definitions.pdf',
      owner: 'amara-okafor',
      createdAt: days(-66),
      modifiedAt: days(-11),
      size: 760 * KB,
    },
    {
      name: 'Portal usage export.csv',
      owner: 'tobias-wehner',
      createdAt: hours(-5),
      size: 48.3 * MB,
    },
  ],
  'realtime-collab-beta': [
    {
      name: 'Collaboration architecture.pdf',
      owner: 'felix-nowak',
      createdAt: days(-55),
      modifiedAt: days(-10),
      size: 3.9 * MB,
    },
    {
      name: 'Merge test cases.xlsx',
      owner: 'priya-raman',
      createdAt: days(-29),
      modifiedAt: hours(-12),
      size: 1.2 * MB,
    },
    {
      name: 'Beta demo.mov',
      owner: 'evan-gutmann',
      createdAt: days(-6),
      size: 742 * MB,
    },
  ],
  'enterprise-sso': [
    {
      name: 'Identity provider matrix.xlsx',
      owner: 'alexander-shields',
      createdAt: days(-46),
      modifiedAt: days(-5),
      size: 410 * KB,
    },
    {
      name: 'SCIM endpoint contract.pdf',
      owner: 'sofia-renner',
      createdAt: days(-37),
      size: 1.1 * MB,
    },
  ],
  'crm-integrations': [
    {
      name: 'Field mapping reference.xlsx',
      owner: 'lowell-lind',
      createdAt: days(-90),
      modifiedAt: days(-12),
      size: 520 * KB,
    },
    {
      name: 'Marketplace listing draft.docx',
      owner: 'janis-considine',
      createdAt: days(-24),
      size: 180 * KB,
    },
  ],
  'accessibility-audit': [
    {
      name: 'Audit findings.pdf',
      owner: 'leticia-yundt',
      createdAt: days(-50),
      modifiedAt: days(-7),
      size: 6.7 * MB,
    },
    {
      name: 'Screen reader recordings.zip',
      owner: 'rosalind-pike',
      createdAt: days(-26),
      size: 2.84 * GB,
    },
  ],
};

const seedItems = (projects: Project[], members: Member[]) => {
  const ids = (people: Person[]) =>
    members
      .filter((member) => people.some((person) => person.name === member.name))
      .map((member) => member.id);
  const byId = (id: string) => members.find((member) => member.id === id)!;

  return flatten(
    [
      ...projects
        .filter((project) => project.status === 'in-progress')
        .map((project) => ({
          id: project.id,
          name: project.name,
          owner: ids([project.lead])[0],
          sharedWith: ids(project.members),
          createdAt: project.startDate,
          children: PROJECT_FILES[project.id] ?? [],
        })),
      {
        name: 'Brand assets',
        owner: 'kelley-schimmel',
        sharedWith: [
          'leticia-yundt',
          'bianca-ferreira',
          'rosalind-pike',
          'nadia-farouk',
          'gloria-metz',
        ],
        createdAt: days(-240),
        children: [
          {
            name: 'Logos',
            owner: 'kelley-schimmel',
            createdAt: days(-238),
            children: [
              {
                name: 'Logomark.svg',
                owner: 'kelley-schimmel',
                createdAt: days(-238),
                modifiedAt: days(-35),
                size: 4 * KB,
                starred: true,
              },
              {
                name: 'Logo lockups.zip',
                owner: 'bianca-ferreira',
                createdAt: days(-35),
                size: 12.6 * MB,
              },
              {
                name: 'Old logo.png',
                owner: 'kelley-schimmel',
                createdAt: days(-238),
                modifiedAt: days(-34),
                size: 210 * KB,
                trashed: true,
              },
            ],
          },
          {
            name: 'Team headshots',
            owner: 'leticia-yundt',
            createdAt: days(-150),
            children: [
              'gloria-metz',
              'kelley-schimmel',
              'marcus-feeney',
              'nadia-farouk',
              'amara-okafor',
              'janis-considine',
            ].map((id, index) => ({
              name: `${byId(id).name}.jpg`,
              owner: 'leticia-yundt',
              createdAt: days(-150 + index * 9),
              size: (2.1 + index * 0.35) * MB,
              preview: byId(id).photo,
            })),
          },
          {
            name: 'Brand guidelines.pdf',
            owner: 'kelley-schimmel',
            createdAt: days(-230),
            modifiedAt: days(-15),
            size: 22.4 * MB,
            starred: true,
          },
          {
            name: 'Brand fonts.zip',
            owner: 'rosalind-pike',
            createdAt: days(-228),
            size: 8.9 * MB,
          },
          {
            name: 'Fall product shoot selects.zip',
            owner: 'nadia-farouk',
            createdAt: days(-17),
            size: 6.2 * GB,
          },
        ],
      },
      {
        name: 'Campaigns',
        owner: 'nadia-farouk',
        sharedWith: [
          'kelley-schimmel',
          'leticia-yundt',
          'gloria-metz',
          'janis-considine',
        ],
        createdAt: days(-210),
        children: [
          {
            name: 'Fall trail campaign',
            owner: 'nadia-farouk',
            createdAt: days(-34),
            children: [
              {
                name: 'Raw footage',
                owner: 'nadia-farouk',
                createdAt: days(-29),
                children: [
                  {
                    name: 'A camera day 1.mov',
                    owner: 'nadia-farouk',
                    createdAt: days(-29),
                    size: 8.6 * GB,
                  },
                  {
                    name: 'A camera day 2.mov',
                    owner: 'nadia-farouk',
                    createdAt: days(-28),
                    size: 7.9 * GB,
                  },
                ],
              },
              {
                name: 'Social cutdowns',
                owner: 'leticia-yundt',
                createdAt: days(-10),
                children: [
                  {
                    name: 'Tent pitch 15s.mp4',
                    owner: 'leticia-yundt',
                    createdAt: days(-9),
                    size: 96 * MB,
                  },
                  {
                    name: 'Down jacket 15s.mp4',
                    owner: 'leticia-yundt',
                    createdAt: days(-8),
                    modifiedAt: hours(-26),
                    size: 88 * MB,
                  },
                ],
              },
              {
                name: 'Trailhead tent hero.mp4',
                owner: 'nadia-farouk',
                createdAt: days(-14),
                modifiedAt: days(-2),
                size: 2.46 * GB,
                starred: true,
              },
              {
                name: 'Storyboard.pdf',
                owner: 'kelley-schimmel',
                createdAt: days(-33),
                size: 14.2 * MB,
              },
            ],
          },
          {
            name: 'Summer sale 2025',
            owner: 'nadia-farouk',
            createdAt: days(-200),
            modifiedAt: days(-21),
            trashed: true,
            children: [
              {
                name: 'Summer sale banner.png',
                owner: 'leticia-yundt',
                createdAt: days(-198),
                size: 2.7 * MB,
              },
            ],
          },
          {
            name: 'Spring catalog.pdf',
            owner: 'nadia-farouk',
            createdAt: days(-180),
            modifiedAt: days(-150),
            size: 64.5 * MB,
          },
          {
            name: 'Outdoor Retail Expo booth.pptx',
            owner: 'janis-considine',
            createdAt: days(-23),
            modifiedAt: days(-1),
            size: 42.1 * MB,
          },
        ],
      },
      {
        name: 'Contracts',
        owner: 'marcus-feeney',
        sharedWith: ['ingrid-solberg', 'alexander-shields', 'gloria-metz'],
        createdAt: days(-365),
        children: [
          {
            name: 'Brightwave Media retainer.pdf',
            owner: 'marcus-feeney',
            createdAt: days(-95),
            size: 1.2 * MB,
          },
          {
            name: 'Brightwave Media retainer 2025.pdf',
            owner: 'marcus-feeney',
            createdAt: days(-360),
            modifiedAt: days(-94),
            size: 1.1 * MB,
            trashed: true,
          },
          {
            name: 'Outdoor Retail Expo booth agreement.pdf',
            owner: 'marcus-feeney',
            createdAt: days(-58),
            size: 860 * KB,
          },
          {
            name: 'DHL Express rate card 2026.pdf',
            owner: 'marcus-feeney',
            createdAt: days(-270),
            size: 2.1 * MB,
          },
          {
            name: 'Ledgerline merchant agreement.pdf',
            owner: 'ingrid-solberg',
            createdAt: days(-310),
            modifiedAt: days(-44),
            size: 1.6 * MB,
          },
          {
            name: 'Mutual NDA template.docx',
            owner: 'ingrid-solberg',
            createdAt: days(-300),
            size: 64 * KB,
          },
        ],
      },
      {
        name: 'Invoices',
        owner: 'marcus-feeney',
        sharedWith: ['dana-hermiston', 'gloria-metz'],
        createdAt: days(-365),
        children: [
          {
            name: 'Q2 2026',
            owner: 'marcus-feeney',
            createdAt: days(-190),
            children: [
              {
                name: 'Brightwave Media INV-2041.pdf',
                owner: 'marcus-feeney',
                createdAt: days(-128),
                size: 240 * KB,
              },
              {
                name: 'DHL Express June statement.pdf',
                owner: 'dana-hermiston',
                createdAt: days(-96),
                size: 380 * KB,
              },
            ],
          },
          {
            name: 'Q3 2026',
            owner: 'marcus-feeney',
            createdAt: days(-96),
            children: [
              {
                name: 'Brightwave Media INV-2087.pdf',
                owner: 'marcus-feeney',
                createdAt: days(-36),
                size: 250 * KB,
              },
              {
                name: 'DHL Express September statement.pdf',
                owner: 'dana-hermiston',
                createdAt: days(-4),
                size: 410 * KB,
              },
              {
                name: 'Ledgerline September statement.pdf',
                owner: 'dana-hermiston',
                createdAt: days(-3),
                size: 290 * KB,
              },
            ],
          },
          {
            name: 'Expense report Q3.xlsx',
            owner: 'dana-hermiston',
            createdAt: days(-5),
            modifiedAt: hours(-30),
            size: 1.8 * MB,
          },
        ],
      },
      {
        name: 'Workspace handbook.pdf',
        owner: 'gloria-metz',
        createdAt: days(-300),
        modifiedAt: days(-25),
        size: 4.2 * MB,
        starred: true,
      },
      {
        name: 'Q4 planning.pptx',
        owner: 'nadia-farouk',
        createdAt: days(-9),
        modifiedAt: hours(-4),
        size: 18.6 * MB,
      },
      {
        name: 'Team offsite agenda.docx',
        owner: 'gloria-metz',
        createdAt: days(-13),
        size: 86 * KB,
      },
    ],
    null,
    []
  );
};

@Service()
export class FilesService {
  // Dependencies
  private membersService = inject(MembersService);
  private projectsService = inject(ProjectsService);

  // Data
  readonly quota = 100 * GB;
  private entries = signal<FileItem[]>(
    seedItems(this.projectsService.projects(), this.membersService.members())
  );
  readonly items = computed(() => {
    const entries = this.entries();
    const resolve = (entry: FileItem): FileItem => {
      if (entry.kind !== 'folder') {
        return entry;
      }

      const children = entries
        .filter((child) => child.parentId === entry.id && !child.trashed)
        .map(resolve);

      return {
        ...entry,
        count: children.length,
        size: children.reduce((total, child) => total + child.size, 0),
        modifiedAt: max([
          entry.modifiedAt,
          ...children.map((child) => child.modifiedAt),
        ]).toISOString(),
      };
    };

    return entries.map(resolve);
  });
  readonly storage = computed(() =>
    FILE_CATEGORIES.map((category) => ({
      ...category,
      size: this.entries()
        .filter((entry) => category.kinds.includes(entry.kind))
        .reduce((total, entry) => total + entry.size, 0),
    }))
  );
  readonly used = computed(() =>
    this.storage().reduce((total, category) => total + category.size, 0)
  );

  byId(id: string) {
    return this.items().find((item) => item.id === id) ?? null;
  }

  path(id: string | null): FileItem[] {
    const item = id ? this.byId(id) : null;
    return item ? [...this.path(item.parentId), item] : [];
  }

  isTrashed(item: FileItem) {
    return this.path(item.id).some((entry) => entry.trashed);
  }

  create(parentId: string | null, name: string) {
    this.entries.update((entries) => [
      ...entries,
      createItem(
        { name, owner: ME, createdAt: new Date().toISOString(), children: [] },
        parentId,
        []
      ),
    ]);
  }

  upload(parentId: string | null) {
    this.entries.update((entries) => [
      ...entries,
      createItem(
        {
          name: 'Trail map scan.pdf',
          owner: ME,
          createdAt: new Date().toISOString(),
          size: 2.4 * MB,
        },
        parentId,
        []
      ),
    ]);
  }

  rename(id: string, name: string) {
    this.update([id], (entry) => ({
      name,
      modifiedAt: new Date().toISOString(),
      activity: this.log(entry, 'pencil', `renamed the ${noun(entry.kind)}`),
    }));
  }

  star(ids: string[], starred: boolean) {
    this.update(ids, () => ({ starred }));
  }

  trash(ids: string[]) {
    this.update(ids, (entry) => ({
      trashed: true,
      activity: this.log(
        entry,
        'trash',
        `moved the ${noun(entry.kind)} to trash`
      ),
    }));
  }

  restore(ids: string[]) {
    this.update(ids, (entry) => ({
      trashed: false,
      activity: this.log(
        entry,
        'rotate-ccw',
        `restored the ${noun(entry.kind)} from trash`
      ),
    }));
  }

  delete(ids: string[]) {
    this.entries.set(
      this.entries().filter(
        (entry) => !this.path(entry.id).some((item) => ids.includes(item.id))
      )
    );
  }

  private log(entry: FileItem, icon: string, text: string) {
    return [
      activity(icon, ME, text, new Date().toISOString()),
      ...entry.activity,
    ];
  }

  private update(
    ids: string[],
    changes: (entry: FileItem) => Partial<FileItem>
  ) {
    this.entries.update((entries) =>
      entries.map((entry) =>
        ids.includes(entry.id) ? { ...entry, ...changes(entry) } : entry
      )
    );
  }
}
