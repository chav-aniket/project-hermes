<script lang="ts">
import { onMount } from "svelte";

// Renders `text` hidden beneath an iMessage-style "invisible ink" cloud of
// shimmering particles, clipped to a pill shape. When `reveal` is enabled,
// hover/focus/tap dissolves the ink to reveal the text; otherwise the ink
// stays put and nothing behind it is shown.
export let text: string;

// Optional props are derived from $$props so their default values don't get
// rewritten to `const` by useConst / prefer-const autofixers — which would
// turn these into non-settable exports and silently drop the parent's props.
// `reveal` gates the hover/focus/tap reveal; `class` forwards pill styling.
$: reveal = Boolean($$props.reveal);
$: className = typeof $$props.class === "string" ? $$props.class : "";

let host: HTMLSpanElement;
let textEl: HTMLSpanElement;
let canvas: HTMLCanvasElement;
let revealed = false;

const onReveal = () => {
	if (reveal) revealed = true;
};
const onHide = () => {
	if (reveal) revealed = false;
};
const onKeydown = (e: KeyboardEvent) => {
	if (reveal && (e.key === "Enter" || e.key === " ")) {
		e.preventDefault();
		revealed = !revealed;
	}
};

onMount(() => {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	type Particle = {
		x: number;
		y: number;
		r: number;
		phase: number;
		tw: number;
		dx: number;
		dy: number;
	};

	let width = 0;
	let height = 0;
	let particles: Particle[] = [];
	let fill = "#888";
	let raf = 0;
	let tick = 0;

	// Match the ink colour to the (theme-dependent) text colour.
	const refreshColor = () => {
		fill = getComputedStyle(textEl).color;
	};

	// SPIKE (theme-transition="vt"): during a View Transition theme wipe this
	// canvas opts out of the browser snapshot (view-transition-name) and stays
	// live, so it must split itself across the wipe front: particles ahead of
	// the front keep the OLD ink colour, particles behind it take the new one.
	// Geometry mirrors the clip-path keyframes in themeVT.ts (viewport %).
	type Wipe = {
		mode: "arc" | "wave";
		duration: number;
		start: number | null;
		oldFill: string;
		rect: DOMRect;
	};
	let wipe: Wipe | null = null;

	// Returns eased front progress, or null when no wipe is running.
	const wipeProgress = (): number | null => {
		if (!wipe) return null;
		if (wipe.start == null) return 0; // snapshot pending: everything old
		const p = Math.min((performance.now() - wipe.start) / wipe.duration, 1);
		return 1 - (1 - p) ** 3; // same ease-out cubic as the clip animation
	};

	// Is this particle behind the front (i.e. showing the NEW theme)?
	const behindFront = (w: Wipe, eased: number, px: number, py: number) => {
		const nx = ((w.rect.left + px) / window.innerWidth) * 100;
		const ny = ((w.rect.top + py) / window.innerHeight) * 100;
		if (w.mode === "arc") {
			// Wedge hinged at (50%, 100%) sweeping 270° (left) → 450° (right).
			let deg = (Math.atan2(ny - 100, nx - 50) * 180) / Math.PI + 90;
			if (deg < 270) deg += 360;
			return deg <= 270 + eased * 180;
		}
		// Wave line descending from the top.
		const wave = Math.sin((nx / 100) * Math.PI * 4) * 3;
		return ny <= eased * 100 + wave;
	};

	const build = () => {
		const rect = host.getBoundingClientRect();
		width = Math.max(1, Math.ceil(rect.width));
		height = Math.max(1, Math.ceil(rect.height));
		const dpr = Math.min(window.devicePixelRatio || 1, 2);

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const count = Math.min(1800, Math.round(width * height * 0.55));
		particles = [];
		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				r: Math.random() * 0.9 + 0.35,
				phase: Math.random() * Math.PI * 2,
				tw: Math.random() * 0.05 + 0.02,
				dx: (Math.random() - 0.5) * 0.12,
				dy: (Math.random() - 0.5) * 0.12,
			});
		}
		refreshColor();
	};

	const paint = (animated: boolean) => {
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = fill;
		tick += 1;
		const eased = wipeProgress();
		for (let i = 0; i < particles.length; i++) {
			const p = particles[i];
			if (animated) {
				p.x += p.dx;
				p.y += p.dy;
				if (p.x < 0) p.x += width;
				else if (p.x > width) p.x -= width;
				if (p.y < 0) p.y += height;
				else if (p.y > height) p.y -= height;
			}
			if (wipe && eased != null) {
				// fill already holds the NEW colour (MutationObserver fired on
				// the class flip); oldFill is what we cached just before it.
				ctx.fillStyle = behindFront(wipe, eased, p.x, p.y)
					? fill
					: wipe.oldFill;
			}
			const a = animated ? 0.35 + 0.45 * Math.sin(p.phase + tick * p.tw) : 0.45;
			ctx.globalAlpha = a < 0 ? 0 : a;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	};

	const loop = () => {
		paint(true);
		raf = requestAnimationFrame(loop);
	};

	// The rAF loop only runs while the pill is both on-screen and in a visible
	// tab, so it isn't burning the main thread when nobody can see it.
	let onScreen = true;
	let running = false;

	const run = () => {
		if (reduce || running || !onScreen || document.hidden) return;
		running = true;
		raf = requestAnimationFrame(loop);
	};

	const stop = () => {
		running = false;
		cancelAnimationFrame(raf);
	};

	const start = () => {
		stop();
		build();
		if (reduce) {
			paint(false);
		} else {
			run();
		}
	};

	start();

	const onResize = () => {
		build();
		if (reduce) paint(false);
	};
	window.addEventListener("resize", onResize);

	const onVisibility = () => {
		if (document.hidden) stop();
		else run();
	};
	document.addEventListener("visibilitychange", onVisibility);

	const io = new IntersectionObserver(
		([entry]) => {
			onScreen = entry.isIntersecting;
			if (onScreen) run();
			else stop();
		},
		{ threshold: 0 },
	);
	io.observe(host);

	// Keep the ink in sync when the theme (html.dark) flips.
	const observer = new MutationObserver(() => {
		refreshColor();
		if (reduce) paint(false);
	});
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	// SPIKE: theme-wipe fires just before the class flips (cache the old
	// colour), theme-wipe-start once the View Transition's clip animation
	// begins (sync clocks), theme-wipe-end when it settles.
	const onWipePrepare = (e: Event) => {
		if (reduce) return; // reduced motion: instant flip via the observer
		const d = (e as CustomEvent).detail;
		wipe = {
			mode: d.mode,
			duration: d.duration,
			start: null,
			oldFill: fill,
			rect: host.getBoundingClientRect(),
		};
	};
	const onWipeStart = (e: Event) => {
		if (wipe) wipe.start = (e as CustomEvent).detail.start;
	};
	const onWipeEnd = () => {
		wipe = null;
	};
	window.addEventListener("theme-wipe", onWipePrepare);
	window.addEventListener("theme-wipe-start", onWipeStart);
	window.addEventListener("theme-wipe-end", onWipeEnd);

	return () => {
		stop();
		window.removeEventListener("resize", onResize);
		document.removeEventListener("visibilitychange", onVisibility);
		window.removeEventListener("theme-wipe", onWipePrepare);
		window.removeEventListener("theme-wipe-start", onWipeStart);
		window.removeEventListener("theme-wipe-end", onWipeEnd);
		io.disconnect();
		observer.disconnect();
	};
});
</script>

