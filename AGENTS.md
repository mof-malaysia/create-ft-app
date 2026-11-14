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
| `catalog.json`                           | The tested version set                                                                  |
| `templates/<stack>/base`                 | Root files of every project                                                             |
| `templates/<stack>/apps/*`, `packages/*` | One folder per part                                                                     |
| `test/*.test.ts`                         | Fast tests: the engine, and every part combination rendered in memory                   |
| `test/scaffold.e2e.ts`                   | Slow tests: real scaffolds with install and build                                       |

## Template rules

- `// @if <expr>` … `// @elif <expr>` … `// @else` … `// @endif` on their own lines (also `#`, `<!-- -->`, `{/* */}`). Flags come from `flagsFor()`: `web`, `api`, `contracts`, `oxlint`, `tsconfig`, `postgres`, `fullstack`, `docker`, `codeReview`, `git`. An unknown flag is an error.
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

## Git

Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `ci:`, `chore:`), on a feature branch. Releases are `chore: release x.y.z` (see README).

## Stop and ask first

This repo's additions to the general rules. Teammates and scripts depend on these:

- The CLI's interface: a flag, prompt, default, or the order of questions.
- The generated layout: file names, package names, root scripts or ports that existing projects or their tooling rely on.
- A new dependency in generated projects (a `catalog.json` entry), or a major version bump in the tested set.
- The rules written into the generated `AGENTS.md`: they are the product's conventions.
- Releases: bumping `version`, tagging, pushing tags.
