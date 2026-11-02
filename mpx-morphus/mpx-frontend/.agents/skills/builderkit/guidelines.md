# BuilderKit design guidelines

How to consume blocks and compose pages in BuilderKit's visual language. Installing
Core is a different job — that is `SKILL.md`; this document assumes Core is installed
and the app renders under `#bui`.

Blocks are showcases, not components: their markup is copied into the application and
adapted. A block's own metadata (`state`, `adaptation`, `container`, `spacing`,
`leaveAlone`, …) governs that block and overrides anything here. This document is
everything the blocks have in common.

## Buttons

BuilderKit replaces Material's button variants with its own class vocabulary. The
directive is always bare — `matButton` or `matIconButton`, on a `<button>` or an `<a>` —
and the look comes from classes.

**The classes only work on those directives.** A plain `<a class="tertiary small">` is
an unstyled anchor — the vocabulary below styles `matButton`/`matIconButton` elements
and nothing else. A nav link that should look like a button gets the directive *and*
the classes; a link that is just a link is styled with utilities, not this vocabulary.

### Text buttons (`matButton`)

- **Variants**: `primary`, `secondary`, `tertiary`, `link`.
- **Modifier**: `destructive`, combined with any variant.
- **Sizes**: `tiny`, `small`, `large`. Medium is the default and has no class.

`secondary` is what a button with no variant class renders as — the two share one rule,
so blocks write bare `matButton` for a secondary button and never spell it out.

| Variant | Fill | Label / icon |
|---|---|---|
| `primary` | `primary-9`, hover `primary-10` | `primary-contrast` |
| `secondary` | white (dark: `neutral-7`), `neutral-a4` border, 1px shadow | `neutral-12` / `neutral-a11` |
| `tertiary` | none; hover `neutral-a3` | `neutral-12` / `neutral-a11` |
| `link` | none — zero padding, no border, underline on hover | `neutral-12`, decoration `neutral-a11` |

`destructive` on `primary` swaps the fill to `error-9`/`error-10` with an
`error-contrast` label. On the other three it recolors label and icon to `error-a11`
and tints the hover with `error-a3`.

| Size | Label | Padding y / x | Icon |
|---|---|---|---|
| `tiny` | 12px / 16px | 4px / 8px | 14px |
| `small` | 13px / 20px | 4px / 10px | 14px |
| *(default)* | 13px / 20px | 6px / 12px | 16px |
| `large` | 14px / 20px | 8px / 12px, larger radius | 16px |

A `matButton` with an icon and no label text picks up square padding on its own.
Icons project before the label; add `iconPositionEnd` to the `mat-icon` to put it after.
`spread` makes the label fill the width, for select-like triggers with a trailing chevron.

The `link` variant draws no color of its own. Inline text links in the blocks add
`text-primary-a11 decoration-primary-a11` on top of it.

### Icon buttons (`matIconButton`)

Square, always the ghost treatment — icon `neutral-a11`, hover `neutral-a3`. The
variant classes do not apply here; only `destructive` and the sizes do.

| Class | Box | Icon |
|---|---|---|
| `tiny` | 24px | 14px |
| `small` | 28px | 14px |
| *(default)* | 32px | 16px |
| `large` | 36px | 20px |

### Not part of the vocabulary

Material's appearances — `matButton="filled" | "outlined" | "elevated" | "tonal"` — are
never used. Nothing in Core styles them, and Core's `#bui`-scoped rules override the
background, color, height, padding and radius they would set, so the button still
renders as its BuilderKit class says (secondary when there is none). Setting one is
dead markup, not a variant.

## Form fields

`mat-form-field` carries the same size vocabulary as the buttons, on the field element
itself. The class covers everything inside it — input, textarea, `mat-select`, native
`select`, prefixes and suffixes.

| Class | Text | Height | Padding y / x | Icon |
|---|---|---|---|---|
| `tiny` | 12px / 16px | 24px | 4px / 8px | 14px |
| `small` | 13px / 20px | 28px | 4px / 10px | 14px |
| *(default)* | 13px / 20px | 32px | 6px / 12px | 16px |
| `large` | 16px / 20px | 36px | 8px / 14px, larger radius | 18px |

