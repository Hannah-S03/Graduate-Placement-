# Graduate Placement Website: Plan

Status: **Draft v1, for discussion.** Items marked **[ASSUMPTION]** are my guesses and need your confirmation.

## 1. Purpose and audience

**Purpose:** a single website that explains the 12-week graduate placement, shows what a graduate will do and learn, and lets them apply.

**Audiences**
| Audience | What they need from the site |
|---|---|
| Prospective graduates | What the placement is, what they'll learn, whether they're eligible, how to apply, key dates |
| Hiring managers / host teams | What the programme expects of them, the weekly structure, how to nominate a project |
| Internal reviewers (HR / programme lead) | Received applications in a reviewable form |

**[ASSUMPTION]** One cohort at a time, roughly 4–10 graduates, run by a company in a technology or software setting. Placements are paid and based in the office or hybrid.

## 2. Placement objectives

### Programme objectives
1. Give graduates real, supervised work experience that produces a deliverable the business uses.
2. Build a pipeline of early-career talent, with a clear route to a permanent offer.
3. Give graduates structured feedback and a mentor, so they leave with a clearer view of their career direction.
4. Give host teams extra capacity on well-scoped projects.

### Graduate learning objectives
By week 12, a graduate will be able to:
- **Deliver:** plan and complete a scoped project with a supervisor and present the results.
- **Collaborate:** work in a team, take part in the team's regular working rhythm (stand-ups, reviews, retros) and give and receive feedback.
- **Communicate:** explain technical or complex work to non-specialist stakeholders, in writing and in person.
- **Apply skills:** use their degree knowledge in a professional setting and identify the gaps to close next.
- **Reflect:** set personal development goals and evidence progress against them.

### Success measures (to track after launch)
- Applications received and completion rate of the application form
- Offer acceptance and placement completion rate
- Graduate and manager satisfaction scores (end of week 12)
- Number converted to permanent roles

## 3. The 12-week breakdown

Phases: **Onboard (1–2) → Learn and contribute (3–5) → Own a project (6–10) → Deliver and plan next steps (11–12).**

| Week | Phase | Focus | Key activities | Milestone / output |
|---|---|---|---|---|
| 1 | Onboard | Welcome and orientation | Company induction, meet team and mentor, equipment and access set-up, programme overview | Personal goals drafted |
| 2 | Onboard | Understand the business | Shadow team members, tour of products/services, how the team works, safe-working and security basics | Goals agreed with supervisor |
| 3 | Learn and contribute | First tasks | Small, well-defined tasks with close support; learn the team's tools and processes | First task completed |
| 4 | Learn and contribute | Build core skills | Skills workshops, pairing with a colleague, regular feedback | Skills self-assessment |
| 5 | Learn and contribute | Contribute independently | Increasing task ownership; project brief agreed with host team | Project brief signed off |
| 6 | Own a project | Plan the project | Break down scope, plan milestones, identify risks | Project plan |
| 7 | Own a project | Build, part 1 | Main project work; weekly check-ins with supervisor | Progress update |
| 8 | Own a project | Mid-point review | Formal mid-point review with supervisor and mentor; adjust goals | Mid-point review recorded |
| 9 | Own a project | Build, part 2 | Continue project work; cross-team exposure (e.g. meet another department) | Working draft of deliverable |
| 10 | Own a project | Test and refine | Review with stakeholders, incorporate feedback, draft final presentation | Feature-complete / near-final deliverable |
| 11 | Deliver | Present and hand over | Rehearse and give final presentation; document and hand over the work | Final presentation |
| 12 | Deliver | Reflect and next steps | End-of-placement review, feedback both ways, career conversation, discuss opportunities | Final review and reflection written up |

Running through all 12 weeks: weekly 1:1 with supervisor, fortnightly mentor catch-up, a short weekly reflection log, and a monthly cohort social or learning session.

**[ASSUMPTION]** The project in weeks 5–11 differs per graduate. If your placement is rotational (e.g. 4 weeks in each of 3 teams), we'd restructure weeks 3–10.

## 4. Application

### Eligibility (to confirm)
- Graduated, or graduating within the next 6 months, from a recognised degree **[ASSUMPTION: in a relevant subject]**
- Right to work in the placement country
- Available for the full 12 weeks from the start date

