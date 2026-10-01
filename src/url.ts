import type { LocalePrefix, Params, Pathname } from "./types";

/** The prefix a locale's URLs carry, "" when it carries none. */
export function prefixFor(
  locale: string,
  defaultLocale: string,
  localePrefix: LocalePrefix = "as-needed",
): string {
  const mode =
    typeof localePrefix === "string" ? localePrefix : localePrefix.mode;
  const prefixes =
    typeof localePrefix === "string" ? undefined : localePrefix.prefixes;

  if (mode === "never") return "";

  if (mode === "as-needed" && locale === defaultLocale) return "";

  const custom = prefixes?.[locale];

  return custom === undefined ? `/${locale}` : normalize(custom);
}

/** Leading slash, no trailing slash, "" for the root. */
export function normalize(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const trimmed = withSlash.replace(/\/+$/, "");

  return trimmed === "/" ? "" : trimmed;
}

/** The pathname a locale uses for a route, before its prefix. */
export function localizedPathname(
  pathname: string,
  locale: string,
  pathnames?: Record<string, Pathname>,
): string {
  const localized = pathnames?.[pathname];

  if (localized === undefined) return pathname;

  if (typeof localized === "string") return localized;

  /* A pathname map that forgets one locale should not silently produce the
     route's key as a URL — that path exists in no locale. Fall back to the
     shared route so the URL is at least a real one, and let the caller notice. */
  return localized[locale] ?? pathname;
}

/**
 * Put the params back into "/blog/[slug]".
 *
 * Follows next-intl's `getPathname`: a segment with no value throws rather
 * than leaving "[slug]" in a URL that exists nowhere. The one exception is an
 * optional catch-all, "[[...slug]]", whose empty form is the route without it.
 */
export function fillParams(pathname: string, params: Params = {}): string {
  return pathname.replace(
    /(\/?)\[(\[)?(\.{3})?([^\]]+?)\]\]?/g,
    (
      _match,
      slash: string,
      optional: string | undefined,
      spread: string | undefined,
      name: string,
    ) => {
      const value = params[name];
      const parts = (Array.isArray(value) ? value : [value])
        .filter((part) => part !== undefined && part !== "")
        .map(String);

      if (parts.length === 0) {
        /* "/docs/[[...slug]]" with nothing to fill is "/docs" — drop the
           slash in front as well, or the URL ends in one. */
        if (optional !== undefined && spread !== undefined) return "";

        throw new Error(
          `next-intl-alternates: no value for "${name}" in pathname "${pathname}". Pass it in params.`,
        );
      }

      if (spread === undefined && Array.isArray(value)) {
        throw new Error(
          `next-intl-alternates: "${name}" in pathname "${pathname}" is not a catch-all segment, but its value is an array.`,
        );
      }

      /* A catch-all takes the array Next passes, or a string that already
         contains slashes. Each part is escaped on its own so the slashes
         between them stay slashes; a slash inside an array element is part of
         that segment and is escaped with it. */
      const segments =
        spread !== undefined && !Array.isArray(value)
          ? parts.flatMap((part) => part.split("/"))
          : parts;

      return `${slash}${segments.map((part) => encodeURIComponent(part)).join("/")}`;
    },
  );
}
