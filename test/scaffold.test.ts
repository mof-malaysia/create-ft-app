/**
 * Renders every combination of parts in memory (no install) and checks the
 * result is consistent: valid JSON, a version for every catalog entry, no
 * leftover template markers, and no reference to a part that wasn't chosen.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PARTS, type Options, type Part } from "../src/options.ts";
import { fillCatalog, renderProject } from "../src/scaffold.ts";
import { resolvePackages, resolveToolchain } from "../src/versions.ts";

function* subsets(): Generator<Part[]> {
  for (let mask = 0; mask < 1 << PARTS.length; mask++)
    yield PARTS.filter((_, i) => mask & (1 << i));
}

const base: Omit<Options, "parts"> = {
  stack: "node",
  name: "demo-app",
  dir: "/tmp/demo-app",
  scope: "@demo-app",
  database: "postgres",
  docker: true,
  codeReview: true,
  git: true,
  install: false,
  versions: "tested",
};

describe("every combination renders cleanly", () => {
  for (const parts of subsets())
    for (const database of ["postgres", "none"] as const) {
      if (database === "none" && !parts.includes("api")) continue;
      it(`${parts.join("+") || "(nothing)"} / db=${database}`, async () => {
        const o: Options = { ...base, parts, database };
        const toolchain = (await resolveToolchain("tested")).value;
        const { files, catalog } = renderProject(o, toolchain, "0.0.0");
        fillCatalog(files, (await resolvePackages("tested", catalog, toolchain.node)).value);
        const byPath = new Map(files.map((f) => [f.path, f.content]));

        for (const [path, text] of byPath) {
          assert.doesNotMatch(text, /@(if|elif|else|endif)\b/, `marker left in ${path}`);
          assert.doesNotMatch(text, /__CATALOG__/, path);
          if (path.endsWith("package.json")) JSON.parse(text);
          for (const ref of text.matchAll(/@demo-app\/([a-z-]+)/g))
            assert.ok(
              (parts as string[]).includes(ref[1]!) || ref[1] === "api" || ref[1] === "web",
              `${path} references @demo-app/${ref[1]}, which wasn't chosen`,
            );
        }
        if (parts.includes("api")) {
          assert.ok(byPath.has("apps/api/src/app.ts"));
          assert.ok(byPath.has("apps/api/src/contract.ts"));
        }
        assert.equal(
          byPath.has("apps/api/src/db/index.ts"),
          parts.includes("api") && database === "postgres",
        );
        assert.equal(
          byPath.has("docker-compose.yml"),
          parts.includes("api") && database === "postgres",
        );
        assert.equal(byPath.has("Dockerfile"), parts.includes("api") || parts.includes("web"));
        assert.equal(byPath.has("nginx.conf"), parts.includes("web") && !parts.includes("api"));
        assert.ok(byPath.has(".github/workflows/code-review.yml"));

        // Claude Code preview config: one server, on the port the browser uses.
        const launch = byPath.get(".claude/launch.json");
        const servesApp = parts.includes("web") || parts.includes("api");
        assert.equal(launch !== undefined, servesApp);
        if (launch) {
          const { configurations } = JSON.parse(launch);
          assert.equal(configurations.length, 1);
          const fullstack = parts.includes("web") && parts.includes("api");
          assert.equal(configurations[0].port, fullstack ? 3001 : 3000);
          // The web dev server must listen on exactly that port, not drift to a free one.
          const rsbuild = byPath.get("apps/web/rsbuild.config.ts");
          if (rsbuild) {
            assert.match(rsbuild, new RegExp(`^\\s*port: ${configurations[0].port},$`, "m"));
            assert.match(rsbuild, /^\s*strictPort: true,$/m);
          }
        }
        assert.match(byPath.get("ROADMAP.md") ?? "", /^# demo-app roadmap$/m, "ROADMAP.md");
        assert.match(byPath.get(".gitignore")!, /^!\.claude\/launch\.json$/m);
      });
    }
});
