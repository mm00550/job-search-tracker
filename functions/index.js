const { onRequest } = require("firebase-functions/v2/https");
const cheerio = require("cheerio");

const UA = "Mozilla/5.0 (compatible; JobScanner/1.0; +https://job-search-tracker-ddace.web.app)";

// Known ATS platforms expose stable JSON APIs — far more reliable than scraping
// the rendered HTML, so we try to match the career site URL against these first.
const KNOWN_ATS = [
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

function matchesCriteria(job, criteria) {
  const title = (job.title || "").toLowerCase();
  const location = (job.location || "").toLowerCase();
  const keywords = (criteria.keywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean);
  const locFilter = (criteria.location || "").toLowerCase().trim();
  const keywordMatch = !keywords.length || keywords.some((k) => title.includes(k));
  const locationMatch = !locFilter || !location || location.includes(locFilter);
  return keywordMatch && locationMatch;
}

exports.scanWatchlist = onRequest({ cors: true, timeoutSeconds: 120, region: "us-central1" }, async (req, res) => {
  const { companies = [], criteria = {} } = req.body || {};
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
      results.push({
        company: company.company,
        companyId: company.id,
        source,
        jobs: jobs.filter((j) => matchesCriteria(j, criteria)),
        totalFound: jobs.length,
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
