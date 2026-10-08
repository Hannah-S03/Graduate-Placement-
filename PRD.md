# Product Requirements Document: Graduate Hub

| | |
|---|---|
| **Status** | Draft v3: the site is now a personalised hub for current graduates |
| **Owner** | Hannah Sullivan |
| **Last updated** | 2026-10-08 |

> **About the dummy data.** The company ("Brightpath Technologies"), people, quotes, links, learning, networks and wording are **invented sample content** so the layout can be reviewed. Replace all of it before launch. A banner on every page says so while `usingDummyData` is `true` in `src/config.js`.

Items marked **[ASSUMPTION]** are unconfirmed. Open questions are in section 15.

---

## 1. Summary

A personalised digital hub that supports graduates **throughout their scheme**, bringing company information, placement details, development goals, learning, professional networks and progress tracking together in one place. Each graduate gets their own profile, goals, milestones, learning plan, reflections and achievement portfolio. Everything they enter is **saved only in their own browser** (no login, no server).

## 2. Decisions so far

| Question | Decision |
|---|---|
| Audience | **Current graduates only.** Recruitment pages and the application form were removed |
| Placement model | One central team: graduates gain experience and exposure in a range of areas within it (no rotations) |
| Personalisation and data | **Saved in each person's own browser** (local storage). Private to that browser; not visible to managers or the programme team |
| Look | Dark blue theme (deep navy background, light text, bright blue accent) |
| Build | Static site (HTML, CSS, JavaScript), no backend; runs on localhost first, hosting chosen later |
| Documentation | Everything in this one file, `PRD.md` |

## 3. Problem and goals

Graduates juggle goals, training deadlines, learning ideas, contacts and reflections in many places, and often cannot show later what they achieved. The hub gives them one place to plan, track and record their scheme.

**Goals**
1. One personal home page showing where they are (week X of 12) and how they are progressing.
2. Make it easy to set goals, record milestones, keep reflections and build an achievement record.
3. Keep company information, key contacts and everyday systems one click away.
4. Never miss required training: show clear reminders.
5. Meet accessibility and privacy expectations from day one.

**Non-goals (this version)**
- Sign-in, accounts, or data shared across devices
- Manager, mentor or programme-team views of progress
- Push or email notifications (reminders appear in the hub, with downloadable calendar files)
- Uploading files (achievements link to evidence instead)
- Recruitment or application features

## 4. Users

| User | Needs | Key tasks |
|---|---|---|
| Graduate | One simple place to plan, track and record their scheme, privately | Set up a profile, set goals, record milestones, rate skills, save learning, keep contacts, write weekly reflections, record achievements, take a copy of their data |
| Programme lead (indirect) | Graduates who stay organised and complete required training | Maintains the content in the data files (company, links, learning, networks) |
| Site editor | Update content without a developer | Edit the files in `src/data/` and `src/config.js` |

**[ASSUMPTION]** Graduates use their own or an assigned laptop with a normal (not private) browser window.

## 5. The hub: sections and requirements

Menu: **My profile · My journey · My development · Quick links · Learning · Company hub · Reflection · Achievements**. Footer: Help, Privacy notice, Accessibility statement.

Priority: **P0** required, **P1** should have, **P2** nice to have.

### 5.1 My profile (home) `index.html`
| ID | Requirement | Priority |
|---|---|---|
| H1 | First visit shows a short setup form (name, role or area, placement start date, manager, mentor, career interests); name and start date required | P0 |
| H2 | Profile card with initials avatar and an edit option | P0 |
| H3 | Placement panel: **Week X of 12** with a progress bar; "Starts in N days" before the start; "Placement complete" after week 12 | P0 |
| H4 | **Overall progress tracker** with separate bars for goals, milestones and required training, and an explanation of how it is worked out (section 6) | P0 |
| H5 | **Reminders**: overdue or due-soon training, goals and milestones nearly due, planned learning in the next 7 days, and this week's reflection | P0 |
| H6 | Pinned links, next goals and latest achievements | P1 |
| H7 | **My data**: Download my data (JSON file), Restore from a file (validated, with confirmation), Reset everything (with confirmation) | P0 |

### 5.2 My journey `journey.html`
| ID | Requirement | Priority |
|---|---|---|
| J1 | Add, edit and delete goals of three types: **Development, Career, Placement**, each with title, details and optional target date | P0 |
| J2 | **Update progress** from 0 to 100% in steps of 5, with an optional note; keep a dated progress history | P0 |
| J3 | Status derived from progress (not started, in progress, done); overdue and due-soon badges on target dates | P0 |
| J4 | Summary per type; filter by type and status | P1 |
| J5 | One-click suggested goals based on the skills | P2 |

