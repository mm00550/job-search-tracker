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
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).text().trim().replace(/\s+/g, " ");
    if (!href || !title || title.length < 4 || title.length > 120) return;
    if (!/\/(job|jobs|vacanc|career|position|opening)[s]?\//i.test(href)) return;
    try {
      jobs.push({ title, url: new URL(href, url).href, location: "" });
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
