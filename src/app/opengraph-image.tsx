import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { createAlternates } from "@/index";

export const alt = "next-intl-alternates";

export const size = { height: 630, width: 1200 };

export const contentType = "image/png";

const TITLE = "hreflang that";
const TITLE_SECOND = "survives review.";

export default async function Image() {
  /* The same Space Grotesk the site uses for headings, cut down to Latin.
     Change the copy and rebuild it per assets/README.md. */
  const font = await readFile(
    join(process.cwd(), "assets/SpaceGrotesk-700-subset.ttf"),
  );
  /* The card shows real output: an article that exists in Japanese only, which
     is the case the annotation is most often wrong for. */
  const { canonical, languages } = createAlternates({
    baseUrl: "https://example.com",
    defaultLocale: "en",
    locales: ["en", "ja"],
  })({
    availableLocales: ["ja"],
    locale: "ja",
    pathname: "/blog/[slug]",
    params: { slug: "hello" },
  });
  const lines = [
    { href: canonical, tag: "canonical", tone: "#a5b4fc" },
    ...Object.entries(languages ?? {}).map(([tag, href]) => ({
      href,
      tag,
      tone: tag === "x-default" ? "#fbbf24" : "#34d399",
    })),
  ];

  return new ImageResponse(
    <div
      style={{
        background: "#0a0d16",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "0 80px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#818cf8",
          display: "flex",
          fontSize: 26,
          letterSpacing: 4,
        }}
      >
        NEXT-INTL-ALTERNATES
      </div>
      <div style={{ display: "flex", fontSize: 68, marginTop: 24 }}>
        {TITLE}
      </div>
      <div style={{ color: "#a1a1aa", display: "flex", fontSize: 68 }}>
        {TITLE_SECOND}
      </div>

      <div
        style={{
          background: "#0d1120",
          border: "1px solid #1e213a",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 46,
          padding: "28px 32px",
        }}
      >
        {lines.map((line) => (
          <div
            key={line.tag}
            style={{ display: "flex", fontSize: 21, whiteSpace: "pre" }}
          >
            <span style={{ color: "#52525b" }}>&lt;link </span>
            <span style={{ color: line.tone }}>{line.tag}</span>
            <span style={{ color: "#52525b" }}> </span>
            <span style={{ color: "#d4d4d8" }}>{line.href}</span>
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { data: font, name: "Space Grotesk", style: "normal", weight: 700 },
      ],
    },
  );
}
