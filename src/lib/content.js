// Reads everything in site-content/ and prepares it for the pages.
// Rules it applies:
//   - Only projects with permission: "yes" appear.
//   - Anything still in [square brackets] is treated as empty, so it never shows.
//   - Media order follows file names (01_, 02_, ...). The rest of the name becomes the caption.
//   - All counts are worked out here, never typed by hand.

import { getCollection, getEntry } from 'astro:content';
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

const allImages = import.meta.glob('/site-content/**/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' });
const allPdfs = import.meta.glob('/site-content/**/*.pdf', { eager: true, query: '?url', import: 'default' });

// ---------- Small helpers ----------

/** True if a value is still a [placeholder] or empty. */
export function isBlank(value) {
  if (value === undefined || value === null) return true;
  const text = String(value).trim();
  return text === '' || /\[[^\]]*\]/.test(text);
}

/** Returns the value, or an empty string if it is still a placeholder. */
export function clean(value) {
  return isBlank(value) ? '' : String(value).trim();
}

const UPPERCASE_WORDS = { nepal: 'Nepal', india: 'India', chaudhary: 'Chaudhary', himalayan: 'Himalayan', javas: 'Java’s', sipvsnepse: 'SIP vs NEPSE', boudhanath: 'Boudhanath', durbar: 'Durbar', langtang: 'Langtang', kathmandu: 'Kathmandu', sip: 'SIP', nepse: 'NEPSE', emi: 'EMI', upi: 'UPI', tms: 'TMS', swf: 'SWF', vat: 'VAT', pan: 'PAN', evs: 'EVs', sebon: 'SEBON', nav: 'NAV', xirr: 'XIRR', rs: 'Rs', it: 'IT', nas: 'NAS', ii: 'II' };

/** Turns "01_truth-behind-pokhara-crash.jpg" into "Truth behind Pokhara crash". */
export function captionFromFile(path) {
  const name = path.split('/').pop().replace(/\.[^.]+$/, '').replace(/^\d+[_-]/, '');
  const words = name.split(/[-_ ]+/).map((word) => UPPERCASE_WORDS[word] ?? word);
  const text = words.join(' ').replace('NAS IT', 'NAS-IT').replace(' pokhara', ' Pokhara').replace('nepals', 'Nepal’s').replace('european union film festival nepal', 'European Union Film Festival Nepal');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function imagesIn(folder) {
  const prefix = `/site-content/${folder}/`;
  return Object.entries(allImages)
    .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, image]) => ({ image, caption: captionFromFile(path), path }));
}

/** All images directly inside a site-content folder, in file-name order. */
export const getImages = imagesIn;

function pdfsIn(folder) {
  const prefix = `/site-content/${folder}/`;
  return Object.entries(allPdfs)
    .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => {
      const base = path.replace(/\.pdf$/, '');
      const preview = Object.entries(allImages).find(([imagePath]) => imagePath.replace(/\.[^.]+$/, '') === base);
      return { url, caption: captionFromFile(path), preview: preview?.[1] };
    });
}

// ---------- Text settings ----------

