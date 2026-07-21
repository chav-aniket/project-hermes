/**
 * SPIKE: snapshot-free theme transition built on the same-document
 * View Transitions API.
 *
 * Instead of hand-cloning <body> and freezing computed styles onto it
 * (see createThemeOverlay in theme.ts), the browser captures the old
 * theme as a compositor texture and live-renders the new theme
 * underneath. The directional reveal is a clip-path animation on
 * ::view-transition-new(root), using the same arc/wave geometry as the
 * overlay path — just expressed as the complement (the NEW region grows
 * instead of the OLD region shrinking).
 *
 * Enabled per-browser via localStorage: theme-transition = "vt".
 * Falls back to the overlay implementation when the flag is off or the
 * API is unsupported (see toggleTheme in theme.ts).
 */

import { ARC, TIMING, WAVE, isMobile } from "@config/theme";

export const VT_FLAG_KEY = "theme-transition";
export const VT_FLAG_VALUE = "vt";

// Minimal structural type so we don't depend on lib.dom shipping
// ViewTransition definitions.
type ViewTransitionLike = {
	ready: Promise<void>;
	finished: Promise<void>;
	updateCallbackDone: Promise<void>;
	skipTransition: () => void;
};

type DocumentWithVT = Document & {
	startViewTransition?: (update: () => void) => ViewTransitionLike;
};

export const supportsViewTransitions = (): boolean =>
	typeof (document as DocumentWithVT).startViewTransition === "function";

export const isVTEnabled = (): boolean => {
	try {
		return (
			localStorage.getItem(VT_FLAG_KEY) === VT_FLAG_VALUE &&
			supportsViewTransitions()
		);
	} catch {
		return false;
	}
};

const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;

const fmt = (n: number) => Number(n.toFixed(2));

/**
 * Polygon (in viewport %) covering the NEW-theme region of the arc sweep
 * at eased progress `eased`. Complement of animateArcClip in theme.ts:
 * a wedge hinged at bottom-center growing clockwise from the left edge.
 */
const ARC_SAMPLES = 24;
function arcNewPolygon(eased: number): string {
	const cx = 50;
	const cy = 100;
	const startDeg = 270; // fixed edge pointing left
	const endDeg = 270 + eased * 180; // sweeping front

	const points = [`${cx}% ${cy}%`];
	for (let i = 0; i <= ARC_SAMPLES; i++) {
		const deg = startDeg + ((endDeg - startDeg) * i) / ARC_SAMPLES;
		const rad = ((deg - 90) * Math.PI) / 180;
		const x = cx + ARC.radius * Math.cos(rad);
		const y = cy + ARC.radius * Math.sin(rad);
		points.push(`${fmt(x)}% ${fmt(y)}%`);
	}
	return `polygon(${points.join(", ")})`;
}

/**
 * Polygon (in viewport %) covering the NEW-theme region of the wave
 * reveal at eased progress `eased`. Complement of animateWaveClip:
 * everything above the descending wave line.
 */
function waveNewPolygon(eased: number): string {
	const waveY = eased * 100;
	const points = ["0% 0%", "100% 0%"];
	for (let x = 100; x >= 0; x -= WAVE.step) {
		const wave = Math.sin((x / 100) * Math.PI * 4) * WAVE.amplitude;
		points.push(`${x}% ${fmt(waveY + wave)}%`);
	}
	return `polygon(${points.join(", ")})`;
}

/**
 * The clip-path runs as a plain CSS animation on the ::view-transition
 * pseudo-elements — no per-frame JS. Keyframes are sampled with the
 * ease-out baked in (animation-timing-function stays linear) and every
 * frame has a fixed vertex count so CSS interpolates smoothly between
 * them. Generated once and injected lazily on first VT toggle.
 */
const KEYFRAME_STEPS = 40;
function buildKeyframes(name: string, poly: (eased: number) => string): string {
	const frames: string[] = [];
	for (let i = 0; i <= KEYFRAME_STEPS; i++) {
		const p = i / KEYFRAME_STEPS;
		frames.push(`${fmt(p * 100)}% { clip-path: ${poly(easeOutCubic(p))}; }`);
	}
	return `@keyframes ${name} {\n${frames.join("\n")}\n}`;
}

let keyframesInjected = false;
function ensureKeyframes(): void {
	if (keyframesInjected) return;
	keyframesInjected = true;
	const style = document.createElement("style");
	style.id = "theme-vt-keyframes";
	style.textContent = [
		buildKeyframes("theme-vt-arc", arcNewPolygon),
		buildKeyframes("theme-vt-wave", waveNewPolygon),
	].join("\n");
	document.head.appendChild(style);
}

/** Details sent to front-aware components (e.g. InvisibleInk). */
export type ThemeWipeDetail = {
	mode: "arc" | "wave";
	duration: number;
};

let activeVT: ViewTransitionLike | null = null;

/**
 * View Transition theme toggle. The caller has already flipped
 * localStorage and the theme-color meta; this only handles the visual
 * transition and the `dark` class flip.
 */
export async function vtTransition(
	html: HTMLElement,
	goingDark: boolean,
): Promise<void> {
	const doc = document as DocumentWithVT;
	if (!doc.startViewTransition) return;

	const dispatchVisual = () =>
		window.dispatchEvent(new CustomEvent("theme-toggle-visual"));

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		html.classList.toggle("dark", goingDark);
		dispatchVisual();
		return;
	}

	ensureKeyframes();
	activeVT?.skipTransition();

	const mobile = isMobile();
	const mode: ThemeWipeDetail["mode"] = mobile ? "wave" : "arc";

	// Phase 1: let front-aware components cache the OLD colour before the
	// class flips. They hold every pixel at the old colour until the front
	// starts moving (theme-wipe-start below).
	window.dispatchEvent(
		new CustomEvent<ThemeWipeDetail>("theme-wipe", {
			detail: { mode, duration: TIMING.phase },
		}),
	);

	html.classList.add("theme-vt", mobile ? "theme-vt-wave" : "theme-vt-arc");
	if (!mobile) html.classList.add("theme-arc-animating");

	const vt = doc.startViewTransition(() => {
		html.classList.toggle("dark", goingDark);
		dispatchVisual();
	});
	activeVT = vt;

	try {
		// Phase 2: the pseudo-element animations begin once the new state is
		// captured — sync the front-aware components to the same clock.
		await vt.ready;
		window.dispatchEvent(
			new CustomEvent("theme-wipe-start", {
				detail: { start: performance.now() },
			}),
		);
		await vt.finished;
	} catch {
		// Skipped or interrupted transitions still need cleanup.
	} finally {
		if (activeVT === vt) activeVT = null;
		window.dispatchEvent(new CustomEvent("theme-wipe-end"));
		html.classList.remove(
			"theme-vt",
			"theme-vt-arc",
			"theme-vt-wave",
			"theme-arc-animating",
		);
	}
}
