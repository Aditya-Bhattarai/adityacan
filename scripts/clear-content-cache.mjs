// Runs before every build (see "prebuild" in package.json).
// Astro keeps a saved copy of the content files (home.yaml, project.md and the rest) between builds.
// Cloudflare restores that saved copy on its next build, and once it kept the old home.yaml,
// so a change to the homepage clients did not appear on the site. Removing the copy makes every
// build read the content files fresh. Saved, resized pictures are kept, so builds stay quick.
import { rmSync } from 'node:fs';

rmSync('node_modules/.astro/data-store.json', { force: true });