<span
  class={`ink ${className}`}
  class:revealed
  class:interactive={reveal}
  bind:this={host}
  role={reveal ? "button" : undefined}
  tabindex={reveal ? 0 : undefined}
  aria-label={text}
  aria-pressed={reveal ? revealed : undefined}
  on:mouseenter={onReveal}
  on:mouseleave={onHide}
  on:focusin={onReveal}
  on:focusout={onHide}
  on:keydown={onKeydown}
>
  <span class="ink-text" bind:this={textEl} aria-hidden="true">{text}</span>
  <canvas class="ink-canvas" bind:this={canvas} aria-hidden="true"></canvas>
</span>

<style>
  .ink {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    vertical-align: middle;
    -webkit-user-select: none;
    user-select: none;
    outline: none;
    /* SPIKE: opt out of the root View Transition snapshot so the canvas
       stays live during theme wipes (single-instance assumption — duplicate
       names would make the browser skip the transition). */
    view-transition-name: invisible-ink;
  }

  .ink.interactive {
    cursor: pointer;
  }

  .ink-text {
    opacity: 0;
    filter: blur(2px);
    transition:
      opacity 500ms ease,
      filter 500ms ease;
  }

  .ink.revealed .ink-text {
    opacity: 1;
    filter: blur(0);
  }

  .ink-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 1;
    transition: opacity 500ms ease;
  }

  .ink.revealed .ink-canvas {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .ink-text,
    .ink-canvas {
      transition-duration: 200ms;
    }
  }
</style>
