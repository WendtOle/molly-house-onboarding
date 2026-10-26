import { readdir, readFile } from 'node:fs/promises';
import { loadHints } from '../src/content.ts';

const directory = new URL('../content/hints/', import.meta.url);
const names = await readdir(directory, { recursive: true });
const entries = await Promise.all(
  names
    .filter((name) => name.endsWith('.md'))
    .map(
      async (name) =>
        [name, await readFile(new URL(name, directory), 'utf8')] as const,
    ),
);
try {
  const hints = loadHints(Object.fromEntries(entries));
  if (!hints.length)
    throw new Error('Add at least one Markdown hint in content/hints.');
  console.log(
    `Validated ${hints.length} hints across ${new Set(hints.flatMap((hint) => hint.topics)).size} topics.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
