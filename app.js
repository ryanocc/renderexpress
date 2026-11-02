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
