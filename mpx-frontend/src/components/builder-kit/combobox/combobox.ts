import { Listbox, Option } from '@angular/aria/listbox';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { ClassValue } from 'cn';
import { filter, fromEvent, merge, takeUntil } from 'rxjs';
import { bui, UniqueId } from '../utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type ComboboxPosition =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';

// -----------------------------------------------------------------------------
// Position Mappings
// -----------------------------------------------------------------------------
const POSITION_MAP: Record<ComboboxPosition, ConnectedPosition> = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
  },
  'top-start': {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  'top-end': {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
  },
  'bottom-start': {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  'bottom-end': {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
};

const FALLBACK_POSITIONS: Record<ComboboxPosition, ComboboxPosition[]> = {
  top: ['bottom'],
  'top-start': ['bottom-start'],
  'top-end': ['bottom-end'],

  bottom: ['top'],
  'bottom-start': ['top-start'],
  'bottom-end': ['top-end'],
};

// -----------------------------------------------------------------------------
// Relayed Keys
// -----------------------------------------------------------------------------
const RELAYED_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
];

// -----------------------------------------------------------------------------
// Tabbable Selector
// -----------------------------------------------------------------------------
const TABBABLE =
  ':is(button, [href], input, select, textarea, [tabindex]):not(:disabled)';

// -----------------------------------------------------------------------------
// Combobox Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiCombobox]',
  exportAs: 'buiCombobox',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox"',
    '[attr.data-invalid]': 'errorState() || null',
    '[attr.data-disabled]': 'disabled() || null',
  },
})
export class BuiCombobox<V> {
  // Dependencies
  readonly elementRef = inject(ElementRef);
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly expanded = model(false);
  readonly value = model<V[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Queries
  readonly trigger = contentChild.required(BuiComboboxTrigger, {
    descendants: true,
  });
  readonly listbox = contentChild(BuiComboboxListbox, { descendants: true });
  readonly search = contentChild(BuiComboboxSearch, { descendants: true });

  // State
  readonly id = this.uniqueId.getId('bui-combobox-');
  readonly triggerId = `${this.id}-trigger`;

  // Computed state
  readonly errorState = computed(() => this.invalid() && this.touched());
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox',

      // User classes
      this.userClass()
    )
  );

  constructor() {
    // An effect also sees a close written through the expanded binding
    let opened = false;

    effect(() => {
      const expanded = this.expanded();

      untracked(() => {
        if (opened && !expanded) {
          this.touch.emit();
        }

        opened = expanded;
      });
    });
  }
}

// -----------------------------------------------------------------------------
// Combobox Control
// -----------------------------------------------------------------------------
@Directive({
  host: {
    role: 'combobox',
    '[aria-expanded]': 'combobox.expanded()',
    '[aria-controls]': 'combobox.listbox()?.listbox.id()',
    '[aria-activedescendant]': 'combobox.listbox()?.listbox.activeDescendant()',
    '(keydown)': 'onKeydown($event)',
  },
})
abstract class BuiComboboxControl {
  // Dependencies
  protected readonly combobox = inject(BuiCombobox);
  readonly element: HTMLElement = inject(ElementRef).nativeElement;

  protected onKeydown(event: KeyboardEvent) {
    // The key belongs to the IME while it composes
    if (event.isComposing || this.combobox.disabled()) {
      return;
    }

    if (!this.combobox.expanded()) {
      if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.combobox.expanded.set(true);
      }

      return;
    }

    if (event.key === 'Escape') {
      // Keep an enclosing overlay, e.g. a dialog, from closing along
      event.stopPropagation();
      this.combobox.expanded.set(false);
    } else if (this.relays(event)) {
      event.preventDefault();

      const listbox = this.combobox.listbox();

      // Aria wraps up from an unset active option to the second to last
      if (listbox && event.key === 'ArrowUp' && listbox.activeIndex() < 0) {
        listbox.listbox.gotoIndex(listbox.options().length - 1);
      } else {
        listbox?.listbox.element.dispatchEvent(
          new KeyboardEvent(event.type, event)
        );
      }
    }
  }

  protected relays(event: KeyboardEvent) {
    return RELAYED_KEYS.includes(event.key);
  }
}

