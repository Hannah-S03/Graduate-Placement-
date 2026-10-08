# Product Requirements Document: Graduate Placement Website

| | |
|---|---|
| **Status** | Draft v2: single source of truth (replaces the earlier `PLAN.md`) |
| **Owner** | Hannah Sullivan |
| **Last updated** | 2026-10-08 |

> **About the dummy data.** The company, people, quotes, and 12-week overview content in this document are **invented sample content** ("Brightpath Technologies" is fictional) so the layout can be reviewed. Replace all of it before launch. Never publish the sample names or quotes as real.

Items marked **[ASSUMPTION]** are unconfirmed. Open questions are in section 16.

---

## 1. Summary

A website for a 12-week graduate placement in which graduates work with the **central team** and gain experience and exposure in a range of areas within it. It explains the company and the placement, introduces the team, gives an overview of the skills they can build over the 12 weeks, and shares feedback from previous graduates. The site is **information only**: it does not take applications.

## 2. Decisions so far

| Question | Decision |
|---|---|
| Placement model | One central team: graduates gain experience and exposure in a range of areas within it (no rotations across teams) |
| 12-week content | A **12-week overview** of the skills graduates can build and what's covered in each (two groups: educational and personal skills). No week-by-week schedule. Currently dummy data |
| Applications | **Not handled by the website** (information only, no application form). How people apply is still to be decided |
| Build approach | Option A: hand-built static site (plain HTML, CSS, JavaScript); no backend |
| Where it runs | Localhost first; public hosting is chosen later |
| Look | Dark blue theme (deep navy background, light text, bright blue accent) |
| Documentation | Everything in this one file, `PRD.md` |

## 3. Problem and opportunity

Graduates need clear, trustworthy information to decide whether to apply: what the company does, who they will work with, what skills they'll build, what past graduates thought, and how selection works. A single site answers those questions and tells them who to contact about applying.

## 4. Goals and non-goals

### Goals
1. Make the placement understandable in under 3 minutes of reading.
2. Make it clear how the process works and who to contact about applying.
3. Give the programme team one place to point candidates to for information.
4. Meet accessibility and data-protection requirements from day one.

### Non-goals (v1)
- Collecting or storing applications on this website (there is no application form)
- A custom applicant tracking system, applicant logins, or a reviewer dashboard
- A graduate onboarding portal or learning platform
- Host-team nomination tools
- Multi-language support
- A content management system (content is edited in data files)

## 5. Users

| User | Needs | Key tasks |
|---|---|---|
| Prospective graduate | Clear information, honest expectations, an easy way to find out who to contact | Learn about the company and placement, check eligibility, see dates, find the contact details |
| Programme lead | Candidates who understand the placement before they get in touch | Answer questions, share the application route (to be decided) |
| Site editor | Update content without a developer | Edit the data files (company, team, feedback, skills overview, dates) |

**[ASSUMPTION]** Most applicants arrive on a phone, so mobile is a first-class experience.

## 6. Success metrics (first cohort, starting targets to agree)

| Metric | Target |
|---|---|
| Accessibility audit (WCAG 2.2 AA) | No critical failures at launch |
| Mobile page load | Largest content visible in under 2.5 seconds |
| Colour contrast (dark blue theme) | All text and link colours at 4.5:1 or better |

## 7. About the company (dummy data)

- **Company name and tagline:** Brightpath Technologies, "Building software that helps people work better"
- **Who we are / what we do:** Brightpath is a mid-sized software company that builds workflow and reporting tools for small and medium businesses. Around 350 people work across engineering, data, product, customer success, and operations.
- **Mission and values:** Mission: make everyday work simpler. Values: curiosity, ownership, kindness, and quality.
- **Size and locations:** About 350 employees; head office in a major city with a smaller regional office; hybrid working (3 days in office).
- **The central team:** For all 12 weeks graduates work with the central team, which supports the whole business, gaining experience and exposure in a range of areas within it. Dummy areas: events and engagement; insight and market research; business and portfolio planning; digital and AI projects; communications and presenting; programme and project coordination.
- **Culture and working environment:** Friendly and collaborative; regular learning sessions; mentoring for everyone early in their career; employee networks; flexible hours; wellbeing support.
- **Why graduates should join us:** Real projects from week one, a mentor who stays with you, exposure to a range of areas within the central team, and a supportive cohort.
- **Images, logo and brand guidelines:** Placeholder logo and imagery for layout only.

## 8. Meet the team (dummy data)

