import { parseArgs } from "node:util";
import {
  DATABASES,
  DEFAULTS,
  PARTS,
  STACKS,
  VERSION_MODES,
  type Database,
  type Part,
  type Stack,
  type VersionMode,
} from "./options.ts";

export const HELP = `create-ft-app [dir] [options]

Scaffold a Turborepo project with the team's Node and SPA stack.

Options
  --stack <${STACKS.join("|")}>      Template stack (default: ${DEFAULTS.stack}; go is planned)
  --name <name>          Project name (defaults to the folder name)
  --include <parts>      Comma-separated: ${PARTS.join(", ")}
  --db <${DATABASES.join("|")}>   Database for the api (default: ${DEFAULTS.database})
  --scope <@scope>       npm scope for workspace packages (default: ${DEFAULTS.scope})
  --versions <mode>      ${VERSION_MODES.join(" or ")} (default: ${DEFAULTS.versions})
  --latest               Same as --versions latest
  --[no-]docker          Dockerfile (default: on)
  --[no-]ci              GitHub Actions workflow (default: on)
  --[no-]git             git init, hooks and a first commit (default: on)
  --[no-]install         Install, add FTDS, format and verify (default: on)
  -y, --yes              Accept defaults for anything not given as a flag
  -h, --help             Show this help
  -v, --version          Show the CLI version

Examples
  pnpm dlx github:mof-malaysia/create-ft-app#semver:^0
  pnpm dlx github:mof-malaysia/create-ft-app my-app --include web,api,contracts -y
`;

export type Args = {
  dir?: string;
  stack: Stack;
  name?: string;
  include?: Part[];
  db?: Database;
  scope?: string;
  versions?: VersionMode;
  docker?: boolean;
  ci?: boolean;
  git?: boolean;
  install?: boolean;
  yes: boolean;
  help: boolean;
  version: boolean;
};

/** Checks a flag's value against its allowed list. */
function oneOf<T extends string>(
  flag: string,
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  if (value === undefined || allowed.includes(value as T)) return value as T | undefined;
  throw new Error(`--${flag} must be one of ${allowed.join(", ")}, got "${value}"`);
}

export function parse(argv: string[]): Args {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    allowNegative: true,
    options: {
      stack: { type: "string" },
      name: { type: "string" },
      include: { type: "string" },
      db: { type: "string" },
      scope: { type: "string" },
      versions: { type: "string" },
      latest: { type: "boolean" },
      docker: { type: "boolean" },
      ci: { type: "boolean" },
      git: { type: "boolean" },
      install: { type: "boolean" },
      yes: { type: "boolean", short: "y" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  if (positionals.length > 1) throw new Error(`Expected one folder, got: ${positionals.join(" ")}`);

  let include: Part[] | undefined;
  if (values.include !== undefined) {
    const given = values.include
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of given) oneOf("include", part, PARTS);
    include = PARTS.filter((p) => given.includes(p));
  }

  return {
    dir: positionals[0],
    stack: oneOf("stack", values.stack, STACKS) ?? DEFAULTS.stack,
    name: values.name,
    include,
    db: oneOf("db", values.db, DATABASES),
    scope: values.scope,
    versions: values.latest ? "latest" : oneOf("versions", values.versions, VERSION_MODES),
    docker: values.docker,
    ci: values.ci,
    git: values.git,
    install: values.install,
    yes: values.yes ?? false,
    help: values.help ?? false,
    version: values.version ?? false,
  };
}