// -----------------------------------------------------------------------------
// Combobox Trigger
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxTrigger]',
  exportAs: 'buiComboboxTrigger',
  host: {
    '[id]': 'id()',
    '[class]': 'computedClass()',
    '[attr.disabled]': 'combobox.disabled() || null',
    'aria-haspopup': 'listbox',
    '[aria-invalid]': 'combobox.errorState()',
    '[aria-required]': 'combobox.required()',
    '[attr.data-slot]': '"bui-combobox-trigger"',
    '[attr.data-state]': 'state()',
    '(blur)': 'onBlur()',

    // A label forwards clicks to its control, never a mousedown
    '(mousedown)': 'onMousedown($event)',
  },
})
export class BuiComboboxTrigger extends BuiComboboxControl {
  // Dependencies
  private readonly focusMonitor = inject(FocusMonitor);

  // Inputs / Outputs
  readonly id = input(this.combobox.triggerId);
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly state = computed(() =>
    this.combobox.expanded() ? 'open' : 'closed'
  );
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-trigger',
      'cursor-pointer select-none',

      // User classes
      this.userClass()
    )
  );

  protected override relays(event: KeyboardEvent) {
    // Space toggles, printable keys run the typeahead, Ctrl/Cmd+A selects all
    return (
      super.relays(event) ||
      (event.key.length === 1 &&
        (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() === 'a'))
    );
  }

  protected onBlur() {
    // An open panel touches on close instead
    if (!this.combobox.expanded()) {
      this.combobox.touch.emit();
    }
  }

  protected onMousedown(event: MouseEvent) {
    if (event.button !== 0 || this.combobox.disabled()) {
      return;
    }

    // Safari never focuses a pressed button
    event.preventDefault();
    this.focusMonitor.focusVia(this.element, 'mouse');

    this.combobox.expanded.update((expanded) => !expanded);
  }
}

// -----------------------------------------------------------------------------
// Combobox Search
// -----------------------------------------------------------------------------
@Directive({
  selector: 'input[buiComboboxSearch]',
  exportAs: 'buiComboboxSearch',
  host: {
    '[class]': 'computedClass()',
    'aria-autocomplete': 'list',
    '[attr.data-slot]': '"bui-combobox-search"',
  },
})
export class BuiComboboxSearch extends BuiComboboxControl {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-search',
      'h-9 w-full bg-transparent px-3 outline-none',
      'border-b border-neutral-a4 placeholder:text-neutral-a10',

      // User classes
      this.userClass()
    )
  );

  constructor() {
    super();

    afterNextRender(() => this.element.focus());
  }

  protected override relays(event: KeyboardEvent) {
    // Shift+Home and Shift+End select the typed text
    return (
      super.relays(event) &&
      !(event.shiftKey && (event.key === 'Home' || event.key === 'End'))
    );
  }
}

// -----------------------------------------------------------------------------
// Combobox Portal
// -----------------------------------------------------------------------------
@Directive({
  selector: 'ng-template[buiComboboxPortal]',
  exportAs: 'buiComboboxPortal',
})
export class BuiComboboxPortal {
  // Dependencies
  private readonly combobox = inject(BuiCombobox);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly overlay = inject(Overlay);
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  // Inputs / Outputs
  readonly position = input<ComboboxPosition>('bottom-start');
  readonly offset = input(4, { transform: numberAttribute });
  readonly matchWidth = input(true, { transform: booleanAttribute });

  // State
  private overlayRef: OverlayRef | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Computed state
  private readonly positions = computed<ConnectedPosition[]>(() => {
    const primary = this.position();
    const offset = this.offset();
    const fallbacks = FALLBACK_POSITIONS[primary];

    // Apply the correct directional offset
    const applyOffset = (position: ComboboxPosition): ConnectedPosition => ({
      ...POSITION_MAP[position],
      offsetY: position.startsWith('top') ? -offset : offset,
    });

    // Return the primary position + fallbacks with the offsets applied
    return [applyOffset(primary), ...fallbacks.map(applyOffset)];
  });

  constructor() {
    effect(() => {
      const expanded = this.combobox.expanded();

      untracked(() => (expanded ? this.attach() : this.detach()));
    });

    // A value change can shift the trigger without resizing it
    afterRenderEffect(() => {
      this.combobox.value();
      this.overlayRef?.updatePosition();
    });

    this.destroyRef.onDestroy(() => this.detach());
  }

