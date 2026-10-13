(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmt = n => Math.round(n).toLocaleString("en-GB");

  /* =========================================================
     LIVESTREAM HERO — runs from the first frame, no scroll needed
     ========================================================= */
  // Every line below was chanted, shouted or captioned in footage from 25 June 2024.
  const CHAT = {
    calm: [
      "Ruto must go!", "Reject Finance Bill 2024 🇰🇪", "We are peaceful! We are peaceful!",
      "Occupy Parliament ✊🏾", "This is Kenya. We are one.", "We are not scared at all",
      "This is something this country has never seen before", "Hands up! We are peaceful 🙌🏾",
      "Shame on you!", "Ruto must go!", "Occupy Parliament ✊🏾"
    ],
    breach: [
      "It is happening, guys!", "They’ve reached parliament!", "We’ve entered!",
      "People are inside the parliament!", "Occupy Parliament ✊🏾", "The people’s assembly belongs to the people"
    ],
    alarm: [
      "They are shooting us!", "Why are you shooting us?", "They’ve shot people, they’ve shot people",
      "Get down! Get down!", "He was shot in the head, bro"
    ]
  };
  const STATE = {
    calm:   { views: 9200,   clock: [13, 41, 7], hearts: true },
    breach: { views: 48000,  clock: [14, 20, 3], hearts: true },
    alarm:  { views: 112000, clock: [15, 4, 0],  hearts: false }
  };
  const phone = $(".phone");
  const chat = $(".chat"), hearts = $(".hearts"), viewsEl = $(".views"), clockEl = $(".phone__clock");
  let phase = "calm", views = 2481, t = [...STATE.calm.clock], chatIdx = 0;
  /* ---------- illustrated avatars (SVG, 32×32), built from random parts ---------- */
  const SKIN = ["#3b2219", "#4a2a1e", "#5a3524", "#6b402b", "#7d4d33", "#93603f", "#a87650"];
  const HAIR = ["#0d0b0a", "#1a1411", "#241a14", "#3a2a20"];
  const BG = ["#e9d8c4", "#cfe0d2", "#d9cdea", "#f1c9c4", "#c9dceb", "#efe0b0", "#2b2b2b", "#3d5a4a", "#5a3d3d"];
  const SHIRT = ["#b3121b", "#1d6b33", "#111", "#f4f1ea", "#2f5d8a", "#d9a21b", "#6b3fa0", "#8a8a8a", "#c2410c"];
  const WRAP = ["#d9a21b", "#b3121b", "#1d6b33", "#6b3fa0", "#c2410c", "#1f6fa8"];
  const HAIRSTYLES = ["fade", "fade", "afro", "locs", "braids", "bald", "puff"];
  let avatarN = 0;
  const makeAvatar = () => {
    const skin = pick(SKIN), hair = pick(HAIR), shirt = pick(SHIRT);
    const head = Math.random();
    // headwear first decides what hair can show
    const wear = head < .16 ? "cap" : head < .26 ? "wrap" : head < .34 ? "bandana" : head < .40 ? "beanie" : "none";
    const style = wear === "none" ? pick(HAIRSTYLES) : "fade";
    const p = [];
    p.push(`<rect width="32" height="32" fill="${pick(BG)}"/>`);   // clipped to a circle below
    // hair that sits behind the head
    if (style === "afro") p.push(`<circle cx="16" cy="12.5" r="9.6" fill="${hair}"/>`);
    if (style === "locs") p.push(`<path d="M8.6 10 C8 16 8.4 21 9.6 24 L12 24 L11.6 13 M23.4 10 C24 16 23.6 21 22.4 24 L20 24 L20.4 13" fill="${hair}"/>`);
    if (style === "puff") p.push(`<circle cx="16" cy="4.6" r="4.4" fill="${hair}"/>`);
    // shoulders + neck
    const collar = shirt === "#f4f1ea" ? "#d6d0c4" : "rgba(0,0,0,.18)";
    p.push(`<path d="M3 32 C4 24.5 9 22 16 22 C23 22 28 24.5 29 32 Z" fill="${shirt}"/>`);
    p.push(`<path d="M13.4 19 L18.6 19 L18.4 23.4 C17 24.6 15 24.6 13.6 23.4 Z" fill="${skin}"/>`);
    p.push(`<path d="M12.6 22.6 C14.6 24.8 17.4 24.8 19.4 22.6" stroke="${collar}" stroke-width=".8" fill="none"/>`);
    if (Math.random() < .22) p.push(`<path d="M5.5 27 L26.5 27" stroke="#fff" stroke-width="1.6" opacity=".7"/><path d="M5 29 L27 29" stroke="#b3121b" stroke-width="1.4"/>`); // flag scarf
    // head + ears
    p.push(`<ellipse cx="9.9" cy="13.6" rx="1.3" ry="1.8" fill="${skin}"/><ellipse cx="22.1" cy="13.6" rx="1.3" ry="1.8" fill="${skin}"/>`);
    p.push(`<ellipse cx="16" cy="13" rx="6.2" ry="7.3" fill="${skin}"/>`);
    // hair on top
    if (style === "fade") p.push(`<path d="M9.8 11.6 C9.6 6.4 12.4 5 16 5 C19.6 5 22.4 6.4 22.2 11.6 C21 9.2 19 8.4 16 8.4 C13 8.4 11 9.2 9.8 11.6 Z" fill="${hair}"/>`);
    if (style === "afro" || style === "puff") p.push(`<path d="M9.8 11.8 C9.8 7 12.4 5.6 16 5.6 C19.6 5.6 22.2 7 22.2 11.8 C20.8 9.4 18.8 8.8 16 8.8 C13.2 8.8 11.2 9.4 9.8 11.8 Z" fill="${hair}"/>`);
    if (style === "locs") p.push(`<path d="M9.6 12.4 C9.4 6.6 12.4 5 16 5 C19.6 5 22.6 6.6 22.4 12.4 C21.6 9.6 20 8.6 18.6 8.4 L17.6 10.4 L16.4 8.4 L15 10.4 L14 8.4 C12 8.8 10.6 9.6 9.6 12.4 Z" fill="${hair}"/>`);
    if (style === "braids") p.push(`<path d="M9.8 11.6 C9.6 6.2 12.4 4.8 16 4.8 C19.6 4.8 22.4 6.2 22.2 11.6 C21.2 9 19 8 16 8 C13 8 10.8 9 9.8 11.6 Z" fill="${hair}"/><path d="M12.4 5.6 L12.8 8.4 M16 5 L16 8 M19.6 5.6 L19.2 8.4" stroke="${skin}" stroke-width=".55" opacity=".7"/>`);
    // headwear
    if (wear === "cap") {
      const c = pick(["#111", "#b3121b", "#1d6b33", "#f4f1ea", "#2f5d8a"]);
      p.push(`<path d="M9.6 11 C9.4 5.6 12.6 4.2 16 4.2 C19.4 4.2 22.6 5.6 22.4 11 Z" fill="${c}"/><path d="M15 10.4 L25.6 10.4 C26.4 10.4 26.4 11.8 25.4 11.8 L15 11.8 Z" fill="${c}" opacity=".85"/><circle cx="16" cy="4.6" r=".7" fill="rgba(0,0,0,.3)"/>`);
    }
    if (wear === "wrap") {
      const c = pick(WRAP);
      p.push(`<path d="M9.2 12 C8.6 5 12.4 3 16 3 C19.6 3 23.4 5 22.8 12 C21.4 9.2 19 8.6 16 8.6 C13 8.6 10.6 9.2 9.2 12 Z" fill="${c}"/><path d="M14 3.6 C17 2 20 2.4 21.4 4.6 C19 4 16.6 4.6 14 6 Z" fill="rgba(255,255,255,.22)"/>`);
    }
    if (wear === "bandana") p.push(`<path d="M9.6 10.4 C9.6 6 12.4 4.6 16 4.6 C19.6 4.6 22.4 6 22.4 10.4 Z" fill="#111"/><path d="M9.6 9 L22.4 9" stroke="#fff" stroke-width=".7"/><path d="M9.7 9.9 L22.3 9.9" stroke="#b3121b" stroke-width="1"/><path d="M9.8 10.8 L22.2 10.8" stroke="#1d6b33" stroke-width=".8"/>`);
    if (wear === "beanie") p.push(`<path d="M9.4 11 C9.2 5 12.6 3.6 16 3.6 C19.4 3.6 22.8 5 22.6 11 Z" fill="${pick(["#111", "#b3121b", "#1d6b33", "#d9a21b"])}"/><rect x="9.2" y="9.6" width="13.6" height="2" rx="1" fill="rgba(0,0,0,.25)"/>`);
    // face
    const masked = Math.random() < .22;
    p.push(`<ellipse cx="13.6" cy="13.4" rx=".75" ry=".85" fill="#120b08"/><ellipse cx="18.4" cy="13.4" rx=".75" ry=".85" fill="#120b08"/>`);
    p.push(`<path d="M12.4 11.6 L14.6 11.4 M17.4 11.4 L19.6 11.6" stroke="${hair}" stroke-width=".6" stroke-linecap="round"/>`);
    if (Math.random() < .14 && !masked) p.push(`<rect x="11.6" y="12.2" width="3.9" height="2.6" rx="1" fill="none" stroke="#111" stroke-width=".55"/><rect x="16.5" y="12.2" width="3.9" height="2.6" rx="1" fill="none" stroke="#111" stroke-width=".55"/><path d="M15.5 13.3 L16.5 13.3" stroke="#111" stroke-width=".55"/>`);
    if (masked) {
      const m = pick(["#e8eef2", "#9fc5e8", "#111", "#e8eef2"]);
      p.push(`<path d="M10.6 15 C12 14.2 20 14.2 21.4 15 L21 18.4 C19.4 20.6 12.6 20.6 11 18.4 Z" fill="${m}"/><path d="M11 16.2 L21 16.2 M11.2 17.6 L20.8 17.6" stroke="rgba(0,0,0,.12)" stroke-width=".4"/>`);
    } else {
      p.push(`<path d="M15.4 15.2 C15.8 16 16.2 16 16.6 15.2" stroke="rgba(0,0,0,.35)" stroke-width=".5" fill="none"/>`);
      p.push(Math.random() < .5
        ? `<path d="M14 17.4 C15.2 18.6 16.8 18.6 18 17.4" stroke="#2a1510" stroke-width=".7" fill="none" stroke-linecap="round"/>`
        : `<path d="M14.2 17.3 C15.2 18.9 16.8 18.9 17.8 17.3 Z" fill="#2a1510"/><path d="M14.7 17.5 L17.3 17.5" stroke="#f4f1ea" stroke-width=".5"/>`);
      if (Math.random() < .25) p.push(`<path d="M12.6 17.2 C13.4 20.4 18.6 20.4 19.4 17.2 C18.4 19 13.6 19 12.6 17.2 Z" fill="${hair}" opacity=".9"/>`); // beard
    }
    if (Math.random() < .12) p.push(`<path d="M10.4 14.6 L11.6 14.6 M10.4 15.4 L11.6 15.4" stroke="#b3121b" stroke-width=".5"/><path d="M10.4 16.1 L11.6 16.1" stroke="#1d6b33" stroke-width=".5"/>`); // flag face paint
    // Clip inside the SVG: CSS border-radius on an <svg> doesn't clip reliably everywhere (Safari),
    // especially while the chat line is animating in.
    const id = `avc${++avatarN}`;
    return `<svg class="av" viewBox="0 0 32 32" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="16" cy="16" r="16"/></clipPath></defs>` +
      `<g clip-path="url(#${id})">${p.join("")}</g><circle cx="16" cy="16" r="15.2" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/></svg>`;
  };

  const pushChat = () => {
    const list = CHAT[phase];
    const li = document.createElement("li");
    if (phase === "alarm") li.className = "alarm";
    li.innerHTML = `${makeAvatar()}<span></span>`;
    li.lastChild.textContent = list[chatIdx++ % list.length];
    chat.append(li);
    while (chat.children.length > 8) chat.firstChild.remove();
  };
  const pushHeart = () => {
    if (!STATE[phase].hearts || document.hidden) return;
    const h = document.createElement("span");
    h.textContent = pick(["❤️", "❤️", "🇰🇪", "✊🏾", "🔥"]);
    h.style.setProperty("--dx", `${(Math.random() - .5) * 50}px`);
    hearts.append(h);
    setTimeout(() => h.remove(), 2700);
  };
  const tickClock = () => {
    t[2]++; if (t[2] > 59) { t[2] = 0; t[1]++; } if (t[1] > 59) { t[1] = 0; t[0]++; }
    clockEl.textContent = t.map(n => String(n).padStart(2, "0")).join(":");
    const target = STATE[phase].views;
    views += Math.max(3, (target - views) * (phase === "calm" ? .02 : .18)) * (Math.random() * .6 + .7);
    if (views > target && phase !== "calm") views = target + Math.random() * 400;
    viewsEl.textContent = views >= 10000 ? (views / 1000).toFixed(1) + "K" : fmt(views);
  };
  const setPhase = p => {
    if (p === phase) return;
    phase = p; chatIdx = 0; t = [...STATE[p].clock];
    pushChat();
  };
  // On phones the stream fills the screen, so the blurred background copy is hidden; don't decode it.
  if (matchMedia("(max-width: 760px)").matches) {
    const bg = $(".live__bg");
    bg.pause(); bg.removeAttribute("src"); bg.load();
  }
  for (let i = 0; i < 4; i++) pushChat();
  setInterval(pushChat, reduce ? 2600 : 1250);
  setInterval(tickClock, 1000);
  if (!reduce) setInterval(pushHeart, 380);

  /* ---------- split quotes into characters for the type-on effect ---------- */
  $$(".type").forEach(el => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = text
      .split(/(\s+)/)
      .map(w => /^\s+$/.test(w) ? w :
        `<span style="white-space:nowrap" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join("")}</span>`)
      .join("");
  });

  /* ---------- reveal on view ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  $$(".reveal, .vote").forEach(el => io.observe(el));

  /* ---------- footage loops play only while on screen ---------- */
  const vio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
    });
  }, { threshold: .25 });
  $$(".clip video").forEach(v => vio.observe(v));

  /* ---------- counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
      countIO.unobserve(el);
      if (reduce || end === 0) { el.textContent = fmt(end) + suf; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(end * eased) + (p === 1 ? suf : "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  $$("[data-count]").forEach(el => countIO.observe(el));

  /* ---------- in-page links scroll smoothly (kept out of CSS: it breaks trigger measuring) ---------- */
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const el = document.getElementById(a.getAttribute("href").slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", a.getAttribute("href"));
  });

  /* ---------- YouTube chapters ---------- */
  const yt = $("#yt");
  $$(".chapters button").forEach(b => b.addEventListener("click", () => {
    $$(".chapters button").forEach(x => x.classList.remove("is-on"));
    b.classList.add("is-on");
    yt.src = `https://www.youtube-nocookie.com/embed/qz0f1yyf_eA?rel=0&autoplay=1&start=${b.dataset.t}`;
  }));

  /* ---------- flowers on the wire: shared by every visitor via /api/flowers ---------- */
  // Falls back to this browser only (localStorage) when the API can't be reached, e.g. opened from file://.
  const wire = $(".wire"), bed = $(".wire__flowers"), note = $(".flower-note"), countEl = $(".flower-count");
  const FLOWERS = ["🌹", "🌼", "🌸", "💐", "🌺", "🥀"];
  const LOCAL = "june25-flowers", MINE = "june25-flowers-mine", ON_WIRE = 150;
  const seen = new Set();
  let shared = null, total = 0, mine = 0, local = [];
  try { mine = +localStorage.getItem(MINE) || 0; local = JSON.parse(localStorage.getItem(LOCAL) || "[]"); } catch (e) {}

  const hang = (fl, animate) => {
    const s = document.createElement("span");
    s.className = "flower"; s.textContent = FLOWERS[fl.f] || FLOWERS[0];
    s.style.left = fl.x + "%"; s.style.setProperty("--r", fl.r + "deg");
    if (!animate) s.style.animation = "none";
    bed.append(s);
    while (bed.children.length > ON_WIRE) bed.firstChild.remove();
    return s;
  };
  const showCount = () => {
    if (!shared) { countEl.textContent = ""; return; }
    countEl.textContent = total ? `${fmt(total)} flower${total === 1 ? "" : "s"} hung by visitors so far` : "No flowers yet. Be the first.";
  };
  const api = opts => fetch("api/flowers", { cache: "no-store", ...opts })
    .then(r => r.json().then(body => ({ status: r.status, body })));

  const pull = async animate => {
    try {
      const { status, body } = await api();
      if (status !== 200) throw new Error(status);
      shared = true; total = body.total;
      body.flowers.slice().reverse().forEach(fl => {
        if (seen.has(fl.id)) return;
        seen.add(fl.id); hang(fl, animate);
      });
    } catch (e) {
      if (shared === null) { shared = false; local.forEach(fl => hang(fl, false)); }
    }
    showCount();
  };

  const thank = () => {
    note.textContent = mine === 1
      ? "You hung a flower. Families did the same outside parliament on 25 June 2026, when barbed wire kept them from the building."
      : shared ? `You’ve hung ${mine} flowers. Everyone who visits this page sees them.`
               : `You’ve hung ${mine} flowers. They stay on this device.`;
  };
  const add = async x => {
    const fl = { x: Math.round(Math.max(2, Math.min(98, x)) * 10) / 10, f: Math.floor(Math.random() * FLOWERS.length), r: Math.round((Math.random() - .5) * 46) };
    const el = hang(fl, true);   // show it straight away; the server confirms
    if (shared) {
      try {
        const { status, body } = await api({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fl) });
        if (status === 429) { el.remove(); note.textContent = body.error; return; }
        if (status !== 201) throw new Error(status);
        seen.add(body.flower.id); total = Math.max(total, body.total); showCount();
      } catch (e) { /* keep it on screen; it just won't reach others this time */ }
    } else {
      local.push(fl);
      try { localStorage.setItem(LOCAL, JSON.stringify(local.slice(-120))); } catch (e) {}
    }
    mine++;
    try { localStorage.setItem(MINE, mine); } catch (e) {}
    thank();
  };
  $(".flower-btn").addEventListener("click", () => add(8 + Math.random() * 84));
  wire.addEventListener("click", e => {
    const r = wire.getBoundingClientRect();
    add((e.clientX - r.left) / r.width * 100);
  });
  // Load the wire as it approaches; while it's on screen, check for new flowers every 15 s.
  let poll = 0;
  new IntersectionObserver(es => {
    const near = es.some(e => e.isIntersecting);
    clearInterval(poll);
    if (!near) return;
    pull(shared !== null);
    if (shared !== false) poll = setInterval(() => !document.hidden && pull(true), 15000);
  }, { rootMargin: "60% 0px" }).observe($(".barbed"));

  /* ---------- masthead + rail ---------- */
  const mast = $(".masthead"), paper = $(".paper"), rail = $(".rail");
  const railLinks = $$(".rail a");
  const darkSecs = $$(".forensic, .bigquote, .barbed, .sources");
  const secs = railLinks.map(a => document.getElementById(a.dataset.sec === "top" ? "top" : a.dataset.sec));
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const onPaper = paper.getBoundingClientRect().top < 60;
    mast.classList.toggle("is-paper", onPaper);
    mast.classList.toggle("is-hidden", onPaper && y > lastY && y > 400);
    lastY = y;
    // dark sections flip the rail colour
    const dark = darkSecs.some(s => {
      const r = s.getBoundingClientRect(); return r.top < innerHeight / 2 && r.bottom > innerHeight / 2;
    });
    rail.classList.toggle("on-paper", onPaper && !dark);
    let cur = 0;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .45) cur = i; });
    railLinks.forEach((a, i) => a.classList.toggle("is-on", i === cur));
  };
  // At most one layout read per frame, however fast scroll events arrive.
  let scrollQueued = false;
  addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  }, { passive: true });
  onScroll();

  /* =========================================================
     FRAME SCRUBBER (Eric Shieni) — lazy-loads its frames
     ========================================================= */
  const SCRUB_N = 198, SPLIT = 96, FPS = 6;
  const canvas = $(".scrub__canvas"), ctx2d = canvas.getContext("2d");
  const frames = new Array(SCRUB_N);
  let wantFrame = 0, loaded = false;
  const draw = i => {
    wantFrame = i;
    let f = frames[i];
    for (let d = 1; !(f && f.complete && f.naturalWidth) && d < SCRUB_N; d++) f = frames[i - d] || frames[i + d];
    if (f && f.complete && f.naturalWidth) ctx2d.drawImage(f, 0, 0, canvas.width, canvas.height);
  };
  const loadFrames = () => {
    if (loaded) return; loaded = true;
    for (let i = 0; i < SCRUB_N; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = `assets/scrub/${String(i).padStart(3, "0")}.webp`;
      img.onload = () => { if (Math.abs(i - wantFrame) < 3) draw(wantFrame); };
      frames[i] = img;
    }
  };
  new IntersectionObserver(es => es.some(e => e.isIntersecting) && loadFrames(), { rootMargin: "150% 0px" })
    .observe($(".forensic"));
  const fill = $(".scrub__fill"), head = $(".scrub__head"), tc = $(".scrub__tc"), src = $(".scrub__src");
  const setScrub = p => {
    const i = Math.min(SCRUB_N - 1, Math.floor(p * SCRUB_N));
    draw(i);
    fill.style.width = head.style.left = (p * 100) + "%";
    const local = i < SPLIT ? i : i - SPLIT, sec = local / FPS;
    tc.textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${(sec % 60).toFixed(1).padStart(4, "0")}`;
    src.textContent = i < SPLIT ? "Footage · parliament grounds" : "BBC 3D reconstruction";
  };

  /* =========================================================
     SCROLL CHOREOGRAPHY — needs GSAP, which loads after this file
     (so the livestream above never waits on the CDN)
     ========================================================= */
  const initMotion = () => {
    if (!window.gsap || !window.ScrollTrigger) {
      $$(".type .ch").forEach(c => c.classList.add("on"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    // Mobile address bars resize the viewport while scrolling; don't re-measure everything when they do.
    ScrollTrigger.config({ ignoreMobileResize: true });

    gsap.to(".progress span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 761px)" }, ctx => {
      const { motion, wide } = ctx.conditions;

      /* ---------- HERO: the stream follows the day, then cuts out ---------- */
      const alarm = document.createElement("div");
      alarm.className = "live__alarm";
      alarm.style.background = "radial-gradient(80% 70% at 50% 50%, rgba(255,20,30,.0), rgba(190,0,10,.55))";
      alarm.style.opacity = 0;
      $(".live__stage").append(alarm);

      const phoneVideo = $(".phone__video");
      const centerX = () => wide ? innerWidth / 2 - (phone.offsetLeft + phone.offsetWidth / 2) : 0;
      // Each beat gets its own label plus a hold, so it stays on screen for a stretch of scroll.
      // On phones the scroll also snaps to these beats, so a single flick can't skip one.
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: ".live", start: "top top", end: "bottom bottom",
          scrub: motion ? (wide ? .5 : .1) : true, invalidateOnRefresh: true,
          snap: wide || !motion ? false : { snapTo: "labelsDirectional", duration: { min: .25, max: .7 }, delay: .08, ease: "power1.inOut" },
          onUpdate: () => {
            const t = tl.time();
            setPhase(t < 2.4 ? "calm" : t < 3.3 ? "breach" : "alarm");
            phone.classList.toggle("is-glitching", motion && t > 5.2 && t < 6.1);
            if (t > 6.1) phoneVideo.pause(); else if (phoneVideo.paused) phoneVideo.play().catch(() => {});
          }
        }
      });
      tl.addLabel("live", 0)
        .to(".live__intro", { autoAlpha: 0, x: wide ? -80 : 0, y: wide ? 0 : -40, duration: 1.4 }, 1)
        .to(phone, wide ? { x: centerX, scale: () => Math.min(1.12, innerHeight * .94 / phone.offsetHeight), duration: 1.8 } : { duration: 1.8 }, 1)
        .to(".phone__top, .phone__loc", { opacity: 1, duration: .8 }, wide ? 0 : 1.8)
        .addLabel("stream", 2.8)
        .to(alarm, { opacity: 1, duration: 1.4 }, 3.3)
        .addLabel("alarm", 4.7)
        .to(".phone__glitch", { opacity: 1, duration: .7, ease: "steps(4)" }, 5.2)
        .to(".phone__lost", { opacity: 1, duration: .5, ease: "steps(3)" }, 6)
        .addLabel("lost", 6.6)
        .to(phone, { autoAlpha: 0, scale: wide ? .9 : 1, duration: .9 }, 7.6)
        .to([".live__bg", alarm], { opacity: 0.12, duration: .9 }, 7.6)
        .fromTo(".outro__line:not(.outro__line--2)", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9 }, 8.3)
        .addLabel("outro1", 9.3)
        .to(".outro__line:not(.outro__line--2)", { opacity: 0, y: -20, duration: .6 }, 10.4)
        .fromTo(".outro__line--2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9 }, 11)
        .addLabel("outro2", 12)
        .to({}, { duration: .9 })
        .addLabel("end");          // lets the snap release you into the page below

      /* ---------- film strips slide in ---------- */
      $$(".filmquote").forEach(fq => {
        const right = fq.classList.contains("filmquote--right");
        gsap.from($(".filmstrip", fq), {
          xPercent: right ? 80 : -80, rotate: right ? 14 : -14, opacity: 0,
          duration: motion ? 1.1 : 0, ease: "power3.out",
          scrollTrigger: { trigger: fq, start: "top 75%" }
        });
      });

      /* ---------- type-on quotes, scrubbed to scroll ---------- */
      $$(".type").forEach(el => {
        const chars = $$(".ch", el);
        if (!motion) { chars.forEach(c => c.classList.add("on")); return; }
        ScrollTrigger.create({
          trigger: el, start: "top 85%", end: "bottom 45%", scrub: true,
          onUpdate: self => {
            const n = Math.round(self.progress * chars.length);
            chars.forEach((c, i) => c.classList.toggle("on", i < n));
          }
        });
      });

      /* ---------- timeline: clock + live map ---------- */
      const clock = $(".clock"), face = $(".clock__time");
      const map = $(".map"), svg = $(".map__svg"), layers = $$(".map .L");
      const VIEW = {
        full: "0 0 1000 786",
        road: "250 190 420 330",
        grounds: "280 290 420 330",
        eve: "190 150 600 471"
      };
      const VIEW_FOR = { "1420": "road", "142x": "road", "1457": "grounds", "1504": "grounds", "eve": "eve" };
      /* 3D: the map shifts into a three.js model from 14:20 on (or whenever the reader picks 3D).
         three.js is fetched only as the timeline approaches; without WebGL the map simply stays 2D. */
      const stage = document.createElement("div");
      stage.className = "map__stage";
      svg.before(stage); stage.append(svg);
      const THREE_STATES = new Set(["1420", "142x", "1457", "1504", "eve"]);
      const modeBtns = $$(".map__mode button");
      let mode = "auto", m3 = null;
      const apply3d = instant => {
        if (!m3) return;
        const key = map.dataset.s;
        const want = mode === "3d" || (mode === "auto" && THREE_STATES.has(key));
        const vb = VIEW[VIEW_FOR[key] || "full"];
        if (want) m3.enter(key, vb, instant || !motion); else m3.exit(vb, instant || !motion);
        modeBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === (want ? "3d" : "2d")));
      };
      modeBtns.forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; apply3d(); }));
      const loadScript = src => new Promise((ok, fail) => {
        const s = document.createElement("script");
        s.src = src; s.onload = ok; s.onerror = fail;
        document.head.append(s);
      });
      const hasWebGL = (() => {
        try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
        catch (e) { return false; }
      })();
      if (hasWebGL) new IntersectionObserver((es, obs) => {
        if (!es.some(e => e.isIntersecting)) return;
        obs.disconnect();
        loadScript("js/vendor/three.min.js")
          .then(() => loadScript("assets/map3d-data.js"))
          .then(() => loadScript("js/map3d.js"))
          .then(() => window.Map3D && window.Map3D.init(stage, svg))
          .then(ok => { if (!ok) return; m3 = window.Map3D; map.classList.add("has-3d"); apply3d(true); })
          .catch(() => {});
      }, { rootMargin: "250% 0px" }).observe($(".timeline"));

      const setMap = key => {
        if (map.dataset.s === key) return;
        map.dataset.s = key;
        layers.forEach(l => l.classList.toggle("on", l.dataset.show.split(" ").includes(key)));
        gsap.to(svg, { attr: { viewBox: VIEW[VIEW_FOR[key] || "full"] }, duration: motion ? 1.1 : 0, ease: "power3.inOut", overwrite: true });
        apply3d();
      };
      const setTime = li => {
        $$(".tl").forEach(x => x.classList.toggle("is-active", x === li));
        setMap(li.dataset.map);
        if (face.textContent === li.dataset.time) return;
        clock.classList.toggle("is-blood", li.classList.contains("tl--blood"));
        if (motion) gsap.fromTo(face, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: "power3.out" });
        face.textContent = li.dataset.time;
      };
      const tls = $$(".tl");
      map.dataset.s = "";
      setMap("0930");
      const pickTime = () => {
        const mid = innerHeight * .55;
        let cur = tls[0];
        for (const li of tls) if (li.getBoundingClientRect().top < mid) cur = li;
        setTime(cur);
      };
      ScrollTrigger.create({ trigger: ".timeline__list", start: "top bottom", end: "bottom top", onUpdate: pickTime, onRefresh: pickTime });

      /* ---------- forensic: steps + scrubber ---------- */
      const frame = $(".forensic__frame"), hudSec = $(".hud__sec");
      const secsHud = ["00", "02", "03", "05", "09", "11", "15"];
      const steps = $$(".step");
      const pickStep = () => {
        const mid = innerHeight / 2;
        let best = steps[0], bestD = Infinity;
        for (const s of steps) {
          const r = s.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
          if (d < bestD) { bestD = d; best = s; }
        }
        const n = best.dataset.step;
        if (frame.dataset.state === n) return;
        frame.dataset.state = n;
        hudSec.textContent = secsHud[n] || "00";
        if (n === "3") {
          $$(".checklist--dark li", best).forEach((li, i) =>
            setTimeout(() => li.classList.add("on"), motion ? 250 + i * 260 : 0));
        }
      };
      ScrollTrigger.create({ trigger: ".forensic", start: "top bottom", end: "bottom top", onUpdate: pickStep, onRefresh: pickStep });
      // Each of the first three steps owns a stretch of frames: crowd fleeing, the shooter circled, the 3D model.
      const KEYS = [[0, 0], [0, 40], [0, 84], [0, 150], [1, SCRUB_N - 1]]; // [progress, frame]; middle three filled on refresh
      const mapFrame = p => {
        for (let k = 1; k < KEYS.length; k++) {
          const [p0, f0] = KEYS[k - 1], [p1, f1] = KEYS[k];
          if (p <= p1) return f0 + (f1 - f0) * Math.max(0, (p - p0) / ((p1 - p0) || 1));
        }
        return SCRUB_N - 1;
      };
      ScrollTrigger.create({
        trigger: steps[0], start: "top 80%", endTrigger: steps[2], end: "bottom 30%",
        onRefresh: s => {
          [0, 1, 2].forEach(i => {
            const r = steps[i].getBoundingClientRect();
            const at = r.top + scrollY + r.height / 2 - innerHeight / 2;
            KEYS[i + 1][0] = Math.min(1, Math.max(0, (at - s.start) / (s.end - s.start)));
          });
          setScrub(mapFrame(s.progress) / SCRUB_N);
        },
        onUpdate: s => setScrub(mapFrame(s.progress) / SCRUB_N)
      });

      /* ---------- case-file checklist ticks off ---------- */
      $$(".casefile .checklist").forEach(list => ScrollTrigger.create({
        trigger: list, start: "top 70%", once: true,
        onEnter: () => $$("li", list).forEach((li, i) =>
          setTimeout(() => li.classList.add("on"), motion ? i * 280 : 0))
      }));

      /* ---------- portraits turn to colour once seen ---------- */
      $$(".person").forEach(p => ScrollTrigger.create({
        trigger: p, start: "top 55%", once: true,
        onEnter: () => setTimeout(() => p.classList.add("is-color"), 600)
      }));
    });

    // Images and fonts change layout as they arrive; re-measure the triggers when they do.
    let rt;
    const refresh = () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 150); };
    addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    $$("img").forEach(img => img.complete || img.addEventListener("load", refresh, { once: true }));
  };
  // Deferred scripts run before DOMContentLoaded, while readyState is already "interactive",
  // so wait for the event itself: by then the GSAP files after this one have run.
  if (document.readyState === "complete") initMotion();
  else document.addEventListener("DOMContentLoaded", initMotion, { once: true });
})();
