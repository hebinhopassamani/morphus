import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  Service,
  signal,
  untracked,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { ClassValue } from 'cn';
import Color from 'colorjs.io';
import { LocalStorage } from '../../core/local-storage';
import { WINDOW } from '../../core/window';
import { bui } from '../utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** Hue in degrees; saturation, value and alpha as 0–1 fractions. */
type Hsv = { h: number; s: number; v: number; a: number };

type Surface = 'saturation' | 'hue' | 'alpha';

type EyeDropperResult = { sRGBHex: string };

type EyeDropperWindow = {
  EyeDropper?: new () => { open(): Promise<EyeDropperResult> };
};

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const RECENT_COLORS_KEY = 'recentColors';
const RECENT_COLORS_LIMIT = 10;

// -----------------------------------------------------------------------------
// Recent Colors
// -----------------------------------------------------------------------------
@Service()
export class BuiRecentColors {
  // Dependencies
  private readonly localStorage = inject(LocalStorage);

  // State
  readonly colors = signal<string[]>(this.read());

  /** Moves a color to the front of the list, deduped and bounded. */
  remember(color: string): void {
    if (!color) {
      return;
    }

    const colors = [
      color,
      ...this.colors().filter((existing) => existing !== color),
    ].slice(0, RECENT_COLORS_LIMIT);

    this.colors.set(colors);

    this.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(colors));
  }

  private read(): string[] {
    try {
      const raw = this.localStorage.getItem(RECENT_COLORS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((entry) => typeof entry === 'string')
        .slice(0, RECENT_COLORS_LIMIT);
    } catch {
      return [];
    }
  }
}

// -----------------------------------------------------------------------------
// Color Picker
// -----------------------------------------------------------------------------
@Component({
  selector: 'bui-color-picker',
  exportAs: 'buiColorPicker',
  imports: [
    MatButtonToggle,
    MatButtonToggleGroup,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatFormField,
    MatPrefix,
    MatSuffix,
    MatButtonToggleGroup,
    MatButtonToggle,
  ],
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-color-picker"',
  },
  template: `
    <!-- Saturation & value -->
    <div
      class="relative h-32 w-full cursor-crosshair touch-none overflow-hidden rounded-(--theme-border-radius)"
      [style.background]="saturationCSS()"
      (pointerdown)="onPointerDown($event, 'saturation')"
      (pointermove)="onPointerMove($event, 'saturation')"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      <div
        class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md ring-1 ring-black-a5"
        [style.left.%]="hsv().s * 100"
        [style.top.%]="(1 - hsv().v) * 100"
      ></div>
    </div>

    <!-- Current color & hex input -->
    <div class="flex items-center gap-x-2">
      <!-- Color -->
      <div
        class="size-8 shrink-0 rounded-(--theme-border-radius) bg-size-[1rem_1rem] outline -outline-offset-1 outline-neutral-a5"
        [style.background-image]="swatchCSS()"
      ></div>

      <!-- Input -->
      <mat-form-field
        class="flex-auto"
        subscriptSizing="dynamic"
      >
        <input
          matInput
          autocomplete="off"
          spellcheck="false"
          placeholder="None"
          [value]="hexText()"
          (blur)="commitHex(hexInput)"
          (keydown.enter)="commitHex(hexInput)"
          #hexInput
        />
        <div matTextPrefix>#</div>
        @if (hasEyeDropper) {
          <button
            matIconButton
            matSuffix
            type="button"
            aria-label="Pick a color from the screen"
            (click)="pickFromScreen()"
          >
            <mat-icon svgIcon="pipette" />
          </button>
        }
      </mat-form-field>
    </div>

    <!-- Hue -->
    <div
      class="relative h-4 w-full cursor-pointer touch-none rounded-full bg-[linear-gradient(to_right,red,yellow,lime,cyan,blue,magenta,red)]"
      (pointerdown)="onPointerDown($event, 'hue')"
      (pointermove)="onPointerMove($event, 'hue')"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      <div
        class="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black-a5"
        [style.left]="thumbLeft(hsv().h / 360)"
      ></div>
    </div>

    <!-- Alpha -->
    @if (alpha()) {
      <div
        class="relative h-4 w-full cursor-pointer touch-none rounded-full bg-[repeating-conic-gradient(var(--color-neutral-a5)_0%_25%,transparent_0%_50%)] bg-size-[0.5rem_0.5rem]"
        (pointerdown)="onPointerDown($event, 'alpha')"
        (pointermove)="onPointerMove($event, 'alpha')"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
      >
        <div
          class="pointer-events-none absolute inset-0 rounded-full"
          [style.background-image]="alphaGradient()"
        ></div>
        <div
          class="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black-a5"
          [style.left]="thumbLeft(hsv().a)"
        ></div>
      </div>
    }

    <!-- Color palette -->
    @if (palette().length) {
      <div class="flex flex-col gap-y-2">
        <div class="text-sm font-medium text-neutral-a11">Color palette</div>
        <mat-button-toggle-group
          class="flex flex-wrap gap-1.5"
          [value]="value()"
          (change)="pick($event.value)"
        >
          @for (color of palette(); track color) {
            <mat-button-toggle
              class="rounded-[calc(var(--theme-border-radius)*2/3)] outline-offset-2 outline-primary-9 [--button-toggle-bg-color-active:transparent] [--button-toggle-bg-color-checked:transparent] [--button-toggle-bg-color-hover:transparent] [--button-toggle-padding-x:0px] [--button-toggle-padding-y:0px]"
              [class.outline-2]="value() === color"
              [aria-label]="color"
              [value]="color"
              [checked]="color === value()"
            >
              <div
                class="size-7 rounded-[calc(var(--theme-border-radius)*2/3)] bg-size-[0.875rem_0.875rem] outline -outline-offset-1 outline-neutral-a4"
                [style.background-image]="swatchLayers(color)"
              ></div>
            </mat-button-toggle>
          }
        </mat-button-toggle-group>
      </div>
    }

    <!-- Recently used -->
    @if (recentColors() && recent().length) {
      <div class="flex flex-col gap-y-2">
        <div class="text-sm font-medium text-neutral-a11">Recently used</div>
        <mat-button-toggle-group
          class="flex flex-wrap gap-1.5"
          [value]="value()"
          (change)="pick($event.value)"
        >
          @for (color of recent(); track color) {
            <mat-button-toggle
              class="rounded-[calc(var(--theme-border-radius)*2/3)] outline-offset-2 outline-primary-9 [--button-toggle-bg-color-active:transparent] [--button-toggle-bg-color-checked:transparent] [--button-toggle-bg-color-hover:transparent] [--button-toggle-padding-x:0px] [--button-toggle-padding-y:0px]"
              [class.outline-2]="value() === color"
              [aria-label]="color"
              [value]="color"
              [checked]="color === value()"
            >
              <div
                class="size-7 rounded-[calc(var(--theme-border-radius)*2/3)] bg-size-[0.875rem_0.875rem] outline -outline-offset-1 outline-neutral-a4"
                [style.background-image]="swatchLayers(color)"
              ></div>
            </mat-button-toggle>
          }
        </mat-button-toggle-group>
      </div>
    }
  `,
})
export class BuiColorPicker {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  private readonly recentColorsService = inject(BuiRecentColors);
  private readonly window = inject(WINDOW);

