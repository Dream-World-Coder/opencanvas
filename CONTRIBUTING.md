# Contributing to OpenCanvas

Thanks for your interest in contributing. OpenCanvas is an early-stage project and contributions are very welcome: fixing bugs, improving performance, writing articles on the platform, or adding new features.

---

## Before You Start

- Check open issues before starting work on something new. If you have a new idea, open an issue first so we can discuss it.
- Keep pull requests focused. One thing per PR, don't bundle unrelated changes together.
- Write clean, readable code. Prefer clarity over cleverness. If something needs a comment to be understood, write one, but keep comments concise and skip the emojis.

---

## Code Style

- **No emojis in comments or commit messages.**
- Follow the existing conventions in the file you're editing: indentation, naming, structure.
- For the frontend (React + Tailwind), keep components small and single-purpose where possible.
- For the backend (Express + Mongoose), prefer lean queries, avoid unnecessary `.populate()`, and keep route handlers thin. Push logic into services.
- Don't leave dead code, `console.log` debug statements, or commented-out blocks in your PR.

---

## Submitting a Pull Request

1. Fork the repo and create a branch off `main`. Name it something descriptive: `fix/comment-reply-bug`, `feat/notification-bell`, etc.
2. Make your changes, test them locally.
3. Open a PR against `main` with a clear title and description of what changed and why.

**For UI / frontend changes:** attach a screenshot or short screen recording of the component in your PR description. Dark mode too if it applies.

**For backend changes:** include a relevant log snippet or Autocannon/Artillery output if your change affects performance or a data-sensitive route. Even a quick `pnpm dev` log showing the route working is helpful.

---

## Project Structure (Quick Reference)

```
client/src/
  pages/        # Route-level page components
  components/   # Shared UI components
  contexts/     # Auth, Theme, etc.
  services/     # API call helpers

server/src/
  models/       # Mongoose schemas
  routes/       # Express route handlers
  middlewares/  # Auth, error handling, fingerprinting
  services/     # Caching, image upload, notifications
  jobs/         # Cron job logic
```

---

## What's Welcome

- Bug fixes
- Performance improvements (DB queries, caching, payload size)
- New UI components or page improvements
- Documentation fixes
- Test coverage

## What to Avoid

- Large refactors without prior discussion
- Changing the design system (colors, typography) without opening an issue first
- Adding dependencies without a clear reason

---

## Questions

Open an issue or reach out directly. This is a solo-built project in active development, so response times may vary, but all genuine contributions will be reviewed.
