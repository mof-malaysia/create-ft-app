/** Everything the scaffold needs to know, gathered from flags and prompts. */

export const PARTS = ["web", "api", "contracts", "oxlint-config", "typescript-config"] as const;
export type Part = (typeof PARTS)[number];

export const PART_HINTS: Record<Part, string> = {
  web: "React SPA: Rsbuild, TanStack Router + Query, FTDS",
  api: "Fastify API: Valibot, OpenAPI + Scalar, Pino",
  contracts: "Valibot schemas shared by web and api",
  "oxlint-config": "shared Oxlint presets (otherwise inlined per package)",
  "typescript-config": "shared tsconfig presets (otherwise inlined per package)",
};

export const STACKS = ["node", "go"] as const;
export type Stack = (typeof STACKS)[number];
/** Stacks with templates. Go is planned: the flag exists so scripts can pass it. */
export const AVAILABLE_STACKS: Stack[] = ["node"];

export const DATABASES = ["postgres", "none"] as const;
export type Database = (typeof DATABASES)[number];

export const VERSION_MODES = ["tested", "latest"] as const;
export type VersionMode = (typeof VERSION_MODES)[number];

/** Defaults for anything not passed as a flag (and shown in --help). */
export const DEFAULTS = {
  stack: "node",
  scope: "@repo",
  database: "postgres",
  versions: "tested",
} as const satisfies {
  stack: Stack;
  scope: string;
  database: Database;
  versions: VersionMode;
};

export type Options = {
  stack: Stack;
  name: string;
  /** Absolute path of the new project. */
  dir: string;
  /** npm scope for workspace packages, e.g. "@repo". */
  scope: string;
  parts: Part[];
  database: Database;
  docker: boolean;
  ci: boolean;
  git: boolean;
  install: boolean;
  versions: VersionMode;
};

/** Template conditions: `@if <flag>` in files and `+<flag>` overlay folders. */
export type Flags = Record<string, boolean>;

export function flagsFor(o: Options): Flags {
  const has = (p: Part) => o.parts.includes(p);
  const api = has("api");
  const web = has("web");
  return {
    web,
    api,
    contracts: has("contracts"),
    oxlint: has("oxlint-config"),
    tsconfig: has("typescript-config"),
    postgres: api && o.database === "postgres",
    fullstack: web && api,
    docker: o.docker && (web || api),
    ci: o.ci,
    git: o.git,
  };
}

const NAME = /^[a-z0-9][a-z0-9._-]*$/;

export function validateName(name: string | undefined): string | undefined {
  if (!name) return "Enter a project name";
  if (!NAME.test(name))
    return "Use lowercase letters, numbers, dots, dashes or underscores (a valid npm package name)";
  if (name.length > 214) return "Keep the name under 214 characters";
  return undefined;
}

export function validateScope(scope: string): string | undefined {
  return /^@[a-z0-9][a-z0-9._-]*$/.test(scope) ? undefined : 'The scope must look like "@repo"';
}