### 5.3 My development `development.html`
| ID | Requirement | Priority |
|---|---|---|
| D1 | **Milestones**: title, date, planned or achieved, optional skill and linked goal, notes; mark achieved; edit; delete; shown in date order | P0 |
| D2 | **Skills self-assessment**: rate confidence 1 to 5 for each of the 11 skills at the start and now, with the change shown; saves automatically | P0 |
| D3 | Summary: milestones achieved, skills rated, average skill growth | P1 |

### 5.4 Quick links `links.html`
| ID | Requirement | Priority |
|---|---|---|
| Q1 | Library of company systems and resources by category; **pin and unpin**; pinned links appear first and on My profile | P0 |
| Q2 | **Add your own links** (only `http` and `https` addresses accepted; opened in a new tab safely) and delete them | P0 |
| Q3 | Search; links without a real address show "Link to be added" | P1 |

### 5.5 Learning `learning.html`
| ID | Requirement | Priority |
|---|---|---|
| L1 | **Required training** list with due dates worked out from the start date, a status (not started, in progress, complete) and reminder badges (due soon, overdue, done) | P0 |
| L2 | **Add to calendar**: download a calendar file (.ics) for one item or all outstanding items, with an alert 3 days before | P1 |
| L3 | **Courses and development opportunities** catalogue (courses, workshops, shadowing, events, mentoring, stretch projects); filter by type and skill; **Save** | P0 |
| L4 | "My saved learning": status (saved, in progress, completed), planned date, remove; planned dates in the next 7 days appear as reminders | P0 |
| L5 | Add your own course or opportunity | P1 |

