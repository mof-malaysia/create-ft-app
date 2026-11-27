# Working on create-ft-app

A CLI that scaffolds Turborepo projects. Teammates run it with `pnpm --config.dlx-cache-max-age=0 dlx github:mof-malaysia/create-ft-app#semver:^0`, so **the committed `dist/index.mjs` is what runs**: there is no build step on their machine.

## Layout

| Path                                     | What                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/index.ts`                           | Entry: prompts, then scaffold, then the post-steps (git, install, FTDS, format, verify) |
| `src/args.ts`, `options.ts`              | Flags, the `Options` type, and `flagsFor()` (the template conditions)                   |
| `src/render.ts`                          | The template engine (`@if` blocks, `+flag` overlay folders, `{{vars}}`, `_dotfiles`)    |
| `src/scaffold.ts`                        | Renders the chosen parts once, inlines presets, fills the pnpm catalog                  |
| `src/versions.ts`                        | Tested vs latest version resolution                                                     |
| `src/ftds.ts`                            | Downloads FTDS's agent skills from its registry, for `--ftds-skills`                    |
| `catalog.json`                           | The tested version set                                                                  |
| `templates/<stack>/base`                 | Root files of every project                                                             |
| `templates/<stack>/apps/*`, `packages/*` | One folder per part                                                                     |
| `test/*.test.ts`                         | Fast tests: the engine, and every part combination rendered in memory                   |
| `test/scaffold.e2e.ts`                   | Slow tests: real scaffolds with install and build                                       |

## Template rules

- `// @if <expr>` … `// @elif <expr>` … `// @else` … `// @endif` on their own lines (also `#`, `<!-- -->`, `{/* */}`). Flags come from `flagsFor()`: `web`, `api`, `contracts`, `oxlint`, `tsconfig`, `postgres`, `fullstack`, `docker`, `codeReview`, `git`, `ftdsSkills`. An unknown flag is an error.
- A folder named `+<expr>` merges into its parent when true. A file that renders empty is skipped.
- A leading `_` becomes `.` (`_gitignore`), because packing drops some dotfiles.
- JSON templates may end up with trailing commas when an `@if` drops the last entry; the scaffold strips them. Third-party dependencies are always `"catalog:"`, and every name must exist in `catalog.json` (`pnpm test` checks).
- Package `tsconfig.json` and `.oxlintrc.json` files always extend the presets in `packages/typescript-config` and `packages/oxlint-config`. When that package isn't chosen, `scaffold.ts` merges the preset into the file instead, so each setting has one source.
- Without `contracts`, the api's `src/contract.ts` is rendered from `packages/contracts/src/index.ts`: one copy of the schemas.
- Templates must type-check and lint as generated: `pnpm test:scaffold` builds them.

## Adding a stack

`--stack go` is accepted but not available yet. To add it: create `templates/go/`, add `"go"` to `AVAILABLE_STACKS` in `src/options.ts`, and give it its own parts and post-steps where they differ from Node's.

## Before calling a change done

There is no CI. The git hooks in `lefthook.yml` (installed by `pnpm install`) are the gate; don't skip them with `--no-verify`. They run the same scripts you can run by hand:

```sh
pnpm check     # pre-commit (after oxfmt on staged files): check-types and build, then adds dist/ to the commit
pnpm verify    # pre-push: test and test:scaffold, on the built bundle
```

Both go through Turborepo, which replays any task whose inputs in `turbo.json` haven't changed. When a task starts reading a new file, add it there.

Faster loops while working:

```sh
pnpm exec tsx --test test/render.test.ts       # one test file
pnpm format                                    # oxfmt (templates/ is skipped: they only parse once rendered)
CLI=src/index.ts KEEP=1 pnpm test:scaffold     # the e2e scaffolds from source, keeping the output folders
```

### Verifying a template change

The in-memory tests only prove a template renders. To prove it works, scaffold a real project from source into a temp folder and let the CLI run its own post-steps (install, FTDS, format, `pnpm verify`):

```sh
dir=$(mktemp -d)/demo-app
pnpm dev "$dir" -y --include web,api,contracts --no-git   # pick the parts your change touches
cd "$dir" && pnpm check                                       # the generated project's own gate
```

Check that the generated `AGENTS.md`, `CLAUDE.md` and `.claude/launch.json` read correctly for the parts you chose. For a change to the web or api templates, also start the scaffolded project's dev server (`pnpm dev`, or its `.claude/launch.json`) and look at it: light and dark mode, phone width, keyboard only. Delete the temp folder when you're done.

For a change to `.claude/launch.json` or a dev port, start the config the way Claude Code does: open the scaffolded project in Claude Code and run `preview_start` with the config's name (or run its `runtimeExecutable` and `runtimeArgs` in the project root), then check the server answers on the config's `port`, with that port already taken too: the dev server should fail, not move to another port the preview won't find.

#### api and Postgres changes

For a change to the api, the database code, `docker-compose.yml` or the web proxy, run the api against a real database. It needs Docker running.

```sh
dir=$(mktemp -d)/demo-app
pnpm dev "$dir" -y --include web,api,contracts --db postgres --no-git
cd "$dir"
export COMPOSE_PROJECT_NAME=ftapp-check     # keeps clear of your other containers
docker compose up -d --wait db
pnpm dev
```

If something else already holds 5432, change the published port in `docker-compose.yml` and `DATABASE_URL` in `apps/api/.env` to match. If 3001 is taken, the web dev server fails (`strictPort`) rather than moving: free the port first.

Then check, in a second terminal:

- [ ] The api log ends in `Server listening at http://127.0.0.1:3000`, with no error. `docker compose exec db psql -U postgres -d demo-app -c 'select name from kysely_migration'` lists every migration.
- [ ] `curl -i localhost:3001/healthz` returns 200 `{"ok":true}` through the web proxy. A 504 means the api isn't running: look at its log.
- [ ] `curl -i localhost:3001/openapi.json` returns JSON, and http://localhost:3001/docs shows Scalar.
- [ ] http://localhost:3001/ shows the web app (not a JSON 404 from the api), with "Api is up" and "Hello, FTDS!".
- [ ] `docker compose stop db`: `/healthz` returns 503 `{"ok":false}` at once, and the api keeps running (it logs `postgres: idle connection lost`). `docker compose start db`: `/healthz` is back to 200.
- [ ] Stop and restart `pnpm dev`: the api starts without re-running migrations (`kysely_migration` has the same rows).
- [ ] With the db stopped, `pnpm dev` fails with `Could not migrate the database at DATABASE_URL`, and the proxy answers 504.

