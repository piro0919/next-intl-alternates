# Changelog

## 0.2.0 - 2026-10-01

### Breaking

- `prefixFor`, `localizedPathname`, `fillParams` and `normalize` are no longer
  exported. The public API is `createAlternates`, `localeUrl` and their types.
- A dynamic segment with no value in `params` now throws, naming the segment
  and the pathname, as next-intl's `getPathname` does. It used to leave
  `[slug]` in the URL.
- `createAlternates` throws when the routing has `domains`, which it never
  handled; it used to build URLs on `baseUrl` as if the key were not there.

### Added

- Catch-all params take the `string[]` Next passes, as well as a string with
  slashes. Each segment is escaped on its own.
- An optional catch-all, `[[...slug]]`, with no value is dropped along with
  the slash before it: `/docs/[[...slug]]` becomes `/docs`.
- `locale` and `availableLocales` are checked at compile time against the
  routing's `locales` when those are literal types. A plain `string` is still
  accepted.
- `Params` and `KnownLocale` types.
- `engines.node` is `>=20`. CI runs the tests on Node 20, 22 and 24, and checks
  the package with publint and @arethetypeswrong/cli.

## 0.1.0

Initial release.

### Added

- `createAlternates` — canonical and `hreflang` links for one page, from
  next-intl's routing object: unprefixed default locale, no redirecting URLs,
  only the locales a page exists in, `x-default` where it can actually point,
  and localized pathnames followed per locale.
- `localeUrl` — one locale's URL on its own.
- `prefixFor`, `localizedPathname`, `fillParams` and `normalize`, for callers
  that want the pieces.
