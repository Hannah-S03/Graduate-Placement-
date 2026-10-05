# Product Requirements Document: Graduate Placement Website

| | |
|---|---|
| **Status** | Draft v1 (for review) |
| **Owner** | Hannah Sullivan |
| **Related** | [PLAN.md](PLAN.md) (plan, 12-week breakdown, open questions) |
| **Last updated** | 2026-10-05 |

Items marked **[ASSUMPTION]** are unconfirmed and should be checked before build starts. Open questions are listed in section 14.

---

## 1. Summary

A website for a 12-week graduate placement programme. It explains the placement, shows what graduates will do each week and what they will learn, and lets eligible graduates apply online. It also gives the programme team a simple, secure way to receive and review applications.

## 2. Problem and opportunity

Graduates need clear, trustworthy information to decide whether to apply: what the work is, how long it lasts, what support they get, and how the selection works. Without a dedicated site, that information is scattered or missing, applications arrive in inconsistent formats, and the programme team spends time answering the same questions and manually collating submissions.

A single site fixes both sides: better-informed applicants, and consistently structured applications for the team.

## 3. Goals and non-goals

### Goals
1. Make the placement easy to understand in under 3 minutes of reading.
2. Let a graduate complete and submit an application in under 15 minutes on any device.
3. Give the programme team all applications in one structured, reviewable place.
4. Meet accessibility and data-protection requirements from day one.

### Non-goals (v1)
- A full applicant tracking system (scoring workflows, interview scheduling, offer letters)
- A graduate login area, onboarding portal, or learning platform
- Host-team nomination or project-matching tools
- Multi-language support
- A blog or content management system beyond simple page edits

## 4. Users and needs

| User | Needs | Key tasks |
|---|---|---|
| **Prospective graduate** | Clear info, honest expectations, easy application, reassurance their data is safe | Learn about the placement, check eligibility, view dates, apply, receive confirmation |
| **Programme lead / reviewer** | All applications in one place, in a consistent format, access limited to those who need it | Receive notifications, read and filter applications, export data, delete data on schedule |
| **Site editor** (often the programme lead) | Update dates, FAQs and copy without a developer | Edit content, open/close applications |

**[ASSUMPTION]** Most applicants will arrive on a phone, so mobile is a first-class experience.

## 5. Success metrics

| Metric | Target (first cohort) |
|---|---|
| Application form completion rate (started → submitted) | ≥ 60% |
| Median time to complete the form | ≤ 15 minutes |
| Share of applications that are complete and eligible for review | ≥ 90% |
| Accessibility audit (WCAG 2.2 AA) | No critical failures at launch |
| Page load (mobile, 4G) | Largest content visible in under 2.5 seconds |
| Applicant-facing support emails about "how do I apply / is it open?" | Trend downward during the application window |

Targets are starting points to be agreed, not commitments.

## 6. Scope

### In scope for v1
- Public informational pages (section 7)
- Online application form with CV upload
- Confirmation email to applicant, notification to programme team
- Secure storage of applications; reviewer access
- Open/closed application state with a closing date
- Accessibility, privacy notice, and cookie handling as needed

### Out of scope for v1
See non-goals. Candidates for v2: graduate stories, host-team nomination page, past-project showcase, applicant status tracking.

## 7. Functional requirements

Priority: **P0** = required for launch, **P1** = should have, **P2** = nice to have.

### 7.1 Public pages

| ID | Requirement | Priority |
|---|---|---|
| F1 | **Home** page: headline, key facts (duration, pay, location, start date), primary "Apply" call to action | P0 |
| F2 | **About the placement**: programme objectives and what graduates will gain | P0 |
| F3 | **Week-by-week** page: the 12-week breakdown (focus, activities, output for each week), grouped into the four phases (Onboard, Learn and contribute, Own a project, Deliver) | P0 |
| F4 | **What we're looking for**: eligibility and selection criteria | P0 |
| F5 | **How to apply**: the process steps and key dates timeline | P0 |
| F6 | **FAQs**: grouped, expandable questions | P0 |
| F7 | **Contact** details for the programme team | P0 |
| F8 | **Privacy notice** and **accessibility statement** pages | P0 |
| F9 | Week-by-week presented as an interactive timeline (expand a week to see detail) with a plain list fallback | P1 |
| F10 | Testimonials / graduate stories | P2 |