Finish with `docker compose down -v` to remove the container and its volume, then delete the temp folder.

#### Docker image

For a change to the `Dockerfile`, `nginx.conf`, `.dockerignore`, the build scripts, or how the api starts or serves the SPA, build and run the image for each shape it touches. Keep the CLI's install step (no `--no-install`): the image builds from `pnpm-lock.yaml`. Tag the images so you can find and remove them.

```sh
base=$(mktemp -d)
pnpm dev "$base/full-app" -y --include web,api,contracts --db postgres --no-git
pnpm dev "$base/api-app" -y --include api --db none --no-git
pnpm dev "$base/web-app" -y --include web --no-git
(cd "$base/full-app" && docker build -t ftapp-check-full .)   # likewise api-app, web-app
```

For every shape:

- [ ] `docker build` finishes. It sends a context of a few hundred kB (`.dockerignore` keeps out `node_modules`, `dist` and `.env`), and `pnpm fetch`, `pnpm install --offline` and `pnpm deploy` run with the pinned pnpm.

Web, api and Postgres: start the db as in the section above, then run the `docker run` command from the generated `README.md`. It points `DATABASE_URL` at `host.docker.internal`, because `localhost` inside the container is the container. If you remapped the db port, use that port in `DATABASE_URL`; if 3000 is taken, publish another host port (`-p 3300:3000`) and use it below.

- [ ] The log shows `Server listening`, and `kysely_migration` lists every migration.
- [ ] `curl -i localhost:3000/healthz` returns 200 `{"ok":true}`, `/openapi.json` returns JSON, and http://localhost:3000/docs shows Scalar.
- [ ] http://localhost:3000/ shows the web app with "Api is up". A deep link (`/some/page`) shows the app's "Page not found" page, not a JSON 404. `/static/js/*` files have `cache-control: public, max-age=31536000, immutable`; `/` has `no-cache`.
- [ ] `docker exec <container> id` shows `node`, and `docker stop` logs `shutting down` and returns at once.

api only (`--db none`): `docker run -p 3000:3000 --env-file apps/api/.env ftapp-check-api`.

- [ ] `/healthz` returns 200 and `/docs` shows Scalar.

Web only: `docker run -p 8080:8080 ftapp-check-web`.

- [ ] http://localhost:8080/ shows the web app, and a deep link shows its "Page not found" page.
- [ ] `curl -I` on a `/static/js/*` file shows one `Cache-Control: public, max-age=31536000, immutable`; `/` has `no-cache`. A missing `/static/` file is a 404, not `index.html`.

Finish with `docker rm -f` on your containers, `docker rmi ftapp-check-full ftapp-check-api ftapp-check-web`, `docker compose down -v`, and delete the temp folder.

## Git

Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `ci:`, `chore:`), on a feature branch. Releases are `chore: release x.y.z` (see README).

Every release bumps `version` in `package.json` first (patch for fixes, minor for features, major for breaking changes), then runs `pnpm build` so `dist/` carries it. Never tag a version that `package.json` doesn't already say, and never reuse an existing tag: check `git tag` for the latest one.

## Stop and ask first

This repo's additions to the general rules. Teammates and scripts depend on these:

- The CLI's interface: a flag, prompt, default, or the order of questions.
- The generated layout: file names, package names, root scripts or ports that existing projects or their tooling rely on.
- A new dependency in generated projects (a `catalog.json` entry), or a major version bump in the tested set.
- The rules written into the generated `AGENTS.md`: they are the product's conventions.
- Releases: bumping `version`, tagging, pushing tags.
