import { Listbox, Option } from '@angular/aria/listbox';
import { Component, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NAVIGATION } from '@/app/domains/admin/layout/data/navigation';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogPortal,
  BuiDialogTrigger,
} from '@/app/ui/dialog';
import { BuiSidebarButton, BuiSidebarIcon } from '@/app/ui/sidebar';

@Component({
  selector: 'action-panel',
  imports: [
    MatIcon,
    Listbox,
    Option,
    RouterLink,
    MatIconButton,
    MatDivider,
    BuiDialog,
    BuiDialogPortal,
    BuiDialogContent,
    BuiDialogBackdrop,
    BuiDialogTrigger,
    BuiDialogClose,
    BuiDialogBody,
    BuiSidebarButton,
    BuiSidebarIcon,
  ],
  host: {
    class: 'contents',
  },
  template: `
    <div
      buiDialog
      class="w-full max-w-xl"
    >
      <!-- Trigger -->
      <button
        buiSidebarButton
        buiDialogTrigger
        aria-label="Search"
      >
        <mat-icon
          buiSidebarIcon
          svgIcon="search"
        />
      </button>

      <!-- Panel -->
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div
          buiDialogContent
          class="flex max-w-none flex-col gap-y-0 p-0"
        >
          <!-- Search field -->
          <div class="relative flex items-center">
            <mat-icon
              class="pointer-events-none absolute start-4 size-4"
              svgIcon="search"
            />
            <input
              id="search"
              type="text"
              class="w-full ps-10 pe-14 pt-4 pb-3.5 outline-0"
              placeholder="Start typing to search..."
            />
            <kbd class="absolute end-4">⌘/</kbd>
          </div>

          <mat-divider />

          <div
            buiDialogBody
            class="py-4"
          >
            <!-- Filters -->
            <div class="flex items-start">
              <div
                ngListbox
                class="flex flex-wrap items-center gap-2 px-4"
                orientation="horizontal"
                selectionMode="explicit"
                multi="true"
                [(value)]="selectedFilter"
              >
                @for (filter of filters; track filter.value) {
                  <div
                    ngOption
                    class="flex cursor-pointer items-center gap-x-1.5 rounded-md py-1 ps-1.5 pe-2 ring-1 ring-neutral-a6 hover:bg-neutral-a2 aria-selected:bg-neutral-a3"
                    [value]="filter.value"
                  >
                    <mat-icon
                      class="size-3.5"
                      [svgIcon]="filter.icon"
                    />
                    <div class="text-sm">{{ filter.label }}</div>
                  </div>
                }
              </div>

              <!-- Spacer -->
              <div class="flex-auto"></div>

              <div class="flex items-center gap-x-1 pe-4">
                <button
                  matIconButton
                  class="tiny"
                >
                  <mat-icon svgIcon="list-filter" />
                </button>

                <button
                  matIconButton
                  class="tiny"
                >
                  <mat-icon svgIcon="arrow-up-narrow-wide" />
                </button>
              </div>
            </div>

            <!-- Pages -->
            <div class="mt-4 flex flex-col gap-y-2">
              <div
                class="px-4 text-xs font-medium tracking-wide text-neutral-a11"
              >
                PAGES
              </div>
              <div
                ngListbox
                class="flex flex-col gap-y-1 px-2.5"
                orientation="vertical"
                [readonly]="true"
              >
                @for (item of navigation; track item.id) {
                  <div
                    ngOption
                    buiDialogClose
                    class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3"
                    [value]="item.id"
                    [routerLink]="item.route"
                  >
                    <div class="flex size-5 items-center justify-center">
                      <mat-icon
                        class="size-4"
                        [svgIcon]="item.icon"
                      />
                    </div>
                    <div class="truncate">{{ item.label }}</div>
                  </div>
                }
              </div>
            </div>

            <mat-divider class="my-4" />

            <!-- Quick actions -->
            <div class="flex flex-col gap-y-2">
              <div
                class="px-4 text-xs font-medium tracking-wide text-neutral-a11"
              >
                QUICK ACTIONS
              </div>
              <div
                ngListbox
                class="flex flex-col gap-y-1 px-2.5"
                orientation="vertical"
                [readonly]="true"
              >
                <!-- Create ticket -->
                <div
                  ngOption
                  class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3"
                  value="create-ticket"
                >
                  <div class="flex size-5 items-center justify-center">
                    <mat-icon
                      class="size-4"
                      svgIcon="ticket-plus"
                    />
                  </div>
                  <div class="flex-auto">Create new ticket</div>
                  <kbd>⌘⇧T</kbd>
                </div>

                <!-- Add customer -->
                <div
                  ngOption
                  class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3"
                  value="create-customer"
                >
                  <div class="flex size-5 items-center justify-center">
                    <mat-icon
                      class="size-4"
                      svgIcon="user-plus"
                    />
                  </div>
                  <div class="flex-auto">Add new customer</div>
                  <kbd>⌘⇧C</kbd>
                </div>

                <!-- Write article -->
                <div
                  ngOption
                  class="flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3"
                  value="create-article"
                >
                  <div class="flex size-5 items-center justify-center">
                    <mat-icon
                      class="size-4"
                      svgIcon="file-pen-line"
                    />
                  </div>
                  <div class="flex-auto">Write new article</div>
                  <kbd>⌘⇧A</kbd>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="mt-0 flex items-center gap-x-4 border-t bg-neutral-a2 px-4 py-2"
          >
            <!-- Navigate -->
            <div class="flex items-center">
              <kbd class="flex items-center">
                <mat-icon
                  class="size-3"
                  svgIcon="arrow-up-down"
                />
              </kbd>
              <span class="ms-2 text-sm text-neutral-a11">Navigate</span>
            </div>

            <!-- Select -->
            <div class="flex items-center">
              <kbd class="flex items-center">
                <mat-icon
                  class="size-3"
                  svgIcon="corner-down-left"
                />
              </kbd>
              <span class="ms-2 text-sm text-neutral-a11">Select</span>
            </div>

            <!-- Close -->
            <div class="flex items-center">
              <kbd class="flex items-center">
                <mat-icon
                  class="size-3"
                  svgIcon="circle-arrow-out-up-left"
                />
              </kbd>
              <span class="ms-2 text-sm text-neutral-a11">Close</span>
            </div>

            <!-- Spacer -->
            <div class="flex-auto"></div>

            <!-- Settings -->
            <button matIconButton>
              <mat-icon svgIcon="settings" />
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class ActionPanel {
  // State
  private navigation = NAVIGATION;
  private selectedFilter = signal(['tickets', 'customers', 'articles']);
  private filters = [
    {
      value: 'tickets',
      label: 'Tickets',
      icon: 'inbox',
    },
    {
      value: 'customers',
      label: 'Customers',
      icon: 'users',
    },
    {
      value: 'articles',
      label: 'Articles',
      icon: 'book-open',
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
  ];
}
