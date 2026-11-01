import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { Container } from '@/app/domains/website/components/container';
import { PricingCards } from '@/app/domains/website/components/pricing-cards';
import { SectionHeader } from '@/app/domains/website/components/section-header';

@Component({
  selector: 'home',
  imports: [
    Container,
    MatButton,
    MatDivider,
    MatIcon,
    RouterLink,
    NgOptimizedImage,
    SectionHeader,
    PricingCards,
  ],
  template: `
    <!-- ------------------------------------------------------------------- -->
    <!-- HERO -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <!-- Eyebrow -->
      <div
        class="relative mb-8 inline-flex flex-col gap-x-3 gap-y-1 rounded-lg bg-jade-a4 px-3.5 py-2 text-jade-a12 hover:bg-jade-a5 lg:flex-row lg:items-center lg:rounded-full lg:py-1.5"
      >
        <a
          class="absolute inset-0"
          routerLink="/"
        >
          <span class=""></span>
        </a>

        <div class="text-lg">Orbit raises $32M Series A funding</div>

        <mat-divider
          vertical
          class="hidden h-3 border-jade-a11 lg:flex"
        />

        <div class="flex items-center gap-x-1.5">
          <div class="text-lg font-semibold">Learn more</div>
          <mat-icon
            svgIcon="arrow-right"
            class="size-4 text-jade-a12"
          />
        </div>
      </div>

      <!-- Title -->
      <h1
        class="max-w-3xl font-display text-7xl font-semibold text-balance font-stretch-110% lg:text-8xl"
      >
        Everything you need to run your projects
      </h1>
      <p class="mt-4 max-w-2xl text-xl/7 md:mt-6 lg:text-2xl/8">
        From planning and task management to progress tracking, keep your entire
        workflow in sync in one place.
      </p>

      <!-- CTA -->
      <div class="mt-8 flex items-center gap-x-2">
        <button
          matButton
          class="primary large w-32"
        >
          Get started
        </button>
        <button
          matButton
          class="large tertiary w-32"
        >
          Book a demo
        </button>
      </div>

      <!-- Screenshot -->
      <div
        class="mt-12 overflow-hidden rounded-xl shadow-lg shadow-neutral-a5 outline-1 outline-neutral-a4 lg:mt-16 lg:shadow-xl dark:shadow-black-a7"
      >
        <div
          class="aspect-1600/900 bg-[url(/images/home/hero/hero-light.png)] bg-size-[180%_auto] bg-position-[0_0] bg-no-repeat sm:bg-size-[150%_auto] md:bg-size-[120%_auto] lg:bg-size-[100%_auto] dark:hidden"
        ></div>
        <div
          class="hidden aspect-1600/900 bg-[url(/images/home/hero/hero-dark.png)] bg-size-[180%_auto] bg-position-[0_0] bg-no-repeat shadow-lg sm:bg-size-[150%_auto] md:bg-size-[120%_auto] lg:bg-size-[100%_auto] dark:block"
        ></div>
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- LOGO CLOUD -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <div
        class="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 md:max-w-3xl md:grid-cols-6 lg:max-w-6xl lg:grid-cols-5"
      >
        <!-- Horizon logo -->
        <img
          class="col-span-2 max-h-10 w-full object-contain lg:col-span-1 dark:hidden"
          ngSrc="/images/home/logos/horizon-light.svg"
          width="194"
          height="54"
          alt="Horizon"
        />
        <img
          class="col-span-2 hidden max-h-10 w-full object-contain lg:col-span-1 dark:block"
          ngSrc="/images/home/logos/horizon-dark.svg"
          width="194"
          height="54"
          alt="Horizon"
        />

        <!-- Atlas logo -->
        <img
          class="col-span-2 max-h-10 w-full object-contain md:col-start-2 lg:col-span-1 lg:col-start-auto dark:hidden"
          ngSrc="/images/home/logos/atlas-light.svg"
          width="169"
          height="54"
          alt="Atlas"
        />
        <img
          class="col-span-2 hidden max-h-10 w-full object-contain md:col-start-2 lg:col-span-1 lg:col-start-auto dark:block"
          ngSrc="/images/home/logos/atlas-dark.svg"
          width="169"
          height="54"
          alt="Atlas"
        />

        <!-- Spark logo -->
        <img
          class="col-span-2 max-h-10 w-full object-contain lg:col-span-1 dark:hidden"
          ngSrc="/images/home/logos/spark-light.svg"
          width="154"
          height="54"
          alt="Spark"
        />
        <img
          class="col-span-2 hidden max-h-10 w-full object-contain lg:col-span-1 dark:block"
          ngSrc="/images/home/logos/spark-dark.svg"
          width="154"
          height="54"
          alt="Spark"
        />

        <!-- Pulse -->
        <img
          class="col-span-2 col-start-2 max-h-10 w-full object-contain md:col-start-auto lg:col-span-1 dark:hidden"
          ngSrc="/images/home/logos/pulse-light.svg"
          width="125"
          height="54"
          alt="Pulse"
        />
        <img
          class="col-span-2 col-start-2 hidden max-h-10 w-full object-contain md:col-start-auto lg:col-span-1 dark:block"
          ngSrc="/images/home/logos/pulse-dark.svg"
          width="125"
          height="54"
          alt="Pulse"
        />

        <!-- Nova logo -->
        <img
          class="col-span-2 max-h-10 w-full object-contain lg:col-span-1 dark:hidden"
          ngSrc="/images/home/logos/nova-light.svg"
          width="169"
          height="54"
          alt="Nova"
        />
        <img
          class="col-span-2 hidden max-h-10 w-full object-contain lg:col-span-1 dark:block"
          ngSrc="/images/home/logos/nova-dark.svg"
          width="169"
          height="54"
          alt="Nova"
        />
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- CORE FEATURES -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <!-- Section header -->
      <section-header
        eyebrow="CORE FEATURES"
        title="Built for modern project workflows"
        subtitle="Handle users, tasks, and timelines with a system designed to keep your work organized and predictable."
      />

      <!-- Features -->
      <div class="mt-12 grid gap-4 lg:grid-cols-3">
        @for (feature of coreFeatures; track $index) {
          <div class="flex flex-col rounded-xl bg-neutral-a3 p-2 pb-0">
            <div class="flex w-full flex-col justify-center">
              <img
                class="aspect-1600/900 overflow-hidden rounded-lg object-cover object-left dark:hidden"
                [ngSrc]="feature.image.light"
                width="1600"
                height="900"
                alt="Users"
              />
              <img
                class="hidden aspect-1600/900 overflow-hidden rounded-lg object-cover object-left dark:block"
                [ngSrc]="feature.image.dark"
                width="1600"
                height="900"
                alt="Users"
              />
            </div>

            <div class="px-2 py-4 lg:px-3">
              <div class="w-full text-lg/6 font-semibold">
                {{ feature.title }}
              </div>
              <p class="mt-2 w-full text-lg/6 text-pretty text-neutral-a11">
                {{ feature.description }}
              </p>
              <button
                matButton
                class="link mt-6"
              >
                Learn more
                <mat-icon
                  svgIcon="move-right"
                  iconPositionEnd
                />
              </button>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- EXTENDED FEATURES -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <section-header
        eyebrow="IN DEPTH FEATURES"
        title="More than just the basics"
        subtitle="Everything you need to manage your work, without adding unnecessary complexity or getting in your way."
      />

      <!-- Features -->
      <div class="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-y-16">
        @for (feature of extendedFeatures; track $index) {
          <div class="flex gap-x-4">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary"
            >
              <mat-icon
                [svgIcon]="feature.icon"
                class="size-4 text-primary-contrast"
              />
            </div>
            <div class="flex flex-col">
              <div class="text-lg/6 font-medium lg:text-xl/7">
                {{ feature.title }}
              </div>
              <p
                class="mt-1 text-lg/6 text-pretty text-neutral-a11 lg:text-xl/7"
              >
                {{ feature.description }}
              </p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- TESTIMONIALS -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <section-header
        eyebrow="TESTIMONIALS"
        title="Trusted by teams everywhere"
        subtitle="Teams of all sizes rely on Orbit to stay organized and keep their work moving."
      />

      <!-- Testimonials -->
      <div class="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        @for (testimonial of testimonials; track $index) {
          <div class="flex flex-col gap-y-16 rounded-xl bg-neutral-a3 p-6">
            <p class="w-full text-lg/7">&quot;{{ testimonial.quote }}&quot;</p>

            <div class="flex items-center gap-x-4">
              <img
                [ngSrc]="testimonial.image"
                class="size-10 rounded-lg outline-1 -outline-offset-1 outline-black-a2 dark:outline-white-a2"
                width="240"
                height="240"
                [alt]="testimonial.name"
              />
              <div class="flex flex-col">
                <div class="text-lg/6 font-semibold">
                  {{ testimonial.name }}
                </div>
                <div class="text-lg">
                  {{ testimonial.title }}
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- PRICING -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <section-header
        eyebrow="PRICING"
        title="Simple, transparent pricing"
        subtitle="Choose a plan that fits your team and start managing your work without any surprises."
      />

      <div class="mt-12">
        <pricing-cards />
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- CTA -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <section-header
        eyebrow="GET STARTED"
        title="Start organizing your work today"
        subtitle="Bring your projects, tasks, and team into one place and start managing your work with clarity, without unnecessary complexity or setup."
      />

      <!-- CTA -->
      <div class="mt-12 flex items-center gap-x-3">
        <button
          matButton
          class="primary large w-32"
        >
          Start for free
        </button>

        <button
          matButton
          class="tertiary large w-32"
        >
          Book a demo
        </button>
      </div>
    </section>
  `,
})
export default class Home {
  private coreFeatures = [
    {
      title: 'Manage your team with clarity',
      description:
        'Invite users, assign roles, and keep everything organized from one place.',
      image: {
        light: '/images/home/features/users-light.jpg',
        dark: '/images/home/features/users-dark.jpg',
      },
    },
    {
      title: 'See your work on a timeline',
      description:
        'Visualize tasks on a calendar, plan ahead, and stay on top of deadlines.',
      image: {
        light: '/images/home/features/calendar-light.jpg',
        dark: '/images/home/features/calendar-dark.jpg',
      },
    },
    {
      title: 'Find what matters, faster',
      description:
        'Filter, search, and sort through your work to quickly find what you need. ',
      image: {
        light: '/images/home/features/tasks-light.jpg',
        dark: '/images/home/features/tasks-dark.jpg',
      },
    },
  ];