  private attach() {
    const root = this.combobox.elementRef.nativeElement as HTMLElement;
    const trigger = this.combobox.trigger().element;

    this.overlayRef = this.overlay.create({
      width: this.matchWidth() ? trigger.offsetWidth : undefined,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions(this.positions())
        .withFlexibleDimensions(false)
        .withPush(true),
    });

    this.overlayRef.attach(
      new TemplatePortal(this.templateRef, this.viewContainerRef)
    );

    const overlay = this.overlayRef.overlayElement;
    const inside = [trigger, overlay];

    // Presses on the trigger toggle on their own
    merge(
      this.overlayRef.outsidePointerEvents(),
      fromEvent(this.document, 'focusin')
    )
      .pipe(
        filter(
          (event) =>
            !inside.some((element) => element.contains(event.target as Node))
        ),
        takeUntil(this.overlayRef.detachments())
      )
      .subscribe(() => this.combobox.expanded.set(false));

    merge(
      ...inside.map((element) => fromEvent<KeyboardEvent>(element, 'keydown'))
    )
      .pipe(
        filter((event) => event.key === 'Tab' || event.key === 'Escape'),
        takeUntil(this.overlayRef.detachments())
      )
      .subscribe((event) => {
        if (event.key === 'Tab') {
          this.onTab(event, trigger, overlay);
        } else if (!event.isComposing) {
          // Keep an enclosing overlay, e.g. a dialog, from closing along
          event.stopPropagation();
          this.combobox.expanded.set(false);
        }
      });

    // The arrows only drive the options from the search or the trigger
    fromEvent<MouseEvent>(overlay, 'click')
      .pipe(
        filter((event) => {
          const target = event.target as Element;

          return (
            !!target.closest('button') &&
            !this.combobox.listbox()?.listbox.element.contains(target)
          );
        }),
        takeUntil(this.overlayRef.detachments())
      )
      .subscribe((event) =>
        this.focusMonitor.focusVia(
          this.combobox.search()?.element ?? trigger,
          event.detail ? 'mouse' : 'keyboard'
        )
      );

    // Reflow inside the root can move the trigger without resizing it
    this.resizeObserver = new ResizeObserver(() =>
      this.overlayRef?.updatePosition()
    );
    this.resizeObserver.observe(trigger);
    this.resizeObserver.observe(root);
  }

  private onTab(
    event: KeyboardEvent,
    trigger: HTMLElement,
    overlay: HTMLElement
  ) {
    const listbox = this.combobox.listbox()?.listbox.element;

    // Aria tabs to the listbox host, but its options are driven from the control
    const tabbables = Array.from(
      overlay.querySelectorAll<HTMLElement>(TABBABLE)
    ).filter((element) => element.tabIndex >= 0 && !listbox?.contains(element));
    const index = tabbables.indexOf(event.target as HTMLElement);
    const next = tabbables[event.shiftKey ? index - 1 : index + 1];

    if (next) {
      event.preventDefault();
      next.focus();
    } else if (event.target !== trigger) {
      // Unprevented, a forward Tab carries on from the trigger into the page
      if (event.shiftKey) {
        event.preventDefault();
      }

      trigger.focus();
    }
  }

  private detach() {
    // Focus inside the panel, e.g. on the search, would drop to the body
    if (this.overlayRef?.overlayElement.contains(this.document.activeElement)) {
      this.combobox.trigger().element.focus();
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}

// -----------------------------------------------------------------------------
// Combobox Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxContent]',
  exportAs: 'buiComboboxContent',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-content"',
  },
})
export class BuiComboboxContent {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-content',
      'relative isolate flex w-full flex-col',
      'rounded-(--theme-border-radius) border border-transparent',

      // Border color as the background to avoid corner rendering issues and
      // better shadow/background-color blending
      'bg-neutral-a4 dark:bg-neutral-a5',

      // Background implemented as the 'before' pseudo-element
      'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
      'before:rounded-[calc(var(--theme-border-radius)-1px)]',
      'before:bg-white dark:before:bg-neutral-3',
      'before:shadow-lg',

