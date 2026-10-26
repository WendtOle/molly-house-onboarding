import { parse } from 'yaml';

export interface Hint {
  id: string;
  title: string;
  topics: string[];
  body: string;
  order: number;
}

export function parseHint(filename: string, source: string): Hint {
  const match = source
    .replace(/\r\n/g, '\n')
    .match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match)
    throw new Error(`${filename}: start with a YAML block between --- lines.`);
  const data = parse(match[1]) as Record<string, unknown> | null;
  if (!data || typeof data.title !== 'string' || !data.title.trim())
    throw new Error(`${filename}: title must be nonempty text.`);
  if (
    !Array.isArray(data.topics) ||
    !data.topics.length ||
    data.topics.some((topic) => typeof topic !== 'string' || !topic.trim())
  )
    throw new Error(`${filename}: topics must be a nonempty list of names.`);
  if (
    data.order !== undefined &&
    (typeof data.order !== 'number' || !Number.isFinite(data.order))
  )
    throw new Error(`${filename}: optional order must be a number.`);
  if (!match[2].trim())
    throw new Error(`${filename}: add some hint text after the metadata.`);
  const id = filename.split('/').at(-1)!.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    throw new Error(
      `${filename}: use a lowercase, hyphen-separated filename ending in .md.`,
    );
  return {
    id,
    title: data.title.trim(),
    topics: [
      ...new Set((data.topics as string[]).map((topic) => topic.trim())),
    ],
    body: match[2].trim(),
    order: (data.order as number | undefined) ?? 100,
  };
}

export function loadHints(files: Record<string, string>): Hint[] {
  const hints = Object.entries(files).map(([name, source]) =>
    parseHint(name, source),
  );
  if (new Set(hints.map((hint) => hint.id)).size !== hints.length)
    throw new Error(
      'Hint filenames must be unique, including across subfolders.',
    );
  return hints.sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
}
