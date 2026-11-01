import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { differenceInSeconds, format, formatDistanceToNowStrict } from 'date-fns';
import {
  Member,
  MembersService,
} from '@/app/domains/admin/modules/members/data/members';
import { TeamsService } from '@/app/domains/admin/modules/teams/data/teams';
import {
  BuiSheet,
  BuiSheetBackdrop,
  BuiSheetBody,
  BuiSheetClose,
  BuiSheetContent,
  BuiSheetHeader,
  BuiSheetPortal,
} from '@/app/ui/sheet';

@Component({
  selector: 'member',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    NgOptimizedImage,
    RouterLink,
    TitleCasePipe,
    BuiSheet,
    BuiSheetBackdrop,
    BuiSheetBody,
    BuiSheetClose,
    BuiSheetContent,
    BuiSheetHeader,
    BuiSheetPortal,
  ],
  host: {
    class: 'hidden size-0 opacity-0',
  },
  template: `
    <div
      buiSheet
      class="w-full sm:max-w-md"
      [(open)]="open"
      (closed)="handleClose()"
    >
      <ng-template buiSheetPortal>
        <div buiSheetBackdrop></div>
        <div buiSheetContent>
          @if (member(); as member) {
            <!-- Header -->
            <header
              buiSheetHeader
              class="flex items-center gap-x-0.5"
            >
              <div class="flex-auto text-xl font-medium">Member details</div>
              @if (!editing()) {
                <button
                  matIconButton
                  class="small"
                  (click)="editing.set(true)"
                >
                  <mat-icon svgIcon="square-pen" />
                </button>
              }
              <button
                matIconButton
                buiSheetClose
                class="small"
              >
                <mat-icon svgIcon="x" />
              </button>
            </header>

            @if (editing()) {
              <!-- Body -->
              <div
                buiSheetBody
                class="flex flex-col px-6 pb-6"
              >
                <form
                  [formRoot]="memberForm"
                  class="flex flex-auto flex-col gap-y-6"
                >
                  <!-- Photo -->
                  <div class="flex items-center gap-x-4">
                    @let hasPhoto = !!memberForm.photo().value();

                    @if (hasPhoto) {
                      <img
                        class="size-16 shrink-0 rounded-full object-cover"
                        [src]="memberForm.photo().value()"
                        alt="Member photo"
                      />
                    } @else {
                      <div
                        class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-neutral-a6"
                      >
                        @let initial =
                          memberForm.name().value()
                            ? memberForm.name().value()[0]
                            : null;
                        @if (initial) {
                          <div class="text-4xl font-semibold">
                            {{ initial }}
                          </div>
                        } @else {
                          <mat-icon svgIcon="circle-user" />
                        }
                      </div>
                    }

                    <div class="flex flex-col gap-y-2">
                      <div class="flex items-center gap-x-1">
                        <button
                          matButton
                          type="button"
                          class="tiny"
                        >
                          <mat-icon svgIcon="upload" />
                          @if (hasPhoto) {
                            Change photo
                          } @else {
                            Upload photo
                          }
                        </button>

                        @if (hasPhoto) {
                          <button
                            matButton
                            type="button"
                            class="tertiary tiny"
                          >
                            Delete
                          </button>
                        }
                      </div>
                      <div class="text-sm text-neutral-a11">
                        Ideal image size: 128x128px. JPG/PNG under 5MB.
                      </div>
                    </div>
                  </div>

                  <mat-form-field>
                    <mat-label>Name</mat-label>
                    <input
                      matInput
                      type="text"
                      [formField]="memberForm.name"
                    />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Email</mat-label>
                    <input
                      matInput
                      type="email"
                      [formField]="memberForm.email"
                    />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Title</mat-label>
                    <input
                      matInput
                      type="text"
                      [formField]="memberForm.title"
                    />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Role</mat-label>
                    <mat-select [formField]="memberForm.role">
                      <mat-option value="owner">Owner</mat-option>
                      <mat-option value="admin">Admin</mat-option>
                      <mat-option value="member">Member</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Teams</mat-label>
                    <mat-select
                      multiple
                      [formField]="memberForm.teamIds"
                    >
                      @for (team of teams(); track team.id) {
                        <mat-option [value]="team.id">{{
                          team.name
                        }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Location</mat-label>
                    <input
                      matInput
                      type="text"
                      [formField]="memberForm.location"
                    />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Address</mat-label>
                    <input
                      matInput
                      type="text"
                      [formField]="memberForm.address"
                    />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Birthday</mat-label>
                    <input
                      matInput
                      [matDatepicker]="birthdayPicker"
                      [formField]="memberForm.birthday"
                    />
                    <mat-datepicker-toggle
                      [for]="birthdayPicker"
                      matIconSuffix
                    />
                    <mat-datepicker #birthdayPicker />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Notes</mat-label>
                    <textarea
                      matInput
                      rows="3"
                      [formField]="memberForm.notes"
                    ></textarea>
                  </mat-form-field>

                  <!-- Spacer -->
                  <div class="flex-auto"></div>

                  <!-- Form actions -->
                  <div
                    class="flex items-center justify-end gap-x-2 border-t pt-6"
                  >
                    <button
                      matButton
                      type="button"
                      class="tertiary"
                      (click)="cancel(member)"
                    >
                      Cancel
                    </button>
                    <button
                      matButton
                      type="submit"
                      class="primary"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            } @else {
              <!-- Body -->
              <div
                buiSheetBody
                class="flex flex-col px-6 pb-6"
              >
                <!-- Intro -->
                <div class="flex items-center gap-x-4">
                  <img
                    class="shrink-0 rounded-full object-cover"
                    width="64"
                    height="64"
                    [ngSrc]="member.photo"
                    [alt]="member.name"
                  />
                  <div class="flex min-w-0 flex-auto flex-col">
                    <div class="truncate text-xl font-medium">
                      {{ member.name }}
                    </div>
                    <div class="truncate text-neutral-a11">
                      {{ member.title }}
                    </div>
                  </div>
                </div>

                <!-- Account details -->
                <div class="mt-6 font-medium">Account details</div>
                <div
                  class="mt-2 grid grid-cols-[6rem_1fr] items-center gap-x-4 gap-y-3"
                >
                  <div class="text-neutral-a11">Email</div>
                  <div class="truncate">{{ member.email }}</div>

                  <div class="text-neutral-a11">Role</div>
                  <div>
                    <div
                      class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium text-neutral-a11"
                    >
                      {{ member.role | titlecase }}
                    </div>
                  </div>

                  <div class="text-neutral-a11">Status</div>
                  <div class="flex items-center gap-x-1.5">
                    <div
                      class="size-1.5 rounded-full"
                      [class.bg-jade-9]="member.status === 'active'"
                      [class.bg-amber-9]="member.status === 'invited'"
                      [class.bg-red-9]="member.status === 'blocked'"
                    ></div>
                    {{ member.status | titlecase }}
                  </div>

                  <div class="text-neutral-a11">2FA</div>
                  <div class="flex items-center gap-x-1.5">
                    <div
                      class="size-1.5 rounded-full"
                      [class.bg-jade-9]="member.twoFactor"
                      [class.bg-neutral-a8]="!member.twoFactor"
                    ></div>
                    @if (member.twoFactor) {
                      Enabled
                    } @else {
                      Disabled
                    }
                  </div>

                  <div class="text-neutral-a11">Teams</div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (team of memberTeams(); track team.id) {
                      <a
                        class="inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-medium hover:underline"
                        [class]="team.tagClass"
                        [routerLink]="['/teams', team.id]"
                      >
                        {{ team.name }}
                      </a>
                    }
                  </div>

                  <div class="text-neutral-a11">Joined</div>
                  <div>{{ formatDate(member.joined) }}</div>

                  <div class="text-neutral-a11">Last active</div>
                  <div>
                    @if (member.lastActive) {
                      {{ relativeDate(member.lastActive) }}
                    } @else {
                      Never
                    }
                  </div>
                </div>

                <!-- Personal details -->
                <div class="mt-6 font-medium">Personal details</div>
                <div
                  class="mt-2 grid grid-cols-[6rem_1fr] items-center gap-x-4 gap-y-3"
                >
                  <div class="text-neutral-a11">Location</div>
                  <div class="truncate">{{ member.location }}</div>

                  <div class="text-neutral-a11">Address</div>
                  <div class="truncate">{{ member.address }}</div>

                  <div class="text-neutral-a11">Birthday</div>
                  <div>{{ formatDate(member.birthday) }}</div>
                </div>

                @if (member.notes) {
                  <!-- Notes -->
                  <div class="mt-6 font-medium">Notes</div>
                  <div class="mt-2 text-neutral-a11">{{ member.notes }}</div>
                }
              </div>
            }
          }
        </div>
      </ng-template>
    </div>
  `,
})
export default class MemberSheet {
  // Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private membersService = inject(MembersService);
  private teamsService = inject(TeamsService);

