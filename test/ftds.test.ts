import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { skillFiles } from "../src/ftds.ts";

describe("FTDS skills", () => {
  it("writes registry files under .claude/skills at the project root", () => {
    const files = skillFiles({
      files: [{ target: "~/.claude/skills/ftds/references/extending.md", content: "x" }],
    });
    assert.deepEqual(files, [
      { path: ".claude/skills/ftds/references/extending.md", content: "x" },
    ]);
  });

  it("refuses files outside the FTDS skill folders", () => {
    for (const target of [
      "~/.claude/settings.json",
      "~/.claude/skills/mine/SKILL.md",
      "~/.claude/skills/ftds/../../x",
      "src/x.ts",
      undefined,
    ])
      assert.throws(() => skillFiles({ files: [{ target, content: "x" }] }), String(target));
  });
});
