const { onRequest } = require("firebase-functions/v2/https");
const cheerio = require("cheerio");

const UA = "Mozilla/5.0 (compatible; JobScanner/1.0; +https://job-search-tracker-ddace.web.app)";

// Workday-hosted career sites (myworkdayjobs.com) serve postings from a
// client-side JSON API, same principle as the other KNOWN_ATS entries below —
// just with a tenant/datacenter/site path to pull out of the URL first.
// Matches both a direct Workday URL and one with a locale prefix (e.g. "/en-US/").
const WORKDAY_URL_RE = /https?:\/\/([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/"'?#\s]+)/i;
const WORKDAY_PAGE_SIZE = 20; // Workday's CXS API rejects a larger "limit" with HTTP 400
const WORKDAY_MAX_PAGES = 20; // reasonable cap — up to 400 postings, well past a typical company's open reqs
// Workday's search API only gives a vague "N Locations" summary for a
// multi-location posting — the actual per-location breakdown isn't in this
// endpoint's response. The posting's own URL does embed one real location
// though (e.g. "/job/Gothenburg/Senior-Product-Manager..."), so that's used
// as a fallback whenever locationsText is just a bare count like this —
// otherwise a location-filtered search wrongly excludes postings that are
// genuinely open in the requested city, just not the only one listed.
const VAGUE_LOCATION_COUNT = /^\d+\s+Locations?$/i;
function workdayLocationFromPath(externalPath) {
  const m = (externalPath || "").match(/^\/job\/([^/]+)\//);
  return m ? decodeURIComponent(m[1]).replace(/-/g, " ").trim() : "";
}
async function fetchWorkdayJobs(tenant, wd, site) {
  const jobs = [];
  for (let page = 0; page < WORKDAY_MAX_PAGES; page++) {
    const r = await fetch(`https://${tenant}.${wd}.myworkdayjobs.com/wday/cxs/${tenant}/${site}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: WORKDAY_PAGE_SIZE, offset: page * WORKDAY_PAGE_SIZE, searchText: "" }),
    });
    if (!r.ok) break;
    const data = await r.json();
    const postings = data.jobPostings || [];
    postings.forEach((j) => {
      if (!j.title) return;
      const location = (j.locationsText && !VAGUE_LOCATION_COUNT.test(j.locationsText))
        ? j.locationsText
        : workdayLocationFromPath(j.externalPath) || j.locationsText || "";
      jobs.push({
        title: j.title,
        location,
        workModel: j.remoteType || "", // "On-Site" / "Hybrid" / "Remote" — Workday's own field, not available from generic scraping
        url: `https://${tenant}.${wd}.myworkdayjobs.com/${site}${j.externalPath}`,
      });
    });
    // Workday's own "total" field is unreliable across pages (comes back 0
    // on later pages even mid-list) — a short page is the only trustworthy
    // end-of-list signal.
    if (postings.length < WORKDAY_PAGE_SIZE) break;
  }
  return jobs;
}

