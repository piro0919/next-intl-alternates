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
 *
 * `L` is the union of the site's locales. It is inferred from `locales`, so a
 * routing object whose locales are literal types makes a locale outside them a
 * compile error; one typed as `string[]` accepts any string.
 */
export type Routing<L extends string = string> = {
  defaultLocale: L;
  /**
   * next-intl's domain-based routing. Not supported: `createAlternates` throws
   * when it is set. Build those URLs with `localeUrl` per domain instead.
   */
  domains?: unknown;
  localePrefix?: LocalePrefix;
  locales: readonly L[];
  pathnames?: Record<string, Pathname>;
};

export type AlternatesConfig<L extends string = string> = {
  /** Origin the URLs are built on, e.g. "https://example.com". */
  baseUrl: string;
  /** Emit a trailing slash, matching Next's `trailingSlash` option. */
  trailingSlash?: boolean;
} & Routing<L>;

/**
 * Values for a pathname's dynamic segments. A catch-all, `[...slug]` or
 * `[[...slug]]`, takes the array Next passes in `params`, or one string with
 * slashes in it.
 */
export type Params = Record<string, number | readonly string[] | string>;

/**
 * `T` when it is one of the site's locales, or a plain `string` whose value is
 * only known at runtime (a route param). A literal outside `L` resolves to `L`,
 * so the compiler reports it.
 */
export type KnownLocale<L extends string, T extends string> = string extends T
  ? T
  : T extends L
    ? T
    : L;

export type AlternatesOptions<
  L extends string = string,
  T extends string = L,
  A extends string = L,
> = {
  /**
   * The locales this page exists in. Defaults to every locale.
   *
   * An article that was only ever written in Japanese exists in one. Listing a
   * language the page does not have makes search engines drop the whole
   * annotation, not just that line.
   */
  availableLocales?: readonly KnownLocale<L, A>[];
  /** The locale being rendered. */
  locale: KnownLocale<L, T>;
  /** Values for the dynamic segments in `pathname`. */
  params?: Params;
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