**Controls sharing a row share a size.** The heights are drawn to match the button
scale, so a field and the button beside it line up only when both carry the same class —
`tiny` with `tiny`, bare with bare. The row's primary action is the exception: it stays
default-sized while the filter chrome beside it runs `small`, the way the tables block's
toolbar does.

Under 640px the default and `large` fields bump their text to 16px, the guard against
iOS zooming the page on focus. `small` and `tiny` keep their size at every width; they
are opt-in density for toolbars, filter bars and table chrome, where a control is small
on purpose. Do not reach for them for primary text entry on a screen that matters on
mobile — that is exactly the input the bump exists for.

**A standalone autosize `textarea` takes no block padding.** Outside `mat-form-field` (a
composer, a note editor), `pt-*`/`pb-*` throws off the `cdkTextareaAutosize` height and
leaves a scrollbar with a few pixels of scroll; space it with margin, `px-*` is fine:
`<textarea class="mt-2 resize-none bg-transparent px-4 outline-none" cdkTextareaAutosize cdkAutosizeMinRows="6" cdkAutosizeMaxRows="12"></textarea>`.

## Type

Core resets Tailwind's `--text-*` scale; the steps are not Tailwind's defaults.

| Utility | Size / line-height | Register |
|---|---|---|
| `text-xs` | 11 / 16 | badges, counts |
| `text-sm` | 12 / 16 | secondary and meta text |
| `text-base` | 13 / 20 | body — the default, never written |
| `text-lg` | 14 / 20 | group headings, prominent rows |
| `text-xl` | 16 / 20 | block / section title |
| `text-2xl` | 18 / 24 | brand wordmark |
| `text-3xl` | 20 / 24 | page title |
| `text-4xl` | 24 / 32 | auth screen headline, stat figures |
| `text-5xl` | 30 / 40 | — |
| `text-6xl` | 40 / 40 | — |

Weights are redefined too: `font-normal` 450, `font-medium` 550, `font-semibold` 650,
`font-bold` 700.

### Heading hierarchy

| Role | Classes |
|---|---|
| Page title | `text-3xl font-semibold tracking-tighter`, `mb-4 sm:mb-6` |
| Block / section title | `text-xl font-semibold`, description below as `<p class="mt-1 text-neutral-a11">` |
| Group heading inside a section | `text-lg font-medium` (or `font-semibold`), content `mt-6` below |
| Label-weight group heading | `font-medium text-neutral-a11` above a divider |
| Helper and meta copy | `text-neutral-a11`; `text-sm text-neutral-a11` one level down |

A block writes its top heading as `<h2 class="text-xl font-semibold">` — sized as if the
block owned the screen, tagged as if something above it did not exist. Fix both when
composing:

- **Block is the page.** Promote its heading to `<h1>`, keep `text-xl font-semibold`, or
  raise it to the page-title classes and let the description follow.
- **Block is a section of a larger page.** The page owns the `text-3xl` title as `<h1>`;
  the block's heading stays `text-xl font-semibold` as `<h2>` beneath it.
- **Headings would collide** — two blocks contributing the same level, or a block heading
  restating the page title. Demote the inner one to `text-lg font-medium` (`<h3>`), or
  delete it when it is a restatement.

Demote by class *and* tag together; the document order of the elements never changes.

## Color

Every palette is a 12-step scale plus an alpha twin (`a1`–`a12`). `primary`, `error` and
`neutral` are generated at runtime from `provideTheming`; the 30 named hues (`green`,
`amber`, `red`, `blue`, …) are static. Prefer the alpha scale — it composes over any
surface; use solid steps only for opaque fills.

- **Body text** — nothing. `body` is already `neutral-12`.
- **Secondary text** — `text-neutral-a11`. By far the most-used class in the blocks:
  descriptions, helper copy, meta lines, chip labels, standalone icons. `text-neutral-a9`
  for the faintest copy ("No columns to customize").
