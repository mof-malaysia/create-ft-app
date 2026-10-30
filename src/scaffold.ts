/** Turns options into files on disk. No prompts, no child processes. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { flagsFor, type Flags, type Options, type Part } from "./options.ts";
import { renderDir, renderFile, type RenderedFile } from "./render.ts";
import { POSTGRES_VERSION, type Packages, type Toolchain } from "./versions.ts";

/** The templates folder (one subfolder per stack), next to dist/ and src/. */
const TEMPLATES = fileURLToPath(new URL("../templates", import.meta.url));

/** Where each part's template lives, and where it lands in the project. */
const ROOTS: Record<Part, string> = {
  web: "apps/web",
  api: "apps/api",
  contracts: "packages/contracts",
  "oxlint-config": "packages/oxlint-config",
  "typescript-config": "packages/typescript-config",
};

function templateVars(o: Options, t: Toolchain, cliVersion: string) {
  return {
    name: o.name,
    scope: o.scope,
    title: o.name
      .split(/[-_.]/)
      .filter(Boolean)
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(" "),
    nodeMajor: t.node,
    pnpmVersion: t.pnpm,
    ftdsVersion: t.ftds,
    postgresVersion: POSTGRES_VERSION,
    cliVersion,
    parts: o.parts.join(", "),
  };
}

/**
 * Renders every chosen part into memory. Returns the files and the npm
 * packages they take from the catalog; fill it in with fillCatalog().
 */
export function renderProject(
  o: Options,
  t: Toolchain,
  cliVersion: string,
): { files: RenderedFile[]; catalog: string[] } {
  const flags = flagsFor(o);
  const vars = templateVars(o, t, cliVersion);
  const root = join(TEMPLATES, o.stack);
  const files = renderDir(join(root, "base"), "", flags, vars);
  for (const part of o.parts)
    files.push(...renderDir(join(root, ROOTS[part]), ROOTS[part], flags, vars));

  // Without the contracts package, the api keeps the same schemas locally.
  if (flags.api && !flags.contracts) {
    const contract = renderFile(
      join(root, "packages/contracts/src/index.ts"),
      "apps/api/src/contract.ts",
      flags,
      vars,
    );
    if (contract) files.push(contract);
  }

  inlinePresets(files, root, o.scope, flags);

  // Validate every package.json and collect the "catalog:" dependencies.
  const used = new Set<string>();
  for (const file of files) {
    if (basename(file.path) !== "package.json") continue;
    const pkg = parseJsonc(file);
    for (const field of ["dependencies", "devDependencies", "peerDependencies"])
      for (const [name, range] of Object.entries(pkg[field] ?? {}))
        if (range === "catalog:") used.add(name);
    file.content = `${JSON.stringify(pkg, null, 2)}\n`;
  }

  return { files, catalog: [...used].sort() };
}

/** Writes the resolved versions into pnpm-workspace.yaml's catalog. */
export function fillCatalog(files: RenderedFile[], packages: Packages) {
  const workspace = files.find((f) => f.path === "pnpm-workspace.yaml");
  if (!workspace?.content.includes("  __CATALOG__"))
    throw new Error("pnpm-workspace.yaml template has no __CATALOG__ line");
  const lines = Object.entries(packages)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([name, range]) => `  ${JSON.stringify(name)}: ${JSON.stringify(range)}`,
    );
  workspace.content = workspace.content.replace(
    "  __CATALOG__",
    lines.join("\n"),
  );
}

export function writeProject(dir: string, files: RenderedFile[]) {
  for (const file of files) {
    const to = join(dir, file.path);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, file.content);
  }
}

/**
 * Package configs always extend the shared presets. When the preset package
 * isn't part of the project, the preset is merged into the config instead,
 * so there is one source for every setting either way.
 */
const PRESETS = [
  { file: "tsconfig.json", flag: "tsconfig", dir: "typescript-config" },
  { file: ".oxlintrc.json", flag: "oxlint", dir: "oxlint-config" },
] as const;

function inlinePresets(
  files: RenderedFile[],
  root: string,
  scope: string,
  flags: Flags,
) {
  for (const preset of PRESETS) {
    if (flags[preset.flag]) continue;
    const prefix = `${scope}/${preset.dir}/`;
    for (const file of files) {
      if (basename(file.path) !== preset.file) continue;
      const config = parseJsonc(file);
      const refs = [config.extends]
        .flat()
        .filter((ref): ref is string => typeof ref === "string");
      const ref = refs.find((r) => r.includes(prefix));
      if (!ref) continue;
      const presetFile = join(
        root,
        "packages",
        preset.dir,
        ref.slice(ref.indexOf(prefix) + prefix.length),
      );
      const { extends: _, ...own } = config;
      file.content = `${JSON.stringify(merge(loadPreset(presetFile), own), null, 2)}\n`;
    }
  }
}

/** A preset with its own relative `extends` chain already merged in. */
function loadPreset(path: string): Json {
  const { extends: parent, ...own } = parseJsonc({
    path,
    content: readFileSync(path, "utf8"),
  });
  const parents = [parent]
    .flat()
    .filter((p): p is string => typeof p === "string");
  const inherited = parents.reduce<Json>(
    (acc, p) => merge(acc, loadPreset(join(dirname(path), p))),
    {},
  );
  return merge(inherited, own);
}

type Json = Record<string, any>;

/** Objects merge key by key; anything else from `over` replaces `base`. */
function merge(base: Json, over: Json): Json {
  const out: Json = { ...base };
  for (const [key, value] of Object.entries(over))
    out[key] =
      isObject(value) && isObject(out[key]) ? merge(out[key], value) : value;
  return out;
}

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** JSON with whole-line `//` comments and trailing commas, as templates write it. */
function parseJsonc(file: RenderedFile): Json {
  const text = file.content
    .split("\n")
    .filter((line) => !/^\s*\/\//.test(line))
    .join("\n")
    .replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Template produced invalid JSON in ${file.path}: ${error}`);
  }
}
