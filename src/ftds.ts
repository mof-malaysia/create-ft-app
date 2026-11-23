/** FTDS's agent skills, read from its shadcn registry at the pinned version. */
import type { RenderedFile } from "./render.ts";
import { getJson } from "./versions.ts";

/** Also the `@ftds` namespace in components.json, as `{{ftdsRegistry}}`. */
export const FTDS_REGISTRY = "https://mof-malaysia.github.io/ftds/r";
/** The last one pulls in the others; all are listed so each is fetched directly. */
const SKILLS = ["ftds-skill", "ftds-explore-skill"] as const;
/** Registry targets are relative to the project root: "~/.claude/skills/…". */
const TARGET = /^~\/(\.claude\/skills\/ftds[\w-]*\/[\w./-]+)$/;

type RegistryItem = { files: { target?: string; content?: string }[] };

const itemUrl = (version: string, name: string) => `${FTDS_REGISTRY}/${version}/${name}.json`;

/** One URL that installs every skill, for `shadcn add` by hand. */
export const ftdsSkillsUrl = (version: string) => itemUrl(version, SKILLS.at(-1)!);

/** The files a registry item writes into the project, under .claude/skills/ftds*. */
export function skillFiles(item: RegistryItem): RenderedFile[] {
  return item.files.map((f) => {
    const path = TARGET.exec(f.target ?? "")?.[1];
    if (!path || path.includes("..") || f.content === undefined)
      throw new Error(`Unexpected FTDS skill file: ${f.target}`);
    return { path, content: f.content };
  });
}

export async function fetchFtdsSkills(version: string): Promise<RenderedFile[]> {
  const items = await Promise.all(
    SKILLS.map((name) => getJson<RegistryItem>(itemUrl(version, name))),
  );
  return items.flatMap(skillFiles);
}
