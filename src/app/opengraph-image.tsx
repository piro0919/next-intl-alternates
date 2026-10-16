import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { createAlternates } from "@/index";

export const alt = "next-intl-alternates";

export const size = { height: 630, width: 1200 };

export const contentType = "image/png";

const TITLE = "next-intl-alternates";
const DESCRIPTION =
  "Builds canonical and hreflang metadata for a next-intl site.";

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

  /* Same layout as the other package cards on kkweb.io: name, one line and
     the domain on the left, what the package does on the right. */
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0b0b0f",
        color: "#ffffff",
        display: "flex",
        height: "100%",
        padding: "0 80px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 600,
        }}
      >
        <div style={{ display: "flex", fontSize: 54, letterSpacing: -1 }}>
          {TITLE}
        </div>
        <div
          style={{
            color: "#a1a1aa",
            display: "flex",
            fontSize: 30,
            lineHeight: 1.4,
            marginTop: 28,
          }}
        >
          {DESCRIPTION}
        </div>
        <div
          style={{
            color: "#71717a",
            display: "flex",
            fontSize: 26,
            marginTop: 48,
          }}
        >
          kkweb.io
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            background: "#15151c",
            border: "1px solid #26262f",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: "26px 28px",
          }}
        >
          {lines.map((line) => (
            <div
              key={line.tag}
              style={{ display: "flex", fontSize: 22, whiteSpace: "pre" }}
            >
              <span style={{ color: line.tone, display: "flex", width: 128 }}>
                {line.tag}
              </span>
              <span style={{ color: "#d4d4d8" }}>
                {new URL(line.href).pathname}
              </span>
            </div>
          ))}
        </div>
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
