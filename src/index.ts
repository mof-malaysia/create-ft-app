import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import * as p from "@clack/prompts";
import pkg from "../package.json" with { type: "json" };
import { HELP, parse, type Args } from "./args.ts";
import {
  AVAILABLE_STACKS,
  DEFAULTS,
  PART_HINTS,
  PARTS,
  flagsFor,
  validateName,
  validateScope,
  type Database,
  type Options,
  type Part,
  type VersionMode,
} from "./options.ts";
import { fillCatalog, renderProject, writeProject } from "./scaffold.ts";
import { FTDS_ITEMS, lastLines, localPnpm, provisionPnpm, run } from "./steps.ts";
import { major, resolvePackages, resolveToolchain } from "./versions.ts";

function unwrap<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled. Nothing was written.");
    process.exit(1);
  }
  return value as Exclude<T, symbol>;
}

/** A spinner on a terminal; plain log lines in CI and other pipes. */
function progress() {
  if (process.stdout.isTTY) return p.spinner();
  return {
    start: (msg: string) => p.log.step(`${msg}…`),
    stop: (msg: string) => p.log.success(msg),
    error: (msg: string) => p.log.error(msg),
  };
}

/** A path as the user would type it from here. */
function display(dir: string) {
  const rel = relative(process.cwd(), dir) || ".";
  return rel.startsWith("..") ? dir : rel;
}

const isEmptyDir = (dir: string) =>
  !existsSync(dir) || readdirSync(dir).every((f) => f === ".git" || f === ".DS_Store");

async function gather(args: Args, interactive: boolean): Promise<Options> {
  let name = args.name ?? (args.dir ? basename(resolve(args.dir)) : undefined);
  if (!name || (interactive && !args.name && !args.dir)) {
    if (!interactive) throw new Error("Pass a folder or --name");
    name = unwrap(
      await p.text({
        message: "Project name",
        placeholder: "my-app",
        defaultValue: name,
        validate: validateName,
      }),
    );
  }
  const nameError = validateName(name);
  if (nameError) throw new Error(`${nameError}: "${name}"`);

  let dir = args.dir;
  if (!dir && interactive)
    dir = unwrap(
      await p.text({
        message: "Where should it go?",
        initialValue: `./${name}`,
        validate: (value) => (value ? undefined : "Enter a folder"),
      }),
    );
  const target = resolve(dir ?? name);
  if (!isEmptyDir(target)) {
    if (!interactive) throw new Error(`${target} is not empty`);
    const go = unwrap(
      await p.confirm({
        message: `${display(target)} is not empty. Write into it anyway?`,
        initialValue: false,
      }),
    );
    if (!go) {
      p.cancel("Cancelled. Nothing was written.");
      process.exit(1);
    }
  }

  const parts: Part[] =
    args.include ??
    (interactive
      ? unwrap(
          await p.multiselect<Part>({
            message: "What should it include?",
            options: PARTS.map((part) => ({
              value: part,
              label: part,
              hint: PART_HINTS[part],
            })),
            initialValues: [...PARTS],
            required: true,
          }),
        )
      : [...PARTS]);

  const database =
    args.db ??
    (parts.includes("api") && interactive
      ? unwrap(
          await p.select<Database>({
            message: "Database for the api",
            options: [
              {
                value: "postgres",
                label: "Postgres",
                hint: "Kysely + pg, migrations on boot",
              },
              { value: "none", label: "None" },
            ],
            initialValue: DEFAULTS.database,
          }),
        )
      : DEFAULTS.database);

  type Extra = "docker" | "ci" | "git" | "install";
  const extraInfo: Record<Extra, { label: string; hint: string }> = {
    docker: { label: "Dockerfile", hint: "one image for the app" },
    ci: { label: "GitHub Actions", hint: "lint, types, test, build" },
    git: { label: "git", hint: "init, pre-commit hook, first commit" },
    install: {
      label: "Install and verify",
      hint: "pnpm install, FTDS, format, build",
    },
  };
  const unasked = (Object.keys(extraInfo) as Extra[]).filter((k) => args[k] === undefined);
  const picked: Extra[] =
    interactive && unasked.length
      ? unwrap(
          await p.multiselect<Extra>({
            message: "Extras",
            options: unasked.map((k) => ({ value: k, ...extraInfo[k] })),
            initialValues: unasked,
            required: false,
          }),
        )
      : unasked;
  const extra = (k: Extra) => args[k] ?? picked.includes(k);

  const versions =
    args.versions ??
    (interactive
      ? unwrap(
          await p.select<VersionMode>({
            message: "Dependency versions",
            options: [
              {
                value: "tested",
                label: "Tested set",
                hint: `the versions create-ft-app ${pkg.version} was verified with`,
              },
              {
                value: "latest",
                label: "Latest",
                hint: "newest releases, checked by the verify step",
              },
            ],
            initialValue: DEFAULTS.versions,
          }),
        )
      : DEFAULTS.versions);

  const scope = args.scope ?? DEFAULTS.scope;
  const scopeError = validateScope(scope);
  if (scopeError) throw new Error(scopeError);

  return {
    stack: args.stack,
    name,
    dir: target,
    scope,
    parts,
    database,
    docker: extra("docker"),
    ci: extra("ci"),
    git: extra("git"),
    install: extra("install"),
    versions,
  };
}

