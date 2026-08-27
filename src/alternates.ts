import type { Alternates, AlternatesConfig, AlternatesOptions } from "./types";
import { fillParams, localizedPathname, normalize, prefixFor } from "./url";

/** The URL one locale uses for a route. */
export function localeUrl(
  config: AlternatesConfig,
  { locale, params, pathname }: Omit<AlternatesOptions, "availableLocales">,
): string {
  const {
    baseUrl,
    defaultLocale,
    localePrefix,
    pathnames,
    trailingSlash = false,
  } = config;
  const origin = baseUrl.replace(/\/+$/, "");
  const prefix = prefixFor(locale, defaultLocale, localePrefix);
  const path = normalize(
    fillParams(localizedPathname(pathname, locale, pathnames), params),
  );
  const url = `${origin}${prefix}${path}`;

  if (!trailingSlash) return url === origin ? `${origin}/` : url;

  return `${url}/`;
}

/**
 * Build the `alternates` block for one page: the canonical URL, and one
 * `hreflang` per locale the page exists in.
 *
 * ```ts
 * const getAlternates = createAlternates({ baseUrl: "https://example.com", ...routing });
 *
 * export async function generateMetadata({ params }) {
 *   const { locale } = await params;
 *
 *   return { alternates: getAlternates({ locale, pathname: "/about" }) };
 * }
 * ```
 */
export function createAlternates(
  config: AlternatesConfig,
): (options: AlternatesOptions) => Alternates {
  const { defaultLocale, locales } = config;

  if (!locales.includes(defaultLocale)) {
    throw new Error(
      `next-intl-alternates: defaultLocale "${defaultLocale}" is not in locales [${locales.join(", ")}].`,
    );
  }

  return ({ availableLocales, locale, params, pathname }) => {
    if (!locales.includes(locale)) {
      throw new Error(
        `next-intl-alternates: locale "${locale}" is not in locales [${locales.join(", ")}].`,
      );
    }

    const available = (availableLocales ?? locales).filter((candidate) =>
      locales.includes(candidate),
    );
    const canonical = localeUrl(config, { locale, params, pathname });
    const mode =
      typeof config.localePrefix === "object"
        ? config.localePrefix.mode
        : (config.localePrefix ?? "as-needed");

    /* With no prefixes there is one URL for every locale, and hreflang lines
       that all point at it are not annotations — they are the same page claimed
       four times. Emit the canonical alone. */
    if (mode === "never") return { canonical };

    if (available.length === 0) return { canonical };

    const languages: Record<string, string> = {};

    for (const candidate of available) {
      languages[candidate] = localeUrl(config, {
        locale: candidate,
        params,
        pathname,
      });
    }

    /* x-default is for readers whose language you do not publish in. Point it
       at the default locale, or — when this page does not exist there — at the
       one version that does. */
    const fallback = available.includes(defaultLocale)
      ? defaultLocale
      : available[0];

    if (fallback !== undefined) {
      languages["x-default"] = languages[fallback] as string;
    }

    return { canonical, languages };
  };
}