### 5.6 Company hub `company.html`
| ID | Requirement | Priority |
|---|---|---|
| C1 | About the company: mission, values, culture, size and locations | P0 |
| C2 | The central team and its areas of work | P0 |
| C3 | **My placement**: at a glance (including the graduate's start date, manager and mentor), key moments, scheme objectives, and the **12-week overview of educational and personal skills** | P0 |
| C4 | **My network, key contacts**: pre-filled key people with why to contact them, plus the graduate's own contacts (add, edit, delete, search) | P0 |
| C5 | Networks and groups (inside and outside the company); stories from past graduates | P1 |

### 5.7 Reflection `reflection.html`
| ID | Requirement | Priority |
|---|---|---|
| R1 | A 12-week grid (current week highlighted, written weeks marked); one reflection per week with **What I learnt** (required), what went well, what was hard, and focus for next week | P0 |
| R2 | Edit or delete any week's reflection; list of all reflections; count of weeks reflected so far | P0 |

### 5.8 Achievements `achievements.html`
| ID | Requirement | Priority |
|---|---|---|
| A1 | Add projects and accomplishments: title, type (project, accomplishment, presentation, recognition, certificate, feedback received), date, skills shown, what I did, result or impact, what I learnt, optional evidence link | P0 |
| A2 | Newest first; filter by type and skill; edit; delete | P0 |
| A3 | **Scheme record**: Print / save as PDF (print-friendly layout) and Download my scheme record (readable text file: profile, goals, milestones, skills, training, learning, achievements, reflections; contacts are excluded) | P1 |

### 5.9 Help, privacy, accessibility
Help has graduate FAQs and the programme contact. The privacy notice (draft) explains browser-only storage. The accessibility statement (draft) commits to WCAG 2.2 AA.

## 6. How "overall progress" is worked out

Overall progress is the **average of the parts that have something in them**: goals progress (average % across all goals), milestones (share achieved) and required training (share complete). A part with nothing yet is left out of the average. Each part is also shown on its own bar. The placement timeline (week X of 12) is shown separately.

## 7. Data and storage

- All information is stored in the browser's local storage under one key (`gradHub.v1`) as JSON: profile, goals (with progress history), milestones, skill ratings, pinned and custom links, saved and custom learning, training status, contacts, weekly reflections and achievements.
- **Limits graduates are told about:** it stays on that browser and device; it does not follow them to another device; clearing browser data can delete it; managers and the programme team cannot see it.
- **Backup:** Download my data and Restore from a file. Restoring validates the file and asks for confirmation first; a wrong or corrupted file is rejected without changing anything.
- **Resilience:** if saving is blocked, every page still works and shows a notice. If stored data cannot be read, a copy is kept under a backup key and the hub starts fresh with a notice.
- Everything a user types is displayed as plain text. Links accept only `http` and `https` addresses. Text fields are length-limited.

## 8. Privacy and security

- The site has no server, no accounts, no analytics and no cookies by default. Nothing a graduate enters is transmitted.
- The contacts a graduate adds are other people's details stored on their device. The privacy notice advises adding only what is needed.
- **Shared or managed computers are a risk:** anyone with access to the browser profile could see the data. The privacy notice tells graduates to reset the hub on shared computers.
- The privacy notice is a draft and must be reviewed by whoever handles data protection before launch.

## 9. Accessibility and quality requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.2 AA: keyboard operation, visible focus, a skip link, every control labelled, errors and saves announced politely to screen readers, no information by colour alone, reduced motion respected |
| Colour | Dark blue theme; all text and link colour pairs checked at 4.5:1 or better (lowest measured 6.4:1) |
| Responsive | Works from 320 px wide phones to desktop; long text wraps instead of scrolling sideways |
| Forms | Real labels, inline error messages, confirmations on the page (no pop-up alerts); delete and reset always ask first |
| Print | Achievements page prints cleanly on a white background without menus or buttons |
| Browsers | Latest two versions of Chrome, Safari, Edge and Firefox; iOS Safari and Android Chrome |
| Performance | No frameworks or build step; small pages |

## 10. Build approach

Static site: plain HTML, CSS and JavaScript, no build step or server.

| Path | What it is |
|---|---|
| `*.html` (11 pages) | The hub pages plus Help, Privacy and Accessibility |
| `assets/site.css`, `assets/site.js` | Styles; menu, footer and the shared company, objectives, skills and FAQ renderers |
| `assets/store.js` | The storage module: load, save, validate, back up, restore, reset, date and week helpers |
| `assets/hub/*.js` | `common.js` (forms, progress, reminders) and one script per section |
| `src/config.js` | Names, placement length, contact email, dummy-data banner switch |
| `src/data/*.js` | Content: company, team, feedback, overview, content, placement, links, learning, networks |

**Run locally:** `python -m http.server 8000` in the project folder (Windows) or `python3 ...` (Mac/Linux), then open `http://localhost:8000`. See `README.md`. **Public hosting later:** deploy the same files to a static host with HTTPS (and an access restriction if it should be internal only).

## 11. Milestones

| Milestone | Deliverable |
|---|---|
| M0 Confirm | Open questions answered; real content gathered |
| M1 Hub draft | All sections built with dummy data on localhost (**this version**) |
| M2 Real content | Dummy data replaced; links, training and contacts checked |
| M3 Quality | Accessibility audit, privacy review, test with real graduates |
| M4 Launch | Hosted (access restricted if internal); graduates onboarded |
| M5 Review | Gather feedback; decide whether to add accounts or manager views |

## 12. Risks

| Risk | Mitigation |
|---|---|
| Graduates lose their data (cleared browser data, new device) | Clear warnings, Download my data and Restore, FAQs; consider real accounts later |
| Shared or managed computers expose or wipe data | Privacy notice guidance; confirm how graduates' devices are managed |
| Managers expect to see progress | Explain plainly that the hub is private; scope manager views as a separate project |
| Dummy content published by mistake | Banner on every page; checklist in README |
| Reminders are in-page only | Calendar files for training; consider email reminders in a later version |
| Content goes stale (links, training, contacts) | Name a content owner; content is plain data files |

## 13. Out of scope for this version
Sign-in, shared or manager views, notifications, syncing across devices, file uploads.

## 14. Dummy content to replace
Company details, the central team and areas, people and key contacts, graduate quotes, the skills overview wording, placement details and key moments, company links, required training and due-day rules, learning catalogue, networks and groups, FAQs, contact email.

## 15. Open questions

1. Real content to replace all dummy data (see section 14), and who owns keeping it up to date.
2. Required training: the real list and due-day rules.
3. Will graduates use shared or managed computers? (Browser-saved data is per browser and could be cleared by IT policy.)
4. Will managers or the programme team later need to see progress? (That needs real accounts and a hosted backend, and data-protection review.)
5. Hosting option and custom domain, and whether access must be restricted to the company.
6. Organisation name and brand (the site currently uses a dark blue theme), and the contact route for help.
