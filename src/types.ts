/** How next-intl puts the locale in the path. */
export type LocalePrefixMode = "always" | "as-needed" | "never";

export type LocalePrefix =
  | LocalePrefixMode
  | {
      mode: LocalePrefixMode;
      /** Per-locale overrides, e.g. `{ ja: "/jp" }`. */
      prefixes?: Record<string, string>;
    };

/**
 * A localized pathname: one string when every locale shares it, or one entry
 * per locale. The same shape next-intl's `routing.pathnames` takes.
 */
export type Pathname = Record<string, string> | string;

/**
 * The parts of next-intl's routing configuration this needs. Pass the routing
 * object itself — the extra keys on it are ignored.
 */
export type Routing = {
  defaultLocale: string;
  localePrefix?: LocalePrefix;
  locales: readonly string[];
  pathnames?: Record<string, Pathname>;
};

export type AlternatesConfig = {
  /** Origin the URLs are built on, e.g. "https://example.com". */
  baseUrl: string;
  /** Emit a trailing slash, matching Next's `trailingSlash` option. */
  trailingSlash?: boolean;
} & Routing;

export type AlternatesOptions = {
  /**
   * The locales this page exists in. Defaults to every locale.
   *
   * An article that was only ever written in Japanese exists in one. Listing a
   * language the page does not have makes search engines drop the whole
   * annotation, not just that line.
   */
  availableLocales?: readonly string[];
  /** The locale being rendered. */
  locale: string;
  /** Values for the dynamic segments in `pathname`. */
  params?: Record<string, number | string>;
  /**
   * The route, as it appears in `pathnames` when you use localized pathnames:
   * "/about", "/blog/[slug]". Otherwise the path itself.
   */
  pathname: string;
};

/** The shape Next's `Metadata["alternates"]` expects. */
export type Alternates = {
  canonical: string;
  languages?: Record<string, string>;
};