      // Animations
      'animate-in duration-100 zoom-in-95 fade-in',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Combobox Listbox
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxListbox]',
  exportAs: 'buiComboboxListbox',
  hostDirectives: [
    {
      directive: Listbox,
      inputs: [
        'id',
        'orientation',
        'multi',
        'wrap',
        'focusMode',
        'selectionMode',
        'typeaheadDelay',
        'disabled',
        'readonly',
        'tabindex',
      ],
    },
  ],
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-listbox"',
    '(keydown.enter)': 'commit()',

    // Focus has to stay on the combobox input the keyboard is relayed from
    '(mousedown)': '$event.preventDefault()',
  },
})
export class BuiComboboxListbox<V> {
  // Dependencies
  readonly listbox = inject<Listbox<V>>(Listbox);
  private readonly combobox = inject<BuiCombobox<V>>(BuiCombobox);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Queries
  readonly options = contentChildren<Option<V>>(Option, { descendants: true });

  // Computed state
  private readonly optionValues = computed(() =>
    this.options().map((option) => option.value())
  );
  readonly activeIndex = computed(() =>
    this.options().findIndex((option) => option.active())
  );
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-listbox',
      'flex max-h-72 flex-col gap-y-0.5 overflow-y-auto overscroll-contain p-1',

      // The active option carries the focus indication
      'outline-none',

      // User classes
      this.userClass()
    )
  );

  constructor() {
    // Activedescendant navigation moves no DOM focus, so nothing scrolls on its own
    effect(() => {
      this.listbox.activeDescendant();

      untracked(() => this.listbox.scrollActiveItemIntoView());
    });

    // Aria drops the selected values it has no option for, so it only gets the
    // rendered ones and the filtered out ones are merged back on every pick
    afterRenderEffect(() => {
      const values = this.optionValues();
      const value = this.combobox.value();

      untracked(() =>
        this.listbox.value.set(value.filter((v) => values.includes(v)))
      );
    });

    // Only a selected option starts active, read after the sync above sets it
    afterRenderEffect(() => {
      const options = this.options();

      untracked(() => {
        const selected = options.findIndex((option) => option.selected());

        if (selected < 0) {
          this.clearActive();
        } else {
          this.listbox.gotoIndex(selected);
        }
      });
    });

    this.listbox.value.subscribe((picked) => {
      const values = this.optionValues();
      const value = this.combobox.value();
      const active = this.options()[this.activeIndex()];

      // A single select re-pick of the selected option confirms, never clears
      if (
        !this.listbox.multi() &&
        !picked.length &&
        active &&
        value.includes(active.value())
      ) {
        this.listbox.value.set([active.value()]);

        return;
      }

      const kept =
        this.listbox.multi() || !picked.length
          ? value.filter((v) => !values.includes(v))
          : [];
      const next = [...kept, ...picked];

      if (
        next.length !== value.length ||
        next.some((v) => !value.includes(v))
      ) {
        this.combobox.value.set(next);
      }
    });
  }

  commit() {
    // Only a multi select with an active option stays open to keep toggling
    if (!this.listbox.multi() || this.activeIndex() < 0) {
      this.combobox.expanded.set(false);
    }
  }

  // Aria has no public way to clear the active option and sets one by default
  private clearActive() {
    this.listbox._pattern.hasBeenInteracted.set(true);
    this.listbox._pattern.listBehavior.unfocus();
  }
}

// -----------------------------------------------------------------------------
// Combobox Group
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxGroup]',
  exportAs: 'buiComboboxGroup',
  host: {
    role: 'group',
    '[class]': 'computedClass()',
    '[attr.aria-labelledby]': 'labelId()',
    '[attr.data-slot]': '"bui-combobox-group"',
  },
})
export class BuiComboboxGroup {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // State
  readonly labelId = signal<string | null>(null);

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-group',
      'flex flex-col gap-y-0.5',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Combobox Group Label
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxGroupLabel]',
  exportAs: 'buiComboboxGroupLabel',
  host: {
    '[id]': 'id',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-group-label"',
  },
})
export class BuiComboboxGroupLabel {
  // Dependencies
  private readonly group = inject(BuiComboboxGroup);
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // State
  readonly id = this.uniqueId.getId('bui-combobox-group-label-');

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-group-label',
      'px-2 py-1.5 font-medium',

      // User classes
      this.userClass()
    )
  );

  constructor() {
    this.group.labelId.set(this.id);
  }
}

