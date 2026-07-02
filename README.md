# Matías A. Armella — personal website

Bilingual (English / Español), **tabbed** personal site. Static, no build step,
ready for **GitHub Pages**. All content lives in plain data files under `data/`.

## How it works
One page, **navigation by tabs**: only the active tab is shown (no endless
scrolling). The URL updates with `#` (e.g. `…/#contrib`), the back button works
and links are shareable. The moving **photo band** stays on top of every tab.
`assets/js/main.js` reads the JSON in `data/` and renders everything — you edit
data, not design.

```
site/
├── index.html              ← skeleton (rarely touched)
├── assets/css/style.css    ← styling (dark theme)
├── assets/js/main.js       ← renders the tabs (rarely touched)
├── data/                   ← ★ YOU EDIT THESE ★
│   ├── site.json           · tabs, UI text, language default, counter, CV switch, links
│   ├── profile.json        · name, home phrase, bio, positions, interests, contact
│   ├── research.json       · the "What I do" area cards
│   ├── publications.json   · papers: formal citation + a plain-language question
│   ├── projects.json       · active projects
│   ├── media.json          · press / outreach
│   ├── teaching.json       · courses + student supervision
│   └── photos.json         · every image: band, personal, fieldwork, lab, collections, outreach, heroBg
├── photos/ (+ photos/thumb)← images
└── preview-offline.html    ← double-click to preview locally (not needed on GitHub)
```

The 8 tabs: **Home · About me · What I do · Projects · Outreach · Some
contributions · Data & resources · Contact.** Each text field has `en` and `es`; the flag button
switches language instantly.

## Content intake (../contenido/)
A staging area organised by section lives at `Web_Pagina/contenido/` (outside
`site/`, so it is never deployed). Drop raw photos in each section’s
`imagenes/` folder and fill its `info.md` (captions ES/EN, texts, new papers).
Then ask to “update the site from /contenido” and the images are optimised and
wired into `site/photos/` + `data/`, keeping the moving band untouched.
`contenido/MANIFEST.md` indexes every image already on the site.

## Common updates

### Add a publication (Some contributions)
Add one block to `data/publications.json`. `q` is the plain-language question
shown on the "Some contributions" tab (links to the paper); the formal citation
appears in the collapsible full list. Newest `year` shows first automatically.
```json
{ "year": 2026, "authors": "Armella, M.A. & Coauthor, X.",
  "title": "Formal article title", "journal": "Journal, vol, pages",
  "link": "https://doi.org/…",
  "q": { "en": "The catchy question?", "es": "¿La pregunta gancho?" } }
```

### Add a photo
Put the file in `photos/` (and a square copy in `photos/thumb/` only if it goes
in the band). Then add a line to the right group in `data/photos.json`
(`band`, `personal`, `fieldwork`, `lab`, `collections` or `outreach`):
```json
{ "src": "photos/my_photo.jpg", "caption": { "en": "Caption", "es": "Epígrafe" } }
```
`heroBg` = the faint background image of the Home tab.

### Enable the CV download later
When the CV is ready: drop the PDF in the folder, set `config.cvEnabled` to
`true` in `data/site.json` and point `config.links.cv` to the file. The button
on "Some contributions" turns into a real download (it's disabled until then).

### Default tab / language
`data/site.json` → `config.defaultTab` (`"home"`) and `config.defaultLang`
(`"en"`).

## Visit counter
Public, no signup (counterapi.dev). Bucket name in
`data/site.json` → `config.counter.namespace`. Set `"enabled": false` to turn off.

## Preview & publish
- **Preview now:** double-click `preview-offline.html` (self-contained).
- **Real site:** it loads `data/*.json`, so opening `index.html` from `file://`
  is blocked by the browser — run a local server (`python -m http.server`) or
  just push to GitHub.
- **GitHub Pages:** upload the contents of this `site/` folder to the repo root
  (so `index.html` is at the top); Settings → Pages → Deploy from branch → main /
  root. Live at `https://matiarmella.github.io`.