// Known ATS platforms expose stable JSON APIs — far more reliable than scraping
// the rendered HTML, so we try to match the career site URL against these first.
const KNOWN_ATS = [
  {
    name: "workday",
    test: (url) => WORKDAY_URL_RE.test(url),
    fetchJobs: async (url) => {
      const m = url.match(WORKDAY_URL_RE);
      if (!m) return [];
      return fetchWorkdayJobs(m[1], m[2], m[3]);
    },
  },
  {
    name: "greenhouse",
    test: (url) => /greenhouse\.io/.test(url),
    fetchJobs: async (url) => {
      const board = (url.match(/greenhouse\.io\/([^/?#]+)/) || [])[1];
      if (!board) return [];
      const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`);
      if (!r.ok) return [];
      const data = await r.json();
      return (data.jobs || []).map((j) => ({
        title: j.title,
        location: j.location && j.location.name || "",
        url: j.absolute_url,
      }));
    },
  },
  {
    name: "lever",
    test: (url) => /lever\.co/.test(url),
    fetchJobs: async (url) => {
      const company = (url.match(/lever\.co\/([^/?#]+)/) || [])[1];
      if (!company) return [];
      const r = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`);
      if (!r.ok) return [];
      const data = await r.json();
      return (data || []).map((j) => ({
        title: j.text,
        location: (j.categories && j.categories.location) || "",
        url: j.hostedUrl,
      }));
    },
  },
  {
    name: "smartrecruiters",
    test: (url) => /smartrecruiters\.com/.test(url),
    fetchJobs: async (url) => {
      const company = (url.match(/smartrecruiters\.com\/([^/?#]+)/) || [])[1];
      if (!company) return [];
      const r = await fetch(`https://api.smartrecruiters.com/v1/companies/${company}/postings`);
      if (!r.ok) return [];
      const data = await r.json();
      return (data.content || []).map((j) => ({
        title: j.name,
        location: (j.location && [j.location.city, j.location.country].filter(Boolean).join(", ")) || "",
        url: j.applyUrl || j.ref || "",
      }));
    },
  },
];

// Job-posting URL patterns, English and Swedish — Swedish boards use "jobb",
// "tjänst(er)", "annons(er)" where English ones use "job(s)"/"career(s)" etc.
const JOB_HREF = /\/(jobs?|vacanc\w*|careers?|positions?|openings?|jobb|tj[aä]nster?|annons(er)?|lediga-jobb)\//i;
// An individual posting almost always carries some kind of unique id in the
// URL (a UUID, a run of digits, or a short opaque hex id like ledigajobb.se's
// "/jobb/cc29e5/...") — a category/filter link in the same nav (e.g.
// "/jobb/re-stockholms-lan/") typically doesn't, so this is what tells a real
// listing apart from navigation on the same search-results page.
const HAS_ID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{4,}|(?:^|\/)[0-9a-f]{6,}(?:\/|$)/i;
// Many sites put the actual job title in a heading next to the link rather
// than in the link's own text (the link just says "see job details" or
// similar) — these are the generic phrases that trigger falling back to a
// nearby heading instead of trusting the link text.
const GENERIC_LINK_TEXT = /^(läs mer|read more|view job|see job|apply|ansök|se jobbdetaljer|more info|details?|show more|visa mer)$/i;

// Best-effort fallback for everything else: pull embedded SSR JSON (Next.js
// __NEXT_DATA__ and similar) when present, otherwise fall back to scanning
// <a> tags whose href looks like a job posting link.
async function fetchGeneric(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`Fetch failed: HTTP ${r.status}`);
  const html = await r.text();

  // Some company career pages (e.g. essity.com/careers) are just a thin
  // wrapper around a Workday-hosted job board — the wrapper's own HTML has
  // no postings in it at all, but it does link out to the real
  // myworkdayjobs.com site, so that's worth checking before falling back to
  // <a>-tag scraping (which would find nothing on a page like that anyway).
  const workdayMatch = html.match(WORKDAY_URL_RE);
  if (workdayMatch) {
    const jobs = await fetchWorkdayJobs(workdayMatch[1], workdayMatch[2], workdayMatch[3]);
    if (jobs.length) return jobs;
  }

  const embedded = extractEmbeddedJobs(html);
  if (embedded.length) return embedded;

  const $ = cheerio.load(html);
  const jobs = [];
  // Some sites (e.g. ledigajobb.se) wrap the same posting in several <a>
  // tags — a title link, plus separate location/tag badges pointing at the
  // same URL with just "Göteborg" or "Distans" as their text — so results
  // are deduped by absolute URL, keeping whichever text is most descriptive.
  const byUrl = new Map();
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || !JOB_HREF.test(href) || !HAS_ID.test(href)) return;
    let title = $(el).text().trim().replace(/\s+/g, " ");
    if (!title || title.length < 4 || title.length > 120 || GENERIC_LINK_TEXT.test(title)) {
      const card = $(el).closest("article, li, div[class*='card'], div[class*='job']");
      const heading = card.find("h1,h2,h3,h4,[class*='title'],[class*='heading']").first().text().trim().replace(/\s+/g, " ");
      title = heading || $(el).attr("aria-label") || "";
    }
    if (!title || title.length < 4 || title.length > 160) return;
    try {
      const absUrl = new URL(href, url).href;
      const existing = byUrl.get(absUrl);
      if (existing) {
        if (title.length > existing.title.length) existing.title = title;
        return;
      }
      const job = { title, url: absUrl, location: "" };
      byUrl.set(absUrl, job);
      jobs.push(job);
    } catch { /* invalid href */ }
  });
  return jobs;
}

function extractEmbeddedJobs(html) {
  const scriptMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) return [];
  try {
    const data = JSON.parse(scriptMatch[1]);
    return findJobArray(data, 0);
  } catch {
    return [];
  }
}

function findJobArray(node, depth) {
  if (depth > 6 || !node || typeof node !== "object") return [];
  if (Array.isArray(node)) {
    const looksLikeJobs = node.length > 0 && node.every(
      (o) => o && typeof o === "object" && ("title" in o || "name" in o)
    );
    if (looksLikeJobs) {
      return node.map((o) => ({
        title: o.title || o.name,
        company: o.company || o.employer || (o.company && o.company.name) || (o.employer && o.employer.name) || "",
        location: (o.location && (o.location.name || o.location)) || o.city || "",
        url: o.url || o.absolute_url || o.link || "",
      }));
    }
    return node.flatMap((item) => findJobArray(item, depth + 1));
  }
  return Object.values(node).flatMap((v) => findJobArray(v, depth + 1));
}

// A pinned role title like "Senior Project Manager" should also surface a
// close variant like "Senior IT Project Manager" — a plain substring check
// misses that entirely since neither string contains the other. Instead,
// every significant word in the search term has to appear somewhere in the
// job title (any order, other words allowed in between) — a word-set match
// rather than a phrase match. This is a strict superset of substring
// matching (anything that used to match still does), so it only ever
// surfaces more, never fewer, results than before.
function titleWords(str) {
  return (str || "").toLowerCase().match(/[a-z0-9]+/g) || [];
}
// Exact match, or one word is a prefix of the other — catches plain plurals
// ("Solution" / "Solutions") and other near-variants without needing a real
// stemming library. Skipped for words under 3 chars (e.g. "IT", "AI") so a
// short acronym doesn't prefix-match half the dictionary.
function wordMatches(a, b) {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  return a.startsWith(b) || b.startsWith(a);
}
function keywordMatches(title, keyword) {
  const kwWords = titleWords(keyword);
  if (!kwWords.length) return false;
  const titleWordList = titleWords(title);
  return kwWords.every((kw) => titleWordList.some((tw) => wordMatches(tw, kw)));
}

// English/Swedish equivalents for search criteria — job ads on Swedish
// company sites often use the Swedish term even when Candidate searches in
// English (e.g. "Göteborg" instead of "Gothenburg"). Add more groups here as
// needed. sameGroup() also still falls back to plain substring containment
// for anything not listed, so this only adds matches, never removes any.
const SYNONYM_GROUPS = [
  ["gothenburg", "göteborg", "goteborg"],
  ["remote", "distans"],
  ["on-site", "onsite", "on site", "på plats", "pa plats", "på kontoret"],
];
function sameGroup(a, b) {
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return SYNONYM_GROUPS.some((g) => g.some((x) => a.includes(x)) && g.some((x) => b.includes(x)));
}

function matchesCriteria(job, criteria) {
  const title = job.title || "";
  const location = (job.location || "").toLowerCase();
  const workModel = (job.workModel || "").toLowerCase();
  const keywords = (criteria.keywords || []).map((k) => k.trim()).filter(Boolean);
  const locFilter = (criteria.location || "").toLowerCase().trim();
  const workModelFilter = (criteria.workModel || "").toLowerCase().trim();
  // No keywords/role titles pinned at all → nothing to filter by title, so
  // every open role from the site is included (capped by offset/limit below,
  // same as any other search).
  const keywordMatch = !keywords.length || keywords.some((k) => keywordMatches(title, k));
  const locationMatch = !locFilter || !location || sameGroup(location, locFilter);
  // workModel (On-site/Hybrid/Remote) is only populated for Workday-sourced
  // jobs today (see fetchWorkdayJobs) — generic scraping has no structured
  // field for it. A job with no workModel data passes through regardless,
  // same permissive rule as an unknown location.
  const workModelMatch = !workModelFilter || !workModel || sameGroup(workModel, workModelFilter);
  return keywordMatch && locationMatch && workModelMatch;
}

exports.scanWatchlist = onRequest({ cors: true, timeoutSeconds: 120, region: "us-central1" }, async (req, res) => {
  const { companies = [], criteria = {} } = req.body || {};
  const offset = Math.max(0, Number(req.body && req.body.offset) || 0);
  const limit = Math.min(500, Math.max(1, Number(req.body && req.body.limit) || 100));
  const results = [];

  for (const company of companies) {
    if (!company.careerSite) continue;
    let jobs = [];
    let source = "generic";
    try {
      const ats = KNOWN_ATS.find((a) => a.test(company.careerSite));
      if (ats) {
        jobs = await ats.fetchJobs(company.careerSite);
        source = ats.name;
      } else {
        jobs = await fetchGeneric(company.careerSite);
      }
      const matched = jobs.filter((j) => matchesCriteria(j, criteria));
      results.push({
        company: company.company,
        companyId: company.id,
        source,
        jobs: matched.slice(offset, offset + limit),
        totalFound: jobs.length,
        totalMatched: matched.length,
        hasMore: offset + limit < matched.length,
        nextOffset: offset + limit,
      });
    } catch (e) {
      results.push({ company: company.company, companyId: company.id, error: e.message, jobs: [] });
    }
  }

  res.json({ results, scannedAt: new Date().toISOString() });
});

// Same approach as scanWatchlist, but for general job-board search-result
// pages instead of a single company's career page. The caller resolves each
// site's real search URL (Search URL template with {q}/{location} filled in)
// client-side and sends it here already-built — this function just fetches
// and parses whatever URL it's given. Arbetsförmedlingen is deliberately not
// routed through here — it has its own real API, called directly from the
// browser. LinkedIn is deliberately never sent here either — scraping it
// violates their Terms of Service; that stays a manual "Open" link only.
exports.scanJobSites = onRequest({ cors: true, timeoutSeconds: 120, region: "us-central1" }, async (req, res) => {
  const { sites = [], criteria = {} } = req.body || {};
  const results = [];

  for (const site of sites) {
    if (!site.url) continue;
    let jobs = [];
    let matchedVia = "generic";
    try {
      const ats = KNOWN_ATS.find((a) => a.test(site.url));
      if (ats) {
        jobs = await ats.fetchJobs(site.url);
        matchedVia = ats.name;
      } else {
        jobs = await fetchGeneric(site.url);
      }
      results.push({
        source: site.source,
        sourceId: site.id,
        matchedVia,
        jobs: jobs.filter((j) => matchesCriteria(j, criteria)),
        totalFound: jobs.length,
      });
    } catch (e) {
      results.push({ source: site.source, sourceId: site.id, error: e.message, jobs: [] });
    }
  }

  res.json({ results, scannedAt: new Date().toISOString() });
});
