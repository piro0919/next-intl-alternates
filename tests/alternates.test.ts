import { describe, expect, it } from "vitest";
import { createAlternates, localeUrl } from "../src/alternates";
import type { AlternatesConfig } from "../src/types";

const config: AlternatesConfig = {
  baseUrl: "https://example.com",
  defaultLocale: "en",
  locales: ["en", "ja"],
};

describe("createAlternates", () => {
  it("leaves the default locale unprefixed and prefixes the others", () => {
    const alternates = createAlternates(config)({
      locale: "ja",
      pathname: "/about",
    });

    expect(alternates.canonical).toBe("https://example.com/ja/about");
    expect(alternates.languages).toEqual({
      en: "https://example.com/about",
      ja: "https://example.com/ja/about",
      "x-default": "https://example.com/about",
    });
  });

  it("does not put a trailing slash on a prefixed home page", () => {
    /* "/ja/" redirects to "/ja" with a 308. A canonical URL that redirects is
       pointing at a page that is not there. */
    expect(
      createAlternates(config)({ locale: "ja", pathname: "/" }).canonical,
    ).toBe("https://example.com/ja");
  });

  it("keeps the root of the unprefixed locale at the origin", () => {
    expect(
      createAlternates(config)({ locale: "en", pathname: "/" }).canonical,
    ).toBe("https://example.com/");
  });

  it("lists only the locales the page exists in", () => {
    const alternates = createAlternates(config)({
      availableLocales: ["ja"],
      locale: "ja",
      pathname: "/blog/20260522",
    });

    expect(alternates.languages).toEqual({
      ja: "https://example.com/ja/blog/20260522",
      "x-default": "https://example.com/ja/blog/20260522",
    });
  });

  it("points x-default at the one version that exists when the default locale has none", () => {
    const alternates = createAlternates(config)({
      availableLocales: ["ja"],
      locale: "ja",
      pathname: "/blog/only-japanese",
    });

    expect(alternates.languages?.["x-default"]).toBe(alternates.languages?.ja);
  });

  it("ignores an available locale the site does not have", () => {
    const alternates = createAlternates(config)({
      availableLocales: ["en", "de"],
      locale: "en",
      pathname: "/about",
    });

    expect(Object.keys(alternates.languages ?? {})).toEqual([
      "en",
      "x-default",
    ]);
  });

  it("emits the canonical alone when no locale is prefixed", () => {
    /* Every locale would have the same URL, and four hreflang lines pointing at
       one URL say nothing. */
    const alternates = createAlternates({
      ...config,
      localePrefix: "never",
    })({ locale: "ja", pathname: "/about" });

    expect(alternates).toEqual({ canonical: "https://example.com/about" });
  });

  it("prefixes every locale in always mode", () => {
    const alternates = createAlternates({
      ...config,
      localePrefix: "always",
    })({ locale: "en", pathname: "/about" });

    expect(alternates.canonical).toBe("https://example.com/en/about");
    expect(alternates.languages?.["x-default"]).toBe(
      "https://example.com/en/about",
    );
  });

  it("follows localized pathnames, so each line points at that locale's URL", () => {
    const alternates = createAlternates({
      ...config,
      pathnames: { "/about": { en: "/about", ja: "/kaisha" } },
    })({ locale: "ja", pathname: "/about" });

    expect(alternates.languages).toEqual({
      en: "https://example.com/about",
      ja: "https://example.com/ja/kaisha",
      "x-default": "https://example.com/about",
    });
  });

  it("fills dynamic segments in every locale", () => {
    const alternates = createAlternates({
      ...config,
      pathnames: { "/blog/[slug]": { en: "/blog/[slug]", ja: "/kiji/[slug]" } },
    })({ locale: "en", params: { slug: "hello" }, pathname: "/blog/[slug]" });

    expect(alternates.languages?.ja).toBe("https://example.com/ja/kiji/hello");
  });

  it("adds trailing slashes when the site does", () => {
    const alternates = createAlternates({ ...config, trailingSlash: true })({
      locale: "ja",
      pathname: "/about",
    });

    expect(alternates.canonical).toBe("https://example.com/ja/about/");
  });

  it("takes a base URL that ends in a slash", () => {
    expect(
      createAlternates({ ...config, baseUrl: "https://example.com/" })({
        locale: "en",
        pathname: "/about",
      }).canonical,
    ).toBe("https://example.com/about");
  });

  it("refuses a default locale that is not in locales", () => {
    expect(() => createAlternates({ ...config, defaultLocale: "fr" })).toThrow(
      /defaultLocale/,
    );
  });

  it("refuses a locale the site does not have", () => {
    expect(() =>
      createAlternates(config)({ locale: "fr", pathname: "/about" }),
    ).toThrow(/locale "fr"/);
  });

  it("returns the canonical alone when the page exists in no locale at all", () => {
    expect(
      createAlternates(config)({
        availableLocales: [],
        locale: "en",
        pathname: "/about",
      }),
    ).toEqual({ canonical: "https://example.com/about" });
  });
});

describe("localeUrl", () => {
  it("builds one locale's URL on its own", () => {
    expect(localeUrl(config, { locale: "ja", pathname: "/about" })).toBe(
      "https://example.com/ja/about",
    );
  });

  it("takes the custom prefix", () => {
    expect(
      localeUrl(
        {
          ...config,
          localePrefix: { mode: "as-needed", prefixes: { ja: "/jp" } },
        },
        { locale: "ja", pathname: "/about" },
      ),
    ).toBe("https://example.com/jp/about");
  });
});