- **Empty states** — that same `text-neutral-a9`: an empty table, list or panel says so in
  the faintest copy, in place of the content it would hold.
- **Neutral fills** — `bg-neutral-a2` recessed strip, `bg-neutral-a3` hover/selected state
  and neutral pills, `bg-neutral-a6` avatar placeholder.
- **Borders** — write bare `border`, `border-b`, `border-t`. Core sets the global default
  border color to `neutral-a4`, so a color class is noise. A boxed surface is a `mat-card`
  or a plain `border` + `rounded-*`; rings are not the house pattern.
- **Brand** — `bg-primary-9` with `text-primary-contrast` on it (contrast is computed per
  theme for legibility — never assume white). `text-primary-a11 decoration-primary-a11`
  for inline links. `bg-primary-a3 border-primary-a6` for a selected card or option.
- **`*-surface`** — `primary-surface`, `error-surface` and `neutral-surface` are
  translucent panel colors, for a surface laid over content.
- **Error** — do not hand-color error states. `destructive` covers buttons; `mat-form-field`
  and `mat-error` already pull `error-11`. `text-error-a11` is the manual equivalent where
  there is no Material control.
- **Tags and status pills**: one style for both, a tinted `rounded-lg` pill with no border
  and no dot:
  `<div class="inline-flex items-center rounded-lg bg-green-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-green-a11">Active</div>`.
  The hue carries the meaning, `neutral` for a plain label. An icon may lead the text
  with `gap-x-1` and `text-current` on the icon.
- **Status dots** — a `size-1.5 rounded-full` div filled with step 9 of a named hue:
  `bg-green-9` active, `bg-amber-9` pending, `bg-red-9` blocked, `bg-neutral-9` inert.
  Only beside plain text, never inside a pill.
- **Dark scheme** — handled by the tokens themselves; each resolves through `light-dark()`.
  Write a `dark:` variant only where the design genuinely differs (the blocks do so about a
  dozen times in total, mostly on rings and outlines).

## Layout and composition

- **The page owns the column.** `mx-auto flex w-full max-w-4xl flex-auto flex-col p-6 pt-2
  lg:p-10 lg:pt-8` is the house page container (`max-w-7xl` for table- and dashboard-width
  pages). The width cap and the page padding live there and nowhere else.
- **Blocks are parent-spaced** unless their metadata says otherwise. A page-content block
  brings internal rhythm — sections stacked with `gap-y-10` or `gap-y-12 sm:gap-y-16` — and
  no outer padding, width cap, background or border. Never wrap one in a second container.
- **Self-contained blocks are the exception**: auth screens center themselves
  (`flex flex-auto items-center justify-center p-6`) and shells fill the page. Their
  metadata `container` and `spacing` fields say so — read them before wrapping anything.
- **An overlay block's classes size it, never place it.** Classes on the `buiDialog` element
  forward to the CDK overlay as `panelClass` — a layout utility (`ms-auto`, flex classes)
  moves the entire overlay. Positioning belongs on the trigger's own wrapper in the page.
  The default width needs no class — the primitive handles it. When a dialog needs a
  different one, it goes there: `w-full max-w-lg` on `buiDialog`, and the `w-full` is
  load-bearing — without it the panel shrink-wraps to whatever the content happens to be.
  `buiDialogContent` carries its own `max-w-md`, so add `max-w-none` to it whenever the
  panel runs wider than `md`.
- **Several blocks on one page**: page title first, then the blocks in order, separated by
  the page's own rhythm (`flex flex-col gap-y-8 sm:gap-y-12`) or a `mat-divider` between
  them. Demote or drop the block headings per the rules above.
- **App shells**: page content goes inside `mat-sidenav-content`, normally as
  `<router-outlet />` replacing the dashed placeholder. `mat-sidenav-container` fills its
  host, so the root component must carry Core's host class,
  `flex min-h-full w-full flex-auto flex-col` — without it the shell collapses to zero
  height. Core's base layer stretches `router-outlet + *`, so routed components under it
  inherit the fill.
