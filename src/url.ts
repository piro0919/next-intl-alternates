import type { LocalePrefix, Pathname } from "./types";

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

/** Put the params back into "/blog/[slug]". */
export function fillParams(
  pathname: string,
  params: Record<string, number | string> = {},
): string {
  return pathname.replace(
    /\[{1,2}(\.{3})?([^\]]+?)\]{1,2}/g,
    (match, spread: string | undefined, name: string) => {
      const value = params[name];

      if (value === undefined) return match;

      /* A catch-all segment takes an array in next-intl; accept a value that
         already contains slashes and leave it as it is. */
      return spread === undefined
        ? encodeURIComponent(String(value))
        : String(value)
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");
    },
  );
}
