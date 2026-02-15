# Project Hermes

This is an Astro project with Solid.js and Svelte components, deployed on Vercel.

## Commands

- `bun install` - Install dependencies
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run format` - Format code (runs biome + oxlint --fix)
- `bun biome check --write <file>` - Format specific file
- `bun oxlint` - Run linter

## Stack

- **Framework**: Astro 5
- **UI**: Solid.js, Svelte, Tailwind CSS
- **Git hooks**: lefthook
- **Deployment**: Vercel
- **PWA**: vite-plugin-pwa with service worker

## Theme System

The site supports light/dark themes with these colors (defined in `tailwind.config.ts`):

| Token | Light | Dark |
|-------|-------|------|
| primary | `#fed7aa` (orange-200) | `#0f172a` (slate-900) |
| secondary | `#fdba74` (orange-300) | `#475569` (slate-600) |
| tertiary | `#ea580c` (orange-600) | `#cbd5e1` (slate-300) |

Theme initialization happens in `src/utils/theme.ts`:
- Inline script in `<head>` prevents flash of wrong theme
- `toggleTheme()` updates both the `dark` class and `theme-color` meta tag
- iOS status bar color updates dynamically with theme

## Theme Animation Architecture

The theme transition uses a JS-driven overlay system with CSS animations:

### Key Files
- `src/config/theme.ts` - Single source of truth for colors, timing, and animation constants
- `src/utils/theme.ts` - Theme toggle logic and overlay animations
- `src/layouts/Layout.astro` - CSS variables and keyframe animations
- `src/components/svelte/ThemeToggle.svelte` - Sun/moon toggle component

### How It Works
1. **Overlay Pattern**: On toggle, a clone of the page is created with frozen styles (the "old" theme)
2. **Clip-path Animation**: JS animates `clip-path` to reveal the new theme underneath
   - Desktop: Arc sweep from bottom-left to bottom-right
   - Mobile: Wave animation from top to bottom
3. **Shadow Animation**: CSS `@keyframes` animate shadows to follow a "light source"

### CSS Variables (defined in Layout.astro)
```css
--arc-duration: 2500ms;    /* Theme transition duration */
--default-shadow: ...;      /* Box shadow for [data-theme-shadow] elements */
--theme-bg: ...;            /* Current theme background */
--theme-tertiary: ...;      /* Current theme accent */
```

### Important Patterns

**Use `dark:` classes, not `:checked` for theme-dependent visuals:**
```svelte
<!-- BAD: Depends on checkbox DOM state -->
<span class="peer-checked:bg-gray-700">

<!-- GOOD: Follows html.dark class (single source of truth) -->
<span class="dark:bg-gray-700">
```

**Sync animation durations via CSS variables:**
```svelte
<!-- Uses same timing as theme overlay animation -->
<span class="duration-[var(--arc-duration)]">
```

**Use `theme()` function in component styles for DRY colors:**
```css
.slider:before {
  background: theme(colors.secondary.dark);
}
```

### Data Attributes
- `data-theme-toggle` - Marks the toggle (elevated above overlay during animation)
- `data-theme-shadow="box"` - Elements that get animated shadows during transition

## Debugging Notes

- **Arc browser** injects its own CSS variables (`--arc-*`) that can override page colors - test in Safari/Chrome if colors look wrong
- **Theme toggle icon stuck**: If sun/moon doesn't change, check that visuals use `dark:` classes not `:checked` selectors
- **Animation out of sync**: Ensure component uses `--arc-duration` CSS variable, not hardcoded duration

## Development Workflow

When working on features or fixes:

1. **Create a new branch** - Always start work in a new branch. If unsure whether a new branch is needed, ask first.
2. **Rebase off main** - Before committing, rebase off main to ensure you have the latest changes: `git fetch origin main && git rebase origin/main`
3. **Push with tracking** - Always push with `-u` to create a remote tracking branch: `git push -u origin <branch-name>`
4. **Create a PR** - After pushing, create a pull request: `gh pr create`
