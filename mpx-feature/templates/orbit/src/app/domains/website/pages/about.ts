import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { Container } from '@/app/domains/website/components/container';
import { SectionHeader } from '@/app/domains/website/components/section-header';

@Component({
  selector: 'about',
  imports: [Container, SectionHeader, NgOptimizedImage],
  template: `
    <!-- ------------------------------------------------------------------- -->
    <!-- HERO -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <h1
        class="max-w-3xl font-display text-7xl font-semibold text-balance font-stretch-110% lg:text-8xl"
      >
        Building better tools for modern teams
      </h1>
      <p class="mt-4 max-w-2xl text-xl/7 md:mt-6 lg:text-2xl/8">
        We believe project management software should feel clear, predictable,
        and easy to use. Orbit was built to help teams stay organized without
        adding unnecessary complexity to their workflow.
      </p>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- STATS -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <div class="grid grid-cols-4 items-center gap-4">
        @for (stat of stats; track $index) {
          <div
            class="flex flex-col items-center gap-y-3 rounded-xl bg-neutral-a3 py-8"
          >
            <div class="text-7xl font-normal">{{ stat.value }}</div>
            <div class="text-xl text-neutral-a11">{{ stat.label }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- TEAM PHOTO -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <img
        class="rounded-xl object-cover"
        ngSrc="/images/photos/cmov8hzpp00003629rzeg.jpg"
        width="1774"
        height="887"
        alt="Office"
      />
    </section>

    <!-- ------------------------------------------------------------------- -->
    <!-- TEAM -->
    <!-- ------------------------------------------------------------------- -->
    <section container>
      <section-header
        eyebrow="TEAM"
        title="Built by people who care about good tools"
        subtitle="We’re a small team focused on creating products that help people work more clearly and efficiently every day."
      />

      <div class="mt-16 grid grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-y-16">
        @for (member of team; track $index) {
          <div class="flex flex-col gap-y-4">
            <img
              class="size-40 rounded-xl object-cover"
              [ngSrc]="member.photo"
              width="160"
              height="160"
              [alt]="member.name"
            />
            <div class="flex flex-col gap-y-1">
              <div class="text-xl font-semibold">{{ member.name }}</div>
              <div class="text-lg">{{ member.title }}</div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export default class About {
  private stats = [
    {
      value: '10K+',
      label: 'Active users',
    },
    {
      value: '2M+',
      label: 'Tasks managed',
    },
    {
      value: '120+',
      label: 'Countries reached',
    },
    {
      value: '99.9%',
      label: 'Uptime',
    },
  ];

  private team = [
    {
      name: 'Daniel Carter',
      title: 'Founder & CEO',
      photo: '/images/photos/9clm0emqhroqnmfr2ftzv.jpg',
    },
    {
      name: 'Emma Brooks',
      title: 'Product Designer',
      photo: '/images/photos/8dscdy675p03e984k3bio.jpg',
    },
    {
      name: 'Noah Khan',
      title: 'Frontend Engineer',
      photo: '/images/photos/ygjb13iue7ikmnf20eezd.jpg',
    },
    {
      name: 'Sophia Lee',
      title: 'Product Manager',
      photo: '/images/photos/n67qrx4tch0n9yhstgqfq.jpg',
    },
    {
      name: 'Lucas Romero',
      title: 'Creative Director',
      photo: '/images/photos/fpooxhjilh4pj36894qf4.jpg',
    },
    {
      name: 'Marcus Johnson',
      title: 'Customer Success Lead',
      photo: '/images/photos/r1v0gr7ziwzuadynhpv9l.jpg',
    },
  ];
}
