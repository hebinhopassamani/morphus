import {
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import { ClassValue } from 'cn';
import { bui, cva, UniqueId, VariantProps } from '../utils';

// -----------------------------------------------------------------------------
// Alert Variants
// -----------------------------------------------------------------------------
const alertVariants = cva({
  variants: {
    slot: {
      root: '',
      icon: '',
      content: '',
      title: '',
      description: '',
      actions: '',
      dismissButton: '',
    },
    appearance: { soft: '', outline: '' },
    tone: {
      neutral: '',
      info: '',
      success: '',
      warning: '',
      error: '',
      magic: '',
    },
  },
  compoundVariants: [
    // Soft
    { slot: 'root', appearance: 'soft', class: 'border-0' },

    // Soft Neutral
    {
      slot: 'root',
      appearance: 'soft',
      tone: 'neutral',
      class: 'bg-neutral-a3 text-neutral-a12',
    },
    {
      slot: 'description',
      appearance: 'soft',
      tone: 'neutral',
      class: 'text-neutral-a11',
    },

    // Soft Info
    {
      slot: 'root',
      appearance: 'soft',
      tone: 'info',
      class: 'bg-blue-a3 text-blue-a12',
    },
    {
      slot: 'description',
      appearance: 'soft',
      tone: 'info',
      class: 'text-blue-a11',
    },

    // Soft Success
    {
      slot: 'root',
      appearance: 'soft',
      tone: 'success',
      class: 'bg-jade-a3 text-jade-a12',
    },
    {
      slot: 'description',
      appearance: 'soft',
      tone: 'success',
      class: 'text-jade-a11',
    },

    // Soft Warning
    {
      slot: 'root',
      appearance: 'soft',
      tone: 'warning',
      class: 'bg-amber-a2 text-amber-a12',
    },
    {
      slot: 'description',
      appearance: 'soft',
      tone: 'warning',
      class: 'text-amber-a11',
    },

    // Soft Error
    {
      slot: 'root',
      appearance: 'soft',
      tone: 'error',
      class: 'bg-red-a3 text-red-a12',
    },
    {
      slot: 'description',
      appearance: 'soft',
      tone: 'error',
      class: 'text-red-a11',
    },

    // Soft Magic
    {
      slot: 'root',
      appearance: 'soft',
      tone: 'magic',
      class: 'bg-violet-a3 text-violet-a12',
    },
    {
      slot: 'description',
      appearance: 'soft',
      tone: 'magic',
      class: 'text-violet-a11',
    },

    // Outline Neutral
    {
      slot: 'root',
      appearance: 'outline',
      tone: 'neutral',
      class: 'border-neutral-a5 text-neutral-a12',
    },
    {
      slot: 'description',
      appearance: 'outline',
      tone: 'neutral',
      class: 'text-neutral-a11',
    },

    // Outline Info
    {
      slot: 'root',
      appearance: 'outline',
      tone: 'info',
      class: 'border-blue-a5 bg-blue-a2 text-blue-a12',
    },
    {
      slot: 'description',
      appearance: 'outline',
      tone: 'info',
      class: 'text-blue-a11',
    },

    // Outline Success
    {
      slot: 'root',
      appearance: 'outline',
      tone: 'success',
      class: 'border-jade-a5 bg-jade-a2 text-jade-a12',
    },
    {
      slot: 'description',
      appearance: 'outline',
      tone: 'success',
      class: 'text-jade-a11',
    },

    // Outline Warning
    {
      slot: 'root',
      appearance: 'outline',
      tone: 'warning',
      class: 'border-amber-a5 bg-amber-a2 text-amber-a12',
    },
    {
      slot: 'description',
      appearance: 'outline',
      tone: 'warning',
      class: 'text-amber-a11',
    },

    // Outline Error
    {
      slot: 'root',
      appearance: 'outline',
      tone: 'error',
      class: 'border-red-a5 bg-red-a2 text-red-a12',
    },
    {
      slot: 'description',
      appearance: 'outline',
      tone: 'error',
      class: 'text-red-a11',
    },

    // Outline Magic
    {
      slot: 'root',
      appearance: 'outline',
      tone: 'magic',
      class: 'border-violet-a5 bg-violet-a2 text-violet-a12',
    },
    {
      slot: 'description',
      appearance: 'outline',
      tone: 'magic',
      class: 'text-violet-a11',
    },
  ],
});

export type BuiAlertAppearance = NonNullable<
  VariantProps<typeof alertVariants>['appearance']
>;
export type BuiAlertTone = NonNullable<
  VariantProps<typeof alertVariants>['tone']
>;

// -----------------------------------------------------------------------------
// Alert Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlert]',
  exportAs: 'buiAlert',
  host: {
    role: 'status',
    '[id]': 'id',
    '[class]': 'computedClass()',
    '[aria-labelledby]': 'labelledBy()',
    '[aria-describedby]': 'describedBy()',
    '[attr.data-state]': 'state()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-tone]': 'tone()',
  },
})
export class BuiAlert {
  // Dependencies
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly dismissed = model(false);
  readonly appearance = input<BuiAlertAppearance>('outline');
  readonly tone = input<BuiAlertTone>('neutral');
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Queries
  private readonly title = contentChild(BuiAlertTitle, { descendants: true });
  private readonly description = contentChild(BuiAlertDescription, {
    descendants: true,
  });

  // State
  readonly id = this.uniqueId.getId('bui-alert-');
  readonly titleId = `${this.id}-title`;
  readonly descriptionId = `${this.id}-description`;

