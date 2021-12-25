import { promises as fs } from 'fs';

export async function ignoreFile(rootDir: string, content: string) {
  const lines = content.split('\n');
  const paths: [boolean, string][] = [];

  for (const line of lines) {
    const find = line.replace('./', rootDir);
    const stats = await fs.stat(find);
    paths.push([stats.isDirectory(), find]);
  }

  return paths;
}