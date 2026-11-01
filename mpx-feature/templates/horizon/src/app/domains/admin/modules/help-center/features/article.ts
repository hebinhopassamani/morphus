import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Media } from '@/app/core/media';
import {
  AgentsService,
  ME,
} from '@/app/domains/admin/modules/agents/data/agents';
import { HelpCenterService } from '@/app/domains/admin/modules/help-center/data/help-center';
import { HelpMarkdown } from '@/app/domains/admin/modules/help-center/ui/markdown';
import { ArticleStatusPill } from '@/app/domains/admin/modules/help-center/ui/pills';

const TOOLS = [
  {
    label: 'Bold',
    icon: 'bold',
    before: '**',
    after: '**',
  },
  {
    label: 'Italic',
    icon: 'italic',
    before: '_',
    after: '_',
  },
  {
    label: 'Heading',
    icon: 'heading',
    before: '## ',
    after: '',
  },
  {
    label: 'List',
    icon: 'list',
    before: '- ',
    after: '',
  },
  {
    label: 'Link',
    icon: 'link',
    before: '[',
    after: '](https://example.com)',
  },
  {
    label: 'Code',
    icon: 'code',
    before: '`',
    after: '`',
  },
];

@Component({
  selector: 'help-center-article',
  imports: [
    ArticleStatusPill,
    CdkTextareaAutosize,
    DatePipe,
    DecimalPipe,
    FormField,
    HelpMarkdown,
    MatButton,
    MatCard,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatOption,
    MatSelect,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatTooltip,
    NgOptimizedImage,
    RouterLink,
  ],
  host: {
    class: '@container flex h-dvh min-w-0 flex-col',
  },
  template: `
    <!-- Header -->
    <header
      class="mx-5 flex items-center gap-2 border-b border-neutral-a4 py-4"
    >
      <!-- Title -->
      <div class="-ms-2 flex min-w-0 flex-auto items-center gap-x-2">
        <a
          matIconButton
          matTooltip="Articles"
          routerLink="/help-center"
        >
          <mat-icon svgIcon="arrow-left" />
        </a>
        <input
          class="w-full min-w-0 truncate bg-transparent text-2xl font-semibold tracking-tighter outline-none placeholder:text-neutral-a9"
          placeholder="Article title"
          aria-label="Title"
          [formField]="articleForm.title"
        />
      </div>

      <!-- Actions -->
      <div class="ms-auto -me-2 flex shrink-0 items-center gap-x-2">
        <!-- Save -->
        <div class="button-group">
          <button
            matButton
            class="primary @max-2xl:icon-only"
            [disabled]="!draft().title.trim()"
            (click)="save()"
          >
            <mat-icon svgIcon="save" />
            {{ article() ? 'Update' : 'Save' }}
          </button>
          <button
            matButton
            class="primary"
            [disabled]="!article()"
            [matMenuTriggerFor]="statusMenu"
          >
            <mat-icon svgIcon="chevron-down" />
          </button>
        </div>

        <!-- Properties toggle -->
        <button
          matIconButton
          matTooltip="Properties"
          (click)="details.update((open) => !open)"
        >
          <mat-icon svgIcon="panel-right" />
        </button>
      </div>
    </header>

    <mat-menu
      xPosition="before"
      #statusMenu
    >
      @if (article(); as article) {
        @if (article.status === 'archived') {
          <button
            mat-menu-item
            (click)="helpCenterService.setStatus(article.id, 'draft')"
          >
            <mat-icon svgIcon="archive-restore" />
            Restore as draft
          </button>
        }
        @if (article.status === 'published') {
          <button
            mat-menu-item
            (click)="helpCenterService.setStatus(article.id, 'draft')"
          >
            <mat-icon svgIcon="undo-2" />
            Unpublish
          </button>
        } @else {
          <button
            mat-menu-item
            (click)="helpCenterService.setStatus(article.id, 'published')"
          >
            <mat-icon svgIcon="send" />
            Publish
          </button>
        }
        @if (article.status !== 'archived') {
          <mat-divider />
          <button
            mat-menu-item
            class="text-red-a11 hover:bg-red-a3"
            (click)="helpCenterService.setStatus(article.id, 'archived')"
          >
            <mat-icon
              class="text-red-a11"
              svgIcon="archive"
            />
            Archive
          </button>
        }
      }
    </mat-menu>

    <mat-sidenav-container
      class="min-h-0 flex-auto bg-transparent"
      [hasBackdrop]="false"
    >
      <!-- Properties -->
      <mat-sidenav
        class="w-80 bg-transparent max-lg:border-s max-lg:border-neutral-a4 max-lg:bg-neutral-2"
        position="end"
        [mode]="isCompact() ? 'over' : 'side'"
        [opened]="details()"
        [disableClose]="!isCompact()"
        (closedStart)="details.set(false)"
      >
        <aside class="flex min-w-0 flex-auto flex-col gap-y-6 p-5">
          <div class="flex flex-col gap-y-4">
            <mat-form-field>
              <mat-label>Category</mat-label>
              <mat-select [formField]="articleForm.categoryId">
                @for (category of categories(); track category.id) {
                  <mat-option [value]="category.id">
                    {{ category.name }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Slug</mat-label>
              <input
                matInput
                [formField]="articleForm.slug"
              />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Excerpt</mat-label>
              <textarea
                matInput
                cdkTextareaAutosize
                cdkAutosizeMinRows="3"
                [formField]="articleForm.excerpt"
              ></textarea>
            </mat-form-field>
          </div>

          <mat-divider />

          <!-- Details -->
          <div class="flex flex-col gap-y-2">
            <div class="font-medium">Details</div>
            <div class="flex items-center gap-x-2">
              <mat-icon
                class="size-4 shrink-0 text-neutral-a11"
                svgIcon="circle-dot"
              />
              <article-status-pill [status]="article()?.status ?? 'draft'" />
            </div>
            <div class="flex items-center gap-x-2">
              <img
                class="size-4 shrink-0 rounded-full object-cover"
                width="16"
                height="16"
                [ngSrc]="author().photo"
                [alt]="author().name"
              />
              <div class="truncate">{{ author().name }}</div>
            </div>
            @if (article(); as article) {
              <div class="flex items-center gap-x-2">
                <mat-icon
                  class="size-4 shrink-0 text-neutral-a11"
                  svgIcon="calendar"
                />
                <div class="truncate">
                  Created {{ article.createdAt | date: 'MMM d, y' }}
                </div>
              </div>
              <div class="flex items-center gap-x-2">
                <mat-icon
                  class="size-4 shrink-0 text-neutral-a11"
                  svgIcon="clock"
                />
                <div class="truncate">
                  Updated {{ article.updatedAt | date: 'MMM d, y, h:mm a' }}
                </div>
              </div>
              <div class="flex items-center gap-x-2">
                <mat-icon
                  class="size-4 shrink-0 text-neutral-a11"
                  svgIcon="eye"
                />
                <div class="truncate">{{ article.views | number }} views</div>
              </div>
            }
          </div>
        </aside>
      </mat-sidenav>

      <mat-sidenav-content class="bg-transparent">
        <div class="flex min-h-full flex-col p-5">
          <mat-card
            class="flex flex-auto flex-col [--card-gap-y:0] [--card-padding:0] lg:flex-row"
          >
            <!-- Editor -->
            <div
              class="flex min-w-0 flex-col border-b border-neutral-a4 lg:flex-1 lg:border-e lg:border-b-0"
            >
              <div class="flex h-8 items-center gap-x-0.5 px-2 pt-2">
                @for (tool of tools; track tool.label) {
                  <button
                    matIconButton
                    class="tiny"
                    [matTooltip]="tool.label"
                    (click)="insert(textarea, tool.before, tool.after)"
                  >
                    <mat-icon [svgIcon]="tool.icon" />
                  </button>
                }
                <div
                  class="ms-auto inline-flex items-center rounded-full border border-neutral-a6 bg-neutral-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-neutral-a11"
                >
                  Editor
                </div>
              </div>
              <textarea
                class="mt-2 flex-auto resize-none bg-transparent px-4 pb-4 font-mono text-sm outline-none"
                cdkTextareaAutosize
                cdkAutosizeMinRows="16"
                placeholder="Write in Markdown"
                aria-label="Body"
                [formField]="articleForm.body"
                #textarea
              ></textarea>
            </div>

            <!-- Preview -->
            <div class="min-w-0 lg:flex-1">
              <div class="flex h-8 items-center gap-x-0.5 px-2 pt-2">
                <div
                  class="ms-auto inline-flex items-center rounded-full border border-neutral-a6 bg-neutral-a3 px-2 py-px text-xs font-medium whitespace-nowrap text-neutral-a11"
                >
                  Preview
                </div>
              </div>
              <help-markdown
                class="block px-8 pt-2 pb-4"
                [md]="draft().body"
              />
            </div>
          </mat-card>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export default class Article {
  // Dependencies
  private agentsService = inject(AgentsService);
  private helpCenterService = inject(HelpCenterService);
  private media = inject(Media);
  private router = inject(Router);

  // Inputs / Outputs
  readonly id = input<string>();
  readonly category = input<string>();

  // State
  private tools = TOOLS;
  private categories = this.helpCenterService.categories;
  private isCompact = this.media.match(`(width < 64rem)`);
  private isNarrow = this.media.match(`(width < 96rem)`);
  readonly details = linkedSignal({
    source: this.id,
    computation: () => !this.isNarrow(),
  });
  // Keyed on the id so status changes keep unsaved edits
  private draft = linkedSignal({
    source: this.id,
    computation: () =>
      untracked(() => {
        const article = this.article();

        return {
          title: article?.title ?? '',
          slug: article?.slug ?? '',
          excerpt: article?.excerpt ?? '',
          body: article?.body ?? '',
          categoryId:
            article?.categoryId ?? this.category() ?? this.categories()[0].id,
        };
      }),
  });
  private articleForm = form(this.draft);

  // Computed state
  private article = computed(() => {
    const id = this.id();
    return id ? this.helpCenterService.byId(id) : null;
  });
  private author = computed(() =>
    this.agentsService.byId(this.article()?.authorId ?? ME.id)!
  );

  constructor() {
    effect(() => {
      if (this.id() && !this.article()) {
        this.router.navigate(['/help-center']);
      }
    });
  }

  private insert(textarea: HTMLTextAreaElement, before: string, after: string) {
    const { selectionStart: start, selectionEnd: end, value } = textarea;

    textarea.setRangeText(before + value.slice(start, end) + after, start, end);
    textarea.setSelectionRange(start + before.length, end + before.length);
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
  }

  private save() {
    const id = this.id();

    if (id) {
      this.helpCenterService.update(id, this.draft());
      return;
    }

    const article = this.helpCenterService.create(this.draft());
    this.router.navigate(['/help-center/article', article.id], {
      replaceUrl: true,
    });
  }
}