| Name (fictional) | Role | Short bio | Works with graduates as |
|---|---|---|---|
| Alex Morgan | Graduate Programme Lead | Runs the programme day to day and is your first point of contact. Previously joined Brightpath as a graduate. | Programme lead |
| Priya Shah | Head of the Central Team | Leads the central team and has mentored graduates for three years. | Your manager and mentor |
| Daniel Okafor | Insight and Research Lead | Leads a small team turning customer and market data into decisions. | Lead for insight and market research |
| Sofia Lindqvist | Digital and AI Projects Lead | Looks after the team's digital tools and loves helping people build their first AI tool. | Lead for digital and AI projects |
| Jordan Reyes | People and Culture Partner | Supports onboarding, wellbeing and career conversations. | Programme support and HR contact |

Photos are placeholder avatars. Real entries need each person's consent to publish their name, photo and bio.

## 9. Previous graduate feedback (dummy data)

> "I was given a real project in my second week, and my mentor made sure I never felt stuck. I learned more in 12 weeks than I expected." (Sam, Cohort 2025, Digital and AI projects)

> "Getting to work in a range of areas within the central team helped me realise which kind of work I enjoy. I would not have known that from a single narrow role." (Maya, Cohort 2025, Insight and market research)

> "Helping to plan the cohort showcase was nerve-wracking and brilliant. Presenting to senior leaders gave me confidence I still use." (Chidi, Cohort 2024, Events and engagement)

**Sample headline results (invented):** 92% would recommend the programme; 18 of 24 past graduates took permanent roles.

Rules once real: real quotes only, with written permission; first name and cohort year only; remove on request. If there are no previous cohorts, hide the section until there is real feedback.

## 10. Placement objectives

### Programme objectives
1. Give graduates exposure to a range of areas within the central team so they can find what interests them most.
2. Produce real, useful work across those areas.
3. Provide practical exposure to how a professional business operates, combining structured learning with meaningful real-world experience.
4. Give every graduate a mentor and regular structured feedback.

### Graduate objectives (by week 12)
- Deliver scoped work in a new area within a short time frame
- Adapt quickly: learn new tools, people and ways of working as you move between areas
- Communicate with different audiences, in writing and in person
- Compare areas of work and make a reasoned choice about their next step
- Keep a reflection log that evidences progress

## 11. The 12-week overview (dummy data)

Over 12 weeks you'll build these skills through real work, mentoring and structured learning. This is an overview of some of what you'll experience. Exact activities vary depending on the projects the central team is working on.

### Educational skills

Skills and knowledge you'll develop through learning and project work.

- **Presentation skills**
  - Structuring a talk
  - Making clear slides
  - Speaking with confidence
  - Handling questions
  - Presenting to senior leaders at the final showcase
- **Creating your own AI tool**
  - What AI tools can and can't do
  - Spotting a task worth automating
  - Building a simple tool of your own
  - Testing it
  - Using AI responsibly
- **Research and analysis**
  - Framing a good question
  - Finding and judging reliable sources
  - Gathering and organising evidence
  - Analysing what you find and drawing clear conclusions
  - Summarising your findings
- **Market research**
  - Understanding who the customers are and what they need
  - Looking at competitors and trends
  - Designing simple surveys or interviews
  - Turning findings into recommendations
- **Business and portfolio mapping**
  - Mapping the company's products, services and customers
  - Seeing how they fit together
  - Understanding where each area of the central team contributes
- **Communicating with different audiences**
  - Adapting your tone, detail and format to your audience
  - Talking with colleagues, managers, customers and senior leaders
- **Helping plan and deliver events**
  - Planning and scheduling
  - Coordinating people and logistics
  - Running the day
  - Reviewing what worked afterwards (for example cohort events or the showcase)

### Personal skills

Skills that help you work well in any role.

- **Professional communication**
  - Clear emails and messages
  - Meeting etiquette
  - Writing short updates
  - Giving and receiving feedback
- **Organisation**
  - Prioritising work
  - Managing your time
  - Planning tasks
  - Keeping track of what's next
- **Building commercial awareness**
  - How the company makes money
  - Who its customers are
  - The market and competitors
  - Costs and value
- **Problem solving**
  - Breaking a problem down
  - Generating options
  - Testing ideas
  - Making and explaining a decision

On the website this is one page (`overview.html`) driven by `src/data/overview.js`. There is deliberately **no week-by-week schedule**.

## 12. Applications (not handled by this website)

The website is **information only**. It has no application form, no Apply page and no Apply button. The Google Form that was planned earlier has been removed.

