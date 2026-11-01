import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
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
import { RouterLink } from '@angular/router';
import { format, isToday } from 'date-fns';
import { Media } from '@/app/core/media';
import {
  Agent,
  AgentsService,
} from '@/app/domains/admin/modules/agents/data/agents';
import {
  HelpArticle,
  HelpArticleStatus,
  HelpCategory,
  HelpCenterService,
  STATUSES,
} from '@/app/domains/admin/modules/help-center/data/help-center';
import HelpCenterLayout from '@/app/domains/admin/modules/help-center/layout';
import { ArticleStatusPill } from '@/app/domains/admin/modules/help-center/ui/pills';
import {
  BuiCombobox,
  BuiComboboxContent,
  BuiComboboxEmpty,
  BuiComboboxListbox,
  BuiComboboxOption,
  BuiComboboxOptionIndicator,
  BuiComboboxPortal,
  BuiComboboxSearch,
  BuiComboboxTrigger,
} from '@/app/ui/combobox';

type ArticleRow = HelpArticle & {
  category: HelpCategory;
  author: Agent;
};

@Component({
  selector: 'help-center-articles',
  imports: [
    ArticleStatusPill,
    BuiCombobox,
    BuiComboboxContent,
    BuiComboboxEmpty,
    BuiComboboxListbox,
    BuiComboboxOption,
    BuiComboboxOptionIndicator,
    BuiComboboxPortal,
    BuiComboboxSearch,
    BuiComboboxTrigger,
    DecimalPipe,
    FormsModule,
    MatButton,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPaginator,
    MatPrefix,
    MatSort,
    MatSortHeader,
    MatSuffix,
    MatTableModule,
    NgOptimizedImage,
    RouterLink,
  ],
  template: `
    <div class="flex w-full min-w-0 flex-auto flex-col gap-y-5 p-5">
      <!-- Header -->
      <div class="flex flex-col gap-y-4">
        <!-- Title -->
        <div class="flex items-center justify-between gap-x-3">
          <div class="flex min-w-0 flex-col gap-y-3">
            @if (layout.isNarrow()) {
              <button
                matButton
                class="tertiary tiny -ms-1.5 w-fit"
                (click)="layout.toggle()"
              >
                <mat-icon svgIcon="panel-left" />
                Help center
              </button>
            }
            <div class="flex min-w-0 flex-col gap-y-0.5">
              <div class="text-2xl font-semibold tracking-tighter">
                {{ category()?.name ?? 'All articles' }}
              </div>
              <div class="text-neutral-a11">
                {{
                  category()?.description ??
                    'Every article in your help center.'
                }}
              </div>
            </div>
          </div>

          <!-- New article -->
          <a
            matButton
            class="primary max-sm:icon-only"
            routerLink="/help-center/article/new"
            [queryParams]="{ category: id() }"
          >
            <mat-icon svgIcon="file-plus" />
            New article
          </a>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Search -->
          <mat-form-field
            class="min-w-0 flex-auto max-sm:basis-full sm:max-w-72"
          >
            <mat-icon
              svgIcon="search"
              matIconPrefix
            />
            <input
              matInput
              placeholder="Search articles"
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

          <!-- Status filter -->
          <div
            buiCombobox
            class="w-fit"
            [(value)]="statuses"
          >
            <button
              matButton
              buiComboboxTrigger
              id="articles-status-filter"
            >
              <span class="inline-flex items-center gap-x-1.5">
                Status
                @if (statuses().length) {
                  <span
                    class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11"
                  >
                    {{ statuses().length }}
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
                  aria-labelledby="articles-status-filter"
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
                      <span class="flex-auto">
                        <article-status-pill [status]="option.id" />
                      </span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  }
                </div>
                @if (statuses().length) {
                  <mat-divider />
                  <button
                    matButton
                    class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                    (click)="statuses.set([])"
                  >
                    <mat-icon svgIcon="x" />
                    Clear filter
                  </button>
                }
              </div>
            </ng-template>
          </div>

          <!-- Author filter -->
          <div
            buiCombobox
            class="w-fit"
            [(value)]="authors"
            (expandedChange)="authorQuery.set('')"
          >
            <button
              matButton
              buiComboboxTrigger
              id="articles-author-filter"
            >
              <span class="inline-flex items-center gap-x-1.5">
                Author
                @if (authors().length) {
                  <span
                    class="rounded-sm bg-neutral-a3 px-1.5 py-px text-xs font-medium text-neutral-a11"
                  >
                    {{ authors().length }}
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
                <input
                  buiComboboxSearch
                  autocomplete="off"
                  placeholder="Search agents"
                  [value]="authorQuery()"
                  (input)="authorQuery.set(authorSearch.value)"
                  #authorSearch
                />
                <div
                  buiComboboxListbox
                  aria-labelledby="articles-author-filter"
                  multi
                  focusMode="activedescendant"
                  selectionMode="explicit"
                >
                  @for (agent of authorResults(); track agent.id) {
                    <div
                      buiComboboxOption
                      [value]="agent.id"
                      [label]="agent.name"
                    >
                      <img
                        class="size-5 shrink-0 rounded-full object-cover"
                        width="20"
                        height="20"
                        [ngSrc]="agent.photo"
                        [alt]="agent.name"
                      />
                      <span class="flex-auto">{{ agent.name }}</span>
                      <span buiComboboxOptionIndicator></span>
                    </div>
                  } @empty {
                    <div buiComboboxEmpty>No agents found</div>
                  }
                </div>
                @if (authors().length) {
                  <mat-divider />
                  <button
                    matButton
                    class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"
                    (click)="authors.set([])"
                  >
                    <mat-icon svgIcon="x" />
                    Clear filter
                  </button>
                }
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="flex flex-col gap-y-1">
        <mat-divider />

        <div class="-mx-3 flex flex-col">
          <div class="relative isolate overflow-x-visible overflow-y-hidden">
            <table
              class="border-spacing-y-1 whitespace-nowrap [--table-body-border-color:transparent] [--table-body-row-height:--spacing(14)] [--table-header-border-color:transparent]"
              mat-table
              [dataSource]="dataSource"
              [trackBy]="trackBy"
              matSort
              matSortActive="updatedAt"
              matSortDirection="desc"
            >
              <!-- Title column -->
              <ng-container matColumnDef="title">
                <th
                  class="w-full"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Title
                </th>
                <td
                  class="w-full max-w-0 min-w-64"
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex flex-col py-1.5">
                    <div class="truncate font-medium">{{ row.title }}</div>
                    <div class="truncate text-sm text-neutral-a11">
                      {{ row.excerpt }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Category column -->
              <ng-container matColumnDef="category">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Category
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2">
                    <mat-icon
                      class="size-4 shrink-0 text-neutral-a11"
                      [svgIcon]="row.category.icon"
                    />
                    {{ row.category.name }}
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
                  <article-status-pill [status]="row.status" />
                </td>
              </ng-container>

              <!-- Author column -->
              <ng-container matColumnDef="author">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Author
                </th>
                <td
                  mat-cell
                  *matCellDef="let row"
                >
                  <div class="flex items-center gap-x-2">
                    <img
                      class="size-6 shrink-0 rounded-full object-cover"
                      width="24"
                      height="24"
                      [ngSrc]="row.author.photo"
                      [alt]="row.author.name"
                    />
                    {{ row.author.name }}
                  </div>
                </td>
              </ng-container>

              <!-- Views column -->
              <ng-container matColumnDef="views">
                <th
                  class="text-end"
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                  arrowPosition="before"
                >
                  Views
                </th>
                <td
                  class="text-end tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ row.views | number }}
                </td>
              </ng-container>

              <!-- Updated column -->
              <ng-container matColumnDef="updatedAt">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                >
                  Updated
                </th>
                <td
                  class="tabular-nums"
                  mat-cell
                  *matCellDef="let row"
                >
                  {{ time(row.updatedAt) }}
                </td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th
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
                    [matMenuTriggerFor]="articleActions"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                  <mat-menu
                    xPosition="before"
                    #articleActions="matMenu"
                  >
                    @if (row.status === 'published') {
                      <button
                        mat-menu-item
                        (click)="helpCenterService.setStatus(row.id, 'draft')"
                      >
                        <mat-icon svgIcon="eye-off" />
                        Unpublish
                      </button>
                    } @else {
                      <button
                        mat-menu-item
                        (click)="
                          helpCenterService.setStatus(row.id, 'published')
                        "
                      >
                        <mat-icon svgIcon="send" />
                        Publish
                      </button>
                    }
                    @if (row.status !== 'archived') {
                      <button
                        mat-menu-item
                        (click)="
                          helpCenterService.setStatus(row.id, 'archived')
                        "
                      >
                        <mat-icon svgIcon="archive" />
                        Archive
                      </button>
                    }
                    <mat-divider />
                    <button
                      mat-menu-item
                      class="text-red-a11 hover:bg-red-a3"
                      (click)="helpCenterService.remove(row.id)"
                    >
                      <mat-icon
                        class="text-red-a11"
                        svgIcon="trash"
                      />
                      Delete
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
                        svgIcon="book-open"
                      />
                      <div class="text-center text-neutral-a11">
                        {{
                          search() || statuses().length || authors().length
                            ? 'No articles match your search.'
                            : 'No articles yet.'
                        }}
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-template>

              <!-- Header row definition -->
              <tr
                class="*:not-first:ps-6 *:first:ps-3 *:last:pe-3"
                mat-header-row
                *matHeaderRowDef="columnIds()"
              ></tr>

              <!-- Row definition -->
              <!-- Hover tile: cells paint the background, end cells round it -->
              <tr
                class="cursor-pointer *:not-first:ps-6 *:first:rounded-s-lg *:first:ps-3 *:last:rounded-e-lg *:last:pe-3 hover:*:bg-neutral-a3"
                mat-row
                *matRowDef="let row; columns: columnIds()"
                [routerLink]="['/help-center/article', row.id]"
              ></tr>
            </table>
          </div>
          <mat-paginator
            class="px-3 py-2"
            [pageSize]="25"
            [pageSizeOptions]="[10, 25, 50]"
          />
        </div>
      </div>
    </div>
  `,
})
export default class Articles {
  // Dependencies
  private agentsService = inject(AgentsService);
  private helpCenterService = inject(HelpCenterService);
  private layout = inject(HelpCenterLayout);
  private media = inject(Media);

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // Inputs / Outputs
  readonly id = input<string>();

