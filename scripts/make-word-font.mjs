// Makes a very small copy of the Nepali font that holds only the few words the design sets in it
// (सपना, चिया?, नमस्ते...). The full font is about 97 KB; this one is a few KB, so pages open faster.
//
// Run it again only if you add a NEW Nepali word to the list below:   node scripts/make-word-font.mjs
// The result is saved in src/assets/fonts/ and is uploaded with the site.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import subsetFont from 'subset-font';

// Every Nepali word that appears in the big display font. Add new ones here.
const WORDS = 'सपना चिया नमस्ते म आदित्य हुँ। सटीक कुरा';

const full = readFileSync('node_modules/@fontsource/tiro-devanagari-hindi/files/tiro-devanagari-hindi-devanagari-400-normal.woff2');
const small = await subsetFont(full, WORDS, { targetFormat: 'woff2' });
mkdirSync('src/assets/fonts', { recursive: true });
writeFileSync('src/assets/fonts/tiro-words.woff2', small);
console.log(`Saved src/assets/fonts/tiro-words.woff2: ${Math.round(small.length / 1024)} KB (the full font is ${Math.round(full.length / 1024)} KB)`);
