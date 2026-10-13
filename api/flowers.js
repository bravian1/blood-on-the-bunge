// Vercel serverless function: the shared "flowers on the wire".
//   GET  /api/flowers  -> { total, flowers: [{ id, x, f, r }] }   newest first, at most 150
//   POST /api/flowers  -> body { x, f, r } -> 201 { total, flower } | 400 | 429
// Storage: Upstash Redis (Vercel Marketplace → Upstash → Redis). The integration sets
// KV_REST_API_URL / KV_REST_API_TOKEN; UPSTASH_REDIS_REST_URL / _TOKEN also work.
// The local dev server (dev/server.py) implements the same contract with a JSON file.
const crypto = require("crypto");

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEEP = 500, SHOW = 150, FLOWER_TYPES = 6;
const PER_HOUR = 20, MIN_GAP_S = 2;

// One round trip for several commands.
async function redis(commands) {
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).map(x => x.result);
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
// Rate limits key on a short hash of the IP; the address itself is never stored.
const who = req => crypto.createHash("sha256")
  .update(String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon")
  .digest("hex").slice(0, 16);

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "storage not configured" });
  try {
    if (req.method === "GET") {
      const [total, list] = await redis([["GET", "flowers:total"], ["LRANGE", "flowers:list", 0, SHOW - 1]]);
      res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=10");
      return res.status(200).json({ total: Number(total) || 0, flowers: (list || []).map(s => JSON.parse(s)) });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const x = Number(b.x), f = Number(b.f), r = Number(b.r);
      if (![x, f, r].every(Number.isFinite)) return res.status(400).json({ error: "bad flower" });

      const id = who(req);
      const [gap, hourly] = await redis([
        ["SET", `flowers:gap:${id}`, "1", "EX", MIN_GAP_S, "NX"],
        ["INCR", `flowers:hour:${id}`],
        ["EXPIRE", `flowers:hour:${id}`, 3600, "NX"]
      ]);
      if (gap === null || hourly > PER_HOUR) {
        res.setHeader("Retry-After", gap === null ? MIN_GAP_S : 3600);
        return res.status(429).json({ error: "Thank you. Please wait a moment before hanging another." });
      }

      const [n] = await redis([["INCR", "flowers:total"]]);
      const flower = { id: n, x: Math.round(clamp(x, 2, 98) * 10) / 10, f: clamp(Math.floor(f), 0, FLOWER_TYPES - 1), r: Math.round(clamp(r, -25, 25)) };
      await redis([["LPUSH", "flowers:list", JSON.stringify(flower)], ["LTRIM", "flowers:list", 0, KEEP - 1]]);
      res.setHeader("Cache-Control", "no-store");
      return res.status(201).json({ total: n, flower });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "storage error" });
  }
};