  // State
  private statusOptions = STATUSES;
  private search = signal('');
  private statuses = signal<HelpArticleStatus[]>([]);
  private authors = signal<string[]>([]);
  private authorQuery = signal('');
  private dataSource = new MatTableDataSource<ArticleRow>([]);
  private isCompact = this.media.match(`(width < 64rem)`);
  private isMobile = this.media.match(`(width < 48rem)`);

  // Computed state
  private category = computed(() => {
    const id = this.id();
    return id ? this.helpCenterService.categoryById(id) : null;
  });
  private columnIds = computed(() =>
    [
      'title',
      'category',
      'status',
      'author',
      'views',
      'updatedAt',
      'actions',
    ].filter(
      (columnId) =>
        !(this.id() && columnId === 'category') &&
        !(this.isCompact() && ['views', 'updatedAt'].includes(columnId)) &&
        !(this.isMobile() && ['author', 'category'].includes(columnId))
    )
  );
  private authorResults = computed(() =>
    this.agentsService
      .agents()
      .filter((agent) =>
        agent.name.toLowerCase().includes(this.authorQuery().toLowerCase())
      )
  );
  private articles = computed(() => {
    const id = this.id();
    const search = this.search().trim().toLowerCase();
    const statuses = this.statuses();
    const authors = this.authors();

    return (
      id
        ? this.helpCenterService.byCategory(id)
        : this.helpCenterService.articles()
    )
      .filter(
        (article) =>
          (!statuses.length || statuses.includes(article.status)) &&
          (!authors.length || authors.includes(article.authorId)) &&
          (!search ||
            [article.title, article.excerpt, article.slug].some((text) =>
              text.toLowerCase().includes(search)
            ))
      )
      .map((article): ArticleRow => ({
        ...article,
        category: this.helpCenterService.categoryById(article.categoryId)!,
        author: this.agentsService.byId(article.authorId)!,
      }));
  });

  constructor() {
    this.dataSource.sortingDataAccessor = (article, id) => {
      if (id === 'category') {
        return article.category.name;
      }

      if (id === 'author') {
        return article.author.name;
      }

      return article[id as keyof ArticleRow] as string | number;
    };

    afterNextRender(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });

    effect(() => {
      this.dataSource.data = this.articles();
      this.paginator()?.firstPage();
    });
  }

  private trackBy(_: number, item: ArticleRow) {
    return item.id;
  }

  private time(date: string) {
    return format(date, isToday(date) ? 'h:mm a' : 'MMM d');
  }
}