  // Inputs / Outputs
  readonly value = model<string>('');
  readonly alpha = input(false, { transform: booleanAttribute });
  readonly palette = input<string[]>([]);
  readonly recentColors = input(true, { transform: booleanAttribute });
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // State
  private readonly hsv = signal<Hsv>({ h: 0, s: 1, v: 1, a: 1 });
  private emitted = '';
  private openedWith: string | null = null;

  private readonly hasEyeDropper = !!this.window && 'EyeDropper' in this.window;

  // Computed state
  private readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-color-picker',
      'flex w-full flex-col gap-y-3',

      // User classes
      this.userClass()
    )
  );
  private readonly recent = this.recentColorsService.colors.asReadonly();
  private readonly hexText = computed(() => this.value().replace('#', ''));
  private readonly hueCSS = computed(() => `hsl(${this.hsv().h} 100% 50%)`);

  // White and black ramps over the hue;
  // the hue itself is the color layer beneath.
  private readonly saturationCSS = computed(
    () =>
      'linear-gradient(to top, #000, #0000), ' +
      'linear-gradient(to right, #fff, #fff0), ' +
      this.hueCSS()
  );
  private readonly alphaGradient = computed(
    () =>
      `linear-gradient(to right, transparent, ${this.toHex({ ...this.hsv(), a: 1 }, false)})`
  );
  private readonly swatchCSS = computed(() => this.swatchLayers(this.value()));

  constructor() {
    // Lifecycle

    // A color counts as used once the panel closes holding something other than
    // what it opened with — dragging live-updates the value, but only the
    // landing spot is kept.
    this.destroyRef.onDestroy(() => {
      const value = this.value();

      if (this.recentColors() && value !== this.openedWith) {
        this.recentColorsService.remember(value);
      }
    });

    // Effects

    // Anything this picker wrote is already reflected in the HSV state;
    // re-adopting it would round-trip through hex and lose the hue of a fully
    // desaturated color.
    effect(() => {
      const color = this.value();

      untracked(() => {
        this.openedWith ??= this.value();

        if (color === this.emitted) {
          return;
        }

        this.emitted = color;

        const parsed = this.parse(color);

        if (parsed) {
          this.adopt(parsed);
        }
      });
    });
  }

  // Native-slider travel: the full range maps onto the track inset by half a
  // thumb plus the ring's 1px, so the knob and its outline stay inside the
  // rounded caps.
  private thumbLeft(fraction: number): string {
    return `calc(0.4375rem + 1px + (100% - 0.875rem - 2px) * ${fraction})`;
  }

  // A solid-color gradient paints over the checkerboard in one layer stack.
  private swatchLayers(color: string): string {
    const layer = color || 'transparent';

    return (
      `linear-gradient(${layer}, ${layer}), ` +
      'repeating-conic-gradient(var(--color-neutral-a5) 0% 25%, transparent 0% 50%)'
    );
  }

  // Capturing the pointer is what makes release always end the gesture,
  // wherever the pointer travelled, and it earns touch the same press-and-drag
  // as the mouse.
  private onPointerDown(event: PointerEvent, surface: Surface): void {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const track = event.currentTarget as HTMLElement;

    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    this.applyPointer(event, track, surface);
  }

  private onPointerMove(event: PointerEvent, surface: Surface): void {
    const track = event.currentTarget as HTMLElement;

    if (!track.hasPointerCapture(event.pointerId)) {
      return;
    }

    this.applyPointer(event, track, surface);
  }

  private onPointerUp(event: PointerEvent): void {
    const track = event.currentTarget as HTMLElement;

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  }

  /** Reformats to canonical hex, or restores the current color when the text is junk. */
  private commitHex(input: HTMLInputElement): void {
    const typed = input.value.trim();

    // Blur fires even on an untouched field, where there is nothing to commit.
    if (typed === this.hexText()) {
      input.value = this.hexText();

      return;
    }

    if (typed === '') {
      this.emitted = '';
      this.value.set('');
      input.value = '';

      return;
    }

    const color = this.parse(typed);

    if (color) {
      this.adopt(color);
      this.commit();
    }

    input.value = this.hexText();
  }

  private pick(color: string): void {
    const parsed = this.parse(color);

    if (!parsed) {
      return;
    }

    this.adopt(parsed);
    this.commit();
  }

  // A Promise because EyeDropper has no observable form.
  private pickFromScreen(): void {
    const eyeDropper = (this.window as EyeDropperWindow | null)?.EyeDropper;

    if (!eyeDropper) {
      return;
    }

    new eyeDropper().open().then(
      (result) => this.pick(result.sRGBHex),
      () => undefined
    );
  }

  private applyPointer(
    event: PointerEvent,
    track: HTMLElement,
    surface: Surface
  ): void {
    const rect = track.getBoundingClientRect();

    this.hsv.update((hsv) =>
      this.atFraction(
        hsv,
        surface,
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height
      )
    );
    this.commit();
  }

  // Fractions rather than pixels, so the same point means the same color at any
  // track size.
  private atFraction(hsv: Hsv, surface: Surface, x: number, y: number): Hsv {
    switch (surface) {
      case 'saturation':
        return { ...hsv, s: this.clamp(x), v: 1 - this.clamp(y) };
      case 'hue':
        return { ...hsv, h: this.clamp(x) * 360 };
      case 'alpha':
        return { ...hsv, a: this.clamp(x) };
    }
  }

  private commit(): void {
    const hex = this.toHex(this.hsv(), this.alpha());

    this.emitted = hex;
    this.value.set(hex);
  }

  // Forgiving on the way in: a bare hex wins over a keyword of the same
  // spelling, since the field is labeled with a `#`.
  private parse(text: string): Color | null {
    const trimmed = text.trim();

    if (trimmed === '') {
      return null;
    }

    const candidates = /^[0-9a-f]{3,8}$/i.test(trimmed)
      ? ['#' + trimmed, trimmed]
      : [trimmed];

    for (const candidate of candidates) {
      try {
        return new Color(candidate);
      } catch {
        continue;
      }
    }

    return null;
  }

  // Hue is NaN for a fully desaturated color, which would otherwise reset the
  // slider.
  private adopt(color: Color): void {
    const [h, s, v] = color.to('hsv').coords;

    this.hsv.update((hsv) => ({
      h: h === null || Number.isNaN(h) ? hsv.h : ((h % 360) + 360) % 360,
      s: this.clamp((s ?? 0) / 100),
      v: this.clamp((v ?? 0) / 100),
      a: this.alpha() ? this.clamp(color.alpha) : 1,
    }));
  }

  private toHex(hsv: Hsv, withAlpha: boolean): string {
    const opaque = !withAlpha || hsv.a >= 1;

    return new Color(
      'hsv',
      [hsv.h, hsv.s * 100, hsv.v * 100],
      opaque ? 1 : hsv.a
    )
      .to('srgb')
      .toString({ format: 'hex', collapse: false, alpha: !opaque })
      .toLowerCase();
  }

  // Finite check included: a zero-width track would otherwise divide to NaN.
  private clamp(value: number): number {
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  }
}
