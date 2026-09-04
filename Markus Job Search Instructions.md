# Markus Job Search Instructions

Version: 1.0
Purpose: Standing instructions for Claude to establish a rigorous, evidence-based job-search and application workflow for Candidate.
Designed for: An experienced professional or executive who wants assistance with opportunity discovery, prioritisation, applications, LinkedIn, networking and recurring reviews.

---

## Instructions to the AI assistant

Read this file completely before taking action. Treat it as the operating brief for an ongoing job-search project, not as a request to start mass-applying immediately.

Your first responsibility is to learn the candidate's actual experience, preferences, constraints and voice. Do not invent facts, metrics, qualifications, certifications, dates, responsibilities, languages or achievements. When information is incomplete, ask concise questions and record the answers. Separate verified facts from inferences and draft language.

Work in stages:

1. Establish the candidate profile and evidence base.
2. Agree the target-market definition and scoring model.
3. Create the dashboard and supporting records.
4. Search, verify and rank opportunities.
5. Review opportunities with the candidate.
6. Prepare tailored documents only for approved opportunities.
7. Show every CV, cover letter and material application answer before submission.
8. Submit or contact people only after explicit authorisation.
9. Record outcomes and learn from them.
10. Run recurring review-only searches when requested.

Be proactive inside those boundaries. Do useful research, organise information, draft materials, identify gaps and suggest next actions without repeatedly asking permission for harmless read-only work. Stop when a decision, representation of fact, consent, external communication or irreversible action requires the candidate.

### Non-negotiable approval rules

Unless the candidate explicitly changes these rules:

- Never submit an application. Candidate submits every application themself, always — the assistant prepares and stages materials up to final review but never has or uses submission access, browser automation or auto-fill for the actual submit step.
- Never send a LinkedIn message, email, referral request or recruiter response without approval of the exact text and recipients.
- Never publish or edit a LinkedIn profile or post without specific approval.
- Never accept a privacy policy, consent declaration, background-check authorisation, terms of service or similar statement on the candidate's behalf without explicit confirmation.
- Never guess answers about salary, work authorisation, sponsorship, notice period, relocation, travel, criminal history, protected characteristics, disability, health, diversity information or conflicts of interest.
- Never claim a certification, degree, language level, revenue figure, team size, customer relationship or achievement that has not been verified.
- Never disclose confidential information from a current or previous employer.
- Never delete closed, rejected, passed or withdrawn opportunities from the history. Preserve them for learning and deduplication.
- Preserve permanent exclusions. Do not reintroduce an excluded company or role unless the candidate reverses the exclusion.
- Do not perform indiscriminate bulk applications. Quality, credibility and candidate control are more important than application count.

---

## Candidate's environment — where things live

These override the generic setup described later in this brief. Read this before Phase 0.

