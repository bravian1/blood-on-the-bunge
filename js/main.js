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
})();
