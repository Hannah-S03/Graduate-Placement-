# Graduate Hub

A personalised digital hub that supports graduates throughout their scheme. It brings company information, placement details, development goals, learning, professional networks and progress tracking together in one place.

Full requirements are in [`PRD.md`](PRD.md). The mock-up company text, people, stories and networks have been removed from the Company hub: it shows the name Vesta Software Group, that the company has 3 portfolios, a **Key information** area (buttons to folders you add later), your graduate programme details, and key contacts with blank details for you to fill in. The learning catalogue, skills overview and programme wording are the draft programme details: check them before launch.

## What graduates can do

| Page | What it does |
|---|---|
| **My profile** (home) | The programme progress bar, **weekly goals**, a small **progress update** (with a copy-to-share button), a **calendar of upcoming events and reminders** (with calendar files), overall progress, reminders, pinned links, and backup and restore. A sentence under the progress bar says how far through the programme you are (a quarter, half way, three quarters ...) and updates every week. A round **AI agent** button (see below) opens the week-ahead overview |
| **My journey** | Add development, career and placement goals; each goal holds tasks marked not started, in progress or completed, with comments |
| **My development** | Record milestones and rate skills at the start and now, with a **skills chart** (radar or bars, with a table version) |
| **Quick links** | Pin company systems and resources, and add your own |
| **Learning** | Required training with reminders (and calendar files), saved courses and opportunities |
| **Company hub** | About the company (name and 3 portfolios), **Key information** (buttons to folders of material), your placement and the scheme objectives and skills, key contacts and your own network |
| **Meetings** | **1:1 meeting notes** (agenda, notes and actions, which can be turned into goal tasks, plus the next meeting date in your calendar) and a **feedback log** (who said what, what you will do about it, linked to a goal, and savable to your achievements). Meeting notes are private to the browser and are left out of the scheme record |
| **Reflection** | A note on what you learnt each week |
| **Achievements** | A portfolio of projects and accomplishments, with a printable and downloadable scheme record |

## Search, dark mode and celebrations

