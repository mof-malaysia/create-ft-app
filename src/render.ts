/**
 * The template engine. Deliberately small:
 *
 * - `{{var}}` placeholders are replaced from `vars` (GitHub Actions'
 *   `${{ … }}` expressions are left alone).
 * - Lines whose only content is `@if <expr>`, `@elif <expr>`, `@else` or
 *   `@endif` (after a comment marker such as `//`, `#` or `<!--`) keep or drop
 *   the lines between them. `<expr>` is flags joined by `&&` / `||`, each
 *   optionally negated with `!`. Blocks nest.
 * - A file that renders to nothing but whitespace is not written, so a whole
 *   file can be made conditional by wrapping it in `@if`.
 * - A folder named `+<expr>` is an overlay: its contents are merged into the
 *   parent folder when `<expr>` is true.
 * - A path segment starting with `_` is written with a leading `.` instead
 *   (`_gitignore` → `.gitignore`), because npm and pnpm drop some dotfiles
 *   when packing the CLI.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Flags } from "./options.ts";

const DIRECTIVE =
  /^\s*(?:\/\/|#|<!--|\/\*|\{\/\*)?\s*@(if|elif|else|endif)\b(.*?)(?:-->|\*\/\}|\*\/)?\s*$/;

export function evaluate(expr: string, flags: Flags): boolean {
  const source = expr.trim();
  if (!source) throw new Error("Empty template condition");
  return source.split("||").some((any) =>
    any.split("&&").every((term) => {
      const t = term.trim();
      const negate = t.startsWith("!");
      const name = negate ? t.slice(1).trim() : t;
      if (!(name in flags)) throw new Error(`Unknown template flag "${name}"`);
      return negate ? !flags[name] : Boolean(flags[name]);
    }),
  );
}

type Frame = { parentOn: boolean; matched: boolean; on: boolean };

export function renderText(
  text: string,
  flags: Flags,
  vars: Record<string, string>,
  file = "template",
): string {
  const out: string[] = [];
  const stack: Frame[] = [];
  const on = () => stack.at(-1)?.on ?? true;

  text.split("\n").forEach((line, i) => {
    const m = DIRECTIVE.exec(line);
    if (!m) {
      if (on()) out.push(line);
      return;
    }
    const [, kind, rest = ""] = m;
    const where = `${file}:${i + 1}`;
    if (kind === "if") {
      const parentOn = on();
      const value = parentOn && evaluate(rest, flags);
      stack.push({ parentOn, matched: value, on: value });
    } else if (kind === "elif" || kind === "else") {
      const top = stack.at(-1);
      if (!top) throw new Error(`@${kind} without @if at ${where}`);
      const value =
        top.parentOn &&
        !top.matched &&
        (kind === "else" || evaluate(rest, flags));
      top.on = value;
      top.matched ||= value;
    } else {
      if (!stack.pop()) throw new Error(`@endif without @if at ${where}`);
    }
  });
  if (stack.length) throw new Error(`Unclosed @if in ${file}`);

  return out
    .join("\n")
    .replace(/(?<!\$)\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
      const value = vars[key];
      if (value === undefined)
        throw new Error(`Unknown template variable ${match} in ${file}`);
      return value;
    });
}

export type RenderedFile = { path: string; content: string };

/** Renders one template file; undefined when it renders to nothing. */
export function renderFile(
  src: string,
  dest: string,
  flags: Flags,
  vars: Record<string, string>,
): RenderedFile | undefined {
  const content = renderText(readFileSync(src, "utf8"), flags, vars, src);
  return content.trim() ? { path: dest, content } : undefined;
}

/** Renders one template folder into a list of files relative to `dest`. */
export function renderDir(
  src: string,
  dest: string,
  flags: Flags,
  vars: Record<string, string>,
): RenderedFile[] {
  const files: RenderedFile[] = [];
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const from = join(src, entry.name);
    if (entry.isDirectory() && entry.name.startsWith("+")) {
      if (evaluate(entry.name.slice(1), flags))
        files.push(...renderDir(from, dest, flags, vars));
      continue;
    }
    const name = entry.name.startsWith("_")
      ? `.${entry.name.slice(1)}`
      : entry.name;
    const to = dest ? `${dest}/${name}` : name;
    if (entry.isDirectory()) files.push(...renderDir(from, to, flags, vars));
    else {
      const file = renderFile(from, to, flags, vars);
      if (file) files.push(file);
    }
  }
  return files;
}
