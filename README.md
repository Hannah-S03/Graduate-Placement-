# Graduate Placement Website

A static website for a 12-week graduate placement that rotates across teams. Applications are collected with a Google Form embedded on the Apply page.

Full requirements are in [`PRD.md`](PRD.md). **All company, people, quotes and week details are dummy data** (fictional company "Brightpath Technologies") until you replace them.

## Run it on your computer (localhost)

You need Python 3 (or any simple web server). No install step.

```bash
git clone https://github.com/Hannah-S03/Graduate-Placement-.git
cd Graduate-Placement-
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Stop the server with `Ctrl+C`.

Only you can see the site while it runs this way. To make it public later, upload the same files to a static host (GitHub Pages, Netlify, or your organisation's hosting).

## Project layout

| Path | What it is |
|---|---|
| `*.html` | The pages (home, about, team, week by week, apply, and so on) |
| `assets/site.css`, `assets/site.js` | Shared styles, and the script that builds the menu, footer and page sections from the data files |
| `src/config.js` | Site settings: applications open/closed, closing date, contact email, **Google Form link**, dummy-data banner |
| `src/data/weeks.js` | The 12 weeks |
| `src/data/company.js` | About the company |
| `src/data/team.js` | Meet the team |
| `src/data/feedback.js` | Previous graduate feedback |
| `src/data/content.js` | Objectives, eligibility, criteria, process steps, FAQs |
| `docs/application-form.md` | Question list and checklist for creating the Google Form |

## Replacing the dummy content

1. Edit the files in `src/data/` (plain text inside quotes; keep the commas and brackets).
2. Edit `src/config.js`: company name, contact email, dates.
3. Create the Google Form (see `docs/application-form.md`) and paste its embed link into `googleFormUrl` in `src/config.js`.
4. Review `privacy.html` and `accessibility.html` (draft wording) with whoever handles data protection.
5. Set `usingDummyData: false` in `src/config.js` once everything is real. This removes the sample-content banner.
6. If you have no previous graduates yet, empty the `quotes` list in `src/data/feedback.js`: the feedback page and home highlight then hide the sample.

## Opening and closing applications

In `src/config.js`, set `applicationsOpen` to `false` to show a "closed" message on the Apply page.

## Before going public

- [ ] All dummy data replaced and `usingDummyData` set to `false`
- [ ] Written permission for every named person, photo and quote
- [ ] Google Form tested; test responses deleted
- [ ] Privacy notice and accessibility statement reviewed
- [ ] Checked on a phone and with the keyboard only