- **Spacing scale**: Tailwind's default 0.25rem step, used narrowly — `gap-x-2`/`gap-x-3`/
  `gap-x-4` inside a row, `gap-y-4`/`gap-y-6` inside a group, `gap-y-10`/`gap-y-12` between
  sections, `p-4`/`p-6` on panels. Stay inside it.
- **Truncation**: long text sits in a `min-w-0 flex-auto` wrapper beside fixed-size
  siblings and carries `truncate`. Dropping the `min-w-0` when copying a row breaks the
  flex parent, not the text.
- **Logical direction classes**: BuilderKit supports RTL, so use the logical utilities —
  `ps-*`/`pe-*` over `pl-*`/`pr-*`, `ms-*`/`me-*` (incl. `ms-auto`) over `ml-*`/`mr-*`,
  `start-*`/`end-*` positioning, `text-start`/`text-end`, `border-s`/`border-e`,
  `rounded-s-*`/`rounded-e-*`. Symmetric utilities (`px-*`, `mx-auto`, `inset-x-*`) are
  fine as they are.

## Page archetypes

Three shapes cover most application pages. Each has an executable reference under
`./.builderkit/templates/fuse/` — read it before building the page, not after.

- **List page** — page title with its action row, then a toolbar (search field, filter
  overlays, column and other secondary controls), then the table, then `mat-paginator`.
  Reference: `src/app/domains/admin/modules/members/features/members/members.ts`.
- **Settings page** — page title, then tabs (`mat-tab-nav-bar` over routed children, a
  `mat-select` in their place below `sm`). Each tab stacks two-column sections divided by
  `mat-divider`, and a tab that edits fields ends in an unsaved-changes bar. Reference:
  `src/app/domains/admin/modules/settings/`.
