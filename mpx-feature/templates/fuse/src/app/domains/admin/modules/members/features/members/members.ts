import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink, RouterOutlet } from '@angular/router';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  Column,
  Member,
  MembersService,
} from '@/app/domains/admin/modules/members/data/members';
import { MembersInviteMembers } from '@/app/domains/admin/modules/members/features/members/invite-members';
import { TeamsService } from '@/app/domains/admin/modules/teams/data/teams';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type FilterOption = {
  id: string;
  label: string;
};

type DataSourceFilter = {
  search: string;
  roles: string[];
  statuses: string[];
};

const ROLE_OPTIONS: FilterOption[] = [
  {
    id: 'owner',
    label: 'Owner',
  },
  {
    id: 'admin',
    label: 'Admin',
  },
  {
    id: 'member',
    label: 'Member',
  },
];

const STATUS_OPTIONS: FilterOption[] = [
  {
    id: 'active',
    label: 'Active',
  },
  {
    id: 'invited',
    label: 'Invited',
  },
  {
    id: 'blocked',
    label: 'Blocked',
  },
];

const COLUMNS: Column[] = [
  {
    id: 'user',
    label: 'User',
    visible: true,
    locked: true,
  },
  {
    id: 'email',
    label: 'Email',
    visible: true,
    locked: false,
  },
  {
    id: 'team',
    label: 'Teams',
    visible: true,
    locked: false,
  },
  {
    id: 'role',
    label: 'Role',
    visible: true,
    locked: false,
  },
  {
    id: 'status',
    label: 'Status',
    visible: true,
    locked: false,
  },
  {
    id: 'lastActive',
    label: 'Last active',
    visible: true,
    locked: false,
  },
  {
    id: 'actions',
    label: 'Actions',
    visible: true,
    locked: true,
  },
];

