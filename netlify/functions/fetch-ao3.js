exports.handler = async function(event) {
  try {
    const url = event.queryStringParameters?.url;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing URL" })
      };
    }

    if (!/^https?:\/\/archiveofourown\.org\/works\/\d+/i.test(url)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid AO3 work link" })
      };
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ArchRavenLibrary/1.0"
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch AO3 page" })
      };
    }

    const html = await response.text();

    const decodeHtml = (value = "") =>
      value
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

    const extract = (pattern) => {
      const match = html.match(pattern);
      return match ? decodeHtml(match[1]) : "";
    };

    const title = extract(/<h2 class="title heading">([\s\S]*?)<\/h2>/i);
    const author = extract(/<a[^>]*rel="author"[^>]*>([\s\S]*?)<\/a>/i);
    const words = extract(/<dd class="words">([\s\S]*?)<\/dd>/i);

    const tagBlockPatterns = [
      /<dd class="fandom tags">([\s\S]*?)<\/dd>/i,
      /<dd class="relationship tags">([\s\S]*?)<\/dd>/i,
      /<dd class="character tags">([\s\S]*?)<\/dd>/i,
      /<dd class="freeform tags">([\s\S]*?)<\/dd>/i
    ];

    const tags = [];
    for (const pattern of tagBlockPatterns) {
      const block = html.match(pattern);
      if (!block) continue;

      const matches = block[1].matchAll(/<a[^>]*class="tag"[^>]*>([\s\S]*?)<\/a>/gi);
      for (const m of matches) {
        const clean = decodeHtml(m[1]);
        if (clean) tags.push(clean);
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        title,
        author,
        words,
        tags
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch AO3 data"
      })
    };
  }
};
