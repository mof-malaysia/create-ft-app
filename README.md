# create-ft-app

Scaffolds a Turborepo monorepo with the team's Node and SPA stack. It asks a few questions, writes the project, installs it, adds FTDS components, formats it, builds it and makes the first commit.

```sh
pnpm dlx github:mof-malaysia/create-ft-app#semver:^0
```

`#semver:^0` runs the newest `v0.x.x` release tag. Pin an exact tag (`#v0.1.0`) for a repeatable run.

## What you get

| Part                | What                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `web`               | React 19 SPA: Rsbuild, TanStack Router + Query, ky, Tailwind v4, FTDS, typed `t()` messages     |
| `api`               | Fastify 5: Valibot validation, OpenAPI + Scalar at `/docs`, Pino, one error shape, `/healthz`   |
| `contracts`         | Valibot schemas shared by web and api; the api builds its OpenAPI document from them            |
| `oxlint-config`     | Oxlint presets `base`, `node`, `react` (left out: each package inlines its config)              |
| `typescript-config` | tsconfig presets `base`, `node`, `library`, `react` (left out: each package inlines its config) |

Always included: pnpm catalogs (one version per dependency), Turborepo tasks, oxfmt, Rstest, `.nvmrc`, Renovate, VS Code settings, `AGENTS.md`/`CLAUDE.md` written for the parts you chose.

Optional: Postgres for the api (Kysely + pg, migrations on boot, `docker-compose.yml` for local dev), a Dockerfile (api + SPA in one image, or nginx for a SPA alone), git with a first commit and a pre-commit hook (lefthook) that formats with oxfmt and runs lint, type checks and tests, and the [fiscal-cr](https://github.com/mof-malaysia/fiscal-cr) code review workflow for pull requests (opt-in). Generated projects have no CI workflow: the pre-commit hook is the gate.

Workspace packages are named after the project: `my-app` gets `@my-app/web`, `@my-app/api` and so on.

## Options

```text
create-ft-app [dir] [options]

  --stack <node|go>      Template stack (default: node; go is planned)
  --name <name>          Project name (defaults to the folder name)
  --include <parts>      Comma-separated: web, api, contracts, oxlint-config, typescript-config
  --db <postgres|none>   Database for the api (default: postgres)
  --scope <@scope>       npm scope for workspace packages (default: @<name>)
  --versions <mode>      tested (default) or latest
  --latest               Same as --versions latest
  --[no-]docker          Dockerfile (default: on)
  --[no-]code-review     fiscal-cr code review on pull requests (default: off)
  --[no-]git             git init, pre-commit checks and a first commit (default: on)
  --[no-]install         Install, add FTDS, format and verify (default: on)
  -y, --yes              Accept defaults for anything not given as a flag
```

Anything you don't pass as a flag is asked for. With `-y`, or when stdin isn't a terminal (CI, agents), the defaults are used instead.

## Versions

- **Tested** (default) uses [`catalog.json`](catalog.json): the versions this release was verified with.
- **Latest** asks the npm registry for every package, nodejs.org for the newest LTS, and GitHub for the newest FTDS tag. It falls back to the tested version for anything it can't reach. The verify step then builds the project, so a broken combination shows up straight away.

Either way the project gets a pnpm catalog and a Renovate config, so it keeps up after day one.

**pnpm:** generated projects pin pnpm in `packageManager`. pnpm 10 can't switch itself to pnpm 11 or later, so if your pnpm has a different major, the CLI runs that version through `npx` and tells you how to upgrade (`npm install -g pnpm@12`).

## Developing the CLI

```sh
pnpm install
pnpm dev -- /tmp/try-it          # run from source
pnpm test                        # template engine + every part combination, in memory
pnpm test:scaffold               # real scaffolds with install and build (slow, needs network)
pnpm build                       # bundle to dist/index.mjs, which is committed
```

See [AGENTS.md](AGENTS.md) for how the templates work.

## Releasing

1. Bump `version` in `package.json` and run `pnpm build`.
2. Commit, including `dist/`.
3. Tag and push: `git tag v0.2.0 && git push --tags`. The release workflow checks the tag matches `package.json` and creates a GitHub release.

Use a major bump when the generated layout changes in a way that breaks existing projects or scripts that call the CLI with flags.
