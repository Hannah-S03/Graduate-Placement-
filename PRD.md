# Product Requirements Document: Graduate Placement Website

| | |
|---|---|
| **Status** | Draft v2: single source of truth (replaces the earlier `PLAN.md`) |
| **Owner** | Hannah Sullivan |
| **Last updated** | 2026-10-07 |

> **About the dummy data.** The company, people, quotes, and week-by-week content in this document are **invented sample content** ("Brightpath Technologies" is fictional) so the layout can be reviewed. Replace all of it before launch. Never publish the sample names or quotes as real.

Items marked **[ASSUMPTION]** are unconfirmed. Open questions are in section 16.

---

## 1. Summary

A website for a 12-week graduate placement in which graduates **rotate across teams**. It explains the company and the placement, introduces the team, shows what happens each week, shares feedback from previous graduates, and lets eligible graduates apply through an embedded **Google Form**.

## 2. Decisions so far

| Question | Decision |
|---|---|
| Field | Mixed / rotation across teams |
| 12-week structure | 12 individual weeks, currently filled with dummy data (induction, three rotations, showcase) |
| Applications | Google Form, embedded in / linked from the website |
| Build approach | Option A: hand-built static site (plain HTML, CSS, JavaScript); no backend |
| Where it runs | Localhost first; public hosting is chosen later |
| Documentation | Everything in this one file, `PRD.md` |

## 3. Problem and opportunity

Graduates need clear, trustworthy information to decide whether to apply: what the company does, who they will work with, what each week looks like, what past graduates thought, and how selection works. A single site answers those questions and sends applicants to one consistent application form.

## 4. Goals and non-goals

### Goals
1. Make the placement understandable in under 3 minutes of reading.
2. Let a graduate apply in under 15 minutes on any device.
3. Give the programme team all applications in one structured place (Google Sheet).
4. Meet accessibility and data-protection requirements from day one.

### Non-goals (v1)
- A custom applicant tracking system, applicant logins, or a reviewer dashboard
- A graduate onboarding portal or learning platform
- Host-team nomination tools
- Multi-language support
- A content management system (content is edited in data files)

## 5. Users

| User | Needs | Key tasks |
|---|---|---|
| Prospective graduate | Clear information, honest expectations, easy application, reassurance their data is safe | Learn about the company and placement, check eligibility, see dates, apply |
| Programme lead / reviewer | All applications in one place, in a consistent format, access limited to those who need it | Receive notifications, review responses in the Sheet, delete data on schedule |
| Site editor | Update content without a developer | Edit the data files (weeks, team, feedback, dates), switch applications open/closed |

**[ASSUMPTION]** Most applicants arrive on a phone, so mobile is a first-class experience.

## 6. Success metrics (first cohort, starting targets to agree)

| Metric | Target |
|---|---|
| Application form completion rate (started to submitted) | 60% or more |
| Median time to complete the form | 15 minutes or less |
| Applications complete and eligible for review | 90% or more |
| Accessibility audit (WCAG 2.2 AA) | No critical failures at launch |
| Mobile page load | Largest content visible in under 2.5 seconds |

## 7. About the company (dummy data)

- **Company name and tagline:** Brightpath Technologies, "Building software that helps people work better"
- **Who we are / what we do:** Brightpath is a mid-sized software company that builds workflow and reporting tools for small and medium businesses. Around 350 people work across engineering, data, product, customer success, and operations.
- **Mission and values:** Mission: make everyday work simpler. Values: curiosity, ownership, kindness, and quality.
- **Size and locations:** About 350 employees; head office in a major city with a smaller regional office; hybrid working (3 days in office).
- **Teams graduates may work in:** Engineering, Data and Analytics, Product, Customer Success, People and Culture.
- **Culture and working environment:** Friendly and collaborative; regular learning sessions; mentoring for everyone early in their career; employee networks; flexible hours; wellbeing support.
- **Why graduates should join us:** Real projects from week one, a mentor who stays with you, exposure to several teams, and a supportive cohort.
- **Images, logo and brand guidelines:** Placeholder logo and imagery for layout only.

## 8. Meet the team (dummy data)