- **What the site does:** the **How to apply** page explains how the process works (screening, one 45-minute interview, an offer within about 2 weeks, information before you start), who is eligible, and who to contact. It states clearly that applications are not taken on the website and that details of how to apply will be shared by the programme team.
- **Eligibility (to confirm):** graduated or graduating within 6 months; right to work; available for all 12 weeks.
- **Still to decide:** how graduates will actually apply (for example the organisation's careers or applicant system, or an email address). Once decided, the How to apply page can point to it.
- **Data:** because the site collects nothing, there is no application data to store or delete. The privacy notice (draft) says so and covers emails sent to the contact address.

## 13. Website requirements

Priority: **P0** required for launch, **P1** should have, **P2** nice to have.

| ID | Requirement | Priority |
|---|---|---|
| W1 | **Home:** headline, key facts (duration, central team model, mentor, start date), call to action to the 12-week overview, short company summary and a feedback highlight | P0 |
| W2 | **About the company**, including the central team and its areas of work | P0 |
| W3 | **Meet the team** | P0 |
| W4 | **About the placement:** objectives and what graduates gain | P0 |
| W5 | **12-week overview:** the educational and personal skills, each with what will be covered (no week-by-week schedule) | P0 |
| W6 | **What we're looking for:** eligibility and selection criteria | P0 |
| W7 | **How to apply:** how the process works and who to contact, with a clear statement that applications are not taken on the website | P0 |
| W8 | **Graduate feedback** page | P0 |
| W9 | **FAQs** | P0 |
| W10 | **Contact** | P0 |
| W11 | **Privacy notice** and **accessibility statement** | P0 |
| W12 | Skills shown as clearly separated educational and personal groups of cards | P1 |
| W13 | Dark blue theme with all text and link colours meeting WCAG AA contrast | P1 |
| W14 | Social-share preview image and page descriptions | P2 |

## 14. Non-functional requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.2 AA: full keyboard use, visible focus, sufficient contrast, labelled controls, a "skip to content" link, no information conveyed by colour alone, reduced-motion respected. The dark blue theme was checked: all text and link colour pairs are at least 5.4:1 against their backgrounds |
| Responsive design | Works from 320 px wide phones to desktop |
| Performance | No frameworks or build step; small pages; no third-party trackers |
| Browsers | Latest two versions of Chrome, Safari, Edge and Firefox; iOS Safari and Android Chrome |
| Privacy | The site collects no personal data and uses no analytics or cookies by default; privacy notice (draft) linked from every page footer |
| Maintainability | Content in data files; README explains how to run and update |

## 15. Build approach

**Option A: hand-built static site.** Plain HTML, CSS and JavaScript, no build step or server, because the site only shows information.

- **Run locally:** clone the repo and run `python3 -m http.server 8000` in the project folder, then open `http://localhost:8000`. Opening `index.html` directly also works for most pages. See [`README.md`](README.md).
- **Public hosting later:** deploy the same files to a static host (GitHub Pages, Netlify, or organisation hosting) with HTTPS and a custom domain. No code changes needed.
- **Localhost limitation:** only the person running it can see it, so candidates can't see it until it's hosted.

### Milestones
| Milestone | Deliverable |
|---|---|
| M0 Confirm | Open questions answered; real content gathered |
| M1 Site draft | All pages built with dummy data, running on localhost (**this version**) |
| M2 Real content | Dummy data replaced; application route decided and described on How to apply |
| M3 Quality | Accessibility, mobile and privacy review |
| M4 Launch | Hosted with custom domain; applications open |
| M5 Review | Check metrics; list improvements |

### Risks
| Risk | Mitigation |
|---|---|
| Dummy content published by mistake | Banner on every page while dummy data is in use; checklist in README |
| Candidates can't find how to apply | Clear How to apply page and contact address; decide the application route before launch |
| Team members or graduates not consenting to publication | Written consent before any real name, photo or quote goes live |
| Site goes stale | Name a content owner; content is plain data files |

## 16. Open questions

1. Real content to replace all dummy data: company details, the central team and its real areas of work, team members, graduate feedback (with permissions), and the wording for each skill.
2. Organisation name and branding; cohort size; next start date.
3. Pay and work location (on-site, hybrid, remote).
4. **How will graduates actually apply, and where will that be described?** (The website no longer takes applications.)
5. Hosting option when the site goes public, and the custom domain.
6. Brand guidelines, logo, or example sites you like? (The site currently uses a dark blue theme.)
