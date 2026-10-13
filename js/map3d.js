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

  /* ---------- ground: the 2D map itself, drawn into a texture ---------- */
  const GROUND_CSS = `
    .m-green path{fill:#dde3cc}.m-minor path{fill:none;stroke:#d9cfbe;stroke-width:1.4}
    .m-road path{fill:none;stroke:#fbf8f2;stroke-width:7;stroke-linecap:round}
    .m-road path.m-trunk,.m-road path.m-motorway{stroke-width:11}
    .m-parl{fill:rgba(179,18,27,.18);stroke:#b3121b;stroke-width:2.5}
    .m-lbl{font:22px Impact,'Arial Narrow',sans-serif;letter-spacing:.06em;fill:#b3121b}
    .m-road-lbl{font:600 10px monospace;letter-spacing:.2em;fill:#8b8172}`;
  const groundTexture = () => new Promise(resolve => {
    const c = svgEl.cloneNode(true);
    c.querySelectorAll(".m-bld, defs").forEach(n => n.remove());
    c.querySelectorAll(".ov > .L").forEach(n => { if (!n.classList.contains("lbl-base")) n.remove(); else n.removeAttribute("class"); });
    c.querySelector(".m-lbl--parl")?.remove();   // the 3D building is labelled by its form
    c.setAttribute("viewBox", "0 0 1000 786");
    c.setAttribute("width", "2048"); c.setAttribute("height", "1610");
    c.removeAttribute("class"); c.removeAttribute("style");
    const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
    st.textContent = GROUND_CSS; c.prepend(st);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "1000"); bg.setAttribute("height", "786"); bg.setAttribute("fill", "#ece5d8");
    c.insertBefore(bg, st.nextSibling);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(c)], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas"); cv.width = 2048; cv.height = 1610;
      cv.getContext("2d").drawImage(img, 0, 0, 2048, 1610);
      URL.revokeObjectURL(url);
      const tex = new T.CanvasTexture(cv);
      tex.encoding = T.sRGBEncoding;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      resolve(tex);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  /* ---------- buildings ---------- */
  const shapeOf = (pts, holes = []) => {
    const s = new T.Shape(pts.map(([x, y]) => new T.Vector2(x - CX, CZ - y)));
    holes.forEach(h => s.holes.push(new T.Path(h.map(([x, y]) => new T.Vector2(x - CX, CZ - y)))));
    return s;
  };
  const extrude = (shape, h, mat, edgeMat) => {
    const g = new T.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    const m = new T.Mesh(g, mat);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    if (edgeMat) scene.add(new T.LineSegments(new T.EdgesGeometry(g, 20), edgeMat));
  };

  /* ---------- people ---------- */
  const bodyGeo = new (T.CylinderGeometry)(1.2, 1.5, 4.4, 7).translate(0, 2.2, 0);
  const headGeo = new T.SphereGeometry(1.15, 10, 8).translate(0, 5.5, 0);
  const figure = (color, emissive) => {
    const mat = new T.MeshLambertMaterial({ color, emissive: emissive || 0x000000 });
    const g = new T.Group();
    const b = new T.Mesh(bodyGeo, mat), h = new T.Mesh(headGeo, mat);
    b.castShadow = h.castShadow = true;
    g.add(b, h); g.scale.setScalar(FIG * 1.35); g.visible = false;
    scene.add(g); return g;
  };
  const instanced = (n, color) => {
    const mat = new T.MeshLambertMaterial({ color });
    const a = new T.InstancedMesh(bodyGeo, mat, n), b = new T.InstancedMesh(headGeo, mat, n);
    a.castShadow = b.castShadow = true;
    a.count = b.count = 0;
    scene.add(a, b); return [a, b];
  };

  const polyLen = pts => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const along = (pts, s) => {   // point + direction at fraction s of a polyline
    let L = polyLen(pts) * s;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], seg = Math.hypot(bx - ax, by - ay);
      if (L <= seg || i === pts.length - 1) {
        const f = seg ? Math.min(1, L / seg) : 0;
        return [ax + (bx - ax) * f, ay + (by - ay) * f, (bx - ax) / (seg || 1), (by - ay) / (seg || 1)];
      }
      L -= seg;
    }
  };
  const FIG = 1.05;   // figures drawn a little larger than life so they read at map scale
  const M = new T.Matrix4(), Q = new T.Quaternion(), S1 = new T.Vector3(FIG, FIG, FIG), P = new T.Vector3();

  const setCrowd = key => {
    agents = [];
    (FLOWS[key] || []).forEach(f => {
      const len = polyLen(f.p);
      for (let i = 0; i < f.n && agents.length < MAX_CROWD; i++)
        agents.push({ f, len, s: Math.random(), off: (Math.random() - .5) * 16, sp: (f.speed || 1) * (9 + Math.random() * 7), bob: Math.random() * 6 });
    });
    crowd.count = crowdHeads.count = agents.length;
  };
  const stepCrowd = dt => {
    agents.forEach((a, i) => {
      a.s += a.sp * dt / a.len;
      if (a.s > 1) a.s -= 1;
      const [x, y, dx, dy] = along(a.f.p, a.s);
      P.set(x - dy * a.off - CX, Math.abs(Math.sin(clock * 9 + a.bob)) * .5, y + dx * a.off - CZ);
      M.compose(P, Q, S1);
      crowd.setMatrixAt(i, M); crowdHeads.setMatrixAt(i, M);
    });
    crowd.instanceMatrix.needsUpdate = crowdHeads.instanceMatrix.needsUpdate = true;
  };
  const setPolice = key => {
    let i = 0;
    (LINES[key] || []).forEach(([[ax, ay], [bx, by], n]) => {
      for (let j = 0; j < n && i < MAX_POLICE; j++, i++) {
        const f = n > 1 ? j / (n - 1) : .5;
        M.compose(P.set(ax + (bx - ax) * f - CX, 0, ay + (by - ay) * f - CZ), Q, S1);
        police.setMatrixAt(i, M); policeHeads.setMatrixAt(i, M);
      }
    });
    police.count = policeHeads.count = i;
    police.instanceMatrix.needsUpdate = policeHeads.instanceMatrix.needsUpdate = true;
  };

  /* ---------- markers ---------- */
  const ringMat = new T.MeshBasicMaterial({ color: 0xc8102e, transparent: true, opacity: .9, side: T.DoubleSide });
  const pillarMat = new T.MeshBasicMaterial({ color: 0xc8102e, transparent: true, opacity: .42, depthWrite: false });
  const setRings = key => {
    ringsGroup.clear();
    (RINGS[key] || []).forEach(([x, y]) => {
      const r = new T.Mesh(new T.RingGeometry(4.2, 6, 32), ringMat);
      r.rotation.x = -Math.PI / 2; r.position.copy(v3(x, y, .4));
      ringsGroup.add(r);
      if (key === "eve") {
        const p = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, 140, 20, 1, true), pillarMat);
        p.position.copy(v3(x, y, 70));
        ringsGroup.add(p);
      }
    });
  };
  const setRange = key => {
    if (rangeLine) { scene.remove(rangeLine); rangeLine = null; }
    const r = RANGE[key]; if (!r) return;
    const g = new T.BufferGeometry().setFromPoints([v3(r[0][0], r[0][1], 3), v3(r[1][0], r[1][1], 3)]);
    rangeLine = new T.Line(g, new T.LineDashedMaterial({ color: 0x111111, dashSize: 3, gapSize: 2.4 }));
    rangeLine.computeLineDistances();
    scene.add(rangeLine);
  };

  /* ---------- HTML labels projected from 3D ---------- */
  const setLabels = key => {
    labelsEl.textContent = "";
    labels = (LABELS[key] || []).map(([text, x, y, h, cls]) => {
      const el = document.createElement("span");
      el.className = "m3-lbl" + (cls ? " m3-lbl--" + cls : "");
      el.textContent = text;
      labelsEl.append(el);
      return { el, pos: v3(x, y, h || 8) };
    });
    const r = RANGE[key];
    if (r) {
      const el = document.createElement("span");
      el.className = "m3-lbl m3-lbl--dist"; el.textContent = r[2]; labelsEl.append(el);
      labels.push({ el, pos: v3((r[0][0] + r[1][0]) / 2, (r[0][1] + r[1][1]) / 2, 9) });
    }
  };
  const V = new T.Vector3();
  const placeLabels = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    labels.forEach(l => {
      V.copy(l.pos).project(camera);
      const off = V.z > 1 || Math.abs(V.x) > 1.05 || Math.abs(V.y) > 1.05;
      l.el.style.opacity = off ? 0 : 1;
      l.el.style.transform = `translate(${(V.x * .5 + .5) * w}px, ${(-V.y * .5 + .5) * h}px) translate(-50%, -100%)`;
    });
  };

  /* ---------- camera ---------- */
  const applyCam = () => {
    const t = v3(cam.x, cam.y, 0);
    const sp = Math.sin(cam.phi);
    camera.position.set(t.x + cam.d * sp * Math.sin(cam.theta), cam.d * Math.cos(cam.phi), t.z + cam.d * sp * Math.cos(cam.theta));
    camera.lookAt(t);
  };
  // A straight-down camera that frames exactly what the 2D SVG shows ("meet" fit).
  const topDownFor = viewBox => {
    const [vx, vy, vw, vh] = viewBox.split(/\s+/).map(Number);
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    const tan = Math.tan(T.MathUtils.degToRad(FOV / 2));
    return { x: vx + vw / 2, y: vy + vh / 2, d: Math.max(vh / 2 / tan, vw / 2 / (tan * aspect)), phi: .001, theta: 0 };
  };
  const shortestTheta = to => {
    let d = to - cam.theta;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return cam.theta + d;
  };
  const fly = (to, dur, ease = "power3.inOut", onComplete) => {
    gsap.killTweensOf(cam);
    gsap.to(cam, { ...to, theta: shortestTheta(to.theta), duration: dur, ease, onComplete });
  };

  /* ---------- loop ---------- */
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const frame = now => {
    raf = 0;
    if (!active || !visible) return;
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now; clock += dt;
    stepCrowd(dt);
    if (fire.visible) { fireLight.intensity = 1.6 + Math.sin(clock * 23) * .5 + Math.random() * .4; fire.children[0].scale.y = 1 + Math.sin(clock * 17) * .2; }
    if (state === "eve" && !gsap.isTweening(cam)) cam.theta += dt * .06;
    applyCam();
    renderer.render(scene, camera);
    placeLabels();
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && active && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };

})();
