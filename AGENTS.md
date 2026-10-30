# Working on create-ft-app

A CLI that scaffolds Turborepo projects. Teammates run it with `pnpm dlx github:mof-malaysia/create-ft-app#semver:^0`, so **the committed `dist/index.mjs` is what runs**: there is no build step on their machine.

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

- `// @if <expr>` … `// @elif <expr>` … `// @else` … `// @endif` on their own lines (also `#`, `<!-- -->`, `{/* */}`). Flags come from `flagsFor()`: `web`, `api`, `contracts`, `oxlint`, `tsconfig`, `postgres`, `fullstack`, `docker`, `ci`, `git`. An unknown flag is an error.
- A folder named `+<expr>` merges into its parent when true. A file that renders empty is skipped.
- A leading `_` becomes `.` (`_gitignore`), because packing drops some dotfiles.
- JSON templates may end up with trailing commas when an `@if` drops the last entry; the scaffold strips them. Third-party dependencies are always `"catalog:"`, and every name must exist in `catalog.json` (`pnpm test` checks).
- Package `tsconfig.json` and `.oxlintrc.json` files always extend the presets in `packages/typescript-config` and `packages/oxlint-config`. When that package isn't chosen, `scaffold.ts` merges the preset into the file instead, so each setting has one source.
- Without `contracts`, the api's `src/contract.ts` is rendered from `packages/contracts/src/index.ts`: one copy of the schemas.
- Templates must type-check and lint as generated: `pnpm test:scaffold` builds them.

## Adding a stack

`--stack go` is accepted but not available yet. To add it: create `templates/go/`, add `"go"` to `AVAILABLE_STACKS` in `src/options.ts`, and give it its own parts and post-steps where they differ from Node's.

## Before calling a change done

```sh
pnpm check-types
pnpm test
pnpm format:check
pnpm build            # then commit dist/
pnpm test:scaffold    # for any template change
```
