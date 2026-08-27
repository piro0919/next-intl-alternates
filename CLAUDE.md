# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**next-intl-alternates** builds the `alternates` block of Next's metadata —
canonical plus `hreflang` — from next-intl's routing object. Its differentiator
over writing it by hand: the cases that fail quietly. An unprefixed default
locale whose home page would otherwise redirect, a page that exists in one
language only, `x-default` with nowhere to point, and localized pathnames.

- **npm package:** next-intl-alternates
- **Demo site:** <https://next-intl-alternates.kkweb.io>

## Tech Stack

- TypeScript 5, no dependencies — next-intl is not one either; the routing
  object is read structurally
- Next.js 16 (App Router) — demo site only
- Biome (linter/formatter)
- tsup (library build, ESM + CJS)
- Vitest — tests
- Vercel (deployment)

## Project Structure

```text
src/
├── index.ts        # public API
├── alternates.ts   # canonical + languages for one page
├── url.ts          # prefixes, localized pathnames, dynamic segments
├── types.ts        # the parts of next-intl's routing this reads
└── app/            # Next.js App Router (demo site)
tests/
assets/             # Space Grotesk subset drawn into the Open Graph card
```

## Design notes

- **The root path is normalized to `""`, not `"/"`.** Joined to a prefix, `"/"`
  produces `/ja/`, which 308s to `/ja`. A canonical that redirects points at a
  page that is not there. The unprefixed root stays `https://host/`.
- **`localePrefix: "never"` returns the canonical alone.** Every locale has the
  same URL there, and `hreflang` lines that all name one URL claim the same page
  several times.
- **`availableLocales` is filtered against `locales`.** A caller passing a
  language the site does not have should not put it in the head.
- **`x-default` falls back to the first available locale** when the page has no
  default-locale version.
- **A `pathnames` entry missing a locale falls back to the route key** rather
  than emitting a URL from a map that does not mention it.
- **Types are structural.** The `Routing` type is the subset this reads, so
  passing next-intl's routing object works without importing next-intl and
  without pinning a version of it.

## Demo site

`_components/inspector.tsx` calls the library in the browser — the head it shows
is the real return value, not a table of prepared answers. Adding a case to the
library means the inspector can already show it; check that the notes under the
head still describe what the controls do.

## Commands

```bash
pnpm dev         # demo site
pnpm test        # vitest
pnpm typecheck   # tsc --noEmit
pnpm lint        # biome check
pnpm build:lib   # tsup -> dist
pnpm build       # next build (demo site)
```

## Testing

The tests are the specification: each one names the trap it protects. When
changing URL building, break it deliberately and confirm the matching test fails
before restoring — several of these cases look wrong only in a search console
weeks later.

## Releasing

Bump `version` in `package.json`, add a `CHANGELOG.md` entry, then push a
`vX.Y.Z` tag. The publish workflow checks the tag against `package.json`.
