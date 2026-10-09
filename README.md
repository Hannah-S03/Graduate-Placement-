# Graduate Hub

A personalised digital hub that supports graduates throughout their scheme. It brings company information, placement details, development goals, learning, professional networks and progress tracking together in one place.

Full requirements are in [`PRD.md`](PRD.md). **All company, people, links, learning and wording are dummy data** (the site is branded as Vesta Software Group, but every fact about the company, the people and the quotes is invented) until you replace them.

## What graduates can do

| Page | What it does |
|---|---|
| **My profile** (home) | The programme progress bar, **weekly goals**, a small **progress update** (with a copy-to-share button), a **calendar of upcoming events and reminders** (with calendar files), overall progress, reminders, pinned links, and backup and restore |
| **My journey** | Add development, career and placement goals and update their progress |
| **My development** | Record milestones and rate skills at the start and now |
| **Quick links** | Pin company systems and resources, and add your own |
| **Learning** | Required training with reminders (and calendar files), saved courses and opportunities |
| **Company hub** | Company information, the central team, placement details, key contacts and your own network |
| **Reflection** | A note on what you learnt each week |
| **Achievements** | A portfolio of projects and accomplishments, with a printable and downloadable scheme record |

## Where is the information saved?

**Only in the browser you use, on that device.** There is no login and no server. Nothing graduates enter is sent anywhere, and managers and the programme team cannot see it. This means:

- It does not follow a graduate to another browser or device.
- Clearing browser data can delete it. **My profile > My data > Download my data** saves a copy, and **Restore from a file** loads it again.
- On a shared computer, use **Reset everything** afterwards.

## Run it on your computer (localhost)

You need Python 3. No install step.

```bash
git clone https://github.com/Hannah-S03/Graduate-Placement-.git
cd Graduate-Placement-
python3 -m http.server 8000
```

On Windows use `python -m http.server 8000` (or `py -m http.server 8000`). Then open <http://localhost:8000>. Stop the server with `Ctrl+C`.

Only you can see the site while it runs this way. To share it with a cohort, upload the same files to a static host (GitHub Pages, Netlify, or your organisation's hosting) over HTTPS, with access restricted if it should be internal only. Saved data is per web address, so graduates start fresh when the address changes.

## Project layout

| Path | What it is |
|---|---|
| `*.html` | The pages |
| `assets/site.css` | All styles, including the tile dashboard theme (light grey and white, navy, a hint of gold) and the print layout |
| `assets/site.js` | Menu, footer and the company, objectives, skills and FAQ sections |
| `assets/store.js` | Saves, checks, backs up and restores what graduates enter |
| `assets/hub/*.js` | `common.js` (shared helpers) and one script per section |
| `src/config.js` | Names, programme start and end dates, contact email, dummy-data banner switch |
| `src/data/*.js` | Content you replace: `company`, `team`, `feedback`, `overview`, `content`, `placement`, `links`, `learning`, `networks`, `events` |

## Replacing the dummy content

0. **Programme dates:** set `programmeStart` and `programmeEnd` in `src/config.js` (format `2026-09-01`). They drive the progress bar at the top of My profile and prefill each graduate's dates. The bar shows the current week out of the total weeks, so week 6 of 12 is 50%.
1. Edit the files in `src/data/` (plain text inside quotes; keep the commas and brackets). In `links.js`, put real web addresses in `url`. In `learning.js`, set the real required training and `dueDays` (days after the start date).
2. Edit `src/config.js`: company name, contact email, placement length.
3. Review `privacy.html` and `accessibility.html` (draft wording) with whoever handles data protection.
4. Set `usingDummyData: false` in `src/config.js` once everything is real. This removes the sample-content banner.

## Changing the text size and spacing

The base text size is the `font-size: 14.5px` line on the `html` rule near the top of `assets/site.css`. Make it larger (for example `16px`) for roomier text, or smaller for a tighter page. Almost everything scales from it. Panel spacing is set on the `.panel` rule, and the page width in `--max`.

## Logo and branding (Vesta Software Group)

The site uses the Vesta Software Group logo and colours.

| File | What it is for |
|---|---|
| `assets/vesta-logo-white.png` | The logo in white (with the gold kept), transparent, for the navy header. This is what `logo` in `src/config.js` points to. |
| `assets/vesta-logo.png` | The original logo (navy and gold on white), for white backgrounds and documents. |
| `assets/vesta-icon.png` | The small V mark used as the browser-tab icon (`favicon` in `src/config.js`). |

To change them: replace the files (a transparent PNG about 40 px tall on screen works best) or point `logo` and `favicon` in `src/config.js` at new files. Set `logo: ""` for no logo. `logoShowsName: true` means the logo already contains the company name, so the header writes only "Graduate Hub" beside it; set it to `false` to write the company name too. `logoAlt` is what screen readers read out. Set `companyName` and `hubName` in `src/config.js`, and the company name in `src/data/company.js`.

## Changing the colours

All colours are in the `:root` block at the top of `assets/site.css`. Change a value, save, then refresh the browser with Ctrl + F5. The Vesta values are: `--navy` `#1C3B54` (RGB 28, 59, 84: header, footer, the programme card and the dark tiles), `--navy-mid` `#2B5A7E` (the lighter blue used in gradients), `--brand` `#1C3B54` (buttons and links) and `--accent` `#DEC100` (Vesta gold, RGB 222, 193, 0: thin lines, progress bar fills and tile markers; decoration only, so never use it for text on white). Keep text readable against its background (aim for good contrast).

## Before going public

- [ ] All dummy data replaced and `usingDummyData` set to `false`
- [ ] Written permission for every named person, photo and quote
- [ ] Required training, links and contacts checked
- [ ] Privacy notice and accessibility statement reviewed
- [ ] Checked on a phone and with the keyboard only
- [ ] Decided how the hub will be hosted and who can reach it