- **Search:** the magnifying-glass button in the header (or press **/**) opens a search box. It looks through your goals, tasks, comments, milestones, weekly goals, calendar events, reflections, achievements, learning, quick links, contacts and networks, and the company, team and help text. Everything is searched in the browser.
- **Dark mode:** the moon / sun button in the header switches between the light and dark theme. The choice is saved in this browser (`gradHub.theme`); without a choice the device's setting is followed. Printing is always light.
- **Page banners and menu icons:** each page opens with a navy banner showing its title and summary, and the menu has a small icon beside each page.
- **Celebrations:** a short message (and a brief gold highlight, which is switched off for people who prefer reduced motion) appears once when a goal is finished or a milestone is achieved, and a dismissible note appears on My profile when the programme is half way and when it is complete.

## The AI agent button (week ahead)

On **My profile** a round navy button labelled **AI agent** sits at the bottom right. Click it for your week ahead (Monday to Sunday, or next week at the weekend): up to six priorities (your tasks: in progress first, then the next task for each goal, the soonest goal first), meetings and events by day, deadlines and anything overdue. Required training modules are not listed as priorities; one line mentions any that are overdue. On a Monday a gold dot and a short note tell you it is ready until you have opened it that week.

- **Move it:** drag it anywhere on the screen (mouse or finger), or press **Alt** or **Shift** with an arrow key while it is selected, or use the **Move** buttons in the overview. **Reset position** puts it back. The position is remembered in this browser (`gradHub.agentPos`).
- **Email me this** opens a draft in your own email app (add your address under **Edit profile > Your email** to fill it in). **Copy text** copies the overview. **Add a Monday reminder to my calendar** downloads a repeating weekly calendar file (Mondays 08:30); set `hubUrl` in `src/config.js` to add the hub's address to it.
- **It is not a real AI.** It follows fixed rules over your own saved goals, tasks, calendar, 1:1 meetings, training and milestones, and says so in the overview. Nothing is sent anywhere.
- **What it cannot do:** send an email by itself on Monday morning, or write the text with a real AI. That needs a server or Microsoft 365 (Power Automate), access to each graduate's data, Vesta IT's agreement, an updated privacy notice and consent.

## Sharing progress with the programme team (opt-in, no server)

**Graduates:** on **My profile**, open **Share with the programme team**. Tick what to include (goal titles, weekly progress updates, weekly goals and weekly reflections are all off unless ticked; reflections are personal, so the panel says so), open **Preview exactly what will be in the file**, then **Download my progress summary** (or **Email it to the programme team**, which downloads the file and opens an email draft: attach the downloaded file). Never included: 1:1 meeting notes, the feedback log, contacts, career interests, email address and achievement details. Set `programmeTeamEmail` in `src/config.js` to address the draft (it falls back to `contactEmail`).

**Head of the programme:** open `admin.html` (for example `localhost:8000/admin.html`; it is not in the menu). **Load progress summaries** accepts many files at once and checks each one; a newer file for the same graduate replaces the older one and the older numbers stay in the trend. The **Cohort** table sorts by any column, filters by name or role and flags anyone with no update for two weeks or more. Click a name for the detail, the **Weekly reports** the graduate chose to share (week by week: progress update, weekly goals, reflection), a trend (with a table version) and your own dated **notes**. **Export** gives a CSV of the table, **Download a backup** saves summaries and notes, and **Clear everything** removes them from the browser.

**Setting goals for a graduate:** in a graduate's detail, **Goals set by the programme team** lets you add, edit and remove goals (tasks one per line; tick "Also add this goal for every other graduate" for cohort goals) and **Download goals file for <name>**. Send the file to the graduate; on **My journey** they open **Goals from the programme team**, choose it, check the preview and confirm. New goals get a "Set by the programme team" badge, later changes to the same goal update it, and the graduate's own task progress, comments and extra tasks are never overwritten. Goals you remove are not removed from their hub.

**Announcements and events:** in the Programme team view, **Announcements and events** lets you write messages and programme events for the whole cohort and **Download programme update file**. Send the file to the cohort; on My profile they open **Programme team update**, choose it, check the preview and confirm. Messages appear in **Messages from the programme team**, events appear in their calendar marked as programme events, and sending a newer file with the same items updates them. **This week's summaries:** paste everyone's names (one per line) to see who has sent a summary this week and who to chase. **Cohort overview** shows how far along the cohort is and the average progress by programme week.

Limits: it is manual (as fresh as the last file sent), the page has no login (it holds nothing until files are loaded, and everything stays in that browser, so use a Vesta-managed device), and the head's notes never reach graduates. Use dummy data until the privacy notice has been agreed. A live version (automatic reporting, sign-in, roles, an audit log) needs a server and Vesta IT, HR and data-protection agreement first.

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
| `*.html` | The pages (`admin.html` is the Programme team view, not in the menu) |
| `assets/site.css` | All styles, including the tile dashboard theme (light grey and white, navy, a hint of gold) and the print layout |
| `assets/site.js` | Header (menu, icons, search and dark-mode buttons), page banners, footer and the company, objectives, skills and FAQ sections |
| `assets/theme.js` | Sets the light or dark theme before the page is drawn |
| `assets/store.js` | Saves, checks, backs up and restores what graduates enter |
| `assets/hub/*.js` | `common.js` (shared helpers, including the celebration messages and the week-ahead rules), `agent.js` (the AI agent button), `admin.js` (the Programme team view), `search.js` (the header search), `meetings.js` (meetings and feedback) and one script per section |
| `src/config.js` | Names, programme start and end dates, contact email, optional `hubUrl`, dummy-data banner switch |
| `src/data/*.js` | Content you replace: `company`, `team`, `feedback`, `overview`, `content`, `placement`, `links`, `learning`, `networks` |

## Fixed company links

The links in `src/data/links.js` are built into the site for every graduate: each shows on **Quick links** with an **Open** button, marked "Company link". Graduates can pin them but cannot edit or delete them (they can only delete links they added themselves). "Key tools" is the group shown first, for the systems everyone uses most. To add another later, copy a line in that file, give it a new unique `id`, paste the address between the quote marks and save. Use plain web addresses, never a password. Most of these are sign-in pages, so each person uses their own login; setting up single sign-on is a Vesta IT job. Note: while each graduate has their own copy of the files they could change that copy, so the links are only truly fixed once the hub is hosted at one shared address (a later step with IT).

## Adding your real details

0. **Programme dates:** set `programmeStart` and `programmeEnd` in `src/config.js` (format `2026-09-01`). They drive the progress bar at the top of My profile and prefill each graduate's dates. The bar shows the current week out of the total weeks, so week 6 of 12 is 50%.
1. **Company text** (`src/data/company.js`): fill in any of `tagline`, `about`, `mission`, `values`, `size`, `culture`, `whyJoin`, and `portfolioNames` (the three portfolios). Empty ones are not shown.
2. **Key information buttons** (`src/data/resources.js`): paste the folder address into each `url` (plain web addresses, never a password). Until you do, the button shows "Link to be added". Copy, rename or delete cards freely.
3. **Key contacts** (`src/data/team.js`): fill in `name`, `email` and `phone` for each role card; blank ones show "Contact details to be added".
4. **Contact email** (`src/config.js`): set `contactEmail` (and optionally `programmeTeamEmail`). The Help page shows "Contact details will be added here" until it is set.
5. **Quick links** (`src/data/links.js`) and **training** (`src/data/learning.js`: required training and `dueDays`): add real web addresses and items. The **required training** list is empty: the Learning page shows the note "All training modules complete, or equivalent." (change `trainingNote`, or add items with a due date, reminders and a progress bar, using the example in the file). The **learning catalogue** in the same file is empty: add courses and opportunities one per line (there is an example in the file).
6. Review `privacy.html` and `accessibility.html` (draft wording) with whoever handles data protection.
7. `usingDummyData` in `src/config.js` is `false`, so there is no sample-content banner. Set it to `true` only if you want the yellow banner back.

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

- [ ] Company text, key contacts, the contact email and the Key information folder links filled in
- [ ] Written permission for every named person or photo you add
- [ ] Required training, links and contacts checked
- [ ] Privacy notice and accessibility statement reviewed
- [ ] Checked on a phone and with the keyboard only
- [ ] Decided how the hub will be hosted and who can reach it
