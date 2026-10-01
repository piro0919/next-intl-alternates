import { defineRouting } from "next-intl/routing";
import { describe, expect, it } from "vitest";
import { createAlternates, localeUrl } from "../src";

/* The routing object is read structurally, so nothing in src imports
   next-intl. These pass next-intl's own defineRouting output through, to catch
   a release whose routing shape no longer fits the Routing type. */

const baseUrl = "https://example.com";

describe("next-intl's defineRouting", () => {
  it("is accepted as it is, prefixes and localized pathnames included", () => {
    const routing = defineRouting({
      defaultLocale: "en",
      localePrefix: { mode: "as-needed", prefixes: { ja: "/jp" } },
      locales: ["en", "ja"],
      pathnames: {
        "/about": { en: "/about", ja: "/kaisha" },
        "/blog/[slug]": "/blog/[slug]",
      },
    });
    const getAlternates = createAlternates({ baseUrl, ...routing });

    expect(getAlternates({ locale: "ja", pathname: "/about" })).toEqual({
      canonical: "https://example.com/jp/kaisha",
      languages: {
        en: "https://example.com/about",
        ja: "https://example.com/jp/kaisha",
        "x-default": "https://example.com/about",
      },
    });
  });

  it("takes the string form of localePrefix", () => {
    const routing = defineRouting({
      defaultLocale: "en",
      localePrefix: "never",
      locales: ["en", "ja"],
    });

    expect(
      localeUrl({ baseUrl, ...routing }, { locale: "ja", pathname: "/" }),
    ).toBe("https://example.com/");
  });

  it("is refused when it routes by domain", () => {
    const routing = defineRouting({
      defaultLocale: "en",
      domains: [
        { defaultLocale: "en", domain: "example.com", locales: ["en"] },
        { defaultLocale: "ja", domain: "example.jp", locales: ["ja"] },
      ],
      locales: ["en", "ja"],
    });

    expect(() => createAlternates({ baseUrl, ...routing })).toThrow(/domains/);
  });

  it("narrows locale to the routing's locales at compile time", () => {
    const routing = defineRouting({
      defaultLocale: "en",
      locales: ["en", "ja"],
    });
    const getAlternates = createAlternates({ baseUrl, ...routing });
    /* A route param is a plain string; its value is checked at runtime. */
    const fromParams: string = "ja";

    expect(getAlternates({ locale: fromParams, pathname: "/" }).canonical).toBe(
      "https://example.com/ja",
    );
    expect(() =>
      // @ts-expect-error "fr" is not one of the routing's locales
      getAlternates({ locale: "fr", pathname: "/" }),
    ).toThrow(/locale "fr"/);
    expect(() =>
      getAlternates({
        // @ts-expect-error "de" is not one of the routing's locales
        availableLocales: ["ja", "de"],
        locale: "ja",
        pathname: "/",
      }),
    ).not.toThrow();
  });
});
