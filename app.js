const express = require("express");
const cors = require("cors");

const app = express();

/**
 * CORS: lock to your GitHub Pages origin.
 * (For quick testing you can use origin: "*", but locking is better.)
 */
app.use(cors({
  origin: "https://ryanocc.github.io"
}));

/** Simple in-memory cache to avoid hammering Waze */
const cache = new Map();
async function cachedFetch(key, ttlMs, fetcher) {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && (now - hit.time) < ttlMs) return hit.value;

  const value = await fetcher();
  cache.set(key, { time: now, value });
  return value;
}

/** Helper: fetch upstream and return text (robust) */
async function fetchText(url) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": "occ-waze-api"
    }
  });

  const body = await r.text();
  return { ok: r.ok, status: r.status, body, contentType: r.headers.get("content-type") };
}

app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * 1) Partner feed (format=1)
 * You provided:
 * https://www.waze.com/row-partnerhub-api/partners/11867436614/waze-feeds/4e8ef399-d6b9-4338-9840-7c2beacd235b?format=1
 */
app.get("/api/waze/partner-feed", async (req, res) => {
  try {
    const upstream = "https://www.waze.com/row-partnerhub-api/partners/11867436614/waze-feeds/4e8ef399-d6b9-4338-9840-7c2beacd235b?format=1";

    const result = await cachedFetch("waze-partner-feed", 15000, async () => {
      const out = await fetchText(upstream);
      if (!out.ok) throw new Error(`Upstream status ${out.status}`);
      return out;
    });

    res.set("Content-Type", result.contentType || "application/json; charset=utf-8");
    res.send(result.body);
  } catch (e) {
    res.status(500).json({ error: "Partner feed fetch failed", message: String(e) });
  }
});

/**
 * 2) TVT feed
 * You provided:
 * https://www.waze.com/row-partnerhub-api/feeds-tvt/?id=1709296452339
 */
app.get("/api/waze/tvt", async (req, res) => {
  try {
    const upstream = "https://www.waze.com/row-partnerhub-api/feeds-tvt/?id=1709296452339";

    const result = await cachedFetch("waze-tvt", 15000, async () => {
      const out = await fetchText(upstream);
      if (!out.ok) throw new Error(`Upstream status ${out.status}`);
      return out;
    });

    res.set("Content-Type", result.contentType || "application/json; charset=utf-8");
    res.send(result.body);
  } catch (e) {
    res.status(500).json({ error: "TVT fetch failed", message: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API listening on", PORT));
