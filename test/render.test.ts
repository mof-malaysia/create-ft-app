import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluate, renderText } from "../src/render.ts";

const flags = { web: true, api: false, postgres: false };

describe("evaluate", () => {
  it("handles !, && and ||", () => {
    assert.equal(evaluate("web", flags), true);
    assert.equal(evaluate("!api", flags), true);
    assert.equal(evaluate("web && api", flags), false);
    assert.equal(evaluate("api || web", flags), true);
  });

  it("rejects unknown flags", () => {
    assert.throws(
      () => evaluate("rust", flags),
      /Unknown template flag "rust"/,
    );
  });
});

describe("renderText", () => {
  it("keeps and drops blocks, with else, elif and nesting", () => {
    const text = [
      "a",
      "// @if api",
      "api",
      "// @elif web",
      "web",
      "  // @if postgres",
      "  pg",
      "  // @else",
      "  no-pg",
      "  // @endif",
      "// @else",
      "neither",
      "// @endif",
      "z",
    ].join("\n");
    assert.equal(renderText(text, flags, {}), "a\nweb\n  no-pg\nz");
  });

  it("understands #, HTML and JSX comment markers", () => {
    const text =
      "# @if api\nx\n# @endif\n<!-- @if web -->\ny\n<!-- @endif -->\n{/* @if web */}\nz\n{/* @endif */}";
    assert.equal(renderText(text, flags, {}), "y\nz");
  });

  it("fills variables and refuses unknown ones", () => {
    assert.equal(
      renderText("{{name}}/{{ scope }}", flags, { name: "a", scope: "@b" }),
      "a/@b",
    );
    assert.throws(
      () => renderText("{{nope}}", flags, {}),
      /Unknown template variable/,
    );
  });

  it("leaves GitHub Actions expressions alone", () => {
    assert.equal(
      renderText("${{ github.ref }}", flags, {}),
      "${{ github.ref }}",
    );
  });

  it("reports unbalanced blocks", () => {
    assert.throws(() => renderText("// @if web\nx", flags, {}), /Unclosed @if/);
    assert.throws(() => renderText("// @endif", flags, {}), /without @if/);
  });
});