### How it works
1. **Apply online** on the website (form below).
2. **Screening:** application reviewed against the criteria.
3. **Interview:** a single 45-minute interview (video or in person), including a short discussion of past work.
4. **Offer:** decision communicated within about 2 weeks of the interview.
5. **Pre-start:** onboarding info sent before week 1.

**Suggested timeline:** applications open → 4 weeks open → screening 1 week → interviews 2 weeks → offers 1 week → pre-start → week 1.

### Application form fields
| Section | Fields |
|---|---|
| About you | Full name, email, phone, location |
| Education | University, degree, subject, classification/expected grade, graduation date |
| Eligibility | Right to work (yes/no), availability for the full 12 weeks (yes/no), earliest start date |
| Experience | CV upload (PDF), link to LinkedIn/portfolio/GitHub (optional) |
| Motivation | Why this placement? (max 250 words); an example of a project you're proud of (max 250 words) |
| Support | Any adjustments you'd need during the process or placement (optional) |
| Equal opportunities | Optional, stored separately from the application and not shown to reviewers |
| Consent | Privacy notice acknowledgement and consent to store data |

### Selection criteria (shown to applicants for transparency)
Motivation and curiosity · relevant knowledge from study or projects · communication · teamwork · problem solving.

### Data and compliance
- Applicant data is personal data. Needs a privacy notice, a stated retention period (e.g. delete unsuccessful applications after 6–12 months), and restricted access for reviewers.
- Accessibility target: WCAG 2.2 AA (keyboard navigation, contrast, labelled form fields, error messages).

## 5. Website structure

| Page | Content |
|---|---|
| Home | Headline, key facts (12 weeks, paid, dates), call to action to apply |
| About the placement | Objectives, what you'll gain, who it's for |
| Week-by-week | The 12-week breakdown, as an interactive timeline |
| What we're looking for | Eligibility and selection criteria |
| How to apply | Process steps and timeline, key dates |
| Apply | The application form |
| FAQs | Pay, location, visas, adjustments, and so on |
| Contact | Programme contact |
| Privacy / accessibility | Legal pages |

Optional later: graduate stories/testimonials, host-team nomination page, past-project showcase.

## 6. Technical approach

**[ASSUMPTION]** Small site, one developer, low traffic, with a lean toward simple and cheap to run.

**Recommended:** a static site (for example Astro or plain HTML/CSS/JS) for the content pages, plus a small backend for the application form (a serverless function or a hosted form service) that stores submissions and CV uploads securely and emails the programme team.

**Alternatives to discuss**
- Use the company's existing careers/applicant tracking system for the form, and keep the website purely informational (least work, best compliance if you already have one).
- A site builder (e.g. Wix/Squarespace) if no custom code is wanted.

## 7. Build phases

| Phase | What | Output |
|---|---|---|
| 0. Confirm | Answer open questions below; confirm content and branding | Signed-off plan |
| 1. Content and design | Write copy, choose visual style, sketch key pages | Content doc, wireframes |
| 2. Build the content site | Home, About, Week-by-week, How to apply, FAQs | Working site (no form) |
| 3. Application form | Form, validation, secure storage, confirmation email, reviewer access | Working application flow |
| 4. Quality | Accessibility check, mobile testing, privacy review, test applications | Launch-ready site |
| 5. Launch | Publish, set up domain, announce | Live site |
| 6. Iterate | Review applications and analytics, improve | Improvements |

## 8. Open questions for you

1. **Who is this for?** Your own company, a university, or another organisation? Name and branding?
2. **Format:** is it a single project per graduate (as I've assumed) or a rotation across teams?
3. **Sector and skills:** software development, data, business, something else? This changes the week-by-week content.
4. **Applications:** do you have an existing applicant tracking system, or should the website collect applications itself?
5. **Dates and cohort size:** next start date, and how many places?
6. **Pay and location:** paid, hybrid/remote/on-site, and anything we can state on the site?
7. **Design:** any brand guidelines, logo, or example sites you like?
8. **Tech preference:** any hosting, framework or language you want to use?

## 9. Proposed next steps

1. You answer the open questions above (or tell me which assumptions are wrong).
2. I revise this plan.
3. We start Phase 1: draft the site copy and a first design, then build.
