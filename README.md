# Ghaith Audi · Portfolio

A static Next.js portfolio in the "Blueprint" design, with a built-in content dashboard. It deploys to GitHub Pages for free.

- **Homepage:** hero, all nine projects as device-mockup cards, how I build software, experience, technical stack, contact.
- **Case studies:** one page per project at `/projects/<slug>/`, with the full technical depth.
- **Dashboard:** `/admin/` edits every word, image, project and the CV. Each save becomes a commit, and the site rebuilds itself.

No server, database or paid service is involved. Content lives in JSON files in this repository.

---

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into ./out
npm run preview    # serve ./out like GitHub Pages, http://localhost:4173
```

## Deploy to GitHub Pages (free)

1. **Create a public repository** on GitHub named **`GhaithAudi.github.io`**. That name makes the site live at `https://ghaithaudi.github.io/`. Any other name also works; the site then lives at `https://ghaithaudi.github.io/<name>/`, and the build adjusts every link automatically.
2. **Push this folder** (it is already a git repository with one commit):
   ```bash
   git remote add origin https://github.com/GhaithAudi/GhaithAudi.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab. The *Deploy to GitHub Pages* workflow runs on every push to `main` and takes one to three minutes. If the first run started before step 3, re-run it.

Free GitHub accounts can only publish Pages from **public** repositories, so everything committed here is public. The private research notes in `collecting/` are excluded by `.gitignore`. Keep it that way: they contain security findings and client details.

### Custom domain (optional)

Buy a domain, add it under **Settings → Pages → Custom domain**, and follow GitHub's DNS instructions. Nothing in the code needs to change.

## Use the dashboard

1. Create a **fine-grained personal access token** at <https://github.com/settings/personal-access-tokens/new>:
   - **Repository access:** Only select repositories, then pick this repository.
   - **Permissions:** *Contents: Read and write*, and *Actions: Read-only* (for deploy status).
   - **Expiration:** your choice. When it expires, create a new one and sign in again.
2. Open `https://ghaithaudi.github.io/admin/`, paste the token and sign in. The repository name is filled in automatically on the deployed site.
3. Edit, check the **Preview** tab, then **Save & publish**. The top bar follows the deploy until it says *Live ✓*.

The token stays in your browser, in session storage by default or local storage if you tick "Remember on this device". It is only ever sent to `api.github.com`. Don't tick "Remember" on a shared computer.

What you can manage:

| Area | Where in the dashboard |
|---|---|
| Name, role lines, introduction, portrait, availability, hero facts | Site → Profile & hero |
| Email, LinkedIn, GitHub, **CV (PDF)**, contact section, footer | Site → Contact & CV |
| Section titles, the five build steps, experience timeline, stack groups | Site → Homepage sections |
| Site title, description, keywords | Site → SEO |
| Add, reorder, delete projects | Projects → All projects |
| Card text, status, tags, screenshots, schematics | Project → Card |
| Overview, role, architecture, implementation, decisions, challenges, results, stack | Project → the other tabs |

The **Download CV** buttons appear automatically once a CV is published (Site → Contact & CV).

## Screenshots

Cards for live projects show real screenshots in `public/projects/<slug>/`. To refresh them, or to capture OVACS and 4longAge (their servers weren't reachable when the site was built), run:

```bash
npm i --no-save puppeteer-core     # one-time, not a site dependency
npm run screenshots                # every project with a live URL
npm run screenshots -- ovacs       # one project
```

Then set the paths in the dashboard (Project → Card → Device mockup), or in the project JSON:

```json
"visual": {
  "desktop": "/projects/ovacs/desktop.webp",
  "mobile": "/projects/ovacs/mobile.webp",
  "full": "/projects/ovacs/full.webp"
}
```

You can also upload screenshots directly in the dashboard; they are resized and converted to WebP in the browser. Private deployments show a schematic instead, labelled as a schematic, so no screen is ever faked.

## Project structure

```
content/
  site.json                 homepage text, contact, experience, stack, SEO
  projects/<slug>.json      one file per project: card + full case study
public/
  images/                   portrait
  projects/<slug>/          screenshots
  cv/                       CV uploaded from the dashboard
  og.png                    social sharing image
src/
  app/                      pages: /, /projects/[slug], /admin, sitemap, robots
  components/               hero, cards, device mockups, case study, sections
  components/diagrams/      architecture diagrams and device-screen schematics (SVG)
  admin/                    dashboard: GitHub client, forms, editors
  lib/                      content loading, types, paths
scripts/
  postbuild.mjs             fixes Next 16 prefetch file names for static hosting
  serve.mjs                 local preview of ./out
  capture-screenshots.mjs   real screenshots of live projects
.github/workflows/deploy.yml
```

## Where the old concept's content went

This site restructures the Blueprint concept into a short homepage plus deep case studies. Nothing was dropped.

| Concept A content | New location |
|---|---|
| Cover: name, role, photo with dimension lines | Homepage hero, shorter copy |
| Title block (8 cells) | Four hero facts |
| Drawing register (9 rows) | Nine homepage project cards with device mockups |
| Sheets: diagrams, descriptions, metrics, role, stack | Each project's case study: Architecture, Role, Results, Stack |
| Construction details D1–D4 (code and decisions) | Case studies → Engineering decisions (OVACS, 4longAge, Dentecs, AGS KSA) |
| Revision history | Homepage → Experience timeline |
| Specifications ("Materials") | Homepage → Technical stack (short) and per-project stacks |
| "Issued for hire" contact | Homepage → "Have a system to build?" |
| Research briefs in `collecting/` | Case-study detail, with anything marked private left out |