async function main() {
  const args = parse(process.argv.slice(2));
  if (args.help) return void console.log(HELP);
  if (args.version) return void console.log(pkg.version);

  if (Number(major(process.versions.node)) < 22)
    throw new Error(`Node 22 or later is required (found ${process.version})`);

  if (!AVAILABLE_STACKS.includes(args.stack))
    throw new Error(
      `The ${args.stack} stack isn't available yet. Available: ${AVAILABLE_STACKS.join(", ")}.`,
    );

  const interactive = Boolean(process.stdin.isTTY) && !args.yes;
  p.intro(`create-ft-app ${pkg.version}`);
  const o = await gather(args, interactive);
  const flags = flagsFor(o);

  const s = progress();
  s.start(o.versions === "latest" ? "Looking up the latest versions" : "Preparing");
  const toolchain = await resolveToolchain(o.versions);
  const { files, catalog } = renderProject(o, toolchain.value, pkg.version);
  const packages = await resolvePackages(o.versions, catalog, toolchain.value.node);
  fillCatalog(files, packages.value);
  const { node, pnpm, ftds, shadcn } = toolchain.value;
  s.stop(
    `${o.versions === "latest" ? "Resolved the latest versions" : "Using the tested versions"} (Node ${node}, pnpm ${pnpm}, FTDS ${ftds})`,
  );
  const fallbacks = [...toolchain.fallbacks, ...packages.fallbacks];
  if (fallbacks.length)
    p.log.warn(
      `Couldn't reach the registry for ${fallbacks.join(", ")}; used the tested versions.`,
    );

  writeProject(o.dir, files);
  for (const f of files)
    if (f.path.endsWith(".env.example"))
      copyFileSync(join(o.dir, f.path), join(o.dir, f.path.replace(/\.example$/, "")));
  p.log.success(`Wrote ${files.length} files to ${o.dir}`);

  const failures: string[] = [];
  const step = async (
    label: string,
    cmd: string,
    cmdArgs: string[],
    opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
  ) => {
    const sp = progress();
    sp.start(label);
    const res = await run(cmd, cmdArgs, {
      cwd: opts.cwd ?? o.dir,
      env: opts.env,
    });
    if (res.ok) sp.stop(label);
    else {
      sp.error(`${label} failed`);
      p.log.message(lastLines(res.output));
      failures.push(label);
    }
    return res.ok;
  };

  if (o.git) await step("git init", "git", ["init", "-b", "main"]);

  const local = localPnpm();
  const pnpmMismatch = !local || major(local) !== major(pnpm);
  const ftdsArgs = [
    "dlx",
    `shadcn@${shadcn}`,
    "add",
    ...FTDS_ITEMS.map((i) => `@ftds/${i}`),
    "--yes",
    "--overwrite",
  ];

  let tempPnpm: string | undefined;
  try {
    if (o.install) {
      let env: NodeJS.ProcessEnv = { CI: "1" };
      if (pnpmMismatch) {
        const sp = progress();
        sp.start(`Fetching pnpm ${pnpm}`);
        const provisioned = await provisionPnpm(pnpm);
        tempPnpm = provisioned.dir;
        env = { ...env, ...provisioned.env };
        sp.stop(`Fetched pnpm ${pnpm}`);
      }
      if (await step("Installing dependencies", "pnpm", ["install"], { env })) {
        if (flags.web)
          await step(`Adding FTDS ${ftds} components`, "pnpm", ftdsArgs, {
            cwd: join(o.dir, "apps/web"),
            env,
          });
        await step("Formatting", "pnpm", ["run", "format"], { env });
        await step(
          "Verifying: lint, check-types, test, build",
          "pnpm",
          ["run", "verify", "--output-logs=errors-only"],
          { env },
        );
      }
    }
  } finally {
    if (tempPnpm) rmSync(tempPnpm, { recursive: true, force: true });
  }

  if (o.git) {
    await step("git add", "git", ["add", "-A"]);
    await step("First commit", "git", [
      "commit",
      "-q",
      "--no-verify",
      "-m",
      `chore: scaffold with create-ft-app ${pkg.version}`,
    ]);
  }

  const next = [`cd ${display(o.dir)}`];
  if (!o.install) {
    next.push("pnpm install");
    if (flags.web) next.push(`(cd apps/web && pnpm ${ftdsArgs.join(" ")})`);
  }
  if (flags.postgres) next.push("docker compose up -d db");
  next.push("pnpm dev", "", "URLs and scripts are in README.md.");
  p.note(next.join("\n"), "Next steps");

  if (pnpmMismatch)
    p.log.warn(
      `This project uses pnpm ${pnpm}, but ${local ? `pnpm ${local} is` : "no pnpm is"} on your PATH.\n` +
        `Install it with: npm install -g pnpm@${major(pnpm)}`,
    );
  if (failures.length) {
    p.outro(`Done, but these steps failed: ${failures.join(", ")}. The output is above.`);
    process.exitCode = 1;
  } else p.outro("Done.");
}

main().catch((error: unknown) => {
  p.log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