@Component({
  selector: 'members',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropList,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MembersInviteMembers,
    MatTableModule,
    NgOptimizedImage,
    RouterLink,
    RouterOutlet,
    TitleCasePipe,
    MatFormField,
    MatInput,
    MatPrefix,
    MatSuffix,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Members</div>
          <div class="text-neutral-a11 sm:text-lg">
            Everyone in the workspace, their team and what they can access.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="primary"
            (click)="inviteMembersOpen.set(true)"
          >
            <mat-icon svgIcon="user-plus" />
            Invite members
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Search & Filters -->
        <div class="flex flex-col items-center gap-2 sm:flex-row">
          <!-- Search -->
          <mat-form-field class="w-full sm:max-w-100">
            <mat-icon
              svgIcon="search"
              matIconPrefix
            />
            <input
              matInput
              placeholder="Search members by name, title or email"
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
            />
            @if (search()) {
              <button
                matIconButton
                matIconSuffix
                (click)="search.set('')"
              >
                <mat-icon svgIcon="x" />
              </button>
            }
          </mat-form-field>

          <div class="flex w-full flex-auto items-center gap-x-2">
            <!-- Role filter -->
            <div
              buiCombobox
              class="w-fit"
              [(value)]="roleFilter"
            >
              <button
                matButton
                buiComboboxTrigger
                id="members-role-filter"
              >
                <span class="inline-flex items-center gap-x-1.5">
                  Role
                  @if (roleFilter().length) {
                    <span
                      class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11"
                    >
                      {{ roleFilter().length }}
                    </span>
                  }
                </span>
                <mat-icon
                  svgIcon="chevron-down"
                  iconPositionEnd
                />
              </button>
              <ng-template
                buiComboboxPortal
                matchWidth="false"
              >
                <div
                  buiComboboxContent
                  class="min-w-40"
                >
                  <div
                    buiComboboxListbox
                    aria-labelledby="members-role-filter"
                    multi
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of roleOptions; track option.id) {
                      <div
                        buiComboboxOption
                        [value]="option.id"
                        [label]="option.label"
                      >
                        <span class="flex-auto truncate">{{
                          option.label
                        }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                  @if (roleFilter().length) {
                    <mat-divider />
                    <button
                      matButton
                      class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                      (click)="roleFilter.set([])"
                    >
                      <mat-icon svgIcon="x" />
                      Clear filter
                    </button>
                  }
                </div>
              </ng-template>
            </div>

            <!-- Status filter -->
            <div
              buiCombobox
              class="w-fit"
              [(value)]="statusFilter"
            >
              <button
                matButton
                buiComboboxTrigger
                id="members-status-filter"
              >
                <span class="inline-flex items-center gap-x-1.5">
                  Status
                  @if (statusFilter().length) {
                    <span
                      class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11"
                    >
                      {{ statusFilter().length }}
                    </span>
                  }
                </span>
                <mat-icon
                  svgIcon="chevron-down"
                  iconPositionEnd
                />
              </button>
              <ng-template
                buiComboboxPortal
                matchWidth="false"
              >
                <div
                  buiComboboxContent
                  class="min-w-40"
                >
                  <div
                    buiComboboxListbox
                    aria-labelledby="members-status-filter"
                    multi
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of statusOptions; track option.id) {
                      <div
                        buiComboboxOption
                        [value]="option.id"
                        [label]="option.label"
                      >
                        <span class="flex-auto truncate">{{
                          option.label
                        }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                  @if (statusFilter().length) {
                    <mat-divider />
                    <button
                      matButton
                      class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                      (click)="statusFilter.set([])"
                    >
                      <mat-icon svgIcon="x" />
                      Clear filter
                    </button>
                  }
                </div>
              </ng-template>
            </div>

            <!-- Spacer -->
            <div class="flex-auto"></div>

            <!-- Customize -->
            <button
              matButton
              class="tertiary hidden sm:flex"
              [matMenuTriggerFor]="customizeMenu"
            >
              <mat-icon svgIcon="settings-2" />
              Customize
            </button>
            <button
              matIconButton
              class="sm:hidden"
              [matMenuTriggerFor]="customizeMenu"
            >
              <mat-icon svgIcon="settings-2" />
            </button>
            <mat-menu
              class="min-w-40"
              xPosition="before"
              #customizeMenu
            >
              <div
                class="mat-mdc-menu-content"
                tabindex="-1"
                cdkDropList
                (click)="$event.stopPropagation()"
                (keydown)="$event.stopPropagation()"
                (cdkDropListDropped)="drop($event)"
              >
                <div
                  mat-menu-item
                  class="not-mat-menu-wrapper font-medium"
                >
                  Columns
                </div>
                @for (column of columns(); track column.id) {
                  <button
                    mat-menu-item
                    cdkDrag
                    cdkDragLockAxis="y"
                    cdkDragPreviewContainer="parent"
                    [cdkDragPreviewClass]="[
                      'bg-neutral-3',
                      'dark:bg-neutral-4',
                      'shadow',
                    ]"
                    (click)="toggleVisibility(column)"
                  >
                    <mat-checkbox
                      class="pointer-events-none"
                      tabIndex="-1"
                      [checked]="column.visible"
                      [disabled]="column.locked"
                    >
                      {{ column.label }}
                    </mat-checkbox>

                    <div class="flex flex-auto justify-end">
                      <mat-icon
                        cdkDragHandle
                        class="cursor-grab"
                        svgIcon="grip-vertical"
                      />
                    </div>

                    <div
                      *cdkDragPlaceholder
                      class="h-8 rounded-md bg-neutral-a3"
                    ></div>
                  </button>
                }
              </div>
            </mat-menu>
          </div>
        </div>

        <!-- Table -->
        <div class="flex flex-col">
          <div class="relative">
            <div class="relative isolate overflow-x-visible overflow-y-hidden">
              <table
                class="whitespace-nowrap"
                mat-table
                [dataSource]="dataSource"
                [trackBy]="trackBy"
                matSort
              >
                <!-- Select column -->
                <ng-container matColumnDef="select">
                  <th
                    class="w-4"
                    mat-header-cell
                    *matHeaderCellDef
                  >
                    <mat-checkbox
                      [checked]="selection.hasValue() && isAllSelected()"
                      [indeterminate]="selection.hasValue() && !isAllSelected()"
                      (change)="toggleAllRows()"
                    >
                    </mat-checkbox>
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <mat-checkbox
                      [checked]="selection.isSelected(row)"
                      (click)="$event.stopPropagation()"
                      (change)="selection.toggle(row)"
                    >
                    </mat-checkbox>
                  </td>
                </ng-container>

                <!-- User column -->
                <ng-container matColumnDef="user">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                  >
                    User
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <div class="flex items-center gap-x-2.5 py-1.5">
                      <img
                        class="shrink-0 rounded-full object-cover"
                        width="28"
                        height="28"
                        [ngSrc]="row.photo"
                        [alt]="row.name"
                      />
                      <div class="flex flex-col">
                        <div class="font-medium">{{ row.name }}</div>
                        <div class="text-sm text-neutral-a11">
                          {{ row.title }}
                        </div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Email column -->
                <ng-container matColumnDef="email">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                  >
                    Email
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    {{ row.email }}
                  </td>
                </ng-container>

                <!-- Team column -->
                <ng-container matColumnDef="team">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                  >
                    Teams
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <div class="flex items-center gap-x-1.5">
                      @for (teamId of row.teamIds; track teamId) {
                        @if (teams()[teamId]; as team) {
                          <div
                            class="inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-medium"
                            [class]="team.tagClass"
                          >
                            {{ team.name }}
                          </div>
                        }
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Role column -->
                <ng-container matColumnDef="role">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                  >
                    Role
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <div
                      class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
                    >
                      {{ row.role | titlecase }}
                    </div>
                  </td>
                </ng-container>

                <!-- Status column -->
                <ng-container matColumnDef="status">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                  >
                    Status
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <div class="inline-flex items-center gap-x-1.5">
                      <div
                        class="size-1.5 rounded-full"
                        [class.bg-jade-9]="row.status === 'active'"
                        [class.bg-amber-9]="row.status === 'invited'"
                        [class.bg-red-9]="row.status === 'blocked'"
                      ></div>
                      {{ row.status | titlecase }}
                    </div>
                  </td>
                </ng-container>

                <!-- Last active column -->
                <ng-container matColumnDef="lastActive">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                  >
                    Last active
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    @if (row.lastActive) {
                      {{ relativeDate(row.lastActive) }}
                    } @else {
                      <span class="text-neutral-a11">Never</span>
                    }
                  </td>
                </ng-container>

                <!-- Actions column -->
                <ng-container matColumnDef="actions">
                  <th
                    class="w-12"
                    mat-header-cell
                    *matHeaderCellDef
                  ></th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                  >
                    <button
                      matIconButton
                      class="tiny mx-auto"
                      [matMenuTriggerFor]="memberActions"
                      (click)="$event.stopPropagation()"
                    >
                      <mat-icon svgIcon="ellipsis-vertical" />
                    </button>
                    <mat-menu
                      xPosition="before"
                      #memberActions="matMenu"
                    >
                      @switch (row.status) {
                        @case ('active') {
                          <button
                            mat-menu-item
                            [routerLink]="row.id"
                            [queryParams]="{ edit: true }"
                          >
                            <mat-icon svgIcon="user-pen" />
                            Edit member
                          </button>
                          <button mat-menu-item>
                            <mat-icon svgIcon="user-cog" />
                            Change role
                          </button>
                          <button mat-menu-item>
                            <mat-icon svgIcon="shield-x" />
                            Block access
                          </button>
                        }
                        @case ('invited') {
                          <button mat-menu-item>
                            <mat-icon svgIcon="send" />
                            Resend invitation
                          </button>
                          <button mat-menu-item>
                            <mat-icon svgIcon="shredder" />
                            Cancel invitation
                          </button>
                        }
                        @case ('blocked') {
                          <button mat-menu-item>
                            <mat-icon svgIcon="shield-check" />
                            Unblock access
                          </button>
                        }
                      }
                      <mat-divider />
                      <button
                        mat-menu-item
                        class="text-red-a11 hover:bg-red-a3"
                      >
                        <mat-icon
                          class="text-red-a11"
                          svgIcon="user-x"
                        />
                        Remove member
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <ng-template matNoDataRow>
                  <tr>
                    <td [attr.colspan]="columnIds().length">
                      <div
                        class="flex flex-col items-center justify-center gap-y-2 py-10"
                      >
                        <mat-icon
                          class="size-10"
                          svgIcon="user-round"
                        />
                        <div class="text-center text-neutral-a11">
                          No members match this view.
                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <!-- Header row definition -->
                <tr
                  mat-header-row
                  *matHeaderRowDef="columnIds()"
                ></tr>

                <!-- Row definition -->
                <tr
                  class="cursor-pointer hover:bg-neutral-a2"
                  mat-row
                  *matRowDef="let row; columns: columnIds()"
                  [routerLink]="row.id"
                ></tr>
              </table>
            </div>
            <!-- Selection bar -->
            @if (selection.hasValue()) {
              <div
                class="absolute inset-x-0 top-0 flex h-10 items-center gap-x-2 border-t border-b border-neutral-a3 bg-neutral-2 ps-2 pe-1.5"
              >
                <div class="w-6">
                  <mat-checkbox
                    [checked]="isAllSelected()"
                    [indeterminate]="!isAllSelected()"
                    (change)="toggleAllRows()"
                  />
                </div>
                <div class="text-sm font-medium text-neutral-a10">
                  {{ selection.selected.length }} selected
                </div>
                <div class="ms-auto flex items-center gap-x-1.5">
                  <button
                    matButton
                    class="small"
                  >
                    <mat-icon svgIcon="user-cog" />
                    Change role
                  </button>
                  <button
                    matButton
                    class="small"
                  >
                    <mat-icon svgIcon="users" />
                    Add to team
                  </button>
                  <button
                    matButton
                    class="small destructive"
                  >
                    <mat-icon svgIcon="user-x" />
                    Remove
                  </button>
                  <button
                    matIconButton
                    class="small"
                    (click)="selection.clear()"
                  >
                    <mat-icon svgIcon="x" />
                  </button>
                </div>
              </div>
            }
          </div>
          <mat-paginator
            class="p-2"
            [length]="members().length"
            [pageSize]="25"
            [pageSizeOptions]="[10, 25, 50]"
          />
        </div>
      </div>
    </div>

    <!-- Invite members -->
    <members-invite-members [(open)]="inviteMembersOpen" />

    <router-outlet />
  `,
})
export default class Members {
  // Dependencies
  private membersService = inject(MembersService);
  private teamsService = inject(TeamsService);

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // State
  private members = this.membersService.members;
  private roleOptions = ROLE_OPTIONS;
  private statusOptions = STATUS_OPTIONS;
  private search = signal('');
  private roleFilter = signal<string[]>([]);
  private statusFilter = signal<string[]>([]);
  private inviteMembersOpen = signal(false);
  private columns = signal<Column[]>([...COLUMNS]);
  private dataSource = new MatTableDataSource<Member>([]);
  private selection = new SelectionModel<Member>(true, []);

  // Computed state
  private columnIds = computed(() => [
    'select',
    ...this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id),
  ]);
  private teams = computed(() =>
    Object.fromEntries(this.teamsService.teams().map((team) => [team.id, team]))
  );
  private dataSourceFilter = computed<DataSourceFilter>(() => ({
    search: this.search().trim().toLowerCase(),
    roles: this.roleFilter(),
    statuses: this.statusFilter(),
  }));

  constructor() {
    this.dataSource.filterPredicate = (member, filter) => {
      const { search, roles, statuses } = JSON.parse(
        filter
      ) as DataSourceFilter;

      return (
        (!search ||
          member.name.toLowerCase().includes(search) ||
          member.title.toLowerCase().includes(search) ||
          member.email.toLowerCase().includes(search)) &&
        (!roles.length || roles.includes(member.role)) &&
        (!statuses.length || statuses.includes(member.status))
      );
    };

    this.dataSource.sortingDataAccessor = (member, id) => {
      if (id === 'user') {
        return member.name;
      }

      if (id === 'team') {
        return member.teamIds
          .map((teamId) => this.teams()[teamId].name)
          .join(', ');
      }

      return member[id as keyof Member] as string;
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.members();
    });

    effect(() => {
      this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
      this.paginator()?.firstPage();
    });
  }

  private drop(event: CdkDragDrop<Column>) {
    const columns = this.columns();
    moveItemInArray(columns, event.previousIndex, event.currentIndex);
    this.columns.set([...columns]);
  }

  private toggleVisibility(column: Column) {
    if (column.locked) {
      return;
    }

    this.columns.update((columns) =>
      columns.map((c) =>
        c.id === column.id ? { ...c, visible: !c.visible } : c
      )
    );
  }

  private isAllSelected() {
    return (
      this.selection.selected.length === this.dataSource.filteredData.length
    );
  }

  private toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.filteredData.forEach((row) => this.selection.select(row));
    }
  }

  private relativeDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }

  private trackBy(_: number, item: Member) {
    return item.id;
  }
}