/** Reads the words for one page from site-content/pages/<name>.yaml */
export async function getPage(name) {
  const entry = await getEntry('pages', name);
  return entry?.data ?? {};
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** The chapters, in the order of site-content/pages/chapters.yaml. Numbers and "next chapter" links come from that order. */
export function getChapters() {
  const chapters = parseYaml(readFileSync('site-content/pages/chapters.yaml', 'utf8')).map((chapter, index) => ({ ...chapter, number: ROMAN[index] }));
  return chapters.map((chapter, index) => ({ ...chapter, next: chapters[index + 1] ?? null }));
}

/** One chapter by its key, for example "film". */
export function getChapter(key) {
  return getChapters().find((chapter) => chapter.key === key);
}

/** Turns an Instagram link into a handle, like @name. */
export function handleFrom(url) {
  return `@${url.replace(/\/$/, '').split('/').pop()}`;
}

let settingsCache;
/** Your name, email and links from site-content/about/bio.md */
export function getSettings() {
  if (settingsCache) return settingsCache;
  const raw = readFileSync('site-content/about/bio.md', 'utf8');
  const [, front = '', body = ''] = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/) ?? [];
  const data = parseYaml(front);
  settingsCache = {
    name: clean(data.name) || 'Aditya Bhattarai',
    location: clean(data.location_public),
    email: clean(data.email_public),
    whatsapp: clean(data.whatsapp),
    linkedin: clean(data.linkedin),
    instagram: clean(data.instagram),
    instagramPhotos: clean(data.instagram_photos),
    youtube: clean(data.youtube),
    vimeo: clean(data.vimeo),
    calendly: clean(data.calendly),
    filmSchool: clean(data.film_school),
    years: clean(data.years_in_creator_scene),
    availableFrom: clean(data.available_from),
    bio: body.split(/\r?\n\r?\n/).map((paragraph) => paragraph.trim()).filter((paragraph) => paragraph && !isBlank(paragraph)),
  };
  return settingsCache;
}

// ---------- Video links ----------

