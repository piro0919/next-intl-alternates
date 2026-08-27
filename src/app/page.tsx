import Inspector from "./_components/inspector";

const USAGE = `// src/libs/alternates.ts
import { createAlternates } from "next-intl-alternates";
import { routing } from "@/i18n/routing";

export const getAlternates = createAlternates({
  baseUrl: "https://example.com",
  ...routing,
});`;

const PAGE = `// src/app/[locale]/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);

  return {
    alternates: getAlternates({
      locale,
      pathname: "/blog/[slug]",
      params: { slug },
      // this article was only ever written in Japanese
      availableLocales: article.locales,
    }),
  };
}`;

const TRAPS = [
  {
    body: 'With as-needed prefixes the default locale has no prefix, and its home page is the origin. Join a locale prefix to a path of "/" and you get "/ja/", which redirects to "/ja" with a 308. A canonical URL that redirects points at a page that is not there.',
    title: "The home page that redirects",
  },
  {
    body: "An article written in one language only has one version. Listing a language the page does not have makes search engines drop the annotation — all of it, not just that line.",
    title: "The language the page does not have",
  },
  {
    body: "x-default is for a reader whose language you do not publish in. It belongs on the default locale, except on a page the default locale does not have, where it belongs on the version that exists.",
    title: "x-default with nowhere to point",
  },
  {
    body: "With localized pathnames, /about is /kaisha in Japanese. Every line has to point at that locale's own pathname, or the annotation names URLs that 404.",
    title: "The pathname that is not the route",
  },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d1120] p-5 font-mono text-[13px] leading-relaxed text-zinc-300">
      <code>{children}</code>
    </pre>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-zinc-200">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.2em] text-indigo-300/80 uppercase">
            npm i next-intl-alternates
          </p>
          <h1 className="font-display mt-4 text-4xl leading-tight font-bold text-white sm:text-5xl">
            hreflang that survives review.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Canonical and alternate URLs for a next-intl site. Four lines of
            configuration produce a set of links that is easy to get subtly
            wrong, and wrong here fails quietly: the annotation is dropped, and
            nothing tells you.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="font-display mb-6 text-xl font-bold text-white">
            Turn the configuration and watch the head change
          </h2>
          <Inspector />
        </section>

        <section className="mt-16 max-w-2xl">
          <h2 className="font-display text-xl font-bold text-white">
            Configure it once
          </h2>
          <p className="mt-3 mb-6 text-zinc-400">
            It takes next-intl&apos;s routing object as it is — locales, default
            locale, prefixes, localized pathnames — plus the origin, which
            next-intl has no reason to know.
          </p>
          <Code>{USAGE}</Code>
          <div className="mt-6">
            <Code>{PAGE}</Code>
          </div>
          <p className="mt-6 text-zinc-400">
            The result drops straight into{" "}
            <code className="font-mono text-indigo-300">
              Metadata[&quot;alternates&quot;]
            </code>
            . Nothing else about your metadata changes.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-white">
            What it is careful about
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {TRAPS.map((trap) => (
              <div
                className="rounded-2xl border border-white/10 bg-[#0d1120] p-5"
                key={trap.title}
              >
                <h3 className="font-display text-base font-bold text-indigo-200">
                  {trap.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {trap.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-8 font-mono text-sm text-zinc-500">
          <a
            className="hover:text-indigo-300"
            href="https://www.npmjs.com/package/next-intl-alternates"
          >
            npm
          </a>
          <a
            className="hover:text-indigo-300"
            href="https://github.com/piro0919/next-intl-alternates"
          >
            GitHub
          </a>
          <a className="hover:text-indigo-300" href="https://kkweb.io/">
            kkweb.io
          </a>
          <span className="ml-auto">MIT</span>
        </footer>
      </div>
    </div>
  );
}
