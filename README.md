# next-intl-alternates

Canonical and `hreflang` metadata for a next-intl site.

```ts
import { createAlternates } from "next-intl-alternates";
import { routing } from "@/i18n/routing";

export const getAlternates = createAlternates({
  baseUrl: "https://example.com",
  ...routing,
});
```

```ts
export async function generateMetadata({ params }) {
  const { locale } = await params;

  return { alternates: getAlternates({ locale, pathname: "/about" }) };
}
```

```html
<link rel="canonical" href="https://example.com/ja/about" />
<link rel="alternate" hreflang="en" href="https://example.com/about" />
<link rel="alternate" hreflang="ja" href="https://example.com/ja/about" />
<link rel="alternate" hreflang="x-default" href="https://example.com/about" />
```

<https://next-intl-alternates.kkweb.io> turns the configuration in a browser and
shows what comes out.

## What it is careful about

Four lines of configuration produce a set of links that is easy to get subtly
wrong, and wrong here fails quietly — the annotation is dropped and nothing
tells you.

**The home page that redirects.** With `as-needed` prefixes the default locale
has no prefix, and its home page is the origin. Join a prefix to a path of `/`
and you get `/ja/`, which redirects to `/ja` with a 308. A canonical URL that
redirects points at a page that is not there.

**The language the page does not have.** An article written in Japanese only has
one version. Listing a language a page does not have makes search engines drop
the whole annotation, not just that line. Pass `availableLocales`.

**`x-default` with nowhere to point.** It is for a reader whose language you do
not publish in, so it belongs on the default locale — except on a page the
default locale does not have, where it belongs on the version that exists.

**The pathname that is not the route.** With next-intl's localized pathnames,
`/about` is `/kaisha` in Japanese. Every line has to point at that locale's own
pathname.

**No prefixes at all.** With `localePrefix: "never"` every locale shares one
URL, and `hreflang` lines that all point at the same page are not an annotation.
Only the canonical is emitted.

## Install

```bash
npm install next-intl-alternates
```

It has no dependencies, and next-intl is not one either — it reads the routing
object you already have.

## `createAlternates(config)`

| Key | | |
| ---- | ---- | ---- |
| `baseUrl` | — | the origin, the one thing next-intl's routing has no reason to know |
| `locales` | — | from `routing` |
| `defaultLocale` | — | from `routing` |
| `localePrefix` | `"as-needed"` | from `routing`; the `{ mode, prefixes }` form works too |
| `pathnames` | — | from `routing`, when you use localized pathnames |
| `trailingSlash` | `false` | match Next's option of the same name |

It returns a function to call per page:

| Key | | |
| ---- | ---- | ---- |
| `locale` | — | the locale being rendered |
| `pathname` | — | the route: `/about`, or `/blog/[slug]` |
| `params` | `{}` | values for the dynamic segments |
| `availableLocales` | every locale | the locales this page exists in |

```ts
getAlternates({
  locale,
  pathname: "/blog/[slug]",
  params: { slug },
  availableLocales: article.locales,
});
```

## `localeUrl(config, { locale, pathname, params })`

One locale's URL on its own, for a sitemap or an `og:url`:

```ts
import { localeUrl } from "next-intl-alternates";

localeUrl(config, { locale: "ja", pathname: "/about" });
// "https://example.com/ja/about"
```

`prefixFor`, `localizedPathname`, `fillParams` and `normalize` are exported too,
for callers that want the pieces rather than the whole.

## Not covered

next-intl's `domains` — a locale served from its own hostname — is not handled.
Build those URLs with `localeUrl` against each domain's `baseUrl`.

## Licence

MIT
