# Working on {{name}}

A Turborepo monorepo scaffolded by create-ft-app {{cliVersion}} with: {{parts}}. This file is what you need to change it safely.

## Run it

Node {{nodeMajor}} or later (see `.nvmrc`) and pnpm {{pnpmVersion}} (`packageManager` in `package.json`). From the repo root:

```sh
pnpm install
<!-- @if postgres -->
docker compose up -d db          # Postgres on :5432 for the api
<!-- @endif -->
pnpm dev                         # every app in watch mode
pnpm build                       # every package, into git-ignored dist/ folders
```

<!-- @if fullstack -->
- `pnpm dev` runs the api on :3000 and the web app on :3001. The web dev server proxies `/v1`, `/healthz`, `/docs` and `/openapi.json` to the api, so the browser sees one origin, as it does in the Docker image.
<!-- @elif api -->
- `pnpm dev` runs the api on :3000.
<!-- @elif web -->
- `pnpm dev` runs the web app on :3000.
<!-- @endif -->
<!-- @if api -->
- **Settings are environment variables**, validated at boot in `apps/api/src/env.ts`; the api refuses to start with a clear message when one is wrong. Local values go in `apps/api/.env` (git-ignored; `.env.example` lists them all).
- **Ready check:** `GET /healthz` returns `{"ok":true}`. API docs (Scalar) are at `/docs`, the OpenAPI document at `/openapi.json`.
<!-- @endif -->
- Run one package with a filter, e.g. `pnpm --filter {{scope}}/api dev`.

## Where things live

| Path | What |
| --- | --- |
<!-- @if web -->
| `apps/web` | React SPA: Rsbuild, TanStack Router (code-based routes in `src/router.tsx`) and TanStack Query, FTDS components |
| `apps/web/src/i18n/messages/en.ts` | Every user-facing string, read with `t()` |
<!-- @endif -->
<!-- @if api -->
| `apps/api` | Fastify api: `src/app.ts` builds the app, `src/routes/` has one module per resource, `src/errors.ts` the error shape |
<!-- @endif -->
<!-- @if postgres -->
| `apps/api/src/db/` | Kysely database, table types (`schema.ts`) and migrations (`migrations.ts`), run on boot |
<!-- @endif -->
<!-- @if contracts -->
| `packages/contracts` | Valibot schemas and types shared by web and api: the wire contract |
<!-- @endif -->
<!-- @if tsconfig -->
| `packages/typescript-config` | tsconfig presets: `base`, `node`, `library`, `react` |
<!-- @endif -->
<!-- @if oxlint -->
| `packages/oxlint-config` | Oxlint presets: `base`, `node`, `react` |
<!-- @endif -->
| `pnpm-workspace.yaml` | Workspace packages and the **catalog**: the one place third-party versions live |

## Rules that aren't obvious from the code

- **Versions live in the catalog.** Add a dependency to `catalog:` in `pnpm-workspace.yaml` and write `"<name>": "catalog:"` in the package.json. Don't put version ranges in package.json files. Renovate keeps the catalog current.
- **Workspace packages are `{{scope}}/<name>`** and referenced as `"workspace:*"`.
<!-- @if contracts -->
- **Contract changes go everywhere at once:** the schema in `packages/contracts`, the api route that uses it, and the web code that reads it. The api turns the same Valibot schemas into its OpenAPI document.
<!-- @endif -->
<!-- @if api -->
- **Errors have one shape:** `{ "error": { "code": "snake_case", "message": "…" } }`; successful responses wrap their payload in `{ "data": … }`. Throw `new HttpError(status, code, message)` from `src/errors.ts`.
- **Routes declare Valibot schemas** (`schema: { querystring: HelloQuery }`). Fastify validates with Valibot (`src/validation.ts`), and the same schemas become the OpenAPI document.
<!-- @endif -->
<!-- @if postgres -->
- **Migrations are append-only.** Add a new entry to `src/db/migrations.ts` (keys sort by name, so keep the numeric prefix), never edit one that has shipped, and mirror the change in `src/db/schema.ts`.
<!-- @endif -->
<!-- @if web -->
- **The UI is built on [FTDS](https://mof-malaysia.github.io/ftds/llms.txt)** (Base UI, Tailwind v4), pinned to {{ftdsVersion}} in `apps/web/components.json`. Add a component with `pnpm dlx shadcn@latest add @ftds/<name>` from `apps/web`. Use FTDS before writing your own; build anything missing from FTDS tokens (`bg-bg-*`, `text-txt-*`, `border-otl-*`), never raw Tailwind colours or `dark:` overrides. Files under `src/components/ui`, `src/components/blocks`, `src/lib/ftds` and `styles/ftds.css` stay as the registry ships them (oxfmt and Oxlint skip them) so upgrades diff cleanly.
- **UI text goes through `t()`** with a key in `src/i18n/messages/en.ts`; the type checker rejects missing keys.
<!-- @endif -->
- **Never commit** `.env` files (only `.env.example`) or `.claude/`. Stage paths explicitly rather than `git add -A`.

## Before calling a change done

```sh
pnpm format
pnpm verify                      # lint, check-types, test, build
```

<!-- @if web -->
For UI changes, also look at the result in a browser (`pnpm dev`).
<!-- @endif -->
<!-- @if docker -->
For anything that changes how the app is built or started, also run `docker build .`.
<!-- @endif -->
