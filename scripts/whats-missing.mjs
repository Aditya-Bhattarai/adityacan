// Lists every blank still waiting to be filled in.
// Run it with:  npm run missing

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(folder) {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name).replaceAll('\\', '/');
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk('site-content').filter((file) => /\.(md|yaml)$/.test(file) && !/_(HOW-TO-FILL|UNSORTED|put-files-here)/.test(file) && !file.includes('cryptid'));
let total = 0;

for (const file of files.sort()) {
  const text = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const blanks = text.split(/\r?\n/).filter((line) => /\[[^\]"]*[A-Za-z…][^\]"]*\]/.test(line) && !/^\s*(roles|people|formats|tags|links|stats|brands|outputs):/.test(line));
  if (blanks.length === 0) continue;
  console.log(`\n${file}`);
  for (const line of blanks) {
    console.log(`  ${line.trim()}`);
    total += 1;
  }
}

console.log(`\n${total} blanks left. They stay hidden on the website until you fill them in.`);
if (!existsSync('site-content/about/portrait') || walk('site-content/about/portrait').every((file) => file.endsWith('.md'))) {
  console.log('Also missing: a portrait of you, in site-content/about/portrait/');
}
