import { computed, Directive, input } from '@angular/core';
import { ClassValue } from 'cn';
import { bui } from '@/app/ui/utils';

@Directive({
  selector: '[container]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Container {
  // Input / Output
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      '@container mx-auto w-full max-w-3xl lg:max-w-7xl',
      'px-6 py-10 lg:px-8 lg:py-16',

      // User classes
      this.userClass()
    )
  );
}
