import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toKebabCase, validateName } from "../src/options.ts";

describe("project names", () => {
  it("accepts kebab-case", () => {
    for (const name of ["budget", "budget-portal", "budget-portal-2", "ft2-app"])
      assert.equal(validateName(name), undefined, name);
  });

  it("rejects everything else, suggesting the kebab-case form", () => {
    const cases: Record<string, string> = {
      budget_portal: "budget-portal",
      "Budget-Portal": "budget-portal",
      BudgetPortal: "budget-portal",
      "budget--portal": "budget-portal",
      "budget.portal": "budget-portal",
      "-budget": "budget",
      "budget-": "budget",
      "2fa-app": "fa-app",
    };
    for (const [name, suggestion] of Object.entries(cases)) {
      assert.equal(toKebabCase(name), suggestion, name);
      assert.match(validateName(name) ?? "", new RegExp(`try "${suggestion}"`), name);
    }
  });

  it("has no suggestion when nothing usable is left", () => {
    assert.doesNotMatch(validateName("123") ?? "", /try "/);
    assert.equal(validateName(""), "Enter a project name");
  });
});
