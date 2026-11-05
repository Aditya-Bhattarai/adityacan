// SAFETY CHECK: stops private files from reaching GitHub or the website.
//
// It runs by itself before every website build and before every Git commit.
// If it finds a problem, it stops and names the file, so nothing gets uploaded.
//
// Run it yourself any time with:  npm run check-private

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

// Words that must never appear in the name of an uploaded file.
const BLOCKED_NAMES =
  /salary|payslip|pay-slip|certificate|loan|cover[-_ ]?letter|bank[-_ ]?(letter|statement)|investment[-_ ]?strategy|passport|citizenship|contract|invoice|proposal|workbook/i;

// File types that never belong on this website.
const BLOCKED_TYPES = new Set(['.doc', '.docx', '.xls', '.xlsx', '.csv', '.env', '.key', '.pem', '.ai', '.psd', '.mov']);

// PDFs are only allowed in these places. Any other PDF stops the upload.
const PDF_ALLOWED = [/^site-content\/02-film\/[^/]+\/documents\//, /^site-content\/about\/cv\//, /^site-content\/writing\//];

// Phrases that must never appear inside text files.
const BLOCKED_TEXT = /loan schedule|loan interest|salary certificate|dear sir\/madam/i;

// Top-level folders that must never be uploaded.
const BLOCKED_FOLDERS = /^(portfolio managed|portfolio unmanaged|design|website references)\//;

// Files allowed to mention the words above, because they describe the rules.
const TEXT_SCAN_SKIP = new Set(['scripts/check-private.mjs', '.gitignore', 'START-HERE.md', 'package-lock.json']);
const TEXT_TYPES = new Set(['.md', '.yaml', '.yml', '.astro', '.js', '.mjs', '.css', '.json', '.txt', '.html']);

function walk(folder) {
  if (!existsSync(folder)) return [];
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name).replaceAll('\\', '/');
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function filesToCheck() {
  if (process.argv.includes('--staged')) {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR -z', { encoding: 'utf8' });
    return output.split('\0').filter(Boolean);
  }
  return ['site-content', 'public', 'src'].flatMap(walk);
}

const staged = process.argv.includes('--staged');
const problems = [];

for (const file of filesToCheck()) {
  const type = extname(file).toLowerCase();

  // These local-only notes are never uploaded, so the website build may ignore them.
  if (!staged && file === 'site-content/_UNSORTED.md') continue;
  if (!staged && file.startsWith('site-content/02-film/cryptid-documentary/')) continue;

  if (BLOCKED_FOLDERS.test(file)) problems.push(`${file}: this folder must stay on your PC`);
  if (BLOCKED_NAMES.test(file)) problems.push(`${file}: the file name looks private`);
  if (BLOCKED_TYPES.has(type)) problems.push(`${file}: this file type is not allowed`);
  if (type === '.pdf' && !PDF_ALLOWED.some((rule) => rule.test(file))) {
    problems.push(`${file}: PDFs are only allowed in film documents, CV and writing folders`);
  }
  if (TEXT_TYPES.has(type) && !TEXT_SCAN_SKIP.has(file) && existsSync(file) && BLOCKED_TEXT.test(readFileSync(file, 'utf8'))) {
    problems.push(`${file}: the text looks private`);
  }
  if (staged && (file === 'site-content/_UNSORTED.md' || file.includes('cryptid-documentary'))) {
    problems.push(`${file}: this must stay on your PC`);
  }
}

if (problems.length > 0) {
  console.error('\nSTOPPED: private files found. Nothing was uploaded.\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nMove these files out of the project, then try again.\n');
  process.exit(1);
}

console.log('Safety check passed: no private files found.');
