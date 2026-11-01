import { SelectionModel } from '@angular/cdk/collections';
import { I18nPluralPipe, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import {
  FILE_CATEGORIES,
  FILE_KINDS,
  FileItem,
  FileKind,
  FilesService,
} from '@/app/domains/admin/modules/files/data/files';
import { FilesFileDetails } from '@/app/domains/admin/modules/files/features/files/file-details';
import { FilesNewFolder } from '@/app/domains/admin/modules/files/features/files/new-folder';
import { FilesRename } from '@/app/domains/admin/modules/files/features/files/rename';
import { FileSizePipe } from '@/app/domains/admin/modules/files/ui/file-size';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type View = 'all' | 'starred' | 'trash';

type Layout = 'grid' | 'list';

type ViewOption = {
  id: View;
  label: string;
};

type TypeOption = {
  label: string;
  kinds: FileKind[];
};

type SortOption = {
  label: string;
  compare: (a: FileItem, b: FileItem) => number;
};

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'all',
    label: 'All files',
  },
  {
    id: 'starred',
    label: 'Starred',
  },
  {
    id: 'trash',
    label: 'Trash',
  },
];

const TYPE_OPTIONS: TypeOption[] = [
  {
    label: 'All types',
    kinds: [],
  },
  {
    label: 'Folders',
    kinds: ['folder'],
  },
  ...FILE_CATEGORIES.map(({ label, kinds }) => ({ label, kinds })),
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Name',
    compare: (a, b) => a.name.localeCompare(b.name),
  },
  {
    label: 'Last modified',
    compare: (a, b) => b.modifiedAt.localeCompare(a.modifiedAt),
  },
  {
    label: 'Size',
    compare: (a, b) => b.size - a.size,
  },
];

