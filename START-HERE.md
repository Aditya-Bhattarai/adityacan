# Your website: start here

This is the full code for adityacan.com. You don't need to know how to code to change most of it.

**The golden rule: your words and pictures live in `site-content/`. You can do almost everything from there.**

---

## Where everything is

| Folder | What's in it | Do you edit it? |
|---|---|---|
| `site-content/pages/` | The words on each page, one file per page | **Yes, often** |
| `site-content/about/bio.md` | Your bio, email, phone and social links | **Yes** |
| `site-content/links.md` | Your YouTube and Vimeo links | **Yes, often** |
| `site-content/01-strategy-content/` and other chapter folders | One folder per project, with its text and images | **Yes, often** |
| `site-content/writing/` | Screenplays and stories | **Yes** |
| `src/styles/tokens.css` | Colours and fonts for the whole site | Sometimes |
| `src/pages/` | The layout of each page | Only if you want to change a layout |
| `src/components/` | Shared pieces: navigation, footer, project cards | Rarely |
| `src/scripts/` | The small interactions: timecode, filters, tabs | Rarely |
| `src/lib/content.js` | Reads your content and hands it to the pages | Rarely |
| `portfolio managed/`, `portfolio unmanaged/` | Your original files. Never uploaded | Leave alone |

---

## Common changes

### Change words on a page
Open the matching file in `site-content/pages/` and change the text after the colon.
For example, the homepage headline is `title:` in `site-content/pages/home.yaml`.

### Change words on the redesigned pages (November 2026)
Home, Films, For creators, Classes, Near Mountains, Me, The museum and Everything keep their words at the top of their own file in `src/pages/`, under a line that says WORDS. Change the text between the quotes and save. Their photos are in `src/assets/day/`.

### Add a new Nepali word in the big display font
The site carries a very small font file with only the Nepali words it shows large (like सपना). For a new one, add the word to the list in `scripts/make-word-font.mjs`, or just ask Claude to do it.

### Fill in your contact details
Open `site-content/about/bio.md`. Replace anything in `[square brackets]` with the real value.
**Anything still in `[square brackets]` stays hidden on the website**, so nothing half-finished ever shows.

### Add a video
Add one line to `site-content/links.md`. Copy an existing line and change it.
To make it the main video on a project page, paste the link into `featured_video` in that project's `project.md`.

### Add images to a project
Drop them into the project's folder:
`thumbnails/`, `covers/`, `vertical-videos/`, `horizontal-videos/`, `stills/`, `photos/`, `assets/`

File names control everything. `01_truth-behind-pokhara-crash.jpg` shows first, with the caption "Truth behind Pokhara crash".
Tabs appear by themselves when a folder has files in it. Counts update by themselves too.

### Add a new project
Copy any project folder, rename it, and edit its `project.md`. A new page appears automatically.

### Hide a project
In its `project.md`, change `permission: "yes"` to `permission: "ask"`.

### Add your portrait
Put the photo in `site-content/about/portrait/`. The first one by file name is the big photo on the About page.

Two more photos are used elsewhere: `site-content/about/avatar/` is the small round face on the Contact page (use a square photo), and `site-content/about/more-photos/` is the photo in the "Why work with me" band on the homepage, now your home editing setup. Any shape of photo works there. Replace a file to change it.

### Show the 15M+ number
In `site-content/pages/home.yaml`, under `stats`, change `show: false` to `show: true` for 15M+.

### Add a real testimonial
Open `site-content/testimonials.md`. Replace `[quote]` with the real words and change `requested` to `approved`.
The testimonials section appears on the homepage once at least one is real.

### Replace the hero video
Replace `hero-tall.mp4`, `hero-tall.webm` and `poster-tall.jpg` in `site-content/00-home/hero-reel/` using the same file names. The video must be tall (9:16) and under about 12 MB. It loads after the page has appeared, so it doesn't slow the first view.

Every screen uses the tall video. `hero-wide.mp4`, `hero-wide.webm` and `poster-wide.jpg` are no longer used and don't go on the site.

`share-card.jpg` in the same folder is the picture people see when you send a link to the site in WhatsApp, LinkedIn or anywhere else. Replace it to change that preview (1200 × 630 pixels). Apps remember old previews for a while, so a change can take a few days to show.

### Change the order of the chapters
Open `site-content/pages/chapters.yaml` and move a whole block up or down. Chapter numbers, menus and "next chapter" links update by themselves. Folder names like `02-film` don't affect the order.

### Add or change a client logo on the homepage
Put the logo in `site-content/clients/logos/`, named after the project folder, for example `viewfinders.png`. No file means the client's initials show instead.

### Change the photos on the Services page
Replace the files in `site-content/services/process-photos/`. The first four show.

### Change a colour or font
Open `src/styles/tokens.css`. Every colour is named there. Change it once and it changes everywhere.

---

## Keeping private files private

Three safeguards protect you:

1. **`.gitignore` blocks everything by default.** Only the items it lists can reach GitHub. Your `portfolio` folders are not on that list.
2. **A safety check runs before every build and every commit.** It stops the upload if a file looks like a bank letter, salary letter, cover letter, contract or similar.
3. **PDFs are only allowed in** film document, CV and writing folders.

Never put private documents inside `site-content/`. Check any time with `npm run check-private`.

---

## Asking Claude from your phone

You can just describe what you want, for example:

- "Add this YouTube link to Satik Kura: ..."
- "Change the homepage headline to ..."
- "Hide the Hamro Motors project for now."
- "What's still missing on the site?"

Claude edits the files, tests them and uploads them. Cloudflare then publishes the site by itself.

---

## If you want to run it yourself on the PC

Open a terminal in this folder, then run one of these:

| Command | What it does |
|---|---|
| `npm run dev` | Opens a live preview at http://localhost:4321. It also shows labelled reminders for anything missing |
| `npm run missing` | Lists every blank still waiting to be filled in |
| `npm run build` | Makes the finished site in the `dist` folder |
| `npm run check-private` | Runs the safety check |

---

## How publishing works

1. Changes are uploaded to GitHub (the repo `Aditya-Bhattarai/adityacan`, branch `main`).
2. Cloudflare sees the upload and runs `npm run build`, then `npx wrangler deploy`.
3. The new version goes live, usually within two minutes.

The live site runs on Cloudflare, so it stays up even when your PC is off.
