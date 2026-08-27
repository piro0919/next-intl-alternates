# Changelog

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
