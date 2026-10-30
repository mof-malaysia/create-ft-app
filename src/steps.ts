/** The steps after the files are written: git, install, FTDS, format, verify. */
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

/** Runs a command, capturing output; never throws on a non-zero exit. */
export function run(
  cmd: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv },
): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("error", (error) => resolve({ ok: false, output: String(error) }));
    child.on("close", (code) => resolve({ ok: code === 0, output }));
  });
}

export function lastLines(text: string, n = 25) {
  return text.trimEnd().split("\n").slice(-n).join("\n");
}

/** The pnpm version on PATH, or undefined if there is none. */
export function localPnpm(): string | undefined {
  const res = spawnSync("pnpm", ["--version"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    // Run outside any project so packageManager fields don't interfere.
    cwd: tmpdir(),
  });
  return res.status === 0 ? res.stdout.trim() : undefined;
}

/**
 * Installs the project's pnpm into a temporary folder and returns the env
 * that puts it first on PATH, for this run's child processes (including the
 * ones shadcn spawns). Used when the local pnpm has a different major:
 * pnpm 10 can't switch itself to 11 or later.
 */
export async function provisionPnpm(version: string) {
  const dir = mkdtempSync(join(tmpdir(), "create-ft-app-"));
  const res = await run(
    "npm",
    ["install", "--prefix", dir, "--no-audit", "--no-fund", "--loglevel=error", `pnpm@${version}`],
    { cwd: dir },
  );
  if (!res.ok) throw new Error(`Couldn't install pnpm ${version}:\n${lastLines(res.output)}`);
  const bin = join(dir, "node_modules", ".bin");
  return { dir, env: { PATH: `${bin}${delimiter}${process.env.PATH ?? ""}` } };
}

export const FTDS_ITEMS = ["ftds-init", "button", "tag", "theme-switch", "skiplink"];
