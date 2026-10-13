"""Local dev server for the site.

Serves the static files (with HTTP Range support, which iOS Safari needs for video)
and implements /api/flowers with the same contract as api/flowers.js on Vercel,
storing flowers in dev/flowers.json.

    python3 dev/server.py [port]        # default 8765, run from anywhere
"""
import hashlib, json, os, re, sys, threading, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE = os.path.join(ROOT, "dev", "flowers.json")
KEEP, SHOW, FLOWER_TYPES = 500, 150, 6
PER_HOUR, MIN_GAP_S = 20, 2

lock = threading.Lock()
hits = {}   # rate-limit memory: hashed visitor -> [timestamps]


def load():
    try:
        with open(STORE) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {"total": 0, "flowers": []}


def save(data):
    tmp = STORE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f)
    os.replace(tmp, STORE)


def clamp(n, lo, hi):
    return min(hi, max(lo, n))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    # ---------- /api/flowers ----------
    def _json(self, code, body, extra=None):
        raw = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(raw)

    def _visitor(self):
        ip = (self.headers.get("CF-Connecting-IP")
              or (self.headers.get("X-Forwarded-For") or "").split(",")[0].strip()
              or self.client_address[0])
        return hashlib.sha256(ip.encode()).hexdigest()[:16]   # never store the raw address

    def do_GET(self):
        if self.path.split("?")[0] == "/api/flowers":
            with lock:
                data = load()
            return self._json(200, {"total": data["total"], "flowers": data["flowers"][:SHOW]},
                              {"Cache-Control": "no-store"})
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/flowers":
            return self._json(405, {"error": "method not allowed"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
            b = json.loads(self.rfile.read(min(n, 2048)) or b"{}")
            x, f, r = float(b["x"]), float(b["f"]), float(b["r"])
        except (ValueError, KeyError, TypeError):
            return self._json(400, {"error": "bad flower"})
        who, now = self._visitor(), time.time()
        with lock:
            recent = [t for t in hits.get(who, []) if now - t < 3600]
            if (recent and now - recent[-1] < MIN_GAP_S) or len(recent) >= PER_HOUR:
                hits[who] = recent
                return self._json(429, {"error": "Thank you. Please wait a moment before hanging another."},
                                  {"Retry-After": str(MIN_GAP_S if len(recent) < PER_HOUR else 3600)})
            hits[who] = recent + [now]
            data = load()
            data["total"] += 1
            flower = {"id": data["total"], "x": round(clamp(x, 2, 98), 1),
                      "f": int(clamp(int(f), 0, FLOWER_TYPES - 1)), "r": round(clamp(r, -25, 25))}
            data["flowers"] = ([flower] + data["flowers"])[:KEEP]
            save(data)
        return self._json(201, {"total": data["total"], "flower": flower}, {"Cache-Control": "no-store"})

    # ---------- static files with Range support ----------
    def send_head(self):
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not rng or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        if not m:
            return super().send_head()
        size = os.path.getsize(path)
        a, b = m.groups()
        start = int(a) if a else max(0, size - int(b))
        end = min(int(b) if (a and b) else size - 1, size - 1)
        if start >= size:
            self.send_error(416)
            return None
        f = open(path, "rb")
        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self._remaining = end - start + 1
        return f

    def copyfile(self, src, dst):
        n = getattr(self, "_remaining", None)
        if n is None:
            return super().copyfile(src, dst)
        while n > 0:
            buf = src.read(min(65536, n))
            if not buf:
                break
            dst.write(buf)
            n -= len(buf)

    def end_headers(self):
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def translate_path(self, path):
        p = super().translate_path(path)
        # keep the dev folder (server code, flower store) private
        return os.path.join(ROOT, "__nope__") if p.startswith(os.path.join(ROOT, "dev")) else p

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"serving {ROOT} on http://127.0.0.1:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