/** Works out how a link plays. YouTube and Vimeo play on the page; anything else opens in a new tab. */
export function parseVideo(url, title = '') {
  const link = clean(url);
  if (!link) return null;
  const youtube = link.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (youtube) {
    const id = youtube[1];
    return { provider: 'youtube', id, url: link, title, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
  }
  const vimeo = link.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { provider: 'vimeo', id: vimeo[1], url: link, title, embed: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1` };
  return { provider: 'external', url: link, title };
}

let linkCache;
function getLinkTable() {
  if (linkCache) return linkCache;
  const rows = readFileSync('site-content/links.md', 'utf8').split(/\r?\n/).filter((line) => line.startsWith('|'));
  linkCache = rows
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 5 && cells[0] !== 'Project folder' && !/^-+$/.test(cells[0]))
    .filter((cells) => cells[4].toLowerCase() === 'yes')
    .map(([folder, title, url]) => ({ folder, ...parseVideo(url, clean(title)) }))
    .filter((row) => row.url);
  return linkCache;
}

// ---------- Projects ----------

function readSections(body = '') {
  const sections = {};
  const withoutNotes = body.replace(/<!--[\s\S]*?-->/g, '');
  for (const part of withoutNotes.split(/^## /m).slice(1)) {
    const [heading, ...rest] = part.split(/\r?\n/);
    sections[heading.trim()] = rest.join('\n').trim();
  }
  return sections;
}

const lines = (text = '') => text.split(/\r?\n/).map((line) => line.replace(/^-\s*/, '').trim()).filter((line) => line && !isBlank(line));

function readCredits(text) {
  return lines(text).map((line) => {
    const [role, ...name] = line.split(' — ');
    return { role: role.trim(), name: name.join(' — ').trim() };
  }).filter((credit) => credit.name);
}

// Short role names for filters and tags.
const ROLE_NAMES = {
  'Content Strategist': 'Strategist',
  'Motion Graphics': 'Motion',
  'Thumbnails & Covers': 'Thumbnails',
  'Production assets': 'Production',
  'Assistant Director': 'Assistant director',
  'Documentary Editor': 'Editor',
  'Course creator': 'Teacher',
};
export const ROLE_ORDER = ['Editor', 'Director', 'Writer', 'Strategist', 'Production', 'Motion', 'Thumbnails', 'Assistant director', 'Filmmaker', 'Colourist', 'Guide', 'Teacher', 'Photographer'];

/** The media tabs on a project page, in order. A tab only shows if it has files. */
const TABS = [
  { key: 'episodes', label: 'Episodes & trailers', folder: 'horizontal-videos', ratio: '16/9', min: '300px', sizes: '(max-width: 700px) 100vw, 33vw' },
  { key: 'reels', label: 'Reels', folder: 'vertical-videos', ratio: '9/16', min: '170px', sizes: '(max-width: 700px) 50vw, 20vw' },
  // noCaption: the picture speaks for itself. Its file name is only used for screen readers.
  { key: 'motion', label: 'Motion graphics', folder: 'motion-graphics', noCaption: true, ratio: '16/9', min: '300px', sizes: '(max-width: 700px) 100vw, 33vw' },
  { key: 'thumbs', label: 'Thumbnails', folder: 'thumbnails', noCaption: true, ratio: '16/9', min: '300px', sizes: '(max-width: 700px) 100vw, 33vw' },
  { key: 'covers', label: 'Vertical covers', folder: 'covers', noCaption: true, ratio: '9/16', min: '170px', sizes: '(max-width: 700px) 50vw, 20vw' },
  // natural: true keeps each picture's own shape, so tall photos aren't cropped.
  { key: 'stills', label: 'Stills', folder: 'stills', noCaption: true, natural: true, min: '300px', sizes: '(max-width: 700px) 50vw, 33vw' },
  { key: 'photos', label: 'Photos', folder: 'photos', noCaption: true, natural: true, min: '280px', sizes: '(max-width: 700px) 50vw, 33vw' },
  { key: 'assets', label: 'Brand assets', folder: 'assets', ratio: '4/3', min: '240px', sizes: '(max-width: 700px) 100vw, 25vw', contain: true },
];

function buildProject(entry) {
  const data = entry.data;
  const folder = entry.filePath.replaceAll('\\', '/').replace(/^.*?site-content\//, '').replace(/\/project\.md$/, '');
  const slug = folder.split('/').pop();
  const sections = readSections(entry.body);

  const videos = [
    parseVideo(data.links?.featured_video, clean(data.title)),
    ...(data.links?.more ?? []).map((url) => parseVideo(url)),
  ].filter(Boolean);
  const tableVideos = getLinkTable().filter((row) => row.folder === slug);
  const featuredVideo = videos[0] ?? tableVideos[0] ?? null;

  const tabs = TABS.map((tab) => {
    // A logo on its own is not worth a tab. It still shows in the page banner when there's no other picture.
    const items = imagesIn(`${folder}/${tab.folder}`).filter((item) => !(tab.key === 'assets' && /logo/.test(item.path)));
    return { ...tab, items, links: tab.key === 'episodes' ? tableVideos : [] };
  }).filter((tab) => tab.items.length + tab.links.length > 0);

  const documents = pdfsIn(`${folder}/documents`);
  const roles = (data.roles ?? []).filter((role) => !isBlank(role));
  const shortRoles = [...new Set(roles.map((role) => ROLE_NAMES[role] ?? role))];

  const find = (...names) => {
    for (const name of names) {
      const found = imagesIn(`${folder}/${name}`)[0];
      if (found) return found;
    }
    return null;
  };

  return {
    slug,
    folder,
    href: `/work/${slug}`,
    order: data.order ?? 999,
    title: clean(data.title),
    titleNepali: clean(data.title_nepali),
    tagline: clean(data.tagline),
    chapterKey: data.chapter,
    client: clean(data.client),
    clientLabel: clean(data.client_label),
    what: clean(data.what),
    people: (data.people ?? []).filter((person) => !isBlank(person)),
    roles,
    shortRoles,
    years: clean(data.years),
    format: clean(data.format),
    formats: (data.formats ?? []).filter((item) => !isBlank(item)),
    featured: Boolean(data.featured),
    screenplay: clean(data.screenplay),
    permission: data.permission,
    oneLiner: clean(sections['One-liner']),
    brief: clean(sections['The brief']),
    did: lines(sections['What I did']),
    results: [...(data.stats ?? []).filter((stat) => !isBlank(stat)), ...lines(sections['Results'])],
    credits: readCredits(sections['Credits']),
    video: featuredVideo,
    tabs,
    documents,
    // A wide image for cards and sharing. Logos are left out on purpose.
    cover: find('poster', 'thumbnails', 'stills', 'horizontal-videos', 'photos', 'motion-graphics', 'covers', 'vertical-videos'),
    wideImage: find('stills', 'thumbnails', 'horizontal-videos', 'photos', 'motion-graphics'),
    logo: find('assets'),
    // Logos don't count as work.
    mediaCount: tabs.filter((tab) => tab.key !== 'assets').reduce((total, tab) => total + tab.items.length + tab.links.length, 0) + documents.length,
  };
}

let projectCache;
/** Every project cleared for the site, in order. Unnamed or unapproved projects are left out. */
export async function getProjects() {
  if (projectCache) return projectCache;
  const entries = await getCollection('projects');
  const chapters = getChapters();
  projectCache = entries
    .map(buildProject)
    .filter((project) => project.permission === 'yes' && project.title)
    .sort((a, b) => a.order - b.order)
    .map((project) => ({ ...project, chapter: chapters.find((chapter) => chapter.key === project.chapterKey) }));
  return projectCache;
}

export async function getProject(slug) {
  return (await getProjects()).find((project) => project.slug === slug) ?? null;
}

/** Projects that count as portfolio entries. The grade slider project is a craft moment, not an entry. */
export async function getWorkProjects() {
  return (await getProjects()).filter((project) => project.slug !== 'colour-grading');
}

/** Up to `count` images for a chapter card, drawn evenly across its projects. */
export async function getChapterThumbs(chapterKey, count = 5) {
  const projects = (await getProjects()).filter((project) => project.chapterKey === chapterKey);
  const pools = projects.map((project) => [
    ...imagesIn(`${project.folder}/covers`),
    ...imagesIn(`${project.folder}/poster`),
    ...imagesIn(`${project.folder}/photos`),
    ...imagesIn(`${project.folder}/stills`),
    ...imagesIn(`${project.folder}/vertical-videos`),
  ]).filter((pool) => pool.length);
  const picked = [];
  for (let round = 0; picked.length < count && pools.some((pool) => pool[round]); round += 1) {
    for (const pool of pools) if (pool[round] && picked.length < count) picked.push(pool[round]);
  }
  return picked;
}

// ---------- Writing ----------

let writingCache;
export async function getWriting() {
  if (writingCache) return writingCache;
  const entries = await getCollection('writing');
  writingCache = entries.map((entry) => {
    const data = entry.data;
    const folder = entry.filePath.replaceAll('\\', '/').replace(/^.*?site-content\//, '').replace(/\/piece\.md$/, '');
    const slug = folder.split('/').pop().replace(/^screenplay-/, '');
    const text = (entry.body ?? '').trim();
    const pdf = pdfsIn(folder)[0];
    const words = text ? text.split(/\s+/).length : 0;
    return {
      slug,
      folder,
      href: `/writing/${slug}`,
      order: data.order ?? 999,
      title: clean(data.title),
      type: data.type,
      year: clean(data.year),
      description: clean(data.description),
      contentNote: clean(data.content_note),
      featured: Boolean(data.featured),
      pages: data.pages,
      project: clean(data.project),
      permission: data.permission,
      paragraphs: text.split(/\r?\n\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
      minutes: words ? Math.max(1, Math.round(words / 200)) : 0,
      pdf,
    };
  }).filter((piece) => piece.permission === 'yes' && piece.title && (piece.pdf || piece.paragraphs.length))
    .sort((a, b) => a.order - b.order);
  return writingCache;
}

// ---------- Testimonials ----------

/** Real quotes only. A person whose quote is still a [placeholder] or "requested" stays hidden. */
export function getTestimonials() {
  const raw = readFileSync('site-content/testimonials.md', 'utf8');
  return raw.split(/^## /m).slice(1).map((block) => {
    const [heading, ...rest] = block.split(/\r?\n/);
    const [name, ...title] = heading.split(' — ');
    const body = rest.join(' ');
    const quote = body.match(/"([^"]+)"/)?.[1] ?? '';
    const status = body.match(/status:\s*(\w+)/)?.[1] ?? '';
    return { name: name.trim(), title: title.join(' — ').trim(), quote, status };
  }).filter((item) => item.quote && !isBlank(item.quote) && item.status !== 'requested');
}
