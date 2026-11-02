---
name: builderkit
description: Build with BuilderKit — start a new Angular app from a template, install Core into an existing Angular application, update Core, and retrieve and adapt blocks. Also use whenever building or extending pages and UI in a project that contains a `./.builderkit` folder — dialogs, tables, forms, settings pages, app shells, sign-in screens and the rest come from BuilderKit blocks rather than from scratch. Spark wires the setup; the fuller templates are the reference for what gets built.
---

# BuilderKit

Four motions, one content source. **Four authorities, in this order.** The application's
own conventions decide structure and idiom. Where a fresh app has none of its own yet the
archetype template decides — Fuse for application pages, Horizon when the app is itself
a help desk or rail-and-pane product, Orbit for marketing ones — structure, idioms and
dependencies alike. One archetype per project, chosen once: the other templates are read
for functionality patterns only, never for design or UI, and that holds for every
template, future ones included. Spark decides the setup wiring and nothing past
it. `guidelines.md` decides the design language, and nothing outranks it there. Where two
of them speak to the same question the earlier one wins: Fuse's relative route imports
stay in Fuse, because a Spark-built app already loads its routes through `@/app/…`.

| Motion | Chapter |
|---|---|
| New application, empty folder | [Greenfield](#greenfield-a-new-application) |
| Install Core into an existing app | [Brownfield](#brownfield-install-core-into-an-existing-app) |
| Refresh an installed Core | [Updating Core](#updating-core) |
| Find and adapt a block | [Blocks](#blocks) |

## The content clone

**Every motion starts here.** BuilderKit's content comes to the project rather than
the other way around — clone it into the project root:

```
git clone --depth 1 https://github.com/builderkit/builderkit .builderkit
rm -rf .builderkit/.git
```

(`git@github.com:builderkit/builderkit` works the same over SSH.) The second command
belongs to the clone, not to tidying up: a project has one git and never a nested repo
or a submodule, so what stays behind is a plain content snapshot.

Add `/.builderkit` to the project's `.gitignore`. It is disposable and per project,
the `node_modules` model: if it is missing, moved or stale, re-clone it. The clone
succeeding *is* the license check — repo access is git's problem, not the skill's.
`./.builderkit/builderkit.json` says which release the project holds.

Sandboxed agents may be unable to run git over the network. If the clone is blocked,
try the other URL form; still blocked, ask the user to approve the command or run it
themselves — one command, once per project. Everything after it is local reads.

Every path below is relative to the project root.

| In the clone | What it is |
|---|---|
| `./.builderkit/builderkit.json` | the manifest — `name` and the `version` the snapshot carries |
| `./.builderkit/builderkit/{styles,core,ui,assets}` | Core, the four folders |
| `./.builderkit/blocks/INDEX.md` | the block index — one row per block |
| `./.builderkit/blocks/application/<name>/` | a block's variant files and its `meta.json` |
| `./.builderkit/templates/spark/` | the setup reference, and the greenfield base for an application |
| `./.builderkit/templates/{fuse,horizon,orbit}/` | fuller templates, same setup underneath — the archetype references, Horizon only for a help desk app, Orbit also the greenfield base for a marketing site |
| `./.builderkit/skills/builderkit/` | this skill and its `guidelines.md` — the installed copy comes from here |

Spark is executable, so it — not this prose — is the last word on setup: its
`src/app/app.config.ts`, `src/index.html`, `src/app/app.ts` and `tsconfig.json` carry
the wiring the brownfield chapter reconstructs. Read the file when a step is unclear.
Its authority ends there. What a page is made of comes from the archetype template, never
from the starter that has no such page.

The four templates share that wiring and differ in what they demonstrate:

| Template | Role | Pages |
|---|---|---|
| `spark` | the minimal starter, and the setup reference | a welcome page and a folder-structure page under an admin sidebar layout, plus a sign-in screen |
| `fuse` | the admin/dashboard template — the archetype reference for application pages | `dashboards`, `projects`, `calendar`, `tasks`, `files`, `teams`, `members`, `orders`, `customers`, `invoices`, `inbox`, `audit-logs`, `notifications`, `settings`, `integrations`, `imports` and a not-found page under an admin shell, plus `sign-in`, `sign-up`, `forgot-password` and `reset-password` under an auth layout |
| `horizon` | the help desk template — the archetype reference for support desk and rail-with-section-pane apps, chosen instead of Fuse when the app is one | `tickets`, `customers`, `agents`, `reports`, `help-center`, `settings` and a not-found page under a rail shell, plus `sign-in`, `sign-up`, `forgot-password` and `reset-password` under an auth layout |
| `orbit` | the landing/marketing template — the archetype reference for marketing pages, and the base for one | `home`, `about`, `pricing`, over shared `section-header`, `container` and `pricing-cards` components |

**Templates never mix.** The archetype is chosen once per project and the other templates
stay closed for design: a page shape Fuse lacks is built from blocks and `guidelines.md`
in Fuse's language, not lifted from Horizon, and a Horizon project never borrows from
Fuse. Functionality patterns — a feature's structure, its data service, its state — may
be read from any template. The rule binds future templates too.

The same rule one level up: **before composing a page type the app does not have yet,
open the nearest template page and read it.** A members list starts at
`./.builderkit/templates/fuse/src/app/domains/admin/modules/members/features/members/members.ts`,
a pricing page at `./.builderkit/templates/orbit/src/app/domains/website/pages/pricing.ts`.
Composition is where prose is weakest and the executable page strongest.

**Adding a package is the user's call.** npm is a supply chain attack surface, so a
package the project does not already declare is never added on your own initiative: name
it, its exact version and why the work needs it, then wait for the answer. Every version
is pinned, in the command and in `package.json` alike (`npm install --save-exact
<name>@<version>`), never a `^` or `~` range.

**A template idiom brings its packages with it.** When a reference page or an idiom needs
something the app does not have, such as `date-fns` behind Fuse's relative timestamps,
the version that template's own `package.json` pins is the one to ask for, rather than
working around it or substituting an equivalent. Those pins are the tested set. The
datepicker's `DateAdapter` is the exception: it follows the app's own date library, as
`guidelines.md` sets out.

## Greenfield: a new application

The target folder must hold no application files. Agent configuration — `.agents/`,
`.claude/`, `AGENTS.md`, the artifacts `npx skills add` leaves behind — does not count:
build in place beside it, do not create a subfolder to get an "empty" directory.

A BuilderKit application starts from the template, never from `ng new` — even when an
Angular scaffolding skill is installed. That skill's CLI guidance applies *inside* the
app once it exists, not to creating it.

**The product decides the base.** An admin, a dashboard, a product tool — anything with a
signed-in shell around it — starts from `spark`, which is built up from clean and has
nothing to empty. A landing or marketing site starts from `orbit` instead: Spark's admin
shell is the wrong skeleton for one, and clearing Orbit's pages is shallow work.
Everything downstream of the copy — stamping, gitignore, `git init`, install, the
instruction file, verify — is one motion either way, and `<base>` below is whichever of
the two it started from.

1. Clone `.builderkit` as above.
2. Copy the template into the project root: `cp -R ./.builderkit/templates/<base>/. .`
   — the trailing `/.` is what carries the dotfiles (`/*` drops them, and
   `.gitignore`, `.editorconfig`, `.vscode/`, `.husky/` are part of the template).
3. Stamp the app name. Where it comes from: when the customer's request names the
   product, use it — a kebab, npm-safe slug for `package.json` and `angular.json`, the
   display name for `<title>` and the README H1. When the request names none, **ask the
   user for a name before stamping**, saying the app will be called "My App" (slug
   `my-app`) if they leave it unnamed — then stamp their answer, or the default, and move
   on without further ceremony. Either way the name carries into the branding below, and
   it is only a label: the descriptive copy beside it — the tagline in `<title>`, the
   `<meta name="description">`, `package.json`'s `description`, the README — describes
   the product the request actually asked for, default name or not.

   | File | What changes |
   |---|---|
   | `package.json` | set `name`; set `version` to `0.0.0` (the template's is BuilderKit's release number); set `description` to the app's own; remove `homepage`, `license` and `author`, which are BuilderKit's; rename the `serve:ssr:<base>` script — its key *and* its `dist/<base>/server/server.mjs` path, because the build's output folder follows the `angular.json` project key of the next row, so the two move together; change the `start` port (28410 in Spark, 28413 in Orbit) if it is taken, which `lsof -i :28410` answers; `private: true` stays |
   | `angular.json` | the `projects.<base>` key and both `buildTarget` refs (`<base>:build:production`, `<base>:build:development`) |
   | `src/index.html` | `<title>` and the `<meta name="description">` |
   | `README.md` | replace with the app's own readme |

4. Add `/.builderkit` to the copied `.gitignore`, under its `# Miscellaneous`
   section — rooted, the style the file uses.
5. `git init` — **before installing**. The template's `prepare` script runs `husky`,
   which needs `.git` to exist; install first and the hooks are silently skipped.
6. Install dependencies — the template ships `package-lock.json`, so `npm install`
   (`engines.node` in the template's `package.json` says which Node — `>=24.15.0` at
   this release). npm may report skipped install scripts (esbuild and friends); the
   build works regardless, so do not approve scripts unprompted.
7. Record BuilderKit in your own project instruction file — `CLAUDE.md`, `AGENTS.md`, or
   your agent's equivalent — so later sessions and other clones of the repo know without
   being told. Neither base ships one, so create it, with a pointer and nothing more:

   ```md
   ## BuilderKit

   UI in this project is built with BuilderKit blocks.
   Content lives in `./.builderkit` (gitignored). Missing? `git clone --depth 1 https://github.com/builderkit/builderkit .builderkit && rm -rf .builderkit/.git`
   Use the `builderkit` skill for setup, updates and blocks. Not installed? `npx skills add builderkit/builderkit`
   ```

8. Commit. The template ships commitlint and a husky `commit-msg` hook, so the message
   must be conventional or it is rejected — `feat: initial commit`.

`ng build` then ends with an initial-bundle budget **warning**, well over the 500kB
budget — the icon set's weight. Expected — do not "fix" it. Sandboxed agents:
if the build dies with an esbuild goroutine deadlock (exit 134), retry with
`NG_BUILD_MAX_WORKERS=1` — a sandbox thread limit, not an application error.

The demo content lives in `src/app/domains/**` and is lazily routed from
`src/app/app.routes.ts` — in Spark a welcome page and a folder-structure page under an
admin sidebar layout plus a sign-in screen, in Orbit the home, about and pricing pages
under a website layout. It is starting content, not scaffolding — replace or delete it
as the app takes shape, a deleted Spark page taking its route in
`src/app/domains/admin/routes.ts` and its entry in
`src/app/domains/admin/layout/data/navigation.ts` with it. Until then the demo pages
render the base's own branding — headings, builderkit.dev links — so a freshly stamped
app welcoming the user to "Spark" is expected, not a botched rename.

The branding outside the pages is demo content on the same terms, and the template's own
logotype never survives the copy. Spark draws it from `public/images/logo/*.svg` as a
light and a dark `img` in `src/app/domains/admin/layout/ui/sidebar.ts` and the same pair
in `src/app/domains/auth/modules/sign-in/features/sign-in.ts`; Orbit draws it as an
icon-and-wordmark lockup in the header and footer of
`src/app/domains/website/layout/layout.ts`. All of it comes out and the brand placeholder
`guidelines.md` documents under Assets goes in — the `command`-icon tile with step 3's
display name in plain text beside it in app chrome, the bare icon on auth screens. Lift
that row from any sidebar block rather than inventing a layout: a `flex items-center` row
holding the tile — `flex size-8 items-center justify-center rounded-lg bg-primary-9`
around `<mat-icon class="size-4 text-primary-contrast" svgIcon="command" />` — and the
name beside it as `<div class="ms-3 text-2xl font-bold">`. Orbit keeps its lockup's shape,
the icon becoming the placeholder and the text the app's name. A default-named app renders
"My App" the same way: the placeholder is what every app starts with, not a marker of a
brand that is missing. Step the name's type size down when it is long, truncate it when it
is absurd. Spark's four `img` elements therefore come out, `public/images/logo/*.svg` with
them, imports following as the Assets knock-on rule says. The theme is not branding to
guess at either — `provideTheming`'s `primary` stays whatever the template ships until the
user hands over a brand color, which is neither asked for nor invented. Spark's sidebar
also carries a "Learn more" card that is a BuilderKit promo and comes out whole; take the
imports it orphans out with it, `MatButtonModule` among them — lint does not flag unused
entries in an `imports:` array, so nothing catches them for you.

Stamping the clone is the floor, not the finish. When the request says what the app is
for (a project management tool, a CRM, a launch site for a product), do not stop at the
pages the copy came with: continue into [Blocks](#blocks) and replace the demo content
with a first real page or two for that product.

An application built on Spark ships what Spark ships unless the user says otherwise,
**auth included**. Do not delete the sign-in flow because the request did not mention it:
everything here is modular and cheap to remove later, so opting out is the explicit case,
never the default. A marketing site reads the same rule against Orbit, which carries no
auth to begin with.

## Brownfield: install Core into an existing app

### What Core is

Four folders, copied together at one version:

| Folder in the clone | Lands in | Wiring |
|---|---|---|
| `builderkit/styles` | `src/styles/**` | the app's global stylesheet starts with `@import './styles/styles.css';` |
| `builderkit/core` | `src/app/core/**` | providers registered at the application root (below) |
| `builderkit/ui` | `src/app/ui/**` | none — imported by consuming code (needs `clsx` + `tailwind-merge`) |
| `builderkit/assets` | `public/**` | none — default asset root |

Installing is plain file copy — no decoding, no rewriting. Existing folders are fine:
copy each folder's *contents* into its target, so an existing `src/app/core/auth`
survives untouched.

### The setup motion

1. Copy the four folders as above.
2. Make the app's global stylesheet import Core's entry file — after the copy that is
   `src/styles/styles.css`, so the first line becomes
   `@import './styles/styles.css';` (Spark's `src/styles.css` contains only that
   line; see "Existing styles" below) — and ensure `angular.json`'s `styles` array
   points at the app's stylesheet.
3. Register the providers at the application root — `app.config.ts` in standalone
   apps, the bootstrapped root `NgModule`'s `providers` in NgModule apps (see below).
   Canonical list, in Spark's order: `provideHttpClient()` belongs to the app's Angular
   providers and the Material options follow it, all above the BuilderKit group, which
   `provideMockServer` leads — it must replace the `HttpBackend` before the app
   initializers that follow it.

   ```ts
   provideHttpClient(),   // from @angular/common/http — without it the mock server is inert
   { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
   { provide: MAT_TABS_CONFIG, useValue: { stretchTabs: false } },

   provideMockServer({ baseURL: 'https://mock.server', delay: 0, logging: { handler: true, bypass: false } }),
   provideIcons(),
   provideLocalStorage(),
   provideMedia(),
   provideTheming({ scheme: 'system', primary: '#3E63DD', error: '#E5484D', neutral: '#8B8D98' }),
   provideWindow(),
   ```

   The `MAT_FORM_FIELD_DEFAULT_OPTIONS` value (from `@angular/material/form-field`)
   is required in every BuilderKit project — Core's form-field styling assumes
   dynamic subscript sizing. The `MAT_TABS_CONFIG` value (from
   `@angular/material/tabs`) is the same kind of house default — Material stretches
   tabs to fill their header, BuilderKit does not.

   The datepicker's `DateAdapter` is not on the list: it is provided where the picker is
   used and moves here only once several parts of the app need it, as `guidelines.md`
   describes.

   Spark imports the six through the `@/*` alias of step 7 — `@/app/core/icons`,
   `@/app/core/local-storage`, `@/app/core/media`, `@/app/core/mock-server`,
   `@/app/core/theming`, `@/app/core/window`. Each is a barrel; relative paths
   (`./core/icons` from `src/app/app.config.ts`) resolve the same files.
4. Mirror Spark's `src/index.html`. Three pieces, each load-bearing:
   - `id="bui"` on `<html>` — Material and third-party styles are scoped under
     `#bui`; without it none of them apply.
   - This exact inline script in `<body>`, immediately before `<app-root>` (it sets
     the scheme class before first paint; its `scheme` localStorage key matches the
     Theming/LocalStorage services — do not reconstruct it, paste it):

     ```html
     <script>
       !function(){try{const e=document.documentElement.classList;e.remove("scheme-dark","scheme-light");const c=localStorage.getItem("scheme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches,s="dark"===c||"system"===c&&t?"scheme-dark":"scheme-light";e.add(s)}catch(e){}}();
     </script>
     ```
   - Three font preloads in `<head>`: `/fonts/inter/InterVariable.woff2`,
     `/fonts/inter/InterVariable-Italic.woff2`,
     `/fonts/commit-mono/CommitMonoVariable.woff2` (as `rel="preload"
     as="font" type="font/woff2" crossorigin`).
5. Add Spark's root class — from its `src/app/app.ts` — to the app component's
   `@Component` metadata: `host: { class: 'flex min-h-full w-full flex-auto flex-col' }`.
   (It works because Core's `base.css` gives `html`/`body` full height.)
6. Dependencies — add what Core needs, nothing else. `clsx` and `tailwind-merge` for
   `src/app/ui`, `colorjs.io` for theming (pre-1.0 with a moving API — do not float it),
   at the exact versions `./.builderkit/templates/spark/package.json` pins, that being
   the tested set; Tailwind 4 and `@tailwindcss/postcss` if the app has neither (next
   section); `@angular/cdk` and `@angular/material` at an exact version on the **same major
   as the app's own `@angular/core`** (exact major match required), not Spark's. Spark's
   `package.json` is the reference for those pins, not a set to adopt — leave the app's own
   dependencies alone. Each one is asked for first, as
   [The content clone](#the-content-clone) says of every package.
7. Path alias — blocks import Core as `@/app/core/…` / `@/app/ui/…`, so the app's
   root `tsconfig.json` needs Spark's `compilerOptions.paths` entry:

   ```json
   "paths": {
     "@/*": ["./src/*"]
   }
   ```
8. Bundle budgets: the icon set pushes a default app past the CLI's 1MB initial
   `maximumError`. Spark's answer is to **drop the `maximumError` entries `ng new`
   writes and keep only the warnings** (initial 500kB, `anyComponentStyle` 4kB); if
   the customer wants a hard cap, raise it above ~1.2MB instead.
9. Record BuilderKit in your own project instruction file — `CLAUDE.md`, `AGENTS.md`, or
   your agent's equivalent — the same four lines greenfield's step 7 spells out. An
   existing app usually has one already: **append a `## BuilderKit` section, never rewrite
   what is there.**

### Tailwind

- Core's cascade imports Tailwind itself, first and with the `important`
  modifier. **The app's own stylesheet must not import `tailwindcss`** — a
  second import silently breaks the layer order. Remove any existing
  `@import 'tailwindcss';` (CSS) or `@use 'tailwindcss';` (SCSS — the CLI's
  Tailwind prompt emits `@use` there because Sass requires `@use` first).
- Tailwind 4 + `@tailwindcss/postcss` + a PostCSS config are required.
  Absent → add them (`.postcssrc.json` or `postcss.config.json` with the
  `@tailwindcss/postcss` plugin). Tailwind 3 → migrate first
  (`npx @tailwindcss/upgrade`); do not install Core on top of v3.

### Existing styles and themes

- An existing Material theme (`mat.theme` or a prebuilt theme in `angular.json`)
  cannot coexist with Core: Core replaces Material theming wholesale through its
  `#bui`-scoped token overrides, so the old theme's tokens fight Core's on every
  component. Remove the old theme; carry the brand over via `provideTheming`'s
  `primary`/`error`/`neutral`.
- The same applies in miniature to global typography rules (`body { font-family }`):
  they defeat Core's typography layer — remove them.
- Keep genuine app rules (layout classes the app's templates use) by moving them
  *after* the Core import. The global stylesheet may stay SCSS — an
  `.scss` entry whose first line is `@import './styles/styles.css';` compiles
  byte-identical to Spark's CSS entry; renaming to `.css` is optional.
- Component styles and `inlineStyleLanguage` are the app's own — leave them.

### Everything else the app already has

The removals named above — the old Material theme, an existing `tailwindcss` import,
global typography rules — are part of the install the user asked for; they stay as
documented. **Nothing else in an existing app is yours to delete.** When app content
collides with Core (the placeholder `app.html` `ng new` writes, say, with its inline
`<style>` block fighting the host class of step 5), do not resolve it unilaterally:
name the collision, give a recommendation with the options, and act on the answer.
Knock-on cost belongs in that recommendation, not in silent extra work — replacing
`app.html` means the component's spec asserting on it needs updating too, so say so and
let the user decide. Greenfield is the opposite case: the content there is the template's,
and reshaping it needs no permission.

### NgModule-bootstrap apps

No standalone migration, and suggesting one is wrong. All six `provide*`
functions return `EnvironmentProviders`, which `NgModule.providers` accepts —
put the canonical list straight into the **module passed to `bootstrapModule`**
(a feature or lazy module's injector never runs the app-initializer hooks).
`RouterModule.forRoot()` is fine as-is. The root component is usually
`standalone: false` with a `templateUrl`; the `host` block from step 5 goes into
its existing `@Component` metadata the same way.

## Updating Core

The brownfield motion again, smaller: bring the source current, diff, apply.

1. There is no pull — the snapshot carries no git. Compare
   `./.builderkit/builderkit.json` against the manifest on the default branch,
   `curl -s https://raw.githubusercontent.com/builderkit/builderkit/main/builderkit.json`;
   newer there — or the user just wants a refresh — delete `.builderkit` and clone it
   again, `.git` stripped as before. The raw fetch blocked (private access, no token)?
   Skip the comparison: re-cloning *is* the check.
2. Diff the clone's four Core folders against the project's installed copies and
   apply what changed. Nothing tracks installed files and nothing is hashed: they are
   the user's code, and `git diff` is the review.
3. **Commit first, review the diff after.** Guidance, not a gate — a user
   overwriting uncommitted changes on purpose is a legitimate case, not something to
   block. Restoring a customization the update overwrote is
   `git checkout -- <file>`.

Recommend, but never enforce, keeping customizations out of Core's files entirely:
custom CSS after the styles import, service extension over service modification.
Updates then never collide.

**Blocks do not update.** Once copied and adapted a block is the app's code — signals
renamed, data wired, structure reshaped — and there is nothing sane to diff it
against. Picking up an improved block upstream is a deliberate copy-again-and-re-adapt
decision.

## Blocks

1. **Retrieve**: read `./.builderkit/blocks/INDEX.md` — one row per block with
   `name`, `intent`, `antiIntent`, `tags`. Do the matching yourself; `antiIntent` is
   what rules a block out and usually names the block that fits instead.
2. **Read the block**: `./.builderkit/blocks/application/<name>/` holds two or three
   variant files and a `meta.json` beside them. That `meta.json` governs the block —
   `variants`, `state`, `adaptation`, `dependencies`, `icons`, `container`,
   `spacing`, `editable`, `leaveAlone`, `responsive`, `pairings` — and overrides any
   general rule. Read it before touching the markup.
3. **Adapt**: copy one variant into the app, delete the rest, and work through the
   block's `adaptation` list. Blocks import Core through `@/*`, which the setup's
   step 7 alias already provides.
4. **Fit it to the app, and make every control respond.** A block is a UI guideline, not
   a feature list: it shows how an action looks, the app decides which actions exist, and
   an action the app *has* that the block does not show is built, styled after the
   block's own examples. The block's demo content sets nothing either. Before adapting
   a region, name the moment it serves and what the person needs within reach there —
   an expanded order row is a fulfillment moment, so it carries the destination, the
   carrier, the customer's note and the act, not just the lines; a ticket's header is
   a triage moment, so it carries priority, assignee and the SLA clock — then fill the
   region from that answer, and only afterwards look at what the demo shows. The block
   decides how each part looks; the moment decides which parts exist. The look still
   comes from the archetype template, `guidelines.md` and the block markup, unchanged. What ships is judged on response rather than wiring — a primary
   action opens a dialog, sheet or popover carrying the app's own fields, and its submit
   closes it, that handler being the seam the real call goes into later. A page also
   ships its archetype's essentials — a list page's search, create action, filters and
   pagination — worked out against the nearest archetype page, which is the reference for
   what a page of that kind carries and not a ruleset that bounds it: a search on a page
   whose archetype counterpart has none is the page's intent talking. Secondary chrome past
   the essentials comes out. Pruning is deferral, not loss: the block's source and
   `meta.json` stay in `./.builderkit`, so re-read that markup and adapt it when the
   feature arrives. Say which controls are seams when handing the work over;
   `guidelines.md` has the doctrine.
5. **No block for it? Material first.** Core themes Angular Material wholesale — every
   Material component already renders in the house style, scoped under `#bui` — so tabs,
   steppers, chips, expansion panels and the rest are visually consistent with the blocks
   for free. Reach for the Material pattern before building anything by hand. Hand-rolled
   UI is the last resort, after blocks and after Material, and follows `guidelines.md`.
6. **The application's architecture wins** — the first line of the precedence order at the
   top of this file. Where the page file lives, how folders and routes are named, which
   part of the app owns them, how a route pulls in its component: the app's own
   conventions decide. This skill prescribes no structure for application code, and a
   brownfield app's conventions win exactly as a scaffolded one's do. We build pages
   inside their app. Only where an app has no precedent of its own yet does the archetype
   template answer — Fuse's `modules/<name>/data/` services are where a page's data
   lives, so a block's module-level demo array graduates into one rather than staying
   beside the component, declared with Angular's `@Service()`, which provides itself,
   rather than `@Injectable({ providedIn: 'root' })`. Where the app *does* have a
   precedent it stands: a Spark-built app loads its routes through `@/app/…`, so Fuse's
   relative `./modules/…` imports do not come across with the page.
7. **Compose**: `guidelines.md`, beside this file, is the design conduct — button
   vocabulary, type scale, color, layout, page archetypes, icons, and the demo-asset
   fallbacks. Read it before placing a block on a page. For a page type the app does not
   have yet, read the nearest template page first — Fuse's for application pages, or
   Horizon's for a help desk app, Orbit's for marketing ones; see [The content clone](#the-content-clone).

## Judgment lines (learned from real runs)

- **Do register `provideMockServer`, configured** — it ships that way by design,
  even in apps with no HTTP usage today; a user who doesn't want it deletes it.
  Do not decide on their behalf that it's demo-only.
- **Do not change the app's compiler settings**, `strict` above all — Core
  compiles under non-strict. The one exception is the `@/*` alias of step 7: it
  is part of the setup, because blocks import Core through it. Core's own
  installed files import each other relatively and do not need it.
- **Match the app's formatting**, not Spark's, in files you edit — the app's
  Prettier config wins.
- **Core's spec files come along** (vitest-style specs beside the services they
  cover) and run under the CLI's unit-test target unmodified — expect them in
  `ng test`, do not convert them. Bare `ng test` is a watcher; the one-shot run
  an agent wants is `ng test --watch=false`.
- **Pre-existing test failures are not yours to fix** — note them, leave them.

## Verify

- `npx ng build` passes.
- The emitted `styles-*.css` contains `#bui`-scoped rules, and `min-h-full`, which the
  root component's host class puts there in every app, the template's own or the one
  the brownfield install adds.
- Brownfield only: grep that same file for a utility one of the app's own templates
  asks for, the wiring there having been assembled by hand. Greenfield needs no such
  grep — the template ships working, and the build passing is the proof.
- Fonts emitted: `ls dist/<app>/browser/fonts/`.
- `provideMockServer` and `provideHttpClient()` are both registered at the
  application root — read the config, no run needed. Existing `HttpClient` calls
  keep working at runtime: the mock server bypasses requests it does not match.

## SSR and strict mode

Nothing extra for either. Core is authored under `strict` (Spark has it on), so
strict apps are the native direction; non-strict apps compile it fine too. SSR
needs no setup-time wiring: the services are SSR-safe by construction (window,
media, and local-storage access go through DI), and the scheme-bootstrap script
is a browser-only inline that server rendering simply doesn't execute.