| Name (fictional) | Role | Short bio | Works with graduates as |
|---|---|---|---|
| Alex Morgan | Graduate Programme Lead | Runs the programme day to day and is your first point of contact. Previously joined Brightpath as a graduate. | Programme lead |
| Priya Shah | Senior Software Engineer | Loves clear code and good coffee. Has mentored graduates for three years. | Mentor and Engineering rotation host |
| Daniel Okafor | Data Analytics Manager | Leads a team of six analysts turning customer data into decisions. | Data rotation supervisor |
| Sofia Lindqvist | Product Manager | Looks after the reporting product and talks to customers every week. | Product rotation supervisor |
| Jordan Reyes | People and Culture Partner | Supports onboarding, wellbeing and career conversations. | Programme support and HR contact |

Photos are placeholder avatars. Real entries need each person's consent to publish their name, photo and bio.

## 9. Previous graduate feedback (dummy data)

> "I was given a real project in my second week, and my mentor made sure I never felt stuck. I learned more in 12 weeks than I expected." (Sam, Cohort 2025, Engineering)

> "Seeing three different teams helped me realise which kind of work I enjoy. I would not have known that from a single placement." (Maya, Cohort 2025, Data and Analytics)

> "The cohort showcase was nerve-wracking and brilliant. Presenting to senior leaders gave me confidence I still use." (Chidi, Cohort 2024, Product)

**Sample headline results (invented):** 92% would recommend the programme; 18 of 24 past graduates took permanent roles.

Rules once real: real quotes only, with written permission; first name and cohort year only; remove on request. If there are no previous cohorts, hide the section until there is real feedback.

## 10. Placement objectives

### Programme objectives
1. Give graduates exposure to several teams so they can find where they fit best.
2. Produce real, useful work in each rotation.
3. Provide practical exposure to how a professional business operates, combining structured learning with meaningful real-world experience.
4. Give every graduate a mentor and regular structured feedback.

### Graduate objectives (by week 12)
- Deliver scoped work in a new team within a short time frame
- Adapt quickly: learn new tools, people and ways of working at each switch
- Communicate with different audiences, in writing and in person
- Compare teams and roles and make a reasoned choice about their next step
- Keep a reflection log that evidences progress

## 11. The 12-week placement (dummy data)

Each week has the same five fields. The rotation lengths and teams are invented; change them to match the real programme. On the website each week is one entry in `src/data/weeks.js`.

### Week 1
- **Phase / team:** Induction
- **Focus:** Welcome and orientation
- **Key activities:** Company welcome, meet the programme lead, mentor and cohort, laptop and access set-up, programme overview, agree personal goals
- **Output / milestone:** Personal goals drafted
- **Supervisor / mentor check-ins:** 1:1 with programme lead; first mentor meeting

### Week 2
- **Phase / team:** Induction
- **Focus:** Understand the business
- **Key activities:** Tour of products and teams, how Brightpath makes money, security and data basics, shadow colleagues across departments
- **Output / milestone:** Goals agreed; rotation plan confirmed
- **Supervisor / mentor check-ins:** Weekly 1:1; mentor catch-up

### Week 3
- **Phase / team:** Rotation 1: Engineering
- **Focus:** Join the team
- **Key activities:** Team onboarding, learn tools and ways of working (stand-ups, code review), pair with a team member, first small task
- **Output / milestone:** First task completed
- **Supervisor / mentor check-ins:** Weekly 1:1 with Engineering supervisor

### Week 4
- **Phase / team:** Rotation 1: Engineering
- **Focus:** Contribute
- **Key activities:** Take on a scoped feature or fix with support; attend planning and retrospective
- **Output / milestone:** Work in review
- **Supervisor / mentor check-ins:** Weekly 1:1; mentor catch-up

### Week 5
- **Phase / team:** Rotation 1: Engineering
- **Focus:** Deliver and hand over
- **Key activities:** Finish the task, document it, demo to the team, rotation feedback conversation
- **Output / milestone:** Rotation 1 deliverable and feedback recorded
- **Supervisor / mentor check-ins:** End-of-rotation review

