// The redesign's own photographs and short silent clips, kept in src/assets/day/.
// Use: day('best/lt_hat2.jpg') for a picture, clip('best/loop_icefall.mp4') for a clip's address.

const pictures = import.meta.glob('/src/assets/day/**/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
const clips = import.meta.glob('/src/assets/day/**/*.mp4', { eager: true, query: '?url', import: 'default' });

/** One picture by its path inside src/assets/day/. Stops the build with a clear message if the file is missing. */
export function day(path) {
  const found = pictures[`/src/assets/day/${path}`];
  if (!found) throw new Error(`Picture not found: src/assets/day/${path}`);
  return found;
}

/** The web address of one clip inside src/assets/day/. */
export function clip(path) {
  const found = clips[`/src/assets/day/${path}`];
  if (!found) throw new Error(`Clip not found: src/assets/day/${path}`);
  return found;
}

/** Places an item on the 1440 wide design board: left, top, width, and an optional tilt in degrees. */
export function at(x, y, w, tilt = 0) {
  return `--x:${x};--y:${y};--w:${w}${tilt ? `;--r:${tilt}deg` : ''}`;
}