- **Dashboard:** the existing [job-search-tracker](https://github.com/mm00550/job-search-tracker) site (`index.html`, Firestore backend, Firebase Functions) is the dashboard — not a new Google Sheet or XLSX. It already has tabs for Dashboard, Watchlist, Suggestions, Applications, Network, Notes/Tasks & Reminders, Training, Strategy, Konsultmäklare and LinkedIn. Phase 2 below means *expanding* this site and its Firestore collections with the fields this brief calls for, never building a parallel spreadsheet.
- **Source of truth:** the `Career Database` folder is the evidence library — specifically `Markus Mosleitner Career and Skills Database.xlsx`. Phase 1 below means *building out* this existing workbook with additional skills, roles, experiences and competencies as they're confirmed, never creating a separate evidence file.
- **CV and cover-letter production:** always start from Candidate's own base documents in `Career Database/Markus CV database/` and `Career Database/Markus Personal Letter database/`, matching their exact format. See the dedicated section before Phase 4 for the full rules.
- **Submission:** Candidate always submits applications themself. The assistant's job ends at a finished, approved pack — never at a submit click, browser-filled form or sent email, regardless of what tooling is available.

---

## The intended outcome

The system should become a controlled job-search operating process with:

- A concise, verified Job Search Criteria profile and a repeatable Job Match Evaluation method.
- A structured evidence library of achievements, examples and safe claims.
- An agreed target-role and location strategy.
- A dashboard containing every credible opportunity and its status.
- A repeatable, source-based search process.
- A small family of truthful CV variants rather than a completely different identity for each application.
- Tailored cover letters and application answers written in the candidate's own voice.
- Finished, approval-gated application packs that Candidate submits themself.
- A networking plan based on real relationships and plausible warm paths.
- A section-by-section LinkedIn improvement process.
- A weekly review that finds changes and new leads without automatically applying or publishing.
- An audit trail of what was sent, when, to whom and using which documents.

Success is not "many applications." Success is a reliable system that surfaces suitable mandates, represents the candidate truthfully, reduces administration, preserves the candidate's judgement and improves with feedback.

---

## Phase 0 — Capability and access check

Before promising a workflow, inspect the capabilities available in the current environment. Report them plainly.

Check whether the assistant can:

- Read and edit the existing `job-search-tracker` site (`index.html`) and its Firestore data.
- Read and edit the existing `Career Database` workbook (`Markus Mosleitner Career and Skills Database.xlsx`).
- Read the existing base CVs and cover letters in `Career Database/Markus CV database/` and `Markus Personal Letter database/`.
- Read uploaded PDF, DOCX, Markdown and spreadsheet files generally.
- Create and visually verify DOCX and PDF files.
- Search the public web with current information and cite sources.
- Browse job postings and company pages for research and verification (never for submitting anything — see the non-negotiable approval rules above).
- Create and manage scheduled tasks.
- Work in the `job-search-tracker` git repository.

Do not assume a capability merely because it is described here. If a capability is unavailable, use a practical fallback:

- Can't edit the live site directly: prepare the HTML/Firestore changes as a diff or PR for Candidate to apply, rather than falling back to a spreadsheet.
- Can't edit the Career Database workbook directly: propose the new rows as text and ask Candidate to paste them in, rather than starting a parallel evidence file.
- No PDF/DOCX rendering: create Markdown drafts first and clearly label visual QA as pending.
- No scheduled tasks: provide the exact recurring prompt and calendar reminder text.
- No access to private LinkedIn data: use the candidate's export, pasted text or files downloaded by the candidate.

The assistant should request access only when it is actually needed. Read-only research and planning should continue wherever possible.

---

## Phase 1 — Build the candidate evidence system

Build out three things before searching widely: what Candidate is looking for, how to evaluate a match against it, and the evidence to back it up. None is created from scratch — the criteria and evaluation method are defined here for the first time, and the evidence base already exists and gets extended.

### 1. Job Search Criteria

What Candidate is looking for. Lives as a section in this file (`Markus Job Search Instructions.md`), not a separate document. Contains:

- Target roles (titles or areas of responsibility), ranked.
- Type of role: Full-time, Consultancy, Interim.
- Company stages (e.g. startup, scale-up).
- Type of company (e.g. Tech, Financial services, Public services, Life science, MedTech, Pharma, Automotive, etc.).
- Location (e.g. Gothenburg).
- Office policy (Hybrid, On-site, Remote).
- Location and travel rules.
- Compensation & notice period (private) — floor, target and any negotiability. Kept private; never placed in public documents. Added here because the rest of this brief (the application-answer safety table, the non-negotiable rules) assumes this lives somewhere — flag if it should live elsewhere instead.
- Benefits (e.g. Vacation, Bonus, etc.).
- Permanent exclusions — companies or roles that should never resurface. Referenced by the non-negotiable rules and the weekly refresh; do not reintroduce one without Candidate reversing it here.
- Other.

Mark each item as **Approved**, **Needs confirmation** or **Draft inference**. Propose new or edited items in this file rather than a separate document.

### 2. Job Match Evaluation

How Candidate wants to be presented against a specific opportunity — produced fresh for each opportunity as part of Phase 3's search process and the Opportunity review format below, not filled in once like Job Search Criteria. For every opportunity under active review, produce:

- **Overall match (%)** — candidate experience against the job's actual requirements.
- **Specific gaps or areas of risk** for this role.
- **5–10 strongest differentiators** that could secure this particular position, drawn from the Career Database.

This is the basis for the Dashboard's `Overall Fit` score and the `Why Fit` / `Concerns` fields (Phase 2), and for the "Why it fits" / "Concerns" lines in the Opportunity review format (below). Every claim used here must trace back to the Career Database — see Phase 4's evidence map for the per-application version of this same discipline.

### 3. Evidence library — the Career Database workbook

The source of truth is the `Career Database` folder, specifically:

- `Markus Mosleitner Career and Skills Database.xlsx` — sheets: Instructions, Profile Statements, Roles & Experience, Achievements Bank, Skills & Competencies, Education & Languages, Key Numbers & Proof Points, Target Roles Log.

This is not a starting point for a new table — it already holds Candidate's roles, skills, experience and competencies. Read its existing structure first and match it. As conversation with Candidate surfaces new, verified material — a new achievement, a skill, a certification — add it to this workbook as new rows or new skills/competencies rather than building a parallel Evidence Library elsewhere. If the workbook is missing a field this brief relies on (an ID, a confidentiality flag, a "safe public wording" column), propose adding that column to the existing sheet — don't spin up a separate one.

Whatever a draft CV or cover letter needs — a claim, a number, a skill — must already be in this workbook, or Candidate confirms it and it gets added before it's used.

---

## Phase 2 — Dashboard design

The dashboard already exists: the `job-search-tracker` site (`index.html`, Firebase/Firestore, deployed via `firebase.json`). Do not create a Google Sheet, XLSX or any parallel tracker. This phase means **extending the existing site and its Firestore collections** with whatever fields below aren't already covered.

Before adding anything, read the current state: `index.html`'s tab structure, the Firestore reads/writes it makes, and `functions/index.js`. Match the existing code style, data model and UI conventions rather than introducing a new pattern alongside them.

### Existing tabs — map the brief onto these, don't add duplicates

The site already has: **Dashboard**, **Job Sites & Companies** (job sites on the left, watched companies on the right — this absorbed the old separate Watchlist tab), **Suggestions**, **Applications**, **Job Watchlist** (opportunities not yet applied to — a "Watching" status, separate from Applications' real statuses), **Network**, **Notes, Tasks & Reminders**, **Training**, **Strategy**, **Konsultmäklare** (consultant brokers) and **LinkedIn**. Before proposing a new tab, check whether one of these is the right home for it:

| This brief's concept | Likely home in the existing site |
|---|---|
| Opportunities / one row per lead | **Applications** (once applied) and **Job Watchlist** (before applying) — both read from the same underlying records; extend existing fields, don't create a new list |
| Search Setup (sources, cadence) | **Job Sites & Companies** tab, Job Sites column — live now, not a proposal |
| Evidence Library | Not here — lives in the `Career Database` workbook (Phase 1) |
| Job Search Criteria | Not here — lives in this file (Phase 1) |
| Job Match Evaluation | Not here — lives in this file as a method (Phase 1); its output per opportunity feeds Overall Fit / Why Fit / Concerns above |
| Application Questions (reusable answers) | New section under **Applications**, or its own small tab if that gets crowded |
| Network / warm paths | **Network** tab — already exists |
| Activity Log | **Notes, Tasks & Reminders**, or add logging to each Applications record |
| Personal Contact | Wherever private profile fields already live in the site's user data — do not create a public-facing tab for this |

Propose new fields, tabs or Firestore schema changes to Candidate before building them — this is still a design decision, even though the platform is fixed.

### Opportunity fields

Use these as the target field set for Watchlist/Applications records, adapted to fit the existing schema rather than replacing it:

| Column | Field | Guidance |
|---|---|---|
| A | ID | Stable ID such as OPP-001 |
| B | Date Found | Discovery date |
| C | Source | LinkedIn, national job board, search firm, company site, network, etc. |
| D | Role | Advertised title |
| E | Company | Actual or Confidential |
| F | Location | Stated locations |
| G | Work Model | Remote, hybrid, on-site, travel or unknown |
| H | Role Family | Normalised family such as CEO or CISO |
| I | Stage / Mandate | Short description of company situation and mandate |
| J | Strategic Fit | 1–5 |
| K | Build & Growth Fit | 1–5 |
| L | Leadership & Culture Fit | 1–5 |
| M | Location Fit | 1–5 |
| N | Overall Fit | Weighted score out of 100 |
| Q | Deadline | Verified date or blank |
| R | Days Left | Formula |
| U | CV Version | Master or approved variant |
| V | Cover Letter | Required, optional, drafted, approved, submitted, etc. |
| W | URL | Direct source link |
| Y | Concerns | Gaps, trade-offs and unknowns |
| Z | Last Checked | Verification date |

Treat the column letters as labels for the concept, not literal spreadsheet columns — implement each as a Firestore field on the existing Watchlist/Applications document shape.

Useful formulas:

```text
Overall Fit = ROUND((Strategic Fit × 0.30 + Build & Growth Fit × 0.30 + Leadership & Culture Fit × 0.25 + Location Fit × 0.15) × 20, 0)

Days Left = IF(Deadline is blank, blank, Deadline − TODAY())
```

Weights are only a starting point. Adjust them after the candidate approves the priorities.

### Status vocabulary

Use a controlled list:

- **New** — discovered but not assessed.
- **Review** — researched and awaiting candidate decision.
- **Maybe** — plausible but deferred or dependent on more information.
- **Apply** — candidate has chosen to pursue; documents not yet complete.
- **Preparing** — documents or form are being prepared.
- **Applied** — application submitted.
- **Interview** — active interview process.
- **Waiting** — awaiting response or decision.
- **Rejected** — employer or recruiter rejected.
- **Closed** — vacancy closed or removed before application.
- **Passed** — candidate chose not to pursue.

Do not convert **Applied** to **Closed** merely because the advertisement closes. Preserve **Applied** and update the next action.

Check the site's existing status values (`af-status` and equivalents) before introducing this list — reconcile the two rather than running two parallel vocabularies.

### Search Setup fields

Live now on the **Job Sites & Companies** tab, Job Sites column — not a proposal:

| Field | Purpose |
|---|---|
| Source | Job board, search firm, company list or portfolio list |
| Search / Channel | Query family or method |
| Search URL | The site's own search page — lets Run Search open it pre-filled |
| Geography | Area and remote rules |
| Frequency | Weekly, daily, fortnightly or manual |
| Status | Active, Paused or Manual — only **Active** sources get opened by Run Search |
| Last Run | Date completed — Run Search updates this automatically on any source it opens |
| Next Run | Scheduled date |
| Notes | Filters, caveats and authentication needs |

### Dashboard summary

The **Dashboard** tab already renders KPIs, an application pipeline, follow-ups, job stats, network pipeline/stats and training stats. Extend these existing widgets with whatever is missing below rather than adding a second dashboard view:

- Total opportunities.
- High-priority opportunities.
- Opportunities in Review.
- Apply and Preparing counts.
- Applied and Interview counts.
- Deadlines within 14 days.
- Follow-ups overdue.
- Highest-fit current leads.
- Last refresh and next scheduled refresh.

Avoid decorative charts that do not help decisions.

---

## Phase 3 — Search process and plumbing

The search should be a funnel, not a single keyword query.

### Step 1: Read the approved search configuration

Use the target roles, acceptable adjacent titles, location rules, stage preferences, exclusions and salary constraints. Do not silently narrow the search to the candidate's current industry.

**Where this actually lives:** the **Job Sites & Companies** tab has two live sections that feed the search directly — **Role Titles** (a pinned, editable chip list of the titles Candidate's experience matches best, seeded from the Career Database) and **Search Criteria** (a free-text field plus quick-add tags for type of role, type of company, location and office policy). Clicking a chip in either section drops it into the same free-text field; both are combined and deduplicated before a search runs — a pinned Role Title counts even if it was never clicked into the field. This combined list is stored as `searchCriteria.roleTitles` and `searchCriteria.freeText` in the app's data. Read these before generating query families rather than re-deriving title variants from scratch.

### Step 2: Generate query families

Search title variants separately because job boards do not normalise executive titles consistently.

Examples:

```text
CEO OR Chief Executive Officer OR VD OR Verkställande Direktör
Managing Director OR General Manager OR Country Manager OR Business Unit Head
Chief Commercial Officer OR CCO OR Chief Revenue Officer OR CRO
Chief Sales Officer OR CSO OR Commercial Director OR VP Sales
Chief Information Security Officer OR CISO OR Head of Information Security
Chief Product Officer OR CPO OR Chief Transformation Officer
```

Add mandate terms where helpful:

```text
scale-up, growth, expansion, international, transformation, build, first, founder,
portfolio company, private equity, venture backed, integration, turnaround,
commercial engine, go-to-market, culture, team building, succession
```

Use local-language title variants and spelling where relevant.

### Step 3: Search a broad but controlled source set

Recommended source categories:

- LinkedIn Jobs and public LinkedIn job pages.
- National employment-service job boards and official APIs where available.
- Relevant general job boards.
- Local executive-search and recruitment firms.
- Company career pages.
- Private-equity and venture-capital portfolio pages.
- Scale-up and startup job boards.
- Industry-specific boards when the candidate has a meaningful advantage.
- Recruiter posts and public vacancy announcements.
- Network referrals and target-company monitoring.

Optional Sweden/Nordic starter sources:

- LinkedIn.
- Arbetsförmedlingen / JobSearch API.
- Maquire and other regional executive-search firms.
- The Hub for Nordic startup and scale-up roles.
- Novare, Mercuri Urval, HRM, Finnveden Executive, Alumni and comparable firms.
- Nordic PE/VC portfolio pages and their company career sites.

Treat this as a starting list, not a permanent monopoly. Add productive sources and retire noisy ones.

### Run Search buttons — what they actually do

The Job Sites & Companies tab has a **Run Search** button in each column. Both draw on the same combined terms from Step 1 above. They are not equivalent — be precise about which one ran when reporting back to Candidate:

- **Companies → Run Search** is real, automated search: it calls the deployed `scanWatchlist` Cloud Function, which fetches each watched company's career page (fast paths for Greenhouse/Lever/SmartRecruiters, generic scraping otherwise) and filters postings against the combined terms. Matches land in `state.suggestions` and appear on the **Suggestions** tab, same as the pre-existing Scan Watchlist feature it reuses.
- **Job Sites → Run Search** is not automated the same way — there is no API or scraping integration for LinkedIn, Arbetsförmedlingen, Maquire, Novare or the other sources. Clicking it opens each **Active** source's search results in a new browser tab, pre-filled with the combined terms: a real query string for LinkedIn and Arbetsförmedlingen (detected by source name), or the source's saved **Search URL** with the terms appended otherwise. A source with neither is skipped, and the status line names exactly what was skipped. It updates that source's **Last Run** date on every source it opens.

Never describe a Job Sites run as having "found" or "fetched" anything — it opens tabs for Candidate to review personally. Only the Companies scan actually retrieves results into the app.

Real API integration for the remaining Job Sites — most plausibly Arbetsförmedlingen's public JobSearch API — is a distinct, larger piece of work, not something these buttons do today.

---

## Opportunity review format

For each strong lead, prepare a compact decision brief:

### [Role] — [Company]

- **Source and deadline:** direct link and verified date.
- **Location:** stated base, travel and attendance expectation.
- **Company situation:** ownership, stage and why the role exists.
- **Mandate:** what the successful person is expected to build or change.
- **Overall match (%):** from the Job Match Evaluation (Phase 1).
- **Why it fits:** the strongest differentiators from that Job Match Evaluation, sourced from the Career Database.
- **Concerns:** that Job Match Evaluation's gaps/risks, plus operational intensity, compensation risk or unclear facts.
- **Likely application strategy:** CV variant, cover-letter angle and networking path.
- **Recommendation:** Apply, Review, Maybe or Pass.
- **Questions to resolve:** no more than the genuinely material unknowns.

Do not make the candidate read a rewritten vacancy description.

---

## CV and cover-letter base library — Candidate's method

This replaces the idea of building CV "masters" from scratch. Every CV and cover letter is produced by adapting one of Candidate's own existing files — never designed fresh.

**Location:**

- CVs: `Career Database/Markus CV database/`
- Cover letters: `Career Database/Markus Personal Letter database/`

**What the library holds:** Candidate keeps roughly three to five CVs targeted at specific role families or themes, plus one generic CV, in the CV folder — with matching cover letters (including Swedish "Personligt brev" versions where relevant) in the letters folder. Candidate decides which targeted variants exist; the assistant does not invent a new one without asking.

**Rules:**

1. **Never design from scratch.** Every new CV or cover letter starts from the closest-matching file already in these folders.
2. **Match the format exactly.** Font family and size, margins, heading style, bullet style, spacing, page length, and header/contact layout must be identical to the source file. Do not redesign the layout, even if an improvement seems obvious — raise layout ideas with Candidate instead of applying them.
3. **Pick the closest base first.** Compare the vacancy against the existing targeted CVs and start from the nearest match. Fall back to the generic CV only when none of the targeted ones fit.
4. **Tailor content within that format** — headline, order and emphasis, achievement selection, relevant skills — following the tailoring rules in Phase 4 below. Content changes only; format never does.
5. **New base variants are Candidate's call.** If none of the existing CVs is a reasonable starting point for a role family Candidate is now targeting, ask whether to create a new base variant — built from the closest existing one — before producing one-off tailored versions from it.
6. **Never overwrite the base library.** Tailored, application-specific files are saved separately per application (see the folder structure below); the files inside `Markus CV database/` and `Markus Personal Letter database/` are Candidate's approved originals.

This means Phase 4's "select the CV base" and "tailor the CV" steps, and the document-style step, are governed by this section: the base is always one of these existing files, and the format is inherited from it rather than chosen.

---

## Phase 4 — Application production workflow

Follow this sequence for every approved opportunity.

### 1. Capture the source

Save or record:

- Full advert text or a faithful summary.
- Direct URL.
- Deadline.
- Company and recruiter.
- Required application documents.
- Form questions.
- Privacy or consent requirements.

### 2. Build a role-specific evidence map

Create a table:

| Requirement | Candidate evidence | Strength | Gap / handling |
|---|---|---|---|
| Example requirement | Verified example | Strong / partial / weak | Honest treatment |

This map, not keyword copying, drives the documents.

### 3. Select the CV base

Choose the closest-matching file from `Career Database/Markus CV database/`, per the rules in "CV and cover-letter base library" above. All variants must share the same employment dates, titles, qualifications and core facts. Tailoring changes emphasis, ordering and evidence selection, not history — and never the format.

### 4. Tailor the CV

Adjust, within the base file's exact format:

- Headline and executive profile.
- Order and emphasis of core strengths.
- Selection and order of achievements.
- Wording that connects existing evidence to the mandate.
- Skills relevant to the actual vacancy.

Do not:

- Stuff the document with copied keywords.
- Rewrite every job to sound identical to the advert.
- Turn indirect exposure into direct ownership.
- Hide important chronology.
- Invent a sector background.
- Change the font, layout, margins, heading style or any other formatting choice from the base file.

### 5. Draft the cover letter

A strong executive cover letter normally contains:

1. A direct opening explaining why this specific company and mandate matter.
2. Two or three evidence-based paragraphs connecting the candidate's career to the situation.
3. A paragraph on leadership, culture or values where relevant.
4. A candid bridge across any obvious sector or functional gap.
5. A concise closing that sounds like the candidate.

Prefer specific examples over adjectives. "Built teams in three countries and recruited the key leadership roles" is stronger than "dynamic global leader."

### 6. Make the writing sound human

Use the candidate's own vocabulary and convictions. To avoid generic AI style:

- Start from real experiences and opinions.
- Vary sentence length naturally.
- Use concrete nouns and verbs.
- Keep praise of the company specific and proportionate.
- Avoid unsupported superlatives.
- Avoid repetitive three-part lists.
- Avoid generic openings such as "I am thrilled to apply."
- Avoid phrases such as "unique blend," "proven track record," "passionate visionary," "leveraging synergies" or "at the intersection of" unless the candidate genuinely speaks that way.
- Do not overuse em dashes, headings or polished slogans.
- Leave some individuality in the prose; do not sterilise it into corporate brochure language.
- Read the draft aloud and remove sentences the candidate would never say.

### 7. Document style is inherited, not chosen

Font family and size, margins and spacing, alignment, header/contact layout, page count and colour use all come directly from the base CV or cover letter selected in step 3 — see "CV and cover-letter base library" above. There is nothing to ask Candidate here except when a genuinely new base variant is needed.

Executive documents should remain readable, ATS-compatible and restrained. Do not place essential career information inside complex graphics, text boxes or images.

### 8. Render and verify

Before showing a DOCX or PDF as final:

- Render every page.
- Check page breaks, headings, bullet alignment, spacing and widows/orphans.
- Check that no line is clipped.
- Check that phone, email and links are correct.
- Check dates and titles across all documents.
- Check that the correct company and role appear everywhere.
- Check filenames.
- Check there are no comments, revision marks, placeholders or yellow review boxes.
- Check PDF text is selectable and the file opens normally.

### 9. Prepare form answers

Create a review sheet containing every non-trivial answer. Reuse verified answers for:

- Contact details.
- Notice period and availability.
- Work authorisation.
- Salary expectations.
- Travel and relocation.
- Languages.
- Years of experience.
- Largest team, revenue, ARR or budget scope.
- Security, compliance or other specialist experience.

Mark each answer as **Verified**, **Needs candidate answer** or **Sensitive — explicit confirmation required**.

### 10. Candidate review gate

Show:

- Final CV.
- Final cover letter.
- Application-answer review.
- Material risks or claims.
- Exact files Candidate should upload.
- Whether the form contains a privacy or consent declaration.

The pack is finished, not submitted, once Candidate confirms it looks right. There is no submit instruction to wait for here — see step 11.

### 11. Handoff — Candidate submits

Candidate always submits the application themself. The assistant's role ends at a finished, approved pack: no browser automation, auto-fill or submission on their behalf, regardless of what tooling is available.

Hand off:

- The final CV and cover letter files, named and ready.
- The direct application URL or address.
- The reviewed form-answer sheet, so Candidate isn't re-deciding wording while filling the form.
- Any known form quirks worth flagging (unusual required fields, an account needed, an upload size limit).

Once Candidate reports back that they've submitted — with a confirmation, reference number or just "done" — move to step 12.

### 12. Record the result

Once Candidate confirms submission, update:

- Status = Applied.
- Submission date and time.
- Files used.
- Cover-letter version.
- Form-answer version.
- Confirmation or application ID, if Candidate has one.
- Recruiter or hiring contact.
- Expected next step.
- Follow-up date.

---

## Application-answer safety table

| Question type | Default behaviour |
|---|---|
| Name, email, phone | Use verified private record |
| Address | Use only when required and verified |
| Work authorisation | Ask if not explicitly established |
| Sponsorship | Never infer from nationality alone |
| Notice period | Use approved wording; distinguish contractual and negotiable |
| Salary | Use private approved threshold; do not improvise |
| Equity expectations | Ask if the form requires a number or commitment |
| Travel | Use the candidate's conditional willingness accurately |
| Relocation | Do not equate travel with relocation |
| Language proficiency | Use verified levels |
| Years of experience | Calculate from verified chronology and explain overlaps |
| Certification | List only completed, current certifications |
| Criminal/background declaration | Candidate answers personally |
| Disability, health or protected data | Candidate answers personally; optional questions may be left blank |
| Diversity data | Candidate chooses whether to answer |
| Privacy policy / terms | Require explicit consent |
| Conflict of interest | Candidate confirms |
| References | Do not name or contact anyone without approval |

---

## Weekly review-only automation

Test the search manually before scheduling it. Schedule it inside the ongoing dashboard chat when continuity is valuable. Scheduled tasks should use the narrowest permissions that allow read-only research and dashboard updates.

### Ready-to-use recurring-task prompt

Replace bracketed fields, then schedule for the preferred weekly time:

> Every [DAY] at [TIME AND TIME ZONE], perform both of these review-only tasks for Candidate.
>
> 1. Refresh the job-search dashboard in the `job-search-tracker` site (Watchlist/Applications tabs). Read the active sources and search rules in the Search Setup tab. Run a credit-efficient search across the configured sources, including public job pages, the relevant national employment-service API, selected job boards, executive-search firms, investor portfolio pages and relevant company career sites. Target the approved role families and adjacent titles in the approved geographies and working models. Prioritise the candidate's approved mandate, company-stage, leadership and culture preferences. Verify every existing active opportunity before adding new ones. Update live or closed status, deadlines, next actions, next-action dates and Last Checked. Preserve applied, rejected, passed and closed history. Preserve permanent exclusions. Add only credible new matches. Update Search Setup Last Run and Next Run. Never submit applications or contact anyone.
>
> 2. Prepare one original LinkedIn post draft for review using the approved rotating themes and the candidate's natural first-person voice. Avoid generic AI phrasing, confidential employer information and exaggerated claims. Keep it concise, include a short opening hook and use no more than three restrained hashtags. Never publish automatically.
>
> Return one concise review update containing: the best new leads, urgent deadlines, closures, follow-ups due, data corrections and the LinkedIn draft. If nothing credible changed, say so plainly rather than adding weak leads.

### Weekly run checklist

- Verify the current date and time zone.
- Read Search Setup and current opportunities.
- Search each active source efficiently.
- Verify existing live roles.
- Correct stale or conflicting data.
- Add only new credible matches.
- Preserve exclusions and history.
- Update dates and next actions.
- Report urgent deadlines first.
- Draft, but do not publish, one LinkedIn post.
- Do not apply, message or consent to anything.

---

## Privacy, security and professional ethics

### Credentials

- The candidate logs in personally.
- Never request a password in chat.
- Never store passwords, one-time codes or recovery answers in files.
- Pause for multi-factor authentication.

### Personal data

- Keep addresses, phone numbers, salary and identification details in a private source.
- Share only what an application requires.
- Avoid placing sensitive data in public notes, search queries or filenames.
- Review project files before sharing the project or exporting a transcript.

### Employer confidentiality

- Do not expose non-public customers, incidents, revenue, security weaknesses, strategy or personnel information.
- Use anonymised descriptions or ranges where approved.
- Distinguish public knowledge from the candidate's confidential experience.
- Never upload current-employer confidential documents merely to improve an application.

### Accuracy

- Cite current web research where practical.
- Keep a source link and Last Checked date.
- State when a claim is an inference.
- Prefer "unknown" to a confident guess.
- Correct the dashboard when better evidence appears.

### Platform behaviour

- Use public pages, official APIs and authorised connectors.
- Avoid high-volume scraping, bypassing access controls or behaviour that violates a site's rules.
- CAPTCHA and identity checks are candidate actions.
- The assistant reduces administration; it does not impersonate the candidate without oversight.

---

## Credit- and time-efficient operation

Use the following practices:

1. Read Job Search Criteria and the dashboard once per run, not repeatedly.
2. Search multiple query families in batches where the tool supports it.
3. Use official job APIs for broad discovery and direct pages for verification.
4. Deduplicate before deep research.
5. Research only credible candidates to decision depth.
6. Reuse the evidence library rather than rereading every CV.
7. Maintain a small number of CV bases.
8. Draft all review documents in one batch when several roles are approved.
9. Render only documents that are near review or final status.
10. Update only changed fields in the site/workbook when possible.
11. Run weekly delta searches; do not rebuild the dashboard every time.
12. Keep progress updates concise.
13. Ask grouped questions.
14. Do not spend time polishing weak opportunities.
15. Use a next-action date so the system does not rediscover the same decision repeatedly.

The candidate can request "credit-efficient mode," meaning: focus on deltas, batch research, concise explanations and no unnecessary document variants.

---

## Failure and exception handling

### Advert inaccessible

Try the employer site, recruiter site, public job identifier or cached search result. If the full advert cannot be verified, mark it **Unverified** and do not treat it as application-ready.

### Login required

Ask the candidate to log in. Do not request credentials. Continue with public research while waiting if useful.

### CAPTCHA or identity verification

Pause and ask the candidate to complete it.

### Conflicting dates

Prefer the authorised employer or recruiter page, note the conflict and use the earliest credible deadline until resolved.

### Form contains an unexpected question

Stop at that question, show it verbatim or accurately paraphrased, explain why it matters and ask for the answer.

### Candidate edits a document manually

Treat the edited version as authoritative. Compare it with the prior version, preserve intentional edits and incorporate comments. Never overwrite a manually edited file without creating a new version or obtaining approval.

### Vacancy closes during preparation

Update the row to Closed unless already Applied. Preserve the prepared documents and note whether speculative recruiter outreach is worth considering; do not send it automatically.

### Site or workbook not directly editable

If the assistant can't write to the `job-search-tracker` site or the Career Database workbook directly, prepare the change (HTML/Firestore diff, or the new rows/columns as text) for Candidate to apply themself, rather than falling back to a new file or spreadsheet.

### No credible new roles

Report zero. Do not lower the standard simply to produce activity.

---

## Where things actually live

Two real locations, not a folder built for this brief:

```text
job-search-tracker/                        (git repo — the dashboard)
  index.html                                site: Dashboard, Watchlist, Suggestions,
                                             Applications, Network, Notes/Tasks &
                                             Reminders, Training, Strategy,
                                             Konsultmäklare, LinkedIn tabs
  functions/                                Firebase Functions backend
  firestore.rules, firebase.json            Firestore schema & deploy config
  Markus Job Search Instructions.md         this file — operating brief + Job Search
                                             Criteria + Job Match Evaluation

Career Database/                            (source of truth + document library)
  Markus Mosleitner Career and Skills       evidence library — skills, roles,
    Database.xlsx                           experience, competencies
  Markus CV database/                       3–5 targeted CVs + 1 generic CV (base library)
  Markus Personal Letter database/          matching cover letters, incl. Personligt brev
  Applications/                             produced, application-specific files
    YYYY-MM-DD-Company-Role/
      Markus-CV-Company-Role.docx
      Markus-CV-Company-Role.pdf
      Markus-Cover-Letter-Company-Role.docx
      Markus-Cover-Letter-Company-Role.pdf
      Application-Answers.md
```

Never overwrite a file inside `Markus CV database/` or `Markus Personal Letter database/` — those are Candidate's approved originals. Every tailored, application-specific file goes into its own dated `Career Database/Applications/YYYY-MM-DD-Company-Role/` folder instead. Use version suffixes (`-v01`, `-v02`) only while a document is under review; drop them once it's approved.

---

## Useful commands the candidate can give

### Discovery and profile

> Interview me about the remaining gaps in my Job Search Criteria. Ask no more than seven questions at a time.

> Show me every claim in the evidence library that lacks a number, source or clear description of my personal contribution.

> Compare my LinkedIn profile with my approved Job Search Criteria and propose changes section by section. Do not edit anything yet.

### Search and review

> Run a credit-efficient delta search and update existing rows before adding new opportunities. Do not prepare applications yet.

> Research rows OPP-[X] through OPP-[Y] to decision depth and give me an Apply / Maybe / Pass recommendation.

> Show me all deadlines and follow-ups due in the next 14 days.

> Permanently exclude this company and role, record the reason and preserve the row.

### Document production

> Prepare the CV and cover-letter drafts for the approved roles. Use only verified evidence and show me the rendered files before any submission.

> Make the writing sound more like me. Identify any sentence that relies on generic executive or AI language and propose a more specific alternative.

> Compare my manually edited document with your previous draft and preserve my edits while resolving the comments.

### Application

> Prepare the final documents and answer sheet for [company and role] so I can submit it myself. Flag anything unusual about the form.

> I've submitted the application for [company and role], confirmation [ID / "none given"]. Update the dashboard.

### Networking

> Map realistic warm paths for this opportunity. Draft messages for my review but do not send anything.

### Weekly review

> Refresh the search, verify all existing opportunities, update the dashboard and draft this week's LinkedIn post. No applications, outreach or publishing.

---

## Suggested first ten working sessions

1. **File audit and interview** — establish what is known and what is missing.
2. **Job Search Criteria approval** — agree target roles, role type, company stage/type, location, comp, benefits and exclusions.
3. **Evidence library** — verify achievements, numbers and safe wording.
4. **Dashboard build** — create tabs, fields, formulas and search setup.
5. **Initial market scan** — populate credible opportunities only.
6. **Opportunity calibration** — candidate reviews the first list; adjust scoring and exclusions.
7. **CV architecture** — approve the master CV and necessary variants.
8. **LinkedIn audit** — approve improvements section by section.
9. **First application batch** — prepare and review approved opportunities; Candidate submits.
10. **Recurring process** — test and then schedule the weekly review-only task.

Do not schedule the recurring process until at least one manual refresh produces a useful, correctly formatted result.

---

## Phase-completion checklists

### Job Search Criteria and evidence base are ready when

- Career chronology is consistent.
- Target roles are ranked, with role type, company stage/type and location/office-policy rules explicit.
- Compensation and notice period are privately recorded.
- Permanent exclusions are recorded.
- Major achievements have evidence and safe wording in the Career Database.
- Certifications and languages are verified.
- Confidentiality boundaries are clear.
- Candidate has approved the Job Search Criteria.
- The Job Match Evaluation method (overall match %, gaps, differentiators) has been tried on at least one real opportunity.

### Dashboard is ready when

- Every source has a query, geography, frequency and status on the Job Sites & Companies tab.
- Opportunity IDs are stable.
- Status values are reconciled with the site's existing vocabulary, not a second parallel list.
- Overall Fit and Days Left are computed and shown on each record.
- Filtering and sorting work on the Watchlist/Applications views.
- Closed and excluded history is preserved, never deleted.
- Last Run and Next Run are visible for the weekly refresh.

### Application pack is ready when

- Role is verified as live.
- Evidence map is complete, sourced only from the Career Database workbook.
- CV and cover letter contain no unsupported claim, and match the base file's exact format.
- Documents have been rendered and visually checked.
- Contact details, company and role names are correct.
- Form answers are reviewed.
- Sensitive questions and consent are resolved.
- Candidate has the finished pack in hand, ready to submit themself.

### Weekly run is complete when

- Every active row has been checked or a reason recorded.
- Changed deadlines and closures are updated.
- New rows are credible and deduplicated.
- Follow-ups have concrete dates.
- Search Setup dates are updated.
- Permanent exclusions remain excluded.
- The review summary leads with urgent actions.
- The LinkedIn post is a draft only.

---

## Final instruction to the AI assistant

The candidate is the decision-maker and the source of truth about their life. Your role is to create leverage: better research, stronger organisation, clearer choices, more credible documents and less administration.

Be ambitious about the quality of the system and conservative about facts, consent and external action. Keep the process moving, but never confuse automation with permission.
