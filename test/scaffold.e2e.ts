/**
 * The slow test: scaffolds real projects with install and verify (lint,
 * check-types, test, build), the way a teammate would run the CLI. Needs
 * network. Run with `pnpm test:scaffold`; CI runs it on every push.
 */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";

const exec = promisify(execFile);
const CLI = process.env.CLI ?? join(import.meta.dirname, "../src/index.ts");
const [cmd, ...pre] = CLI.endsWith(".ts") ? ["tsx", CLI] : ["node", CLI];

const cases: { name: string; args: string[]; expect: (dir: string) => void }[] = [
  {
    name: "web only, configs inlined",
    args: ["--include", "web", "--no-git"],
    expect: (dir) => {
      assert.ok(existsSync(join(dir, "apps/web/src/components/ui/button.tsx")), "FTDS installed");
      assert.ok(existsSync(join(dir, "nginx.conf")));
      assert.ok(!existsSync(join(dir, "packages")));
    },
  },
  {
    name: "api only, no database",
    args: ["--include", "api,typescript-config", "--db", "none", "--no-docker", "--no-git"],
    expect: (dir) => {
      assert.ok(!existsSync(join(dir, "apps/api/src/db")));
      assert.ok(!existsSync(join(dir, "Dockerfile")));
    },
  },
  {
    name: "everything, latest versions",
    args: ["--latest", "--code-review"],
    expect: (dir) => {
      const api = JSON.parse(readFileSync(join(dir, "apps/api/package.json"), "utf8"));
      assert.equal(api.name, "@demo-app/api");
      assert.ok(existsSync(join(dir, ".github/workflows/code-review.yml")));
      assert.match(readFileSync(join(dir, "pnpm-workspace.yaml"), "utf8"), /fastify/);
    },
  },
];

describe("scaffold end to end", { concurrency: true }, () => {
  for (const c of cases)
    it(c.name, { timeout: 15 * 60_000 }, async () => {
      const dir = join(mkdtempSync(join(tmpdir(), "ft-e2e-")), "demo-app");
      try {
        await exec(cmd!, [...pre, dir, "-y", ...c.args], {
          env: { ...process.env, CI: "1" },
          maxBuffer: 64 * 1024 * 1024,
        });
      } catch (error) {
        const { stdout = "", stderr = "" } = error as {
          stdout?: string;
          stderr?: string;
        };
        assert.fail(`${stdout}\n${stderr}`);
      }
      c.expect(dir);
      if (c.args.includes("--latest")) {
        const { stdout } = await exec("git", ["log", "--oneline"], {
          cwd: dir,
        });
        assert.match(stdout, /chore: scaffold/);
      }
      if (!process.env.KEEP) rmSync(dir, { recursive: true, force: true });
      else console.log(`kept ${dir}`);
    });
});
