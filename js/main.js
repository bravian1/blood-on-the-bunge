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

})();
