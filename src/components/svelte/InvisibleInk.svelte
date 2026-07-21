<script lang="ts">
import { onMount } from "svelte";

// Renders `text` hidden beneath an iMessage-style "invisible ink" cloud of
// shimmering particles. Hover, focus or tap to dissolve the ink and reveal it.
export let text: string;

let host: HTMLSpanElement;
let textEl: HTMLSpanElement;
let canvas: HTMLCanvasElement;
let revealed = false;

const reveal = () => {
	revealed = true;
};
const hide = () => {
	revealed = false;
};
const toggle = () => {
	revealed = !revealed;
};
const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		toggle();
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

	const start = () => {
		cancelAnimationFrame(raf);
		build();
		if (reduce) {
			paint(false);
		} else {
			raf = requestAnimationFrame(loop);
		}
	};

	start();

	const onResize = () => {
		build();
		if (reduce) paint(false);
	};
	window.addEventListener("resize", onResize);

	// Keep the ink in sync when the theme (html.dark) flips.
	const observer = new MutationObserver(() => {
		refreshColor();
		if (reduce) paint(false);
	});
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	return () => {
		cancelAnimationFrame(raf);
		window.removeEventListener("resize", onResize);
		observer.disconnect();
	};
});
</script>

<span
  class="ink"
  class:revealed
  bind:this={host}
  role="button"
  tabindex="0"
  aria-label={text}
  aria-pressed={revealed}
  on:mouseenter={reveal}
  on:mouseleave={hide}
  on:focusin={reveal}
  on:focusout={hide}
  on:click={toggle}
  on:keydown={onKeydown}
>
  <span class="ink-text" bind:this={textEl} aria-hidden="true">{text}</span>
  <canvas class="ink-canvas" bind:this={canvas} aria-hidden="true"></canvas>
</span>

<style>
  .ink {
    position: relative;
    display: inline-block;
    cursor: pointer;
    vertical-align: baseline;
    -webkit-user-select: none;
    user-select: none;
    outline: none;
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
