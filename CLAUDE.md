# Project Hermes

This is an Astro project with Solid.js and Svelte components, deployed on Vercel.

## Commands

- `bun install` - Install dependencies
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run linter
- `bun run lint:fix` - Fix lint issues
- `bun run format` - Format code
- `bun run format:check` - Check formatting

## Stack

- **Framework**: Astro 5
- **UI**: Solid.js, Svelte, Tailwind CSS
- **Git hooks**: lefthook
- **Deployment**: Vercel

## Development Workflow

When working on features or fixes:

1. **Create a new branch** - Always start work in a new branch. If unsure whether a new branch is needed, ask first.
2. **Rebase off main** - Before committing, rebase off main to ensure you have the latest changes: `git fetch origin main && git rebase origin/main`
3. **Push with tracking** - Always push with `-u` to create a remote tracking branch: `git push -u origin <branch-name>`
4. **Create a PR** - After pushing, create a pull request: `gh pr create`
