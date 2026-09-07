import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const AO3_HOSTS = new Set(["archiveofourown.org", "www.archiveofourown.org"]);

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function parseNumber(value = "") {
  const n = Number(value.replace(/,/g, "").match(/[\d.]+/)?.[0]);
  return Number.isFinite(n) ? n : null;
}

function normalizeAo3Url(input) {
  if (typeof input !== "string" || input.length > 500) throw new Error("Invalid AO3 URL.");
  const url = new URL(input);
  if (!AO3_HOSTS.has(url.hostname.toLowerCase())) throw new Error("Only archiveofourown.org work URLs are supported.");
  const match = url.pathname.match(/^\/works\/(\d+)/);
  if (!match) throw new Error("Paste a direct AO3 work URL.");
  return { id: match[1], url: `https://archiveofourown.org/works/${match[1]}?view_adult=true` };
}

function listFromMeta($, label) {
  const dt = $("dl.work.meta.group dt").filter((_, el) => clean($(el).text()).startsWith(label)).first();
  if (!dt.length) return [];
  return dt.next("dd").find("a.tag").map((_, a) => clean($(a).text())).get();
}

async function authenticatedUser(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error("Server authentication is not configured.");

  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data?.user || null;
}

export default async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const user = await authenticatedUser(request);
    if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json();
    const { id, url } = normalizeAo3Url(body?.url || "");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": "RaevynShelf/1.0 (+https://raevynshelf.app; private AO3 reading companion)",
          "Accept": "text/html,application/xhtml+xml"
        },
        redirect: "follow",
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 429) {
      return Response.json({ error: "AO3 is rate-limiting requests. Please try again later." }, { status: 429 });
    }
    if (!response.ok) {
      return Response.json({ error: `AO3 returned ${response.status}. The work may be unavailable or login-restricted.` }, { status: 502 });
    }

    const html = await response.text();
    if (html.length > 5_000_000) return Response.json({ error: "AO3 response was unexpectedly large." }, { status: 502 });

    const $ = cheerio.load(html);
    const title = clean($("h2.title.heading").first().text());
    if (!title) return Response.json({ error: "Could not read public work metadata from this AO3 page." }, { status: 422 });

    const authors = $("h3.byline.heading a[rel=author]").map((_, a) => clean($(a).text())).get();
    return Response.json({
      ao3_work_id: Number(id),
      ao3_url: `https://archiveofourown.org/works/${id}`,
      title,
      author: authors.join(", ") || "Anonymous",
      authors,
      word_count: parseNumber($("dd.words").first().text()),
      chapters: clean($("dd.chapters").first().text()),
      language: clean($("dd.language").first().text()),
      published_at: clean($("dd.published").first().text()) || null,
      updated_at_ao3: clean($("dd.status").first().text()) || null,
      ao3_rating: listFromMeta($, "Rating:")[0] || null,
      warnings: listFromMeta($, "Archive Warning"),
      categories: listFromMeta($, "Category:"),
      fandoms: listFromMeta($, "Fandoms:"),
      relationships: listFromMeta($, "Relationships:"),
      characters: listFromMeta($, "Characters:"),
      tags: listFromMeta($, "Additional Tags:")
    });
  } catch (error) {
    if (error?.name === "AbortError") return Response.json({ error: "AO3 did not respond in time." }, { status: 504 });
    return Response.json({ error: error.message || "Unable to import AO3 work." }, { status: 400 });
  }
};