### 7.2 Application

| ID | Requirement | Priority |
|---|---|---|
| A1 | Application form with the fields listed in section 8 | P0 |
| A2 | Required-field and format validation, with clear inline error messages | P0 |
| A3 | CV upload: PDF only, maximum 5 MB, with a clear error if rejected **[ASSUMPTION: limits]** | P0 |
| A4 | Word limits (250 words) on the two motivation questions with a live counter | P0 |
| A5 | Eligibility questions (right to work, availability for all 12 weeks); ineligible answers show a clear explanation before submission rather than a silent rejection | P0 |
| A6 | Consent checkbox for the privacy notice, required to submit | P0 |
| A7 | On submit: show a confirmation page and send a confirmation email to the applicant | P0 |
| A8 | On submit: notify the programme team and store the application (including CV) securely | P0 |
| A9 | Protection against spam and bots without making the form inaccessible (e.g. honeypot field and rate limiting before considering CAPTCHA) | P0 |
| A10 | Application window: form is shown only while open; after the closing date, show a "closed" message with the next intake information if known | P0 |
| A11 | Save progress / resume later | P2 |
| A12 | Optional equal-opportunities questions stored separately and not shown to reviewers | P1 |

### 7.3 Reviewer and admin

| ID | Requirement | Priority |
|---|---|---|
| R1 | Reviewers can view all submitted applications in one place, with the CV | P0 |
| R2 | Access is restricted to named, authenticated users | P0 |
| R3 | Export applications as CSV (without equal-opportunities data in the reviewer export) | P1 |
| R4 | Ability to delete an individual application on request, and to bulk-delete after the retention period | P0 |
| R5 | Simple status per application (e.g. New, Shortlisted, Rejected) | P2 |
| R6 | Site editor can change dates, FAQs and page copy without a developer | P1 |

## 8. Application form specification

| Section | Field | Type | Required |
|---|---|---|---|
| About you | Full name | Text | Yes |
| | Email | Email | Yes |
| | Phone | Phone | Yes |
| | Location (city/country) | Text | Yes |
| Education | University | Text | Yes |
| | Degree and subject | Text | Yes |
| | Classification / expected grade | Select | Yes |
| | Graduation date | Month/year | Yes |
| Eligibility | Right to work in [country] | Yes/No | Yes |
| | Available for the full 12 weeks | Yes/No | Yes |
| | Earliest start date | Date | Yes |
| Experience | CV | File upload (PDF) | Yes |
| | LinkedIn / portfolio / GitHub | URL | No |
| Motivation | Why this placement? (max 250 words) | Long text | Yes |
| | A project you're proud of (max 250 words) | Long text | Yes |
| Support | Adjustments needed during process or placement | Long text | No |
| Equal opportunities | Optional monitoring questions | Selects | No |
| Consent | Privacy notice acknowledged | Checkbox | Yes |

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| **Accessibility** | WCAG 2.2 AA: full keyboard use, visible focus, sufficient colour contrast, labelled fields, errors announced to screen readers, no information conveyed by colour alone |
| **Responsive design** | Works from 320 px wide phones to desktop; touch targets at least 44 px |
| **Performance** | Mobile page weight kept small; images optimised; no heavy client-side frameworks for content pages |
| **Browsers** | Latest two versions of Chrome, Safari, Edge and Firefox, plus iOS Safari and Android Chrome |
| **Security** | HTTPS only; CV uploads type- and size-checked and stored privately (never publicly accessible by URL); least-privilege access for reviewers; secrets kept out of the repository; basic rate limiting on the form |
| **Privacy and data protection** | Privacy notice shown at the point of collection; collect only needed data; stated retention period (**[ASSUMPTION]** unsuccessful applications deleted after 6 months); deletion on request; equal-opportunities data held separately; no third-party trackers without consent |
| **Reliability** | Submissions must not be silently lost: if saving fails the applicant sees an error and can retry; team is notified of failures |
| **Maintainability** | Content edits possible without code changes where practical; README covering how to run, deploy and update the site |
| **SEO and sharing** | Descriptive page titles and meta descriptions; social-share preview image |