- **Dashboard** — page title with its actions (a customize button, a date-range
  `mat-menu`), then a single column of filled `mat-card`s: full-width cards for the
  headline panels, a grid of metric tiles (stats' `simple` variant), and `@container`
  grids setting the smaller cards side by side. A longer dashboard opens a group of cards
  with an `<h2>` and its description. References: `project/project.ts` and
  `analytics/analytics.ts` under `src/app/domains/admin/modules/dashboards/features/`.

Marketing pages have their own reference set — `./.builderkit/templates/orbit/`, whose
`home`, `about` and `pricing` pages are stacked `section-header` sections inside the
shared `container`.

**Say it once.** A fact appears once on a page: a count, a view name, a selection, the
record being edited. A heading that restates the page title or the selected navigation
item is deleted, not styled — the heading-collision rules above decide which of two
competing headings goes.

## Building without a block

The order is block, then Material component, then hand-rolled. This is how the third
case is done, and it is a normal case rather than a failure.

- **The visual language is already specified.** The type scale, the spacing scale, the
  alpha color rules and bare borders leave nothing to invent: markup composed strictly
  inside those rails *is* the house style. Build the thing decisively — stalling on a
  missing block, or going sparse to stay safe, is the worse outcome.
- **Steal structure.** Derive from the nearest block or template page instead of
  designing from zero: open the closest existing thing and read how it solves the same
  problem — a row, a toolbar, a card header, an empty state — then adapt it.
- **Class forwarding works.** Core and the templates give a composable component its
  classes through `readonly userClass = input<ClassValue>('', { alias: 'class' })`, merged
  by `bui()` into the `[class]` host binding. A plain static `class="…"` at the call site
  reaches that input like any other attribute binding — build on the pattern and trust it,
  rather than adding a second input to route classes around it.
- **Import nothing from other product families.** A rail of views down the side of the
  content, a refine panel docked beside it, card-in-card-in-card assemblies: these come
  from other design systems and they break the page's single column. Filters and
  secondary controls belong in an overlay anchored to their trigger: `mat-menu` for
  actions, `buiCombobox` for filters and anything with selectable options, `buiPopover`
  for free content, never in a panel that claims layout space.

Read the markup from the source rather than from here — these files are the reference:

- **Page header with actions** — Fuse's members page header:
  `./.builderkit/templates/fuse/src/app/domains/admin/modules/members/features/members/members.ts`.
  Apply this file's heading rules on top (`<h1>` plus the page-title classes) — templates
  occasionally drift.
- **Empty state** — the empty branch of that same page; the color register is this file's
  rule: `text-neutral-a9`, icon sized per the Icons section.
- **List row with truncation** — team-management's member rows:
  `./.builderkit/blocks/application/team-management/`. The Truncation bullet above states
  the load-bearing classes.
- **Filter combobox with multi-select options**: the role and status filters on Fuse's
  members page, same file as above. Selectable options in a toolbar or picker are a
  `buiCombobox` root with an array `[(value)]`, a `button matButton buiComboboxTrigger`,
  and an `ng-template buiComboboxPortal matchWidth="false"` holding a `div buiComboboxContent`.
  Options sit in a `div buiComboboxListbox` (`multi`, `focusMode="activedescendant"`,
  `selectionMode="explicit"`); each row is a `div buiComboboxOption` with `[value]` and
  `[label]`, a `flex-auto truncate` label span and a trailing `span buiComboboxOptionIndicator`.
  Never `mat-menu` (it closes on each selection, holds no search field).
- **Combobox search and groups**: a long or data driven list opens with an
  `input buiComboboxSearch` first in the content and a `buiComboboxEmpty` row in the
  options loop's `@empty`. Groups are `buiComboboxGroup` with a `buiComboboxGroupLabel`,
  a `mat-divider class="-mx-1 my-0.5"` between groups.
- **Clearing a combobox**: a multi filter clears from a `matButton` below the listbox,
  inside the content, after a bare `mat-divider`, with
  `class="tertiary m-1 justify-start rounded-[calc(var(--theme-border-radius)*2/3)] px-2"`;
  it sets the value to an empty array and the panel stays open. A single select clears
  through a button beside the trigger.
- **Single pick from a button**: OS-like choices are plain text rows in a `mat-menu`, the
  checked one with a leading minimal `mat-pseudo-checkbox` (a color scheme submenu). Rich
  rows (an avatar, a second line, a badge), as in an account or workspace switcher, are a
  `buiCombobox` without `multi`, rows as in the filter combobox: the account switcher in
  `./.builderkit/templates/fuse/src/app/domains/admin/modules/inbox/features/inbox/inbox.ts`.
  Never hand-build rich rows in `mat-menu`. The trigger is a `tertiary`
  `spread` button; the portal keeps its default `matchWidth` so the panel lines up with it.
- **Panel popover radius** — a `buiPopover` that works as a panel (free content: a heading,
  copy and actions, as in a notifications panel, quick settings or a confirmation) sets a
  larger radius on `buiPopoverContent`:
  `class="[--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"`. Combobox
  panels keep the default radius.
- **Trigger width popover** — a `buiPopover` that should line up with its trigger sets
  `class="w-(--popover-anchor-width)"`, or `min-w-(--popover-anchor-width)` to grow past it.
- **Action row control width** — a fixed width control beside a `flex-auto` title and
  description column takes `shrink-0`, so a long description cannot squeeze it. Reference:
  settings' `action-rows.ts` in `./.builderkit/blocks/application/settings/`.

Where a rule here and a source disagree, the rule wins on register — this file owns the
design language. The source still owns the assembly: its structure, and what it imports
to get there.

## Icons

- Every icon is `<mat-icon svgIcon="name" />`. `provideIcons()` from Core registers the
  whole lucide symbol sheet once, at application start.
- Names are lucide ids in kebab-case: `user-plus`, `chevron-down`, `ellipsis-vertical`.
- **A name that is not in the set renders an empty `mat-icon`** — no error, no warning,
  nothing in the console. Check before using: grep `id="<name>"` in
  `src/app/core/icons/lucide.ts`. A block's metadata `icons` array lists every name that
  block needs.
- `mat-icon` is 24px and `neutral-11` by default. Inside a `matButton`/`matIconButton` the
  button sizes and colors it; standalone, size it — `class="size-4"` is the common case,
  `size-3`/`size-3.5` for inline marks. Sizing is always the `size-*` class, never
  `mat-icon`'s `size` input.
- A standalone `mat-icon` sets its own color, so it does not inherit a colored parent's
  text color. When it leads or sits inside colored text (a pill, a status or hue label like
  `text-amber-a11`) and should match it, add `text-current`:
  `<mat-icon class="size-3.5 text-current" svgIcon="lock" />`.

## Assets

The `assets` registry item ships **fonts only** (`public/fonts/**`). Every `/images/**`
path in a block is a demo asset the consuming application does not have, so leaving it in
ships a broken image. Applying the fallback is the default case, not the exception —
and the one carve-out from meta precedence: a `leaveAlone` entry naming an
image-bearing structure protects the structure, never the demo `img` inside it.

- **Avatars** → an initials tile at the same size as the photo it replaces:
  `<div class="flex size-8 items-center justify-center rounded-full bg-neutral-a3 font-semibold text-neutral-a11">{{ name | slice: 0 : 1 }}</div>`.
  Several blocks already render this branch for a null photo — keep the branch, delete the
  `img`.
- **Logos** → blocks already ship a brand placeholder instead of a demo image, in one of
  two forms: a tile in app chrome —
  `<div class="flex size-8 items-center justify-center rounded-lg bg-primary-9"><mat-icon class="size-4 text-primary-contrast" svgIcon="command" /></div>` —
  and the bare `<mat-icon class="size-6 text-neutral-12" svgIcon="command" />` on auth
  screens. A template's own logotype is replaced by this same placeholder rather than
  carried into the app, the application's display name in plain text beside the tile.
  Both the icon and the tile backing wait on a real brand asset and are swapped for it
  when the user hands one over.
- **The dropped `img` takes its data with it.** The field that fed it — `photo: string |
  null` and the values in the demo records — is dead once nothing renders it, so it comes
  out of the model and the records too. Never leave a field nothing reads.
- **Follow the removal through.** Dropping an image orphans whatever only it used: the
  imports (`NgOptimizedImage` first, and whatever went with it — lint flags them) and the
  `/images/**` file itself. Delete the unreferenced demo SVGs and JPGs along with the
  reference.

## Conduct

- **Match the host application's formatting.** Block source is formatted with
  `printWidth: 999` and `singleAttributePerLine: false`, so templates arrive as very long
  single lines. The application's Prettier config wins — run it, do not preserve the
  block's shape.
- **Keep `@/…` imports as they are.** Blocks import Core as `@/app/core/media`,
  `@/app/ui/dialog`, and the `@/*` → `src/*` alias comes with the Core setup. If the
  application's `tsconfig.json` is missing it, add the `paths` entry
  (`"@/*": ["./src/*"]`) rather than rewriting the imports.
- **Keep one variant.** Every block ships two or three variant files. Copy one, delete the
  rest.
- **Delete demo scaffolding.** Bindings the block comments as demo-only (a forced `[open]`,
  `afterNextRender` state that opens a dialog on load), the `theme-indigo` class pinned to
  overlay panels, hardcoded sample arrays.
- **A block is a UI guideline, not a feature list.** The application's real capabilities
  decide the content, and adaptation runs in both directions: the block shows *how* an
  action looks, the app decides *which* actions exist.
- **Every control that ships responds.** The test is not whether a control is wired but
  whether it does something true when used. A primary action — "New project", "Edit" —
  responds by opening a dialog, sheet or popover carrying the fields the application
  really needs, adapted from the dialog, sheet and form blocks and reshaped for the
  domain: project name, category, due date, never the block's demo fields. One depth of
  interaction is the boundary — the overlay opens, its fields are real, and its submit
  simply closes it, that handler being the seam the application's call goes into later.
  No local-state persistence, no pretend saves; "Edit" may open pre-filled from the row's
  demo data. A control that would do nothing at all still never ships.
- **A page ships its archetype's essentials.** The chrome an archetype always carries in
  the real world is part of the page, not an extra: a list or collection page gets a
  search field, the primary create action, a filter or two, and a `mat-paginator`
  wherever there is a table. Work the set out per page against the nearest Fuse page,
  which is the reference for what a page of that kind carries rather than a ruleset that
  bounds it: Fuse's teams page ships no filter, and a teams page that wants one
  builds it. Shape the page to its intent. What binds is where the material comes from —
  the block-then-Material-then-hand-rolled order below — and the packages that order drags
  in: one the reference page imports and the app lacks is asked for at the version Fuse
  pins, as `SKILL.md` says of every package, never stripped out or swapped for something
  else. Blocks are the parts; the archetype decides which parts the page needs, the ones
  the chosen block does not ship included — a card grid still gets its search-and-create
  toolbar.
- **Build what the block leaves out.** Where the app has a capability the block does not
  show — an API action with no menu item — implement it, styled after the block's own
  examples and these guidelines. A block's silence is not a ceiling.
- **No block for it? Material first.** Core themes Angular Material wholesale, so every
  Material component — tabs, steppers, chips, expansion panels — already renders in the
  house style. The order is block, then Material component, then hand-rolled: reach for the
  Material pattern before building anything by hand, and build by hand only when neither
  covers it, styled after the block examples and these guidelines. This applies to
  individual controls too: a date field is `matDatepicker`, a selection is `mat-select` —
  never a bare `<input>` where a themed Material control exists.
- **A date picker is always `mat-datepicker`.** A missing `DateAdapter` is never a reason
  to avoid it or build something else; provide one. When the app's `package.json` has a
  date library its code actually uses and Material ships an adapter for it, use that one:
  `provideDateFnsAdapter()` from `@angular/material-date-fns-adapter` for date-fns, with
  `MAT_DATE_LOCALE` set to a date-fns locale object, `provideLuxonDateAdapter()` from
  `@angular/material-luxon-adapter` for Luxon, `provideMomentDateAdapter()` from
  `@angular/material-moment-adapter` for Moment. An adapter package the app lacks is asked
  for as `SKILL.md` says of every package, pinned to the exact version of the app's
  installed `@angular/material`. With no date library, `provideNativeDateAdapter()` from
  `@angular/material/core` needs nothing installed.
- **The adapter lives where the picker does.** It goes in the `providers` of the feature
  that uses the picker, the route's or component's in a standalone app and the feature
  module's in an NgModule app. Once more pages, modules or applications need it, move it
  to the root providers (`app.config.ts`, or the bootstrapped root module) and delete the
  scoped copies. An adapter already provided at the root needs nothing more.
- **Past the essentials, still prune.** Row action menus, a header-slot export and the
  rest of the secondary chrome would be dead ends, so they come out unless the user asks
  for them. Bulk actions scoped to a selection are the exception: keep the ones the
  application genuinely has, reading the selection for the ids their calls need, and
  prune the rest. Demo *data* in data areas becomes real or clearly-local state either way.
  Follow the user's pace, and ask when it is unclear whether they want the wiring now.
- **Hand off honestly.** Finishing includes saying which controls are seams — "the create
  dialog is unwired; its submit handler is where your call goes" — so a dialog closing on
  submit is never read as a working create. Surviving template demo content is the same
  kind of debt: testimonials, stats, customer logo clouds and stock screenshots are
  fabricated, so name them at handoff as copy to replace before launch.
- **Pruning is deferral, not loss.** The block's source and its `meta.json` stay in
  `./.builderkit`. When the user later implements something that was pruned — the row
  action menu, say — go back to the block, re-read the pruned markup, and adapt it then.
  A pruned block is never gone.
- **The application's architecture wins.** Where a page file lives, how folders and routes
  are named, which part of the app owns them: the application's own conventions decide,
  and nothing here overrides them. These guidelines are the visual language only.
- **`leaveAlone` is literal.** The structural pieces — Material's `matColumnDef` /
  `matHeaderCellDef` / `matCellDef` scaffolding, the `mat-form-field` > `mat-label` +
  `input matInput` nesting, the checkbox alignment classes — break silently when tidied.