@Component({
  selector: 'files',
  imports: [
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxTrigger,
    FileSizePipe,
    FilesFileDetails,
    FilesNewFolder,
    FilesRename,
    FormsModule,
    I18nPluralPipe,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatCheckbox,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatPrefix,
    MatSuffix,
    MatTableModule,
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 sm:gap-6 lg:p-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-x-3">
        <div class="flex flex-col gap-y-0.5">
          <div class="text-3xl font-semibold tracking-tighter">Files</div>
          <div class="text-neutral-a11 sm:text-lg">
            Shared documents, media and project files for the whole workspace.
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-x-3">
          <button
            matButton
            class="max-sm:icon-only"
            (click)="newFolderOpen.set(true)"
          >
            <mat-icon svgIcon="folder-plus" />
            New folder
          </button>
          <button
            matButton
            class="primary max-sm:icon-only"
            (click)="filesService.upload(folderId() ?? null)"
          >
            <mat-icon svgIcon="upload" />
            Upload
          </button>
        </div>
      </div>

      <!-- Storage -->
      <div
        class="flex flex-col gap-3 rounded-lg border border-neutral-a4 p-3 md:flex-row md:items-center md:gap-6"
      >
        <div class="flex shrink-0 items-center gap-x-2 tabular-nums">
          <mat-icon
            class="size-4 text-neutral-a11"
            svgIcon="hard-drive"
          />
          <div class="text-neutral-a11">
            <span class="font-medium text-neutral-12">{{
              filesService.used() | fileSize
            }}</span>
            of {{ filesService.quota | fileSize }} used
          </div>
        </div>
        <div
          class="flex h-1.5 min-w-0 flex-auto overflow-clip rounded-full bg-neutral-a3"
        >
          @for (category of filesService.storage(); track category.id) {
            <div
              [class]="category.colorClass"
              [style.width.%]="(category.size / filesService.quota) * 100"
            ></div>
          }
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          @for (category of filesService.storage(); track category.id) {
            <div class="flex items-center gap-x-1.5">
              <div
                class="size-2 rounded-full"
                [class]="category.colorClass"
              ></div>
              <span class="text-neutral-a11">{{ category.label }}</span>
              <span class="tabular-nums">{{ category.size | fileSize }}</span>
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col gap-y-3">
        <!-- Breadcrumb, Search & Sort -->
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <!-- Breadcrumb -->
          <nav
            class="flex min-w-0 flex-auto flex-wrap items-center gap-x-1.5 gap-y-1"
            aria-label="Breadcrumb"
          >
            <a
              matButton
              class="link"
              routerLink="/files"
              [class.text-neutral-a11]="path().length"
            >
              Home
            </a>
            @for (folder of path(); track folder.id; let last = $last) {
              <mat-icon
                class="size-4 text-neutral-a8"
                svgIcon="chevron-right"
              />
              <a
                matButton
                class="link"
                [class.text-neutral-a11]="!last"
                [routerLink]="['/files', folder.id]"
              >
                {{ folder.name }}
              </a>
            }
          </nav>

          <div class="flex w-full items-center gap-x-2 md:w-auto">
            <!-- Search -->
            <mat-form-field class="w-full md:w-64">
              <mat-icon
                svgIcon="search"
                matIconPrefix
              />
              <input
                matInput
                placeholder="Search files"
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

            <!-- Sort -->
            <div
              buiCombobox
              class="w-fit"
              [value]="[sort()]"
              (valueChange)="sort.set($event[0] ?? sort())"
            >
              <button
                matButton
                buiComboboxTrigger
                class="min-h-8 max-sm:icon-only"
                id="files-sort"
              >
                <mat-icon svgIcon="arrow-down-up" />
                {{ sort().label }}
                <mat-icon
                  svgIcon="chevron-down"
                  class="max-sm:hidden"
                  iconPositionEnd
                />
              </button>
              <ng-template
                buiComboboxPortal
                position="bottom-end"
                matchWidth="false"
              >
                <div
                  buiComboboxContent
                  class="min-w-40"
                >
                  <div
                    buiComboboxListbox
                    aria-labelledby="files-sort"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of sortOptions; track option.label) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.label"
                      >
                        <span class="flex-auto">{{ option.label }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>

            <!-- Layout -->
            <mat-button-toggle-group
              class="segmented shrink-0"
              name="layout"
              [value]="layout()"
              (valueChange)="layout.set($event)"
            >
              <mat-button-toggle value="grid">
                <mat-icon svgIcon="layout-grid" />
                <span class="hidden sm:flex">Grid</span>
              </mat-button-toggle>
              <mat-button-toggle value="list">
                <mat-icon svgIcon="list" />
                <span class="hidden sm:flex">List</span>
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>
        </div>

        <!-- Filters -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-neutral-a4 pt-3"
        >
          <!-- View filter -->
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [value]="[view()]"
              (valueChange)="view.set($event[0] ?? view())"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="files-view-filter"
              >
                <span class="font-medium">
                  View:
                  <span class="font-normal">{{ view().label }}</span>
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
                    aria-labelledby="files-view-filter"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of viewOptions; track option.id) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.label"
                      >
                        <span class="flex-auto">{{ option.label }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Type filter -->
          <div class="flex items-center rounded-lg bg-neutral-a3">
            <div
              buiCombobox
              class="w-fit"
              [value]="[type()]"
              (valueChange)="type.set($event[0] ?? type())"
            >
              <button
                matButton
                class="tertiary tiny hover:bg-neutral-a4"
                buiComboboxTrigger
                id="files-type-filter"
              >
                <span class="font-medium">
                  Type:
                  <span class="font-normal">{{ type().label }}</span>
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
                    aria-labelledby="files-type-filter"
                    focusMode="activedescendant"
                    selectionMode="explicit"
                  >
                    @for (option of typeOptions; track option.label) {
                      <div
                        buiComboboxOption
                        [value]="option"
                        [label]="option.label"
                      >
                        <span class="flex-auto">{{ option.label }}</span>
                        <span buiComboboxOptionIndicator></span>
                      </div>
                    }
                  </div>
                </div>
              </ng-template>
            </div>
          </div>

          @if (view() !== viewOptions[0] || type() !== typeOptions[0]) {
            <button
              matButton
              class="tertiary tiny"
              (click)="clearFilters()"
            >
              Clear all
            </button>
          }
        </div>

        @if (layout() === 'grid') {
          @if (results().length) {
            <div class="flex flex-col gap-y-6 border-t border-neutral-a4 pt-3">
              <!-- Folders -->
              @if (folders().length) {
                <div class="flex flex-col gap-y-3">
                  <div class="font-medium">Folders</div>
                  <div class="@container">
                    <div
                      class="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4"
                    >
                      @for (folder of folders(); track folder.id) {
                        <mat-card
                          appearance="filled"
                          class="flex flex-row items-center"
                        >
                          <mat-card-content
                            class="flex min-w-0 flex-auto cursor-pointer items-center gap-x-3 py-3"
                            role="button"
                            tabindex="0"
                            (click)="open(folder)"
                            (keydown.enter)="open(folder)"
                          >
                            <div
                              class="flex size-9 shrink-0 items-center justify-center rounded-lg"
                              [class]="kind(folder).colorClass"
                            >
                              <mat-icon
                                class="size-4.5"
                                [svgIcon]="kind(folder).icon"
                              />
                            </div>
                            <div class="flex min-w-0 flex-col">
                              <div class="flex items-center gap-x-1.5">
                                <div class="truncate font-medium">
                                  {{ folder.name }}
                                </div>
                                @if (folder.starred) {
                                  <mat-icon
                                    class="size-3.5 shrink-0 text-amber-a10"
                                    svgIcon="star"
                                  />
                                }
                              </div>
                              <div
                                class="truncate text-sm text-neutral-a11 tabular-nums"
                              >
                                {{ folder.count | i18nPlural: itemPlural }}
                              </div>
                            </div>
                          </mat-card-content>
                          <button
                            matIconButton
                            class="tiny mx-1.5 shrink-0"
                            [matMenuTriggerFor]="itemMenu"
                            [matMenuTriggerData]="{ item: folder }"
                          >
                            <mat-icon svgIcon="ellipsis-vertical" />
                          </button>
                        </mat-card>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Files -->
              @if (files().length) {
                <div class="flex flex-col gap-y-3">
                  <div class="font-medium">Files</div>
                  <div class="@container">
                    <div
                      class="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4"
                    >
                      @for (file of files(); track file.id) {
                        <mat-card
                          appearance="filled"
                          class="flex flex-col"
                        >
                          <mat-card-content
                            class="flex flex-auto cursor-pointer flex-col gap-y-3"
                            role="button"
                            tabindex="0"
                            (click)="open(file)"
                            (keydown.enter)="open(file)"
                          >
                            <div
                              class="relative flex aspect-video min-w-0 items-center justify-center overflow-clip rounded-md"
                              [class]="kind(file).colorClass"
                            >
                              @if (file.preview) {
                                <img
                                  class="object-cover"
                                  fill
                                  [ngSrc]="file.preview"
                                  [alt]="file.name"
                                />
                              } @else {
                                <mat-icon
                                  class="size-8"
                                  [svgIcon]="kind(file).icon"
                                />
                              }
                            </div>
                            <div class="flex min-w-0 items-center gap-x-1.5">
                              <div class="truncate font-medium">
                                {{ file.name }}
                              </div>
                              @if (file.starred) {
                                <mat-icon
                                  class="size-3.5 shrink-0 text-amber-a10"
                                  svgIcon="star"
                                />
                              }
                            </div>
                          </mat-card-content>

                          <mat-card-footer class="items-center px-3 py-2">
                            <div
                              class="min-w-0 flex-auto truncate text-sm text-neutral-a11 tabular-nums"
                            >
                              {{ file.size | fileSize }} ·
                              {{ relativeDate(file.modifiedAt) }}
                            </div>
                            <button
                              matIconButton
                              class="tiny shrink-0"
                              [matMenuTriggerFor]="itemMenu"
                              [matMenuTriggerData]="{ item: file }"
                            >
                              <mat-icon svgIcon="ellipsis-vertical" />
                            </button>
                          </mat-card-footer>
                        </mat-card>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div
              class="flex flex-col items-center justify-center gap-y-2 border-t border-neutral-a4 py-10"
            >
              <mat-icon
                class="size-10"
                [svgIcon]="empty().icon"
              />
              <div class="text-center text-neutral-a11">
                {{ empty().text }}
              </div>
            </div>
          }
        } @else {
          <!-- Table -->
          <div class="flex flex-col">
            <div class="relative">
              <div
                class="relative isolate overflow-x-visible overflow-y-hidden"
              >
                <table
                  class="whitespace-nowrap"
                  mat-table
                  [dataSource]="results()"
                  [trackBy]="trackBy"
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
                        [indeterminate]="
                          selection.hasValue() && !isAllSelected()
                        "
                        (change)="toggleAllRows()"
                      >
                      </mat-checkbox>
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let row"
                    >
                      <mat-checkbox
                        [checked]="selection.isSelected(row.id)"
                        (click)="$event.stopPropagation()"
                        (change)="selection.toggle(row.id)"
                      >
                      </mat-checkbox>
                    </td>
                  </ng-container>

                  <!-- Name column -->
                  <ng-container matColumnDef="name">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Name
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let row"
                    >
                      <div class="flex items-center gap-x-2.5 py-1.5">
                        <div
                          class="flex size-7 shrink-0 items-center justify-center rounded-md"
                          [class]="kind(row).colorClass"
                        >
                          <mat-icon
                            class="size-4"
                            [svgIcon]="kind(row).icon"
                          />
                        </div>
                        <div class="font-medium">{{ row.name }}</div>
                        @if (row.starred) {
                          <mat-icon
                            class="size-3.5 shrink-0 text-amber-a10"
                            svgIcon="star"
                          />
                        }
                      </div>
                    </td>
                  </ng-container>

                  <!-- Owner column -->
                  <ng-container matColumnDef="owner">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Owner
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let row"
                    >
                      @if (membersService.byId(row.ownerId); as member) {
                        <div class="flex items-center gap-x-2">
                          <img
                            class="shrink-0 rounded-full object-cover"
                            width="24"
                            height="24"
                            [ngSrc]="member.photo"
                            [alt]="member.name"
                          />
                          {{ member.name }}
                        </div>
                      }
                    </td>
                  </ng-container>

                  <!-- Modified column -->
                  <ng-container matColumnDef="modified">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Modified
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let row"
                    >
                      {{ relativeDate(row.modifiedAt) }}
                    </td>
                  </ng-container>

                  <!-- Size column -->
                  <ng-container matColumnDef="size">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                    >
                      Size
                    </th>
                    <td
                      class="tabular-nums"
                      mat-cell
                      *matCellDef="let row"
                    >
                      {{ row.size | fileSize }}
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
                        [matMenuTriggerFor]="itemMenu"
                        [matMenuTriggerData]="{ item: row }"
                        (click)="$event.stopPropagation()"
                      >
                        <mat-icon svgIcon="ellipsis-vertical" />
                      </button>
                    </td>
                  </ng-container>

                  <ng-template matNoDataRow>
                    <tr>
                      <td [attr.colspan]="columnIds.length">
                        <div
                          class="flex flex-col items-center justify-center gap-y-2 py-10"
                        >
                          <mat-icon
                            class="size-10"
                            [svgIcon]="empty().icon"
                          />
                          <div class="text-center text-neutral-a11">
                            {{ empty().text }}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </ng-template>

                  <!-- Header row definition -->
                  <tr
                    mat-header-row
                    *matHeaderRowDef="columnIds"
                  ></tr>

                  <!-- Row definition -->
                  <tr
                    class="cursor-pointer hover:bg-neutral-a2"
                    mat-row
                    *matRowDef="let row; columns: columnIds"
                    (click)="open(row)"
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
                    @if (view().id === 'trash') {
                      <button
                        matButton
                        class="small"
                        (click)="filesService.restore(selection.selected)"
                      >
                        <mat-icon svgIcon="rotate-ccw" />
                        Restore
                      </button>
                      <button
                        matButton
                        class="small destructive"
                        (click)="filesService.delete(selection.selected)"
                      >
                        <mat-icon svgIcon="trash" />
                        Delete permanently
                      </button>
                    } @else {
                      <button
                        matButton
                        class="small"
                        (click)="filesService.star(selection.selected, true)"
                      >
                        <mat-icon svgIcon="star" />
                        Star
                      </button>
                      <button
                        matButton
                        class="small destructive"
                        (click)="filesService.trash(selection.selected)"
                      >
                        <mat-icon svgIcon="trash" />
                        Move to trash
                      </button>
                    }
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
          </div>
        }
      </div>
    </div>

    <!-- Item menu -->
    <mat-menu
      xPosition="before"
      #itemMenu="matMenu"
    >
      <ng-template
        matMenuContent
        let-item="item"
      >
        @if (item.trashed) {
          <button
            mat-menu-item
            (click)="filesService.restore([item.id])"
          >
            <mat-icon svgIcon="rotate-ccw" />
            Restore
          </button>
          <mat-divider />
          <button
            mat-menu-item
            class="text-red-a11 hover:bg-red-a3"
            (click)="filesService.delete([item.id])"
          >
            <mat-icon
              class="text-red-a11"
              svgIcon="trash"
            />
            Delete permanently
          </button>
        } @else {
          <button
            mat-menu-item
            (click)="renaming.set(item)"
          >
            <mat-icon svgIcon="pencil" />
            Rename
          </button>
          <button
            mat-menu-item
            (click)="filesService.star([item.id], !item.starred)"
          >
            <mat-icon [svgIcon]="item.starred ? 'star-off' : 'star'" />
            {{ item.starred ? 'Unstar' : 'Star' }}
          </button>
          <mat-divider />
          <button
            mat-menu-item
            class="text-red-a11 hover:bg-red-a3"
            (click)="filesService.trash([item.id])"
          >
            <mat-icon
              class="text-red-a11"
              svgIcon="trash"
            />
            Move to trash
          </button>
        }
      </ng-template>
    </mat-menu>

    <!-- Details -->
    <files-file-details [(id)]="selected" />

    <!-- New folder -->
    <files-new-folder
      [(open)]="newFolderOpen"
      [parentId]="folderId() ?? null"
    />

    <!-- Rename -->
    <files-rename [(item)]="renaming" />
  `,
})
export default class Files {
  // Dependencies
  private filesService = inject(FilesService);
  private membersService = inject(MembersService);
  private router = inject(Router);

  // Inputs / Outputs
  readonly folderId = input<string>();

  // State
  private itemPlural = { '=1': '# item', other: '# items' };
  private viewOptions = VIEW_OPTIONS;
  private typeOptions = TYPE_OPTIONS;
  private sortOptions = SORT_OPTIONS;
  private columnIds = [
    'select',
    'name',
    'owner',
    'modified',
    'size',
    'actions',
  ];
  private layout = signal<Layout>('grid');
  private search = linkedSignal({
    source: this.folderId,
    computation: () => '',
  });
  private view = linkedSignal({
    source: this.folderId,
    computation: () => VIEW_OPTIONS[0],
  });
  private type = signal(TYPE_OPTIONS[0]);
  private sort = signal(SORT_OPTIONS[0]);
  private selected = signal<string | null>(null);
  private renaming = signal<FileItem | null>(null);
  private newFolderOpen = signal(false);
  private selection = new SelectionModel<string>(true, []);

  // Computed state
  private path = computed(() =>
    this.filesService.path(this.folderId() ?? null)
  );
  private results = computed(() => {
    const folderId = this.folderId() ?? null;
    const search = this.search().trim().toLowerCase();
    const view = this.view().id;
    const kinds = this.type().kinds;
    const flat = !!search || view !== 'all';

    return this.filesService
      .items()
      .filter(
        (item) =>
          (flat
            ? !folderId ||
              this.filesService
                .path(item.parentId)
                .some((folder) => folder.id === folderId)
            : item.parentId === folderId) &&
          (view === 'trash'
            ? item.trashed
            : !(flat ? this.filesService.isTrashed(item) : item.trashed) &&
              (view === 'all' || item.starred)) &&
          (!search || item.name.toLowerCase().includes(search)) &&
          (!kinds.length || kinds.includes(item.kind))
      )
      .sort(
        (a, b) =>
          Number(b.kind === 'folder') - Number(a.kind === 'folder') ||
          this.sort().compare(a, b)
      );
  });
  private folders = computed(() =>
    this.results().filter((item) => item.kind === 'folder')
  );
  private files = computed(() =>
    this.results().filter((item) => item.kind !== 'folder')
  );
  private empty = computed(() => {
    if (this.search() || this.type().kinds.length) {
      return { icon: 'search', text: 'No files match this view.' };
    }

    if (this.view().id === 'trash') {
      return { icon: 'trash', text: 'Trash is empty.' };
    }

    if (this.view().id === 'starred') {
      return { icon: 'star', text: 'No starred files here yet.' };
    }

    return { icon: 'folder-open', text: 'This folder is empty.' };
  });

  constructor() {
    // Bulk actions only reach rows still on screen
    effect(() => {
      this.results();
      this.selection.clear();
    });
  }

  private open(item: FileItem) {
    if (item.kind === 'folder') {
      this.router.navigate(['/files', item.id]);
    } else {
      this.selected.set(item.id);
    }
  }

  private kind(item: FileItem) {
    return FILE_KINDS[item.kind];
  }

  private clearFilters() {
    this.view.set(VIEW_OPTIONS[0]);
    this.type.set(TYPE_OPTIONS[0]);
  }

  private isAllSelected() {
    return this.selection.selected.length === this.results().length;
  }

  private toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.results().map((item) => item.id));
    }
  }

  private relativeDate(date: string) {
    return differenceInMinutes(new Date(), date) < 1
      ? 'Just now'
      : `${formatDistanceToNowStrict(date)} ago`;
  }

  private trackBy(_: number, item: FileItem) {
    return item.id;
  }
}