  // Inputs / Outputs
  readonly id = input.required<string>();
  readonly edit = input(false, { transform: booleanAttribute });

  // State
  private open = signal(false);
  private editing = linkedSignal(() => this.edit());
  private teams = this.teamsService.teams;

  // Computed state
  private member = computed(() => this.membersService.byId(this.id()));
  private memberTeams = computed(() =>
    this.teams().filter((team) => this.member()?.teamIds.includes(team.id))
  );

  private memberModel = linkedSignal<Member>(
    () =>
      this.member() ?? {
        id: '',
        name: '',
        photo: '',
        email: '',
        title: '',
        role: 'member',
        status: 'active',
        teamIds: [],
        lastActive: null,
        joined: '',
        location: '',
        address: '',
        birthday: '',
        twoFactor: false,
        notes: '',
      }
  );
  private memberForm = form(
    this.memberModel,
    (form) => {
      required(form.name, { message: 'Name is required.' });
      required(form.email, { message: 'Email is required.' });
      email(form.email, { message: 'Please enter a valid email address.' });
    },
    {
      submission: {
        action: async () => {
          this.cancel(this.member()!);
        },
      },
    }
  );

  constructor() {
    afterNextRender(() => {
      this.open.set(true);
    });

    effect(() => {
      if (!this.member()) {
        this.handleClose();
      }
    });
  }

  private cancel(member: Member) {
    this.memberModel.set(member);
    this.editing.set(false);
  }

  private formatDate(date: string) {
    return format(date, 'MMM d, yyyy');
  }

  private relativeDate(date: string) {
    if (differenceInSeconds(Date.now(), date) < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  }

  private handleClose() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
