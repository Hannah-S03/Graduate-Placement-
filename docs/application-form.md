# Google Form: question list and setup checklist

Create the form in the organisation's Google Workspace account (not a personal account), then paste its link into `src/config.js` (`googleFormUrl`). Claude can't create the form for you, so use this list.

## 1. Form 1: Application

**Title:** Graduate Placement Application
**Description:** Takes about 15 minutes. Please read our privacy notice first (link to the Privacy page on the site).

### Section 1: About you
| Question | Type | Required |
|---|---|---|
| Full name | Short answer | Yes |
| Email address | Short answer (validation: email) | Yes |
| Phone number | Short answer | Yes |
| Where are you based? (city and country) | Short answer | Yes |

### Section 2: Education
| Question | Type | Required |
|---|---|---|
| University | Short answer | Yes |
| Degree and subject | Short answer | Yes |
| Grade achieved or expected | Dropdown (First, 2:1, 2:2, Third, Other / not applicable) | Yes |
| Graduation date (month and year) | Date or short answer | Yes |

### Section 3: Eligibility
| Question | Type | Required |
|---|---|---|
| Do you have the right to work in [country]? | Multiple choice (Yes / No) | Yes |
| Are you available for all 12 weeks of the placement? | Multiple choice (Yes / No) | Yes |
| Earliest date you could start | Date | Yes |

### Section 4: Experience
| Question | Type | Required |
|---|---|---|
| Link to your CV (Google Drive, Dropbox or similar, set so anyone with the link can view) | Short answer (validation: URL) | Yes |
| Link to your LinkedIn, portfolio or GitHub | Short answer (validation: URL) | No |

*File upload alternative:* Google Forms can accept a CV upload, but every applicant must then sign in to a Google account, and files are stored in the form owner's Drive. Use the link question above unless you have decided that is acceptable.

### Section 5: Tell us about you
| Question | Type | Required |
|---|---|---|
| Why do you want this placement? (about 250 words) | Paragraph (validation: maximum 1,500 characters) | Yes |
| Tell us about a project you're proud of (about 250 words) | Paragraph (validation: maximum 1,500 characters) | Yes |
| Which teams are you most interested in? (this helps us plan rotations and does not affect selection) | Checkboxes (the team names from `src/data/company.js`) | No |
| Do you need any adjustments during the application process or the placement? | Paragraph | No |

### Section 6: Consent
| Question | Type | Required |
|---|---|---|
| I have read the privacy notice and consent to my information being used to assess my application | Checkbox | Yes |

## 2. Form 2: Equal opportunities (separate form)

Optional monitoring questions (for example gender, ethnicity, disability, school type). Keep this as a **separate form** with its own Sheet and **do not collect names or email**, so reviewers can't link answers to applications. Link to it from the confirmation message of Form 1 (optional).

## 3. Settings checklist

- [ ] **Responses → Link to Google Sheets** (restrict the Sheet to named reviewers)
- [ ] **Responses → Get email notifications for new responses** (programme team)
- [ ] **Settings → Responses → Send responders a copy of their response: Always** (collect email addresses is required for this)
- [ ] **Settings → Presentation → Confirmation message:** thank applicants and say when they will hear back
- [ ] **Settings → Responses:** turn off "Allow response editing" unless wanted
- [ ] Set a closing process: turn off **Accepting responses** on the closing date, or schedule it with an add-on or Apps Script
- [ ] Add the form's **embed link** to `src/config.js` as `googleFormUrl` (use the "Send → `<>` embed" link, keeping `?embedded=true`)
- [ ] Test submit from a phone and from a computer, and check the response reaches the Sheet and email
- [ ] Delete test responses before launch

## 4. Data protection checklist

- [ ] Retention period agreed (assumed: delete unsuccessful applications after 6 months)
- [ ] Privacy notice reviewed (`privacy.html`)
- [ ] Only named reviewers have access to the Sheet and any Drive files
- [ ] A calendar reminder exists to delete data on schedule
