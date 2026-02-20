import cors from "cors";

const ALLOWED_ORIGINS = [
  "https://ryanocc.github.io",
  "https://app.onecompiler.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  }
}));
