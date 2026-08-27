"use client";

import { useMemo, useState } from "react";
import { createAlternates } from "@/index";
import type { LocalePrefixMode } from "@/types";

const LOCALES = ["en", "ja", "de"] as const;

const PATHNAMES = {
  "/about": { de: "/ueber-uns", en: "/about", ja: "/kaisha" },
} as const;

const MODES: LocalePrefixMode[] = ["as-needed", "always", "never"];

type Field = {
  children: React.ReactNode;
  label: string;
};

function Field({ children, label }: Field) {
  return (
    <div>
      <span className="font-mono text-[11px] tracking-wide text-indigo-300/70 uppercase">
        {label}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Toggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-lg px-3 py-1.5 font-mono text-sm transition-colors ${
        active
          ? "bg-indigo-500 text-white"
          : "border border-white/10 text-zinc-400 hover:text-zinc-200"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

/**
 * The controls on the left are the routing configuration; the head on the right
 * is what this package returns for it. It is the real function running in the
 * browser, not a table of prepared answers.
 */
export default function Inspector() {
  const [defaultLocale, setDefaultLocale] = useState<string>("en");
  const [mode, setMode] = useState<LocalePrefixMode>("as-needed");
  const [available, setAvailable] = useState<string[]>([...LOCALES]);
  const [pathname, setPathname] = useState("/about");
  const [localized, setLocalized] = useState(false);
  const [trailingSlash, setTrailingSlash] = useState(false);
  const locale = available[0] ?? defaultLocale;

  const alternates = useMemo(() => {
    const build = createAlternates({
      baseUrl: "https://example.com",
      defaultLocale,
      locales: LOCALES,
      localePrefix: mode,
      pathnames: localized ? PATHNAMES : undefined,
      trailingSlash,
    });

    return build({ availableLocales: available, locale, pathname });
  }, [
    available,
    defaultLocale,
    localized,
    locale,
    mode,
    pathname,
    trailingSlash,
  ]);

  const notes = useMemo(() => {
    const lines: string[] = [];

    if (mode === "never") {
      lines.push(
        "Nothing is prefixed, so every locale shares one URL. Lines that all point at the same page are not an annotation, so only the canonical is emitted.",
      );
    }

    if (available.length > 0 && !available.includes(defaultLocale)) {
      lines.push(
        `This page does not exist in ${defaultLocale}, so x-default points at ${available[0]} — the version a reader you do not publish for should land on.`,
      );
    }

    if (mode === "as-needed") {
      lines.push(
        `${defaultLocale} carries no prefix, so its canonical is the bare path. A canonical that redirects points at a page that is not there.`,
      );
    }

    if (localized) {
      lines.push(
        "Each line points at that locale's own pathname, not the route it was declared under.",
      );
    }

    return lines;
  }, [available, defaultLocale, localized, mode]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1120] p-5">
        <Field label="locales">
          {LOCALES.map((candidate) => (
            <span className="font-mono text-sm text-zinc-500" key={candidate}>
              {candidate}
            </span>
          ))}
        </Field>

        <Field label="defaultLocale">
          {LOCALES.map((candidate) => (
            <Toggle
              active={defaultLocale === candidate}
              key={candidate}
              onClick={() => setDefaultLocale(candidate)}
            >
              {candidate}
            </Toggle>
          ))}
        </Field>

        <Field label="localePrefix">
          {MODES.map((candidate) => (
            <Toggle
              active={mode === candidate}
              key={candidate}
              onClick={() => setMode(candidate)}
            >
              {candidate}
            </Toggle>
          ))}
        </Field>

        <Field label="this page exists in">
          {LOCALES.map((candidate) => (
            <Toggle
              active={available.includes(candidate)}
              key={candidate}
              onClick={() =>
                setAvailable((current) =>
                  current.includes(candidate)
                    ? current.filter((entry) => entry !== candidate)
                    : LOCALES.filter(
                        (entry) =>
                          entry === candidate || current.includes(entry),
                      ),
                )
              }
            >
              {candidate}
            </Toggle>
          ))}
        </Field>

        <Field label="pathname">
          <input
            aria-label="pathname"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-zinc-200 outline-none focus:border-indigo-500"
            onChange={(event) => setPathname(event.target.value)}
            spellCheck={false}
            value={pathname}
          />
        </Field>

        <Field label="options">
          <Toggle
            active={localized}
            onClick={() => setLocalized((current) => !current)}
          >
            localized pathnames
          </Toggle>
          <Toggle
            active={trailingSlash}
            onClick={() => setTrailingSlash((current) => !current)}
          >
            trailingSlash
          </Toggle>
        </Field>
      </div>

      <div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1120] p-5 font-mono text-[13px] leading-relaxed">
          <p className="mb-3 text-[11px] tracking-wide text-indigo-300/70 uppercase">
            what Next puts in the head
          </p>
          {available.length === 0 ? (
            <p className="text-zinc-500">
              A page that exists in no language has nothing to annotate.
            </p>
          ) : null}
          <p className="break-all text-zinc-300">
            &lt;link rel=&quot;canonical&quot; href=&quot;
            <span className="text-indigo-300">{alternates.canonical}</span>
            &quot; /&gt;
          </p>
          {Object.entries(alternates.languages ?? {}).map(([tag, href]) => (
            <p className="break-all text-zinc-300" key={tag}>
              &lt;link rel=&quot;alternate&quot; hreflang=&quot;
              <span
                className={
                  tag === "x-default" ? "text-amber-300" : "text-emerald-300"
                }
              >
                {tag}
              </span>
              &quot; href=&quot;
              <span className="text-indigo-300">{href}</span>
              &quot; /&gt;
            </p>
          ))}
        </div>

        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          {notes.map((note) => (
            <li className="flex gap-2" key={note}>
              <span className="text-indigo-400">—</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
