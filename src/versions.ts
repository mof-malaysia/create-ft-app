/**
 * Version resolution. "tested" uses catalog.json as committed; "latest" asks
 * the npm registry, nodejs.org and GitHub, and falls back to the tested
 * version for anything it can't reach.
 */
import catalog from "../catalog.json" with { type: "json" };
import type { VersionMode } from "./options.ts";

/** Versions the templates need before rendering. */
export type Toolchain = {
  node: string;
  pnpm: string;
  ftds: string;
  shadcn: string;
};
/** npm package name → range, for the pnpm catalog. */
export type Packages = Record<string, string>;
/** A resolved value plus the lookups that fell back to the tested version. */
export type Resolved<T> = { value: T; fallbacks: string[] };

const {
  $comment: _,
  postgres,
  packages: testedPackages,
  ...testedToolchain
} = catalog;
const tested: Toolchain = testedToolchain;

/** Docker image tags move on their own schedule; always the tested major. */
export const POSTGRES_VERSION = postgres;

/** "12.16.1" → "12", "v26.1.0" → "26". */
export const major = (version: string) =>
  version.replace(/^v/, "").split(".")[0]!;

const TIMEOUT = 10_000;

async function getJson<T>(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    headers: { accept: "application/json", ...headers },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}

const npmLatest = (name: string) =>
  getJson<{ version: string }>(
    `https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`,
  ).then((p) => p.version);

/** Newest LTS major, e.g. "26". */
const nodeLts = () =>
  getJson<{ version: string; lts: string | false }[]>(
    "https://nodejs.org/dist/index.json",
  ).then((releases) => {
    const lts = releases.find((r) => r.lts);
    if (!lts) throw new Error("no LTS release listed");
    return major(lts.version);
  });

const ftdsLatest = () =>
  getJson<{ name: string }[]>(
    "https://api.github.com/repos/mof-malaysia/ftds/tags?per_page=20",
    process.env.GITHUB_TOKEN
      ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {},
  ).then((tags) => {
    const tag = tags.find((t) => /^v\d+\.\d+\.\d+$/.test(t.name));
    if (!tag) throw new Error("no release tag");
    return tag.name;
  });

function fallbackTo(fallbacks: string[]) {
  return async <T>(label: string, run: () => Promise<T>, fallback: T) => {
    try {
      return await run();
    } catch {
      fallbacks.push(label);
      return fallback;
    }
  };
}

export async function resolveToolchain(
  mode: VersionMode,
): Promise<Resolved<Toolchain>> {
  if (mode === "tested") return { value: tested, fallbacks: [] };
  const fallbacks: string[] = [];
  const attempt = fallbackTo(fallbacks);
  const [node, pnpm, shadcn, ftds] = await Promise.all([
    attempt("node", nodeLts, tested.node),
    attempt("pnpm", () => npmLatest("pnpm"), tested.pnpm),
    attempt("shadcn", () => npmLatest("shadcn"), tested.shadcn),
    attempt("ftds", ftdsLatest, tested.ftds),
  ]);
  return { value: { node, pnpm, shadcn, ftds }, fallbacks };
}

export async function resolvePackages(
  mode: VersionMode,
  names: string[],
  nodeMajor: string,
): Promise<Resolved<Packages>> {
  const known: Packages = testedPackages;
  const missing = names.filter((n) => !(n in known));
  if (missing.length)
    throw new Error(`catalog.json has no version for: ${missing.join(", ")}`);
  if (mode === "tested")
    return {
      value: Object.fromEntries(names.map((n) => [n, known[n]!])),
      fallbacks: [],
    };

  const fallbacks: string[] = [];
  const attempt = fallbackTo(fallbacks);
  const entries = await Promise.all(
    names.map(async (name) => {
      // @types/node follows the Node major, not the newest types release.
      if (name === "@types/node") return [name, `^${nodeMajor}`] as const;
      const version = await attempt(name, () => npmLatest(name), null);
      return [name, version ? `^${version}` : known[name]!] as const;
    }),
  );
  return { value: Object.fromEntries(entries), fallbacks };
}
