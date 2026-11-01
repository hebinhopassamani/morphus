import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, model } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { differenceInMinutes, formatDistanceToNowStrict } from 'date-fns';
import {
  FILE_KINDS,
  FileItem,
  FilesService,
} from '@/app/domains/admin/modules/files/data/files';
import { FileSizePipe } from '@/app/domains/admin/modules/files/ui/file-size';
import { MembersService } from '@/app/domains/admin/modules/members/data/members';
import {
  BuiSheet,
  BuiSheetBackdrop,
  BuiSheetBody,
  BuiSheetClose,
  BuiSheetContent,
  BuiSheetFooter,
  BuiSheetHeader,
  BuiSheetPortal,
} from '@/app/ui/sheet';

@Component({
  selector: 'files-file-details',
  imports: [
    BuiSheet,
    BuiSheetBackdrop,
    BuiSheetBody,
    BuiSheetClose,
    BuiSheetContent,
    BuiSheetFooter,
    BuiSheetHeader,
    BuiSheetPortal,
    DatePipe,
    FileSizePipe,
    MatButton,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatTooltip,
    NgOptimizedImage,
  ],
  template: `
    <div
      buiSheet
      class="w-full sm:max-w-md"
      [open]="!!id()"
      (closed)="id.set(null)"
    >
      <ng-template buiSheetPortal>
        <div buiSheetBackdrop></div>
        <div buiSheetContent>
          @if (file(); as file) {
            <!-- Header -->
            <header
              buiSheetHeader
              class="flex items-center gap-x-3 border-b border-neutral-a4 py-4"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                [class]="kinds[file.kind].colorClass"
              >
                <mat-icon
                  class="size-5"
                  [svgIcon]="kinds[file.kind].icon"
                />
              </div>
              <div class="flex min-w-0 flex-auto flex-col">
                <div class="truncate text-xl font-medium">
                  {{ file.name }}
                </div>
                <div class="truncate text-sm text-neutral-a11">
                  {{ kinds[file.kind].label }}
                </div>
              </div>
              <button
                matIconButton
                buiSheetClose
                class="small"
              >
                <mat-icon svgIcon="x" />
              </button>
            </header>

            <!-- Body -->
            <div
              buiSheetBody
              class="flex flex-col py-6"
            >
              <!-- Preview -->
              <div
                class="relative flex aspect-video min-w-0 items-center justify-center overflow-clip rounded-lg"
                [class]="kinds[file.kind].colorClass"
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
                    class="size-12"
                    [svgIcon]="kinds[file.kind].icon"
                  />
                }
              </div>

              <mat-divider class="my-6" />

              <!-- Details -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Details</div>
              </div>
              <div
                class="mt-2 grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3"
              >
                <div class="text-neutral-a11">Type</div>
                <div>{{ kinds[file.kind].label }}</div>

                <div class="text-neutral-a11">Size</div>
                <div class="tabular-nums">{{ file.size | fileSize }}</div>

                <div class="text-neutral-a11">Location</div>
                <div class="truncate">{{ location(file) }}</div>

                @if (membersService.byId(file.ownerId); as member) {
                  <div class="text-neutral-a11">Owner</div>
                  <div class="flex min-w-0 items-center gap-x-2">
                    <img
                      class="shrink-0 rounded-full object-cover"
                      width="20"
                      height="20"
                      [ngSrc]="member.photo"
                      [alt]="member.name"
                    />
                    <div class="truncate">{{ member.name }}</div>
                  </div>
                }

                <div class="text-neutral-a11">Created</div>
                <div class="tabular-nums">
                  {{ file.createdAt | date: 'MMM d, y' }}
                </div>

                <div class="text-neutral-a11">Modified</div>
                <div class="tabular-nums">
                  {{ file.modifiedAt | date: 'MMM d, y' }}
                </div>
              </div>

              <mat-divider class="my-6" />

              <!-- Shared with -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Shared with</div>
              </div>
              @if (file.sharedWith.length) {
                <div class="mt-3 flex items-center -space-x-1">
                  @for (id of file.sharedWith; track id) {
                    @if (membersService.byId(id); as member) {
                      <img
                        class="rounded-full object-cover ring-2 ring-white outline -outline-offset-1 outline-black-a3 dark:ring-neutral-3 dark:outline-white-a3"
                        width="28"
                        height="28"
                        [ngSrc]="member.photo"
                        [alt]="member.name"
                        [matTooltip]="member.name"
                      />
                    }
                  }
                </div>
              } @else {
                <div class="mt-2 text-neutral-a11">
                  Not shared with anyone yet.
                </div>
              }

              <mat-divider class="my-6" />

              <!-- Activity -->
              <div class="flex min-h-6 items-center gap-x-2">
                <div class="flex-auto font-medium">Activity</div>
              </div>
              <ul class="mt-3 flex flex-col">
                @for (
                  entry of file.activity;
                  track entry.id;
                  let last = $last
                ) {
                  <li class="flex gap-x-3">
                    <div class="flex flex-col items-center">
                      <div
                        class="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-a4"
                      >
                        <mat-icon
                          class="size-3.5 text-neutral-a11"
                          [svgIcon]="entry.icon"
                        />
                      </div>

                      @if (!last) {
                        <div class="w-px flex-auto bg-neutral-a4"></div>
                      }
                    </div>

                    <div
                      class="flex flex-auto flex-col"
                      [class.pb-5]="!last"
                    >
                      <div class="leading-7 text-pretty text-neutral-a11">
                        <span class="font-medium text-neutral-12">{{
                          membersService.byId(entry.memberId)?.name
                        }}</span>
                        {{ entry.text }}
                      </div>
                      <div class="text-sm text-neutral-a11">
                        {{ relativeDate(entry.date) }}
                      </div>
                    </div>
                  </li>
                }
              </ul>
            </div>

            <!-- Footer -->
            <div
              buiSheetFooter
              class="border-t border-neutral-a4 py-4"
            >
              @if (file.trashed) {
                <button
                  matButton
                  class="destructive me-auto"
                  (click)="filesService.delete([file.id]); id.set(null)"
                >
                  Delete permanently
                </button>
                <button
                  matButton
                  class="primary"
                  (click)="filesService.restore([file.id])"
                >
                  Restore
                </button>
              } @else {
                <button
                  matButton
                  class="me-auto"
                  (click)="filesService.trash([file.id])"
                >
                  Move to trash
                </button>
                <button matButton>Share</button>
                <button
                  matButton
                  class="primary"
                >
                  Download
                </button>
              }
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export class FilesFileDetails {
  // Dependencies
  private filesService = inject(FilesService);
  private membersService = inject(MembersService);

  // Inputs / Outputs
  readonly id = model<string | null>(null);

  // Data
  private kinds = FILE_KINDS;

  // Computed state
  private file = computed(() => {
    const id = this.id();
    return id && this.filesService.byId(id);
  });

  private location(file: FileItem) {
    return [
      'Home',
      ...this.filesService.path(file.parentId).map((folder) => folder.name),
    ].join(' / ');
  }

  private relativeDate(date: string) {
    return differenceInMinutes(new Date(), date) < 1
      ? 'Just now'
      : `${formatDistanceToNowStrict(date)} ago`;
  }
}
