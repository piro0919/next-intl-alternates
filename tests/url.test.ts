import { describe, expect, it } from "vitest";
import {
  fillParams,
  localizedPathname,
  normalize,
  prefixFor,
} from "../src/url";

describe("normalize", () => {
  it("adds the leading slash", () => {
    expect(normalize("about")).toBe("/about");
  });

  it("drops a trailing slash", () => {
    expect(normalize("/about/")).toBe("/about");
  });

  it("empties the root, so it can be joined onto a prefix", () => {
    expect(normalize("/")).toBe("");
  });
});

describe("prefixFor", () => {
  it("leaves the default locale unprefixed when prefixes are as-needed", () => {
    expect(prefixFor("en", "en", "as-needed")).toBe("");
    expect(prefixFor("ja", "en", "as-needed")).toBe("/ja");
  });

  it("prefixes every locale in always mode", () => {
    expect(prefixFor("en", "en", "always")).toBe("/en");
  });

  it("prefixes nothing in never mode", () => {
    expect(prefixFor("ja", "en", "never")).toBe("");
  });

  it("takes the per-locale prefix next-intl allows", () => {
    const prefix = { mode: "as-needed", prefixes: { ja: "/jp" } } as const;

    expect(prefixFor("ja", "en", prefix)).toBe("/jp");
  });

  it("defaults to as-needed", () => {
    expect(prefixFor("ja", "en")).toBe("/ja");
  });
});

describe("localizedPathname", () => {
  const pathnames = {
    "/about": { en: "/about", ja: "/about-us" },
    "/blog": "/blog",
  };

  it("takes the locale's own pathname", () => {
    expect(localizedPathname("/about", "ja", pathnames)).toBe("/about-us");
  });

  it("takes a shared pathname as it is", () => {
    expect(localizedPathname("/blog", "ja", pathnames)).toBe("/blog");
  });

  it("passes through a route the map does not mention", () => {
    expect(localizedPathname("/contact", "ja", pathnames)).toBe("/contact");
  });

  it("falls back to the route when the map forgets a locale", () => {
    expect(localizedPathname("/about", "fr", pathnames)).toBe("/about");
  });
});

describe("fillParams", () => {
  it("fills a dynamic segment", () => {
    expect(fillParams("/blog/[slug]", { slug: "hello" })).toBe("/blog/hello");
  });

  it("escapes what it puts in", () => {
    expect(fillParams("/blog/[slug]", { slug: "a b" })).toBe("/blog/a%20b");
  });

  it("keeps the slashes in a catch-all", () => {
    expect(fillParams("/docs/[...path]", { path: "a/b" })).toBe("/docs/a/b");
  });

  it("encodes each part of a catch-all string, keeping the slashes between them", () => {
    expect(fillParams("/docs/[...path]", { path: "a b/c?d" })).toBe(
      "/docs/a%20b/c%3Fd",
    );
  });

  it("takes the array Next passes for a catch-all", () => {
    expect(fillParams("/docs/[...path]", { path: ["guides", "setup"] })).toBe(
      "/docs/guides/setup",
    );
  });

  it("encodes each element of a catch-all array on its own", () => {
    /* A slash inside one element is part of that segment, not a separator. */
    expect(fillParams("/docs/[...path]", { path: ["a b", "c/d", "é"] })).toBe(
      "/docs/a%20b/c%2Fd/%C3%A9",
    );
  });

  it("fills an optional catch-all", () => {
    expect(fillParams("/docs/[[...path]]", { path: ["a", "b"] })).toBe(
      "/docs/a/b",
    );
  });

  it("drops an optional catch-all with no value, and the slash before it", () => {
    /* "/docs/" 308s to "/docs"; "/docs//edit" is not a page. */
    expect(fillParams("/docs/[[...path]]")).toBe("/docs");
    expect(fillParams("/docs/[[...path]]", { path: [] })).toBe("/docs");
    expect(fillParams("/docs/[[...path]]/edit", { path: "" })).toBe(
      "/docs/edit",
    );
    expect(fillParams("/[[...path]]")).toBe("");
  });

  it("throws on a segment with no value, rather than emitting [slug] as a URL", () => {
    /* "/blog/[slug]" exists in no locale. next-intl's getPathname throws here
       too. */
    expect(() => fillParams("/blog/[slug]")).toThrow(
      'no value for "slug" in pathname "/blog/[slug]"',
    );
    expect(() => fillParams("/blog/[slug]", { slug: "" })).toThrow(/"slug"/);
  });

  it("throws on a required catch-all with no value", () => {
    expect(() => fillParams("/docs/[...path]", { path: [] })).toThrow(
      'no value for "path" in pathname "/docs/[...path]"',
    );
  });

  it("refuses an array for a segment that is not a catch-all", () => {
    expect(() => fillParams("/blog/[slug]", { slug: ["a", "b"] })).toThrow(
      /not a catch-all/,
    );
  });
});