  private extendedFeatures = [
    {
      icon: 'user-lock',
      title: 'Roles and permissions',
      description:
        'Control access and keep your workspace secure. Assign roles and make sure everyone only sees what they need.',
    },
    {
      icon: 'list-filter-plus',
      title: 'Advanced filtering',
      description:
        'Quickly find what you need with powerful filters and search. Narrow down large datasets in seconds without losing context.',
    },
    {
      icon: 'circle-dashed',
      title: 'Task statuses',
      description:
        'Track progress clearly with customizable states. Keep everyone aligned by making the state of work visible at all times.',
    },
    {
      icon: 'file-clock',
      title: 'Activity tracking',
      description:
        'Stay informed with a clear history of changes. See who did what and when without digging through your data.',
    },
    {
      icon: 'paint-bucket',
      title: 'Customizable views',
      description:
        'Switch between list, table, and calendar views. Adapt the interface to match how your team prefers to work.',
    },
    {
      icon: 'sparkles',
      title: 'Clean, consistent UI',
      description:
        'Focused interface designed to stay out of your way. Spend less time figuring things out and more time getting work done.',
    },
  ];

  private testimonials = [
    {
      name: 'Alex Morgan',
      title: 'Product Lead at Atlas',
      image: '/images/photos/d6l6k0erazgtowytjkz6u.jpg',
      quote:
        'Orbit made it much easier to keep track of everything. We finally have a clear view of what’s happening across the team.',
    },
    {
      name: 'Sarah Chen',
      title: 'Operations Manager at Pulse',
      image: '/images/photos/a7q4cj096iff94f9txbbj.jpg',
      quote:
        'We moved everything into Orbit and never looked back. It’s simple, fast, and just works the way you expect.',
    },
    {
      name: 'Daniel Park',
      title: 'Project Manager at Spark',
      image: '/images/photos/ot79dx7wxgnj6ixi0aszt.jpg',
      quote:
        'Being able to see tasks on a timeline changed how we plan our work. It keeps everyone aligned without extra effort.',
    },
    {
      name: 'Emily Rodriguez',
      title: 'Product Manager at Horizon',
      image: '/images/photos/yg1g453wjflwtdwrq3sxa.jpg',
      quote:
        'Orbit brought everything into one place for our team. It’s simple, predictable, and makes it much easier to stay on top of our work.',
    },
    {
      name: 'James Wilson',
      title: 'Team Lead at Nova',
      image: '/images/photos/9clm0emqhroqnmfr2ftzv.jpg',
      quote:
        'We finally have a clear view of what’s going on across projects. Planning and tracking work feels a lot more organized now.',
    },
    {
      name: 'Olivia Bennett',
      title: 'Operations Lead at Vertex',
      image: '/images/photos/n67qrx4tch0n9yhstgqfq.jpg',
      quote:
        'The interface is clean and easy to follow, which makes a big difference day to day. It helps the whole team stay aligned without extra effort.',
    },
  ];
}