## 10. Content requirements

Content to be written or confirmed before build (a content owner is needed):
- Programme overview and objectives (draft in `PLAN.md`)
- The 12-week breakdown (draft in `PLAN.md`)
- Eligibility, selection criteria, and key dates (dates not yet set)
- FAQs (pay, location, visas, adjustments, what happens after the placement)
- Privacy notice and accessibility statement (the privacy notice should be reviewed by whoever handles data protection for the organisation)
- Branding: name, logo, colours, imagery

## 11. Technical approach (proposed)

**[ASSUMPTION]** Small site, low traffic, one developer.

- **Front end:** static site generator (e.g. Astro) or plain HTML/CSS/JS for content pages
- **Application back end:** a serverless function (or hosted form service) that validates input, stores the submission and CV in private storage, and sends the two emails
- **Storage:** private object storage for CVs; a small database or structured store for application records
- **Reviewer access:** a simple authenticated admin view or, at minimum, access to the stored data and a CSV export
- **Hosting:** a static host with serverless functions, custom domain, and HTTPS
- **Alternative to evaluate:** use the organisation's existing applicant tracking system for the form and keep the site purely informational. This is the lowest-effort option if such a system exists.

The final stack depends on the answers to open questions 4 and 8 in section 14.

## 12. Milestones

| Milestone | Deliverable | Depends on |
|---|---|---|
| M0. Confirm | Open questions answered; content owner named; PRD signed off | You |
| M1. Content and design | Copy drafted; visual style and wireframes for key pages | M0 |
| M2. Content site | Public pages built and reviewable | M1 |
| M3. Application flow | Form, storage, emails, reviewer access | M2 (can overlap) |
| M4. Quality | Accessibility and mobile testing, privacy review, end-to-end test applications | M3 |
| M5. Launch | Live on the final domain, application window opens | M4 |
| M6. Review | Check metrics from section 5 after the window closes; list improvements | M5 |

No calendar dates are set yet; they depend on the cohort start date (open question 5).

## 13. Risks and dependencies

| Risk / dependency | Impact | Mitigation |
|---|---|---|
| Placement details (dates, pay, location, format) not confirmed | Content can't be finalised; rework | Resolve open questions first; build content so details are easy to change |
| Personal data handled incorrectly | Legal and reputational harm | Privacy review before launch; private storage; retention and deletion process |
| Form is hard to use or inaccessible | Lost applicants, exclusion of candidates | Accessibility testing with keyboard and screen reader; test with real users |
| Spam or bot submissions | Noise for reviewers | Honeypot and rate limiting; add CAPTCHA only if needed |
| Existing applicant tracking system conflicts with a custom form | Duplicate effort | Decide on question 4 before building the form |
| Single owner / no content editor | Site goes stale | Name an editor; keep editing simple |

## 14. Open questions

1. Which organisation is this for, and is there existing branding?
2. Is it one project per graduate or a rotation across teams? (Affects the week-by-week content.)
3. What field is it in (software, data, business, other)?
4. Is there an existing applicant tracking system, or should the website collect and store applications itself?
5. Next start date and number of places?
6. Pay, work location (on-site, hybrid, remote), and what can be stated publicly?
7. Brand guidelines, logo, or example sites you like?
8. Any hosting, framework, or language preferences or constraints?
9. Who will review applications, and how many?
10. What retention period and legal basis apply to applicant data in your organisation?

## 15. Approvals

| Role | Name | Decision | Date |
|---|---|---|---|
| Product owner | Hannah Sullivan | Pending | |
| Data protection / HR | TBC | Pending | |
