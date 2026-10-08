# Graduate Placement Website

A static, information-only website for a 12-week graduate placement where graduates work with the central team across a range of areas. The site does not take applications.

Full requirements are in [`PRD.md`](PRD.md). **All company, people, quotes and skills details are dummy data** (fictional company "Brightpath Technologies") until you replace them.

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
| `*.html` | The pages (home, about, team, 12-week overview, how to apply, and so on) |
| `assets/site.css`, `assets/site.js` | Shared styles, and the script that builds the menu, footer and page sections from the data files |
| `src/config.js` | Site settings: names, start date, contact email, dummy-data banner |
| `src/data/overview.js` | The 12-week overview: educational and personal skills, and what each covers |
| `src/data/company.js` | About the company, including the central team and its areas of work |
| `src/data/team.js` | Meet the team |
| `src/data/feedback.js` | Previous graduate feedback |
| `src/data/content.js` | Objectives, eligibility, criteria, process steps, FAQs |

## Replacing the dummy content

1. Edit the files in `src/data/` (plain text inside quotes; keep the commas and brackets).
2. Edit `src/config.js`: company name, contact email, dates.
3. Decide how graduates will apply, then update the wording on the How to apply page (`how-to-apply.html`) and the first step in `src/data/content.js`.
4. Review `privacy.html` and `accessibility.html` (draft wording) with whoever handles data protection.
5. Set `usingDummyData: false` in `src/config.js` once everything is real. This removes the sample-content banner.
6. If you have no previous graduates yet, empty the `quotes` list in `src/data/feedback.js`: the feedback page and home highlight then hide the sample.

## Changing the colours

The site uses a dark blue theme. All colours are in the `:root` block at the top of `assets/site.css`. Change a value, save, then refresh the browser with Ctrl + F5. Keep light text on dark backgrounds readable (aim for good contrast).

## Before going public

- [ ] All dummy data replaced and `usingDummyData` set to `false`
- [ ] Written permission for every named person, photo and quote
- [ ] How graduates will apply decided, and the How to apply page updated
- [ ] Privacy notice and accessibility statement reviewed
- [ ] Checked on a phone and with the keyboard only
