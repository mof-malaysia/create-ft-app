# Roadmap

> Draft by Claude from the repo, docs, issues and commits as of 2026-11-14. Owned by Irfan: edit freely. `/pm` reads this file and only proposes changes to it.

## Now (this quarter, in priority order)

1. **Teammates get what's on `main`.** The Claude Code setup, `ROADMAP.md` stub and turbo-run hooks are merged but unreleased, so `#semver:^0` still scaffolds v0.1.3.
   - Done when: a new tag above v0.1.3 is pushed and its GitHub release exists; a fresh `pnpm --config.dlx-cache-max-age=0 dlx github:mof-malaysia/create-ft-app#semver:^0` project contains `ROADMAP.md`, `CLAUDE.md` and `.claude/launch.json`.
   - Evidence: `git log v0.1.3..origin/main` (3 commits, including #1); `package.json` is still `0.1.3`; README "Releasing".

2. **A generated project is proven to run, not only to build.** Today nothing starts the api against Postgres or builds the Docker image.
   - Done when: for a web+api+contracts project with Postgres, `docker compose up -d db` then `pnpm dev` runs the migrations, `/healthz` returns 200 through the web app's proxy (no 504), and `/docs` loads; `docker build` succeeds and the image serves the SPA and the api (and the nginx image for a web-only project). The steps are written down in `AGENTS.md` ("Verifying a template change") or automated.
   - Evidence: PR #1 "Not verified" (no Docker, api half of the dev server untested, proxied requests returned 504); `test/scaffold.e2e.ts` only installs and runs `verify` (lint, check-types, test, build), and its api-only case uses `--db none --no-docker`; `templates/node/apps/api/test/app.test.ts` builds the app "without a database".

3. **The outputs that are only rendered get checked once for real.**
   - Done when: the web-only and api-only projects' `.claude/launch.json` start a working dev server on port 3000; the `--code-review` workflow (`.github/workflows/code-review.yml`) runs on a pull request in a real generated repo with the org's `ANTHROPIC_*` variables.
   - Evidence: PR #1 "Not verified" (web-only and api-only `launch.json` only checked by the unit test); `src/index.ts` code-review hint "needs the org's ANTHROPIC_* variables"; no e2e case opens a PR.

## Next

- Go stack: `templates/go/`, then add `"go"` to `AVAILABLE_STACKS` (`--stack go` is accepted but errors "isn't available yet").
- Keep the tested set in `catalog.json` current on a schedule (today it is bumped by hand, e.g. `d5ec7e3 chore: upgrade FTDS to v0.2.2`; the repo has no Renovate config of its own).
- Add a Postgres + Docker case to `test/scaffold.e2e.ts` that runs when Docker is available.
- Turn the Now goals into GitHub issues labelled `ready` so `/pm` has work to suggest.

## Not doing

- A CI workflow, in this repo or in generated projects: "Generated projects have no CI workflow: the pre-commit hook is the gate" (README); "There is no CI. The git hooks in `lefthook.yml` ... are the gate" (AGENTS.md). The only workflow is the tag-triggered release.
- Creating the GitHub repo or its labels from the scaffolder: "The scaffolder never creates a GitHub repo, so it doesn't create the labels; `/pm` does" (PR #1).
- TODO: Irfan to fill in.

## Known gaps

- Only the `node` template exists (`templates/node`); Go is "planned" (`src/options.ts` `AVAILABLE_STACKS`, README options, `src/args.ts` help).
- The api with Postgres has never been run end to end from a scaffold; the e2e test never starts a dev server or a database (`test/scaffold.e2e.ts`, PR #1).
- The Dockerfile and `nginx.conf` are rendered but never built (`templates/node/base/+docker/`; no `docker build` in `test/`).
- `main` is 3 commits ahead of the latest release v0.1.3 (`git log v0.1.3..origin/main`).
- No open issues and no `ready` or `needs-decision` labels in `mof-malaysia/create-ft-app`, so `/pm` currently has nothing to start from (`gh issue list`, `gh label list`).
- `catalog.json` has no automated update path; the root has no `renovate.json` (generated projects do: `templates/node/base/renovate.json`).

## Questions for Irfan

1. Is the Go stack wanted this quarter? I put it in Next because nothing beyond the "planned" note says when.
2. Should the next release be 0.1.4 or 0.2.0? Generated projects gain new files (`ROADMAP.md`, `.claude/launch.json`) but the CLI's flags are unchanged.
3. Should Postgres and Docker checks go into the pre-push `pnpm verify` (making Docker a requirement for contributors), or stay a manual checklist in `AGENTS.md`?
4. Is bumping `catalog.json` by hand deliberate, or should it get Renovate (or a scheduled `--latest` check) like generated projects?
