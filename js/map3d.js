/* 3D view of the timeline map, built with three.js from the same OpenStreetMap data as the 2D map.
   Loaded lazily by main.js. Exposes window.Map3D. Positions are approximate, after BBC Africa Eye's reconstruction. */
(() => {
  const T = window.THREE, DATA = window.MAP3D_DATA;
  if (!T || !DATA) return;

  const CX = 500, CZ = 393;                 // map centre; map units ≈ 0.62 m
  const FOV = 30;
  const v3 = (x, y, h = 0) => new T.Vector3(x - CX, h, y - CZ);

  /* ---------- what each moment shows ---------- */
  // Crowd flows: polylines in map coordinates, with how many people walk each one.
  const FLOWS = {
    "0930": [],
    "1300": [{ p: [[905, 15], [590, 170]], n: 70 }, { p: [[318, 25], [372, 148]], n: 45 }, { p: [[120, 345], [245, 290]], n: 45 }],
    "1400": [{ p: [[905, 15], [470, 222]], n: 80 }, { p: [[318, 25], [400, 200]], n: 55 }, { p: [[120, 345], [372, 250]], n: 55 }],
    "1414": [{ p: [[905, 15], [470, 222]], n: 80 }, { p: [[318, 25], [400, 200]], n: 55 }, { p: [[120, 345], [372, 250]], n: 55 }],
    "1420": [{ p: [[420, 236], [496, 390]], n: 90 }, { p: [[760, 80], [440, 228]], n: 60 }, { p: [[340, 90], [410, 225]], n: 40 }],
    "142x": [{ p: [[455, 330], [430, 262], [418, 236]], n: 90, speed: 2.4 }, { p: [[470, 350], [440, 285]], n: 30, speed: 2.4 }],
    "1457": [{ p: [[512, 412], [452, 470]], n: 60 }, { p: [[538, 462], [478, 512]], n: 60 }, { p: [[488, 368], [432, 425]], n: 50 }, { p: [[440, 250], [500, 380]], n: 60 }],
    "1504": [{ p: [[452, 470], [520, 432], [560, 400]], n: 80, speed: 2.6 }, { p: [[478, 505], [545, 462], [590, 440]], n: 60, speed: 2.6 }],
    "eve": []
  };
  // Police and soldiers: lines of figures between two points.
  const LINES = {
    "1300": [[[563, 140], [587, 186], 6], [[355, 175], [399, 155], 6], [[257, 286], [279, 328], 6]],
    "1400": [[[418, 286], [462, 264], 9]], "1414": [[[418, 286], [462, 264], 9]],
    "1420": [[[488, 420], [520, 404], 7]],
    "142x": [[[494, 430], [524, 415], 7]],
    "1457": [[[440, 470], [455, 500], 4]],
    "1504": [[[456, 418], [452, 428], 2]]
  };
  const SHOOTER = { "142x": { at: [497, 410], kneel: true }, "1504": { at: [468, 424] } };
  const ERIC = { "1504": [505, 440] };
  const RINGS = { "142x": [[452, 322], [462, 334]], "1504": [[507, 439]], "eve": [[452, 322], [462, 334], [507, 439]] };
  const FIRE = new Set(["1420", "142x"]);
  const RANGE = { "142x": [[456, 330], [494, 404], "≈ 50 m"], "1504": [[505, 440], [470, 425], "≈ 25 m"] };
  const LABELS = {
    "0930": [["MPs file in for the final vote", 428, 540, 30]],
    "1300": [["From the east", 760, 85, 4, "crowd"], ["From the north", 330, 60, 4, "crowd"], ["From the west", 150, 330, 4, "crowd"], ["Police lines", 575, 160, 10, "police"]],
    "1400": [["Last line of defence", 440, 275, 10, "police"]],
    "1414": [["195–106: the bill passes", 428, 540, 34]],
    "1420": [["Police truck set alight", 452, 316, 18], ["Protesters reach Parliament Road", 470, 350, 8, "crowd"]],
    "142x": [["David Chege", 452, 322, 10, "red"], ["Ericsson Mutisya", 462, 334, 4, "red"], ["Police officer kneels, fires", 497, 410, 12, "red"]],
    "1457": [["Fences torn down; crowd crosses the lawns", 500, 430, 8, "crowd"]],
    "1504": [["Eric Shieni, at the exit", 505, 440, 20, "yellow"], ["Soldier fires", 468, 424, 12, "red"]],
    "eve": [["David Chege", 452, 322, 70, "red"], ["Ericsson Mutisya", 462, 334, 54, "red"], ["Eric Shieni", 507, 439, 70, "red"]]
  };
  // Camera per moment: target (map coords), distance, tilt from vertical, compass angle.
  const CAMS = {
    "0930": { x: 470, y: 420, d: 700, phi: .78, theta: .35 },
    "1300": { x: 520, y: 260, d: 880, phi: .82, theta: .35 },
    "1400": { x: 470, y: 270, d: 650, phi: .85, theta: .4 },
    "1414": { x: 450, y: 380, d: 620, phi: .85, theta: .5 },
    "1420": { x: 465, y: 315, d: 400, phi: .98, theta: .62 },
    "142x": { x: 476, y: 368, d: 270, phi: .98, theta: 1.05 },
    "1457": { x: 480, y: 450, d: 360, phi: .82, theta: 1.25 },
    "1504": { x: 482, y: 448, d: 240, phi: .88, theta: 2.45 },
    "eve":  { x: 480, y: 385, d: 420, phi: .9, theta: 1.95 }
  };

  let renderer, scene, camera, stage, canvas, labelsEl, svgEl;
  let active = false, visible = true, state = null, raf = 0, last = 0, clock = 0;
  const cam = { x: CX, y: CZ, d: 600, phi: .001, theta: 0 };
  let crowd, crowdHeads, police, policeHeads, shooter, eric, fire, fireLight, ringsGroup, rangeLine, labels = [];
  let agents = [];
  const MAX_CROWD = 260, MAX_POLICE = 24;

})();