// -----------------------------------------------------------------------------
// Combobox Option
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxOption]',
  exportAs: 'buiComboboxOption',
  hostDirectives: [
    {
      directive: Option,
      inputs: ['id', 'value', 'label', 'disabled'],
    },
  ],
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-option"',
    '(mouseenter)': 'onMouseEnter()',
    '(click)': 'comboboxListbox.commit()',
  },
})
export class BuiComboboxOption {
  // Dependencies
  protected readonly comboboxListbox = inject(BuiComboboxListbox);
  private readonly option = inject(Option);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-option',
      'flex cursor-pointer items-center gap-x-2 select-none',
      'rounded-[calc(var(--theme-border-radius)*2/3)] px-2 py-1.5',

      // One highlight follows both pointer and keyboard, so no hover background
      'data-[active=true]:bg-neutral-a3',
      'aria-disabled:pointer-events-none',

      // Secondary text dims with the rest, overriding its own color
      'aria-disabled:text-neutral-a9 aria-disabled:**:text-neutral-a9',

      // User classes
      this.userClass()
    )
  );

  protected onMouseEnter() {
    this.comboboxListbox.listbox.gotoIndex(
      this.comboboxListbox.options().indexOf(this.option)
    );
  }
}

// -----------------------------------------------------------------------------
// Combobox Option Indicator
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxOptionIndicator]',
  exportAs: 'buiComboboxOptionIndicator',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-option-indicator"',
  },
})
export class BuiComboboxOptionIndicator {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-option-indicator',
      'relative',

      // Keeps its space when hidden, so selecting shifts no text
      'invisible size-4 shrink-0',
      'group-aria-selected/bui-combobox-option:visible',

      // Values mirror the pseudo-checkbox from 'core.css'
      '[--pseudo-checkbox-single-short-part-width:0.09375rem]',
      '[--pseudo-checkbox-single-short-part-height:0.3125rem]',
      '[--pseudo-checkbox-single-long-part-width:0.625rem]',
      '[--pseudo-checkbox-single-long-part-height:0.09375rem]',
      '[--pseudo-checkbox-single-top:0.4375rem]',
      '[--pseudo-checkbox-single-left:0.3125rem]',
      '[--pseudo-checkbox-single-color:var(--color-neutral-12)]',
      'group-aria-disabled/bui-combobox-option:[--pseudo-checkbox-single-color:var(--color-neutral-9)]',

      // Check
      'before:absolute before:rounded-full after:absolute after:rounded-full',
      'before:bg-(--pseudo-checkbox-single-color)',
      'after:bg-(--pseudo-checkbox-single-color)',

      // Short part
      'before:top-(--pseudo-checkbox-single-top)',
      'before:left-(--pseudo-checkbox-single-left)',
      'before:w-(--pseudo-checkbox-single-short-part-width)',
      'before:h-(--pseudo-checkbox-single-short-part-height)',
      'before:origin-[right_calc(var(--pseudo-checkbox-single-short-part-height)_-_var(--pseudo-checkbox-single-short-part-width))]',
      'before:-rotate-35',

      // Long part
      'after:top-[calc(var(--pseudo-checkbox-single-top)_+_var(--pseudo-checkbox-single-short-part-height)_-_var(--pseudo-checkbox-single-long-part-height))]',
      'after:left-(--pseudo-checkbox-single-left)',
      'after:w-(--pseudo-checkbox-single-long-part-width)',
      'after:h-(--pseudo-checkbox-single-long-part-height)',
      'after:origin-[var(--pseudo-checkbox-single-short-part-width)_0]',
      'after:-rotate-50',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Combobox Option Custom Indicator
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxOptionCustomIndicator]',
  exportAs: 'buiComboboxOptionCustomIndicator',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-option-custom-indicator"',
  },
})
export class BuiComboboxOptionCustomIndicator {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-option-custom-indicator',

      // Keeps its space when hidden, so selecting shifts no text
      'invisible size-4 shrink-0',
      'group-aria-selected/bui-combobox-option:visible',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Combobox Empty
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiComboboxEmpty]',
  exportAs: 'buiComboboxEmpty',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-combobox-empty"',
  },
})
export class BuiComboboxEmpty {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-combobox-empty',
      'px-2 py-6 text-center text-neutral-a11',

      // User classes
      this.userClass()
    )
  );
}
