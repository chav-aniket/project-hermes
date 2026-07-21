# Spike: seamless theme transition without a snapshot overlay

Status: exploratory — prototype lives behind a flag, not merge-bound.

**TL;DR / recommendation:** the same-document **View Transitions API, with the
directional arc/wave expressed as a `clip-path` animation on
`::view-transition-new(root)`, plus per-component "wipe-front awareness" for
live canvases** is the winner. It deletes the entire hand-rolled snapshot
(`getComputedStyle` loop, body clone, SVG fill mapping, canvas `drawImage`
special case), keeps the exact same reveal geometry, keeps the InvisibleInk
particles animating through the whole transition (which even the current
system can't do), and its main-thread cost stays flat as the page grows —
measured ~1–2 ms vs. ~100 ms for the overlay path on a +6k-node DOM. The
trade-offs are browser support (falls back to the current path) and one
subtle limitation: *non-canvas* live elements ahead of the wipe front are
still a frozen picture, same as today.

Enable it in a browser console:

```js
localStorage.setItem("theme-transition", "vt"); // remove key to go back
```

---

## 1. The constraint, stated explicitly

The theme is one global bit: `html.dark`. Every colour on the page —
Tailwind `dark:` utilities, `--theme-*` custom properties, `@custom-variant
dark` — resolves from that single class. CSS computes **one** value per
property per element. So during a directional wipe, an element straddling
the front would need to paint its left half with one resolved style and its
right half with another — and there is no mechanism in CSS for one element
to have two resolved values of `color` split along an arbitrary moving
curve.

That forces every possible design into one of three shapes:

- **(a) Duplication** — render the page twice (once per theme) and clip one
  rendering against the other. The two copies can be *frozen* (today's
  clone, a View Transition snapshot) or *live* (a second real DOM). Only
  duplication gives a true per-pixel directional split of arbitrary content.
- **(b) Non-directional blend** — accept a crossfade (View Transitions'
  default) or opacity blend. No front, so no split problem — and no arc.
- **(c) Per-property tween / per-element flip** — animate colours uniformly
  over time, or flip each element atomically as the front passes its
  position. Directionality is approximated at element granularity: small
  elements look wiped, large elements (worst case: the page background,
  which is *one* element covering the whole viewport) pop or need special
  handling.

The one true exception is **self-painting content**: a `<canvas>` chooses
its own colour per pixel per frame. A canvas component that knows where the
front is can be genuinely half-old/half-new *and* live — no duplication
needed. That exception is the key to the hybrid below.

Today's implementation is (a) with a frozen copy: the clone freezes the old
theme on top, the live page flips underneath, and the clip-path reveals it.
Everything below evaluates alternatives against (a)/(b)/(c).

## 2. Approaches evaluated

### A. Two *live* layers — rejected (big architectural change)

Render the page twice, both hydrated and running, one forced light and one
forced dark, and clip the top one.

- **The theme bit is the blocker.** `dark` lives on `<html>`, and
  `@custom-variant dark (&:where(.dark, .dark *))` plus the `--theme-*`
  variables on `:root`/`html.dark` key off it. Two live copies inside one
  document can't disagree about `<html>`'s class. The entire theme system
  would need re-keying to a *scoped* container (e.g.
  `[data-theme="dark"]` wrappers) — touching `app.css`, the custom variant,
  `Layout.astro`, and every component that assumes the html-level class
  (InvisibleInk's MutationObserver watches `<html>` specifically).
- **Islands double-hydrate.** `Age` (`client:idle`), `InvisibleInk`
  (`client:visible`), `ThemeToggle` (`client:load`) would mount twice:
  double timers, double rAF loops and particle sims, duplicate
  `aria-label`s/roles in the accessibility tree, duplicate focusables.
  Astro has no notion of "render this island tree twice against two theme
  scopes" — it would be a hand-maintained mirror.
- **Interaction correctness is a tar pit.** Scroll sync between layers,
  hover/focus states diverging, `IntersectionObserver`s firing for the
  hidden copy, events landing on whichever layer is on top mid-wipe.
- Verdict: the only approach that makes *arbitrary DOM* live on both sides
  of the front, but the cost is a permanent architectural tax paid on every
  future component for a 2-second animation. Not prototyped (per the
  "ask before big architectural changes" rule); I don't think it's worth a
  follow-up conversation unless the live-both-sides property becomes a hard
  requirement.

### B. View Transitions API, root-only — close, chosen as the base

`document.startViewTransition(() => html.classList.toggle("dark"))` makes
the *browser* do the snapshot: the old state is captured as a compositor
texture, the new state renders live underneath its `::view-transition-new`
image. Crucially:

- The **old** image is a static bitmap — same frozen-old-theme semantics as
  today's clone, but captured by the engine with zero `getComputedStyle`
  calls, zero DOM cloning, and canvases captured for free (no `drawImage`
  special case, no taint handling).
- The **new** image is *live* — rAF loops, CSS animations and the toggle's
  own 2 s slider keep running and are visible as the front reveals them.
- The default animation is a crossfade (shape (b)), but the pseudo-elements
  are fully styleable: kill the fade, and play the **same arc/wave polygons
  as today** as a `clip-path` animation on `::view-transition-new(root)` —
  the new region grows (complement of the old overlay shrinking). Shape (a)
  with the engine doing the copying.
- Note: this is the *same-document* DOM API. Astro's `<ClientRouter />`
  view-transitions support is about cross-page navigation and is unrelated;
  nothing Astro-specific is needed.

What root-only VT does **not** give: anything ahead of the front is a
frozen picture, so InvisibleInk would freeze there — the exact complaint
about the clone. Which leads to:

### C. Single-layer, variable-driven — great for canvas, non-viable for DOM

No layers at all: animate a "front" parameter and have everything colour
itself by which side it's on.

- **Canvas: perfect.** InvisibleInk already repaints every frame and knows
  each particle's position; give it the front's equation and it paints each
  particle old-or-new. Per-pixel directional, fully live, zero duplication.
- **Arbitrary DOM: falls apart.** Elements would flip via per-element
  staggered `transition-delay`s computed from geometry — acceptable for
  small text nodes, but borders/shadows/images flip atomically, and the
  page background is a single viewport-sized element that *cannot* be split
  this way at all. You'd reintroduce a clipped overlay just for the
  background, then another for each large surface, and converge back to a
  worse version of (a). Also requires measuring every element's position
  (`getBoundingClientRect` sweep — the same forced-reflow class of cost we
  are trying to delete).
- Verdict: not a page-level strategy, but exactly the right *component*
  strategy for self-painting content.

### D. Chosen hybrid: B for the page + C for live canvases

- The page transitions via View Transitions with the directional clip-path.
- Components that must stay live opt out of the root snapshot with their
  own `view-transition-name`; their old image is hidden and their new image
  shows unanimated, so the *live element* is visible for the entire
  transition (this replaces the current z-index elevation hack for the
  toggle, too).
- A live-opted-out component is now visible on *both* sides of the front,
  so it must handle the split itself. InvisibleInk does (approach C): it
  caches the old ink colour just before the flip, and colours each particle
  by testing its viewport position against the same front equation the
  clip-path keyframes use.

## 3. The prototype

Flag: `localStorage["theme-transition"] = "vt"` (checked per toggle;
falls back to the overlay path when unset, or when
`document.startViewTransition` is missing). `.dark` on `<html>` remains the
single source of truth — the VT path flips exactly that class, once, inside
the transition callback, so there is no flash in either direction.

| File | Change |
| --- | --- |
| `src/utils/themeVT.ts` | New. Flag check, polygon generators for the *new* region (complements of `animateArcClip`/`animateWaveClip`, same `ARC`/`WAVE`/`TIMING` constants), `@keyframes` generation + one-time injection, `vtTransition()` orchestration, `theme-wipe*` events. |
| `src/utils/theme.ts` | `toggleTheme` branches to `vtTransition` when the flag is on. Overlay path untouched. |
| `src/layouts/Layout.astro` | Static VT CSS, all scoped under `html.theme-vt*` classes that only exist mid-transition: disable default crossfade/blend on `(root)`, wire the arc/wave animations, `pointer-events: none` on `::view-transition` so the page stays interactive (VT swallows hit-testing by default), and live opt-outs for `theme-toggle` / `invisible-ink`. |
| `src/components/svelte/InvisibleInk.svelte` | `view-transition-name: invisible-ink` on the host; listens for `theme-wipe` (cache old colour + host rect before the class flips), `theme-wipe-start` (sync to the moment the clip animation actually starts, i.e. `viewTransition.ready`), `theme-wipe-end`; `paint()` picks old vs. new fill per particle against the front. |

Implementation notes worth keeping:

- **No per-frame JS for the reveal.** The old path builds a polygon string
  and writes `style.clipPath` in a rAF loop for 2 s. The VT path bakes the
  ease-out into ~40 sampled keyframes (fixed vertex count so CSS
  interpolates smoothly between them, all viewport-% so they're
  resolution-independent), injects them once, and lets the compositor run a
  plain CSS animation. That animation is also what holds the transition
  open for `--arc-duration`.
- **Timing sync.** The front-aware canvas must use the same clock as the
  clip animation, which starts at `viewTransition.ready` (after capture),
  not at toggle time — hence the two-phase `theme-wipe` →
  `theme-wipe-start` handshake.
- **`prefers-reduced-motion`** short-circuits the VT path to an instant
  class flip (the ink likewise ignores the wipe and recolours instantly via
  its existing MutationObserver). The *current* overlay path has no
  reduced-motion handling at all — worth fixing there regardless of this
  spike's outcome.
- The shadow keyframes (`theme-arc-animating`) run on the real page and are
  visible through the live new layer unchanged.

### Verified in Chromium (Playwright, dev server)

- Desktop arc and mobile wave both render the directional reveal,
  light→dark and dark→light, ~2 s, no wrong-theme flash, no overlay element
  created, no console errors from the new code.
- Mid-transition screenshots show the ink pill's particles split correctly
  across the front and still animating.
- Synchronous main-thread block at toggle time (median of 3), after
  inflating the DOM with N extra styled nodes:

  | Extra nodes | Overlay path (clone + `getComputedStyle` loop) | VT path |
  | ---: | ---: | ---: |
  | 0 | 3.9 ms | 0.9 ms |
  | 2,000 | 31.4 ms | 1.3 ms |
  | 6,000 | 99.3 ms | 1.8 ms |

  This is the forced-reflow issue from the earlier review, quantified: the
  overlay cost is linear in DOM size (~16 ms per 1k nodes on this machine);
  VT capture is effectively constant from the page's perspective. The VT
  path also allocates no clone (the overlay path briefly doubles the DOM
  and retains it for the full 2 s).
- Incidental find: the overlay path throws a pre-existing
  `TypeError: Cannot read properties of undefined (reading 'id')` on every
  toggle (reproduced on the base commit; it fires when `cloneNode` copies
  Svelte 5-managed DOM). The VT path doesn't clone, so it also makes this
  class of bug structurally impossible.

## 4. Comparison

| | A. Two live layers | B. VT root-only | C. Variable-driven | **D. Hybrid (prototyped)** |
| --- | --- | --- | --- | --- |
| Feasibility | Poor — re-key theme scoping, double-hydrate islands | Good | Poor for DOM, great for canvas | **Good — built, working** |
| Directional arc/wave | Yes | Yes (custom clip-path) | Approximated per-element; background unsolvable | **Yes, identical geometry** |
| Live content ahead of front | Yes (its one advantage) | No (frozen, like today) | Yes | **Canvas + opted-out elements yes; other DOM frozen (same as today)** |
| Perf | 2× hydration, 2× DOM permanently | Engine capture, ~flat | Element position sweep (reflow again) | **~1–2 ms sync cost, flat; no per-frame reveal JS** |
| Complexity | Very high, permanent tax | Low | High, per-component | **Moderate: ~150 LoC + CSS, overlay code becomes deletable** |
| Browser support | Universal | Chrome 111+, Safari 18+, Firefox 144+ | Universal | **Same as B, graceful fallback** |

## 5. Risks and caveats

- **Support matrix**: same-document View Transitions are in all current
  evergreen releases (Chromium 111+, Safari 18+, Firefox 144+), but older
  Safari/Firefox get the fallback. If this graduates, decide whether the
  fallback stays the full overlay implementation (two systems to maintain)
  or becomes a plain instant/crossfade toggle (my preference — delete the
  clone code entirely).
- **`view-transition-name` uniqueness**: duplicate names make the browser
  skip the transition (page still switches themes, just instantly).
  `invisible-ink` assumes a single pill instance; if more appear, assign
  names dynamically (`ink-1`, `ink-2`, …) at wipe start.
- **Interactivity during the 2 s**: handled via `pointer-events: none` on
  `::view-transition`, matching today's behaviour — but *clicks land on the
  new theme's live DOM* even in regions still displaying the old theme.
  Identical to today (the overlay is also `pointer-events: none`), just
  worth knowing.
- **Frozen old region**: `Age`'s ticking decimals, hover states, and any
  future animation freeze ahead of the front until swept, exactly as with
  the clone. Only front-aware, self-painting components escape this (see
  the constraint). If a future component needs it, the InvisibleInk pattern
  (`theme-wipe` events + own `view-transition-name`) is reusable.
- **One rAF hiccup at capture** is inherent to VT (the engine rasterises
  the old state). It's a compositor capture, not a style/layout sweep — it
  did not register in the sync-cost measurements.

## 6. Suggested next steps (if the spike is approved)

1. Decide the fallback story (keep overlay vs. instant toggle) — this
   determines whether ~200 lines of snapshot code get deleted.
2. Fold reduced-motion handling into whichever path ships.
3. Optionally rename the flag to a build-time constant once it stops being
   an experiment.