### Week 6
- **Phase / team:** Rotation 2: Data and Analytics
- **Focus:** Join the team
- **Key activities:** Team onboarding, learn data tools and reporting, shadow analysts, agree a small analysis question
- **Output / milestone:** Question and plan agreed
- **Supervisor / mentor check-ins:** Weekly 1:1 with Data supervisor

### Week 7
- **Phase / team:** Rotation 2: Data and Analytics
- **Focus:** Analyse
- **Key activities:** Collect and clean data, build analysis or dashboard, regular check-ins with the team
- **Output / milestone:** Draft analysis
- **Supervisor / mentor check-ins:** Weekly 1:1; mid-point review with programme lead

### Week 8
- **Phase / team:** Rotation 2: Data and Analytics
- **Focus:** Present findings
- **Key activities:** Finalise analysis, present findings to stakeholders, handover notes, rotation feedback
- **Output / milestone:** Rotation 2 deliverable and feedback recorded
- **Supervisor / mentor check-ins:** End-of-rotation review

### Week 9
- **Phase / team:** Rotation 3: Product and Customer
- **Focus:** Join the team
- **Key activities:** Team onboarding, sit in on customer calls, learn how product decisions are made, scope a small improvement
- **Output / milestone:** Improvement scoped
- **Supervisor / mentor check-ins:** Weekly 1:1 with Product supervisor

### Week 10
- **Phase / team:** Rotation 3: Product and Customer
- **Focus:** Shape and propose
- **Key activities:** Gather customer input, write a short proposal with options, test ideas with the team
- **Output / milestone:** Proposal drafted
- **Supervisor / mentor check-ins:** Weekly 1:1; mentor catch-up

### Week 11
- **Phase / team:** Showcase
- **Focus:** Prepare to present
- **Key activities:** Pull together learnings from all three rotations, build the showcase presentation, rehearse with the cohort and mentor
- **Output / milestone:** Showcase presentation ready
- **Supervisor / mentor check-ins:** Rehearsal feedback from mentor

### Week 12
- **Phase / team:** Showcase
- **Focus:** Present and reflect
- **Key activities:** Cohort showcase to senior leaders, end-of-placement review, career conversation, feedback both ways, complete reflection log
- **Output / milestone:** Final presentation, reflection write-up, next-step preferences
- **Supervisor / mentor check-ins:** Final review with programme lead and mentor


## 12. Application (Google Forms)

### Eligibility (to confirm)
Graduated or graduating within 6 months; right to work; available for all 12 weeks.

### Process
Apply via the Google Form, screening, one 45-minute interview, offer within about 2 weeks, pre-start information.

### Form questions
The paste-ready list and setup checklist are in [`docs/application-form.md`](docs/application-form.md).

| Section | Questions |
|---|---|
| About you | Full name, email, phone, location |
| Education | University, degree, grade, graduation date |
| Eligibility | Right to work, available for all 12 weeks, earliest start date |
| Experience | CV (upload or link), optional portfolio / LinkedIn link |
| Motivation | Why this placement? (about 250 words); a project you're proud of (about 250 words) |
| Rotation interest | Optional: teams you're most interested in (informs rotation planning only) |
| Support | Optional: adjustments needed |
| Consent | Required: privacy notice acknowledged |

Equal-opportunities questions go in a **separate second form** so reviewers don't see them with applications.

### How it connects to the site
The Apply page embeds the form (iframe) with an "Open in a new tab" link as a fallback and for accessibility. The form address and open/closed state are set in `src/config.js`. Responses collect in a linked Google Sheet, new responses email the programme team, and applicants get a copy of their response.

### Google Forms limitations
- **CV upload** requires applicants to sign in to a Google account, and files go to the form owner's Drive. If that is a barrier, use a "link to your CV" question or ask for the CV at interview stage. **Decision needed.**
- Word limits can only be approximated with character-count validation (about 1,500 characters).
- The closing date is set by turning off "Accepting responses", manually or with a scheduled add-on or Apps Script.
- Look and feel is limited, and the form is hosted by Google, so the privacy notice must say so.