  // Computed state
  readonly state = computed(() => (this.dismissed() ? 'dismissed' : 'open'));
  private readonly labelledBy = computed(() =>
    this.title() ? this.titleId : null
  );
  private readonly describedBy = computed(() =>
    this.description() ? this.descriptionId : null
  );
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert',
      'relative flex items-start gap-x-3 rounded-xl border',
      'px-4 py-3',

      // Pin the type scale, the alert's geometry is tuned for the 20px line height
      'text-base leading-5',

      // Reserve the end when a dismiss button is present
      'has-[>[data-slot=bui-alert-dismiss-button]]:pe-11',

      // Appearance and tone
      alertVariants({
        slot: 'root',
        appearance: this.appearance(),
        tone: this.tone(),
      }),

      // User classes
      this.userClass()
    )
  );

  dismiss() {
    this.dismissed.set(true);
  }
}

// -----------------------------------------------------------------------------
// Alert Icon
// -----------------------------------------------------------------------------
@Directive({
  selector: 'mat-icon[buiAlertIcon]',
  exportAs: 'buiAlertIcon',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-icon"',
  },
})
export class BuiAlertIcon {
  // Dependencies
  private readonly alert = inject(BuiAlert);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-icon',
      'mt-0.5 size-4 shrink-0',
      'text-current',

      // Appearance and tone
      alertVariants({
        slot: 'icon',
        appearance: this.alert.appearance(),
        tone: this.alert.tone(),
      }),

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Alert Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlertContent]',
  exportAs: 'buiAlertContent',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-content"',
  },
})
export class BuiAlertContent {
  // Dependencies
  private readonly alert = inject(BuiAlert);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-content',
      'flex flex-auto flex-col',

      // Appearance and tone
      alertVariants({
        slot: 'content',
        appearance: this.alert.appearance(),
        tone: this.alert.tone(),
      }),

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Alert Title
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlertTitle]',
  exportAs: 'buiAlertTitle',
  host: {
    '[id]': 'alert.titleId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-title"',
  },
})
export class BuiAlertTitle {
  // Dependencies
  private readonly alert = inject(BuiAlert);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-title',
      'font-medium',

      // Appearance and tone
      alertVariants({
        slot: 'title',
        appearance: this.alert.appearance(),
        tone: this.alert.tone(),
      }),

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Alert Description
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlertDescription]',
  exportAs: 'buiAlertDescription',
  host: {
    '[id]': 'alert.descriptionId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-description"',
  },
})
export class BuiAlertDescription {
  // Dependencies
  private readonly alert = inject(BuiAlert);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-description',
      '*:[p]:not-last:mb-2',
      'text-neutral-a11',

      // Appearance and tone
      alertVariants({
        slot: 'description',
        appearance: this.alert.appearance(),
        tone: this.alert.tone(),
      }),

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Alert Actions
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlertActions]',
  exportAs: 'buiAlertActions',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-actions"',
  },
})
export class BuiAlertActions {
  // Dependencies
  private readonly alert = inject(BuiAlert);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-actions',
      'flex items-center gap-x-2',

      // Fixed "small" size buttons regardless of the size classes
      '*:[--button-font-size:var(--text-base)] *:[--button-icon-size:0.875rem] *:[--button-line-height:var(--leading-5)] *:[--button-padding-x:0.625rem] *:[--button-padding-y:0.25rem]',

      // Add a margin top when inside "buiAlertContent"
      'in-data-[slot=bui-alert-content]:not-first:mt-3',

      // When inside "buiAlertContent" and last but not the only child, match the line height extra of the text above on the bottom
      'in-data-[slot=bui-alert-content]:last:not-only:mb-0.5',

      // Set the height to 1lh when outside "buiAlertContent"
      'not-in-data-[slot=bui-alert-content]:h-lh',

      // When outside "buiAlertContent" and last in the alert, pull the last button so its end gap matches its top gap
      '[&:not([data-slot=bui-alert-content]_*):last-child>:last-child]:-me-2',

      // Appearance and tone
      alertVariants({
        slot: 'actions',
        appearance: this.alert.appearance(),
        tone: this.alert.tone(),
      }),

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Alert Dismiss
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlertDismiss]',
  exportAs: 'buiAlertDismiss',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-dismiss"',
    '(click)': 'dismiss()',
  },
})
export class BuiAlertDismiss {
  // Dependencies
  private readonly alert = inject(BuiAlert);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-dismiss',

      // User classes
      this.userClass()
    )
  );

  private dismiss() {
    this.alert.dismiss();
  }
}

// -----------------------------------------------------------------------------
// Alert Dismiss Button
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiAlertDismissButton]',
  exportAs: 'buiAlertDismissButton',
  hostDirectives: [BuiAlertDismiss],
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-alert-dismiss-button"',
    '[aria-label]': 'ariaLabel',
  },
})
export class BuiAlertDismissButton {
  // Dependencies
  private readonly alert = inject(BuiAlert);
  private readonly elementRef = inject(ElementRef);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // State
  private readonly ariaLabel =
    this.elementRef.nativeElement.getAttribute('aria-label') ?? 'Dismiss';

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-alert-dismiss-button',
      'text-current *:[mat-icon]:text-current',

      // Fixed "small" size icon button regardless of the size classes
      '[--icon-button-icon-size:0.875rem] [--icon-button-padding:0.4375rem] [--icon-button-size:1.75rem]',

      // Pin to the top end corner of the alert
      'absolute inset-e-2 top-2',

      // Appearance and tone
      alertVariants({
        slot: 'dismissButton',
        appearance: this.alert.appearance(),
        tone: this.alert.tone(),
      }),

      // User classes
      this.userClass()
    )
  );
}
