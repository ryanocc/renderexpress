const express = require("express");
const cors = require("cors");

const app = express();

/* ======================================================
   ✅ CORS CONFIG
   ====================================================== */
const ALLOWED_ORIGINS = [
  "https://ryanocc.github.io",
  "https://onecompiler.com",
  "https://app.onecompiler.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server / curl / Render health checks
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  }
}));

/* ======================================================
   ✅ HEALTH CHECK
   ====================================================== */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ======================================================
   ✅ WAZE PARTNER FEED
   ====================================================== */
app.get("/api/waze/partner-feed", async (req, res) => {
  try {
    const url =
      "https://www.waze.com/row-partnerhub-api/partners/11867436614/waze-feeds/4e8ef399-d6b9-4338-9840-7c2beacd235b?format=1";

    const r = await fetch(url, {
      headers: { "User-Agent": "occ-dashboard" }
    });

    if (!r.ok) {
      return res.status(r.status).send(await r.text());
    }

    const text = await r.text();
    res.set("Content-Type", "application/json; charset=utf-8");
    res.send(text);
  } catch (err) {
    res.status(500).json({
      error: "Waze partner feed failed",
      detail: String(err)
    });
  }
});

/* ======================================================
   ✅ WAZE TVT (NETWORK HEALTH)
   ====================================================== */
app.get("/api/waze/tvt", async (req, res) => {
  try {
    const url =
      "https://www.waze.com/row-partnerhub-api/feeds-tvt/?id=1713523744433";

    const r = await fetch(url, {
      headers: { "User-Agent": "occ-dashboard" }
    });

    if (!r.ok) {
      return res.status(r.status).send(await r.text());
    }

    const text = await r.text();
    res.set("Content-Type", "application/json; charset=utf-8");
    res.send(text);
  } catch (err) {
    res.status(500).json({
      error: "Waze TVT failed",
      detail: String(err)
    });
  }
});

/* ======================================================
   ✅ NATIONAL HIGHWAYS RSS (NORTH WEST)
   ====================================================== */
app.get("/api/highways-nw", async (req, res) => {
  try {
    const url =
      "https://m.highwaysengland.co.uk/feeds/rss/UnplannedEvents/North%20West.xml";

    const r = await fetch(url, {
      headers: { "User-Agent": "occ-dashboard" }
    });

    if (!r.ok) {
      return res.status(r.status).send(await r.text());
    }

    const xml = await r.text();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    res.status(500).json({
      error: "Highways feed failed",
      detail: String(err)
    });
  }
});

/* ======================================================
   ✅ BODS (SIRI-SX)
   ====================================================== */
app.get("/api/bods-siri-sx", async (req, res) => {
  try {
    const apiKey = process.env.BODS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing BODS_API_KEY"
      });
    }

    const url =
      `https://data.bus-data.dft.gov.uk/api/v1/siri-sx/?api_key=${encodeURIComponent(apiKey)}`;

    const r = await fetch(url, {
      headers: { "User-Agent": "occ-dashboard" }
    });

    if (!r.ok) {
      return res.status(r.status).send(await r.text());
    }

    const body = await r.text();
    res.set(
      "Content-Type",
      r.headers.get("content-type") || "application/xml; charset=utf-8"
    );
    res.send(body);
  } catch (err) {
    res.status(500).json({
      error: "BODS fetch failed",
      detail: String(err)
    });
  }
});

/* ======================================================
   ✅ START SERVER (RENDER)
   ====================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ OCC API running on port ${PORT}`);
});