### Data
Use an organisation-owned Google Workspace account (not a personal one); restrict the Sheet to named reviewers; state a retention period (**[ASSUMPTION]** 6 months for unsuccessful applicants); delete responses and uploaded CVs on schedule.

## 13. Website requirements

Priority: **P0** required for launch, **P1** should have, **P2** nice to have.

| ID | Requirement | Priority |
|---|---|---|
| W1 | **Home:** headline, key facts (duration, location, rotation model), call to action to apply, short company summary and a feedback highlight | P0 |
| W2 | **About the company** | P0 |
| W3 | **Meet the team** | P0 |
| W4 | **About the placement:** objectives and what graduates gain | P0 |
| W5 | **Week-by-week:** all 12 weeks, grouped by phase | P0 |
| W6 | **What we're looking for:** eligibility and selection criteria | P0 |
| W7 | **How to apply:** process steps and key dates | P0 |
| W8 | **Apply:** embedded Google Form, new-tab fallback, closed state | P0 |
| W9 | **Graduate feedback** page | P0 |
| W10 | **FAQs** | P0 |
| W11 | **Contact** | P0 |
| W12 | **Privacy notice** and **accessibility statement** | P0 |
| W13 | Week-by-week presented as an expandable timeline with a plain-list fallback | P1 |
| W14 | Switch applications open/closed from one config value | P0 |
| W15 | Social-share preview image and page descriptions | P2 |

## 14. Non-functional requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.2 AA: full keyboard use, visible focus, sufficient contrast, labelled controls, a "skip to content" link, no information conveyed by colour alone, reduced-motion respected |
| Responsive design | Works from 320 px wide phones to desktop |
| Performance | No frameworks or build step; small pages; no third-party trackers |
| Browsers | Latest two versions of Chrome, Safari, Edge and Firefox; iOS Safari and Android Chrome |
| Privacy | Privacy notice linked from the Apply page; collect only needed data; stated retention period; no analytics or cookies by default |
| Maintainability | Content in data files; README explains how to run and update |

## 15. Build approach

**Option A: hand-built static site.** Plain HTML, CSS and JavaScript, no build step or server, because Google Forms and Sheets handle submissions.

- **Run locally:** clone the repo and run `python3 -m http.server 8000` in the project folder, then open `http://localhost:8000`. Opening `index.html` directly also works for most pages. See [`README.md`](README.md).
- **Public hosting later:** deploy the same files to a static host (GitHub Pages, Netlify, or organisation hosting) with HTTPS and a custom domain. No code changes needed.
- **Localhost limitation:** only the person running it can see it, so applicants can't use it until it's hosted. The Google Form is public by link in the meantime.

### Milestones
| Milestone | Deliverable |
|---|---|
| M0 Confirm | Open questions answered; real content gathered |
| M1 Site draft | All pages built with dummy data, running on localhost (**this version**) |
| M2 Real content | Dummy data replaced; Google Form created and connected |
| M3 Quality | Accessibility, mobile and privacy review |
| M4 Launch | Hosted with custom domain; applications open |
| M5 Review | Check metrics; list improvements |

### Risks
| Risk | Mitigation |
|---|---|
| Dummy content published by mistake | Banner on every page while dummy data is in use; checklist in README |
| Personal data handled incorrectly | Organisation-owned account, restricted Sheet, retention and deletion process, privacy review |
| Google sign-in for CV upload deters applicants | Offer a CV link instead; decide before launch |
| Team members or graduates not consenting to publication | Written consent before any real name, photo or quote goes live |
| Site goes stale | Name a content owner; content is plain data files |

## 16. Open questions

1. Real content to replace all dummy data: the 12 weeks, company details, team members, graduate feedback (with permissions).
2. Organisation name and branding; cohort size; next start date.
3. Pay and work location (on-site, hybrid, remote).
4. Who reviews applications, and which data retention rules apply?
5. Hosting option when the site goes public, and the custom domain.
6. Is a Google sign-in for CV upload acceptable, or should the CV be a link?
7. Which Google account (ideally organisation-owned Workspace) will own the form and Sheet?
8. Brand guidelines, logo, or example sites you like?
