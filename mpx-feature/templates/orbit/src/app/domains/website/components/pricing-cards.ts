import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'pricing-cards',
  imports: [MatIcon, MatButton],
  template: `
    <div class="grid gap-4 lg:grid-cols-3">
      @for (plan of plans; track $index) {
        <div class="flex flex-col rounded-xl bg-neutral-a3 p-6">
          <!-- Title & badge -->
          <div class="flex items-center justify-between gap-x-4">
            <h3
              class="shrink-0 font-display text-3xl font-medium tracking-tight font-stretch-110%"
            >
              {{ plan.name }}
            </h3>
            @if (plan.badge) {
              <div
                class="rounded-full bg-jade-a4 px-2 py-1 text-sm font-medium text-jade-a11"
              >
                {{ plan.badge }}
              </div>
            }
          </div>

          <!-- Description -->
          <div class="mt-4 text-lg text-neutral-a11">
            {{ plan.description }}
          </div>

          <!-- Price -->
          <div class="mt-8 flex items-baseline gap-x-1">
            <div class="font-display text-4xl font-medium">
              {{ plan.price }}
            </div>
            <div class="text-xl text-neutral-a11">{{ plan.period }}</div>
          </div>

          <!-- Features -->
          <div class="mt-8 flex flex-col gap-y-4">
            @for (feature of plan.features; track $index) {
              <div class="flex items-center gap-x-2">
                <mat-icon
                  svgIcon="check"
                  class="size-4"
                />
                <div class="text-lg">{{ feature }}</div>
              </div>
            }
          </div>

          <!-- CTA -->
          <div class="mt-auto pt-10">
            <button
              matButton
              class="large w-full"
            >
              {{ plan.cta }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class PricingCards {
  private plans = [
    {
      name: 'Starter',
      description:
        'Small teams and individuals getting started. Basic tools to organize and manage your work.',
      price: '$9',
      period: '/month',
      badge: null,
      features: [
        'Up to 3 projects',
        'Basic task management',
        'Calendar view',
        'Email support',
      ],
      cta: 'Get started',
    },
    {
      name: 'Pro',
      description:
        'Growing teams that need more control. Advanced tools to manage work at scale.',
      price: '$19',
      period: '/month',
      badge: 'Best value',
      features: [
        'Everything in Starter',
        'Unlimited projects',
        'Advanced filtering and search',
        'User roles and permissions',
        'Calendar and timeline views',
        'Priority support',
      ],
      cta: 'Start free trial',
    },
    {
      name: 'Business',
      description:
        'Larger teams with advanced needs. More control, visibility, and dedicated assistance.',
      price: '$39',
      period: '/month',
      badge: null,
      features: [
        'Everything in Pro',
        'Advanced permissions',
        'Activity tracking',
        'Team management tools',
        'Dedicated support',
      ],
      cta: 'Start free trial',
    },
  ];
}
