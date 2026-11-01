import { Component, computed, input } from '@angular/core';
import { ClassValue } from 'cn';
import { bui } from '@/app/ui/utils';

@Component({
  selector: 'section-header',
  imports: [],
  host: {
    '[class]': 'computedClass()',
  },
  template: `
    <!-- Eyebrow -->
    @if (eyebrow()) {
      <div
        class="font-mono font-medium tracking-wider text-jade-a10 lg:text-lg"
      >
        {{ eyebrow() }}
      </div>
    }

    <!-- Title -->
    @if (title()) {
      <h2
        class="w-full max-w-3xl text-5xl/9 font-semibold tracking-tighter lg:text-6xl"
        [class.mt-3]="eyebrow()"
      >
        {{ title() }}
      </h2>
    }

    <!-- Subtitle -->
    @if (subtitle()) {
      <p
        class="mt-2 w-full max-w-xl text-xl/6 text-pretty text-neutral-a11 md:mt-4 lg:text-xl/7"
      >
        {{ subtitle() }}
      </p>
    }
  `,
})
export class SectionHeader {
  // Input / Output
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  readonly eyebrow = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // User classes
      this.userClass()
    )
  );
}
