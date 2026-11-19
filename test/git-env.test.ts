/**
 * Git sets GIT_DIR for hooks run in a worktree. The new project's git steps
 * must still act on the new project, not on the repo whose hook ran the CLI.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { childEnv } from "../src/steps.ts";

const CLI = join(import.meta.dirname, "../src/index.ts");

describe("git steps ignore an inherited repository", () => {
  it("drops the variables that point git at a repository, and keeps the rest", () => {
    const env = childEnv(
      {
        GIT_DIR: "/outer/.git",
        GIT_INDEX_FILE: "/outer/.git/index",
        GIT_EDITOR: "true",
        PATH: "/bin",
      },
      { CI: "1" },
    );
    assert.deepEqual(env, { GIT_EDITOR: "true", PATH: "/bin", CI: "1" });
  });

  it("commits to the new project when GIT_DIR names another repo", () => {
    const root = mkdtempSync(join(tmpdir(), "ft-git-env-"));
    try {
      // This test runs in the pre-push hook too, so its own git calls need
      // the cleaned env as well, or they'd land in this repo.
      const clean = childEnv(process.env);
      const outer = join(root, "outer");
      const git = (cwd: string, ...args: string[]) =>
        execFileSync("git", args, { cwd, encoding: "utf8", env: clean }).trim();
      execFileSync("git", ["init", "-q", "-b", "main", outer], { env: clean });
      git(
        outer,
        "-c",
        "user.name=t",
        "-c",
        "user.email=t@t",
        "commit",
        "-q",
        "--allow-empty",
        "-m",
        "outer",
      );
      const before = git(outer, "rev-parse", "HEAD");

      const dir = join(root, "demo-app");
      execFileSync("tsx", [CLI, dir, "-y", "--include", "web", "--no-install"], {
        cwd: outer,
        env: {
          ...clean,
          CI: "1",
          GIT_DIR: join(outer, ".git"),
          GIT_AUTHOR_NAME: "t",
          GIT_AUTHOR_EMAIL: "t@t",
          GIT_COMMITTER_NAME: "t",
          GIT_COMMITTER_EMAIL: "t@t",
        },
        stdio: "pipe",
      });

      assert.equal(git(outer, "rev-parse", "HEAD"), before, "the outer repo got no new commit");
      assert.equal(git(outer, "status", "--porcelain"), "", "the outer repo is clean");
      assert.ok(existsSync(join(dir, ".git")), "the new project has its own repo");
      assert.match(git(dir, "log", "--oneline"), /chore: scaffold with create-ft-app/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
