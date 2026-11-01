import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { Container } from '@/app/domains/website/components/container';
import { PricingCards } from '@/app/domains/website/components/pricing-cards';
import { SectionHeader } from '@/app/domains/website/components/section-header';

@Component({
  selector: 'pricing',
  imports: [
    Container,
    PricingCards,
    MatIcon,
    SectionHeader,
    NgTemplateOutlet,
    MatDivider,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    TitleCasePipe,
  ],
  template: `
    <!-- ------------------------------------------------------------------- -->
    <!-- HERO -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <h1
        class="max-w-3xl font-display text-7xl font-semibold text-balance font-stretch-110% lg:text-8xl"
      >
        Simple, transparent pricing.
      </h1>
      <p class="mt-4 max-w-2xl text-xl/7 md:mt-6 lg:text-2xl/8">
        Choose a plan that fits your team and start managing your work without
        any surprises.
      </p>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- CARDS -->
    <!-- ------------------------------------------------------------------- -->
    <section
      container
      class="pt-0 lg:pt-0"
    >
      <pricing-cards />
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- FEATURES -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <section-header
        eyebrow="COMPARE PLANS"
        title="Features designed for teams of all sizes"
        subtitle="Everything you need to manage your work, without adding unnecessary complexity or getting in your way."
      />

      <!-- Tabs, visible on mobile -->
      <div class="mt-12 flex flex-col gap-y-12 sm:hidden">
        <mat-tab-group
          ngSkipHydration
          [animationDuration]="0"
        >
          @for (tab of plans; track $index) {
            <mat-tab>
              <ng-template mat-tab-label>
                <span class="text-lg">{{ tab | titlecase }}</span>
              </ng-template>

              <div class="mt-6 flex flex-col gap-y-12">
                @for (group of planFeatures; track $index) {
                  <div class="flex flex-col gap-y-3 text-lg">
                    <div class="font-medium text-neutral-a12">
                      {{ group.name }}
                    </div>

                    <mat-divider />

                    @for (
                      feature of group.features;
                      track $index;
                      let last = $last
                    ) {
                      <div class="grid grid-cols-2 items-center gap-2">
                        <div class="text-neutral-a11">
                          {{ feature.name }}
                        </div>

                        <ng-container
                          *ngTemplateOutlet="
                            featureValueTemplate;
                            context: { $implicit: feature.values[tab] }
                          "
                        />
                      </div>

                      @if (!last) {
                        <mat-divider />
                      }
                    }
                  </div>
                }
              </div>
            </mat-tab>
          }
        </mat-tab-group>
      </div>

      <!-- Table, visible on desktop -->
      <table
        class="mt-16 hidden w-full table-fixed text-start text-lg sm:table **:[td]:p-4 **:[td]:align-middle **:[td]:first-of-type:ps-0 **:[td]:last-of-type:pe-0 **:[th]:px-4 **:[th]:first-of-type:ps-0 **:[th]:last-of-type:pe-0"
      >
        <thead>
          <tr class="*:[th]:py-4">
            <th></th>
            @for (plan of plans; track $index) {
              <th>
                <div class="text-xl font-medium">{{ plan | titlecase }}</div>
              </th>
            }
          </tr>
        </thead>

        @for (group of planFeatures; track $index) {
          <tbody
            class="not-first-of-type:**:[th]:pt-10 first-of-type:**:[th]:pt-4 *:[tr]:not-last:border-b"
          >
            <!-- Group name -->
            <tr>
              <th colspan="4">
                <div class="py-4 font-medium">
                  {{ group.name }}
                </div>
              </th>
            </tr>

            <!-- Features -->
            @for (feature of group.features; track $index) {
              <tr>
                <td class="text-neutral-a11">
                  {{ feature.name }}
                </td>

                @for (plan of plans; track $index) {
                  <td>
                    <ng-container
                      *ngTemplateOutlet="
                        featureValueTemplate;
                        context: { $implicit: feature.values[plan] }
                      "
                    />
                  </td>
                }
              </tr>
            }
          </tbody>
        }
      </table>

      <!-- Feature value template -->
      <ng-template
        #featureValueTemplate
        let-feature
      >
        @switch (feature.kind) {
          @case ('text') {
            {{ feature.value }}
          }
          @case ('none') {
            <span class="text-neutral-a9">&ndash;</span>
          }
          @case ('check') {
            <mat-icon
              class="size-4 text-jade-9"
              svgIcon="check"
            />
          }
        }
      </ng-template>
    </section>
  `,
})
export default class Pricing {
  private plans = ['starter', 'pro', 'business'] as const;
  private planFeatures = [
    {
      name: 'Features',
      features: [
        {
          name: 'Projects',
          values: {
            starter: { kind: 'text', value: 'Up to 3' },
            pro: { kind: 'text', value: 'Unlimited' },
            business: { kind: 'text', value: 'Unlimited' },
          },
        },
        {
          name: 'Calendar view',
          values: {
            starter: { kind: 'check' },
            pro: { kind: 'check' },
            business: { kind: 'check' },
          },
        },
        {
          name: 'Advanced filtering & search',
          values: {
            starter: { kind: 'none' },
            pro: { kind: 'check' },
            business: { kind: 'check' },
          },
        },
        {
          name: 'Roles & permissions',
          values: {
            starter: { kind: 'none' },
            pro: { kind: 'check' },
            business: { kind: 'check' },
          },
        },
      ],
    },
    {
      name: 'Tools',
      features: [
        {
          name: 'Logging',
          values: {
            starter: { kind: 'text', value: 'Basic' },
            pro: { kind: 'text', value: 'Advanced' },
            business: { kind: 'text', value: 'Advanced' },
          },
        },
        {
          name: 'Team management',
          values: {
            starter: { kind: 'none' },
            pro: { kind: 'check' },
            business: { kind: 'check' },
          },
        },
        {
          name: 'Activity tracking',
          values: {
            starter: { kind: 'none' },
            pro: { kind: 'none' },
            business: { kind: 'check' },
          },
        },
      ],
    },
    {
      name: 'Support',
      features: [
        {
          name: 'Email support',
          values: {
            starter: { kind: 'check' },
            pro: { kind: 'check' },
            business: { kind: 'check' },
          },
        },
        {
          name: 'Priority support',
          values: {
            starter: { kind: 'none' },
            pro: { kind: 'check' },
            business: { kind: 'check' },
          },
        },
        {
          name: 'Dedicated support',
          values: {
            starter: { kind: 'none' },
            pro: { kind: 'none' },
            business: { kind: 'check' },
          },
        },
      ],
    },
  ];
}
