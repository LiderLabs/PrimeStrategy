/* ═══════════════════════════════════════════════════════════════════
   PRIMESTRATEGY // THREE.JS RING — CAMERA-TRAVEL EDITION
   ───────────────────────────────────────────────────────────────────
   The camera MOVES. The world stays still.

   World layout (along the X axis):
       X =   0   →  Discipline ring (5 slabs)
       X =  40   →  Services ring for Discipline 0  (2 slabs)
       X =  45   →  Services ring for Discipline 1
       X =  50   →  Services ring for Discipline 2
       X =  55   →  Services ring for Discipline 3
       X =  60   →  Services ring for Discipline 4
       X = 100   →  Detail destination (single service, enlarged)

   Camera X drives everything:
       Level 1: camera.x = 0        (looking at disciplines)
       Level 2: camera.x = 40 + di*5 (looking at that discipline's services)
       Level 3: camera.x = 100      (looking at the selected service alone)

   The camera dollies horizontally with a soft ease and a small
   settle. Because the world is stationary, the motion reads as
   the frame traveling — not cards animating.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  if (typeof THREE === "undefined") { console.warn("[Ring] no three"); return; }
  if (typeof gsap === "undefined") { console.warn("[Ring] no gsap"); return; }

  var wrap = document.getElementById("threeRingWrap");
  var canvas = document.getElementById("threeRingCanvas");
  var loaderEl = document.getElementById("threeRingLoader");
  var closeBtn = document.getElementById("threeRingClose");
  if (!wrap || !canvas) { console.warn("[Ring] no wrap/canvas"); return; }

  /* ═══ DATA ═══ */
  var DISCIPLINES = window.PS_DISCIPLINES || [
    { number: "01", title: "Management Consulting", desc: "Strategy, operating model, org performance.", long: "Strategic advisory and organizational implementation for enterprises navigating growth, complexity, and change.", services: [
      { number: "01", title: "Management Consulting", desc: "Strategy formulation, process optimization." },
      { number: "02", title: "Market & Business Analysis", desc: "Commercial assessment, competitor landscape." }
    ]},
    { number: "02", title: "Market & Consumer Research", desc: "Field, focus groups, brand equity.", long: "Quantitative and qualitative primary market studies that arm leadership with category leadership.", services: [
      { number: "01", title: "Consumer Research", desc: "Consumer preferences, loyalty, brand equity." },
      { number: "02", title: "Focus Group Discussion", desc: "Moderated sessions, qualitative insight." }
    ]},
    { number: "03", title: "Quantitative Data Analytics", desc: "Modelling, BI, business intelligence.", long: "Data science pipelines and business intelligence architecture that turn field data into decisions.", services: [
      { number: "01", title: "Data Analytics", desc: "Predictive models, revenue optimization." },
      { number: "02", title: "Market Sizing", desc: "Addressable volume, segment opportunity." }
    ]},
    { number: "04", title: "Customized Software & IT", desc: "Enterprise apps, automation.", long: "Custom enterprise engineering that leverages digital tools to minimize cost and raise productivity.", services: [
      { number: "01", title: "Software Development", desc: "Custom enterprise applications." },
      { number: "02", title: "Data Capture & Entry", desc: "Structured, quality-controlled capture." }
    ]},
    { number: "05", title: "Field & Mystery Studies", desc: "On-ground evaluation, service audit.", long: "Trained field evaluators and mystery shopping programs transformed into actionable reports.", services: [
      { number: "01", title: "Mystery Shopping", desc: "Trained field evaluators, service reports." },
      { number: "02", title: "Market Research", desc: "Primary market studies, field data." }
    ]}
  ];

  /* ═══ WORLD POSITIONS ═══ */
  var DISC_RING_X    = 0;
  var SVC_RING_X     = 40;
  var SVC_RING_GAP   = 5;
  var DETAIL_X       = 100;
  var CAM_Z          = 12.2;
  var CAM_Y          = 0.6;

  /* ═══ COLOURS ═══ */
  var DISC_COLORS  = { top: "#E86A34", mid1: "#D4521E", mid2: "#B23F12", bot: "#8E3210", edge: 0x8E3210 };
  var SVC_COLORS   = { top: "#4A74C7", mid1: "#1E4FA8", mid2: "#0E2F6B", bot: "#081B4A", edge: 0x081B4A };
  var DETAIL_COLORS = { top: "#E86A34", mid1: "#D4521E", mid2: "#B23F12", bot: "#8E3210", edge: 0x8E3210 };
  var SLAB_TEXT   = "#FFFFFF";
  var SLAB_NUMBER = "rgba(255,255,255,0.80)";
  var SLAB_DESC   = "rgba(255,255,255,0.88)";

  var ENV_TOP = "#FFFFFF", ENV_MID = "#D8DEE9", ENV_LOW = "#8FA0B5", ENV_BOT = "#0E2F6B";

  /* ═══ GEOMETRY ═══ */
  var RING_RADIUS = 4.6;
  var DISC_W = 2.2, DISC_H = 3.0, DISC_D = 0.18;
  var SVC_W = 2.0, SVC_H = 1.4, SVC_D = 0.14;
  var DETAIL_W = 3.6, DETAIL_H = 4.8, DETAIL_D = 0.22;

  /* ═══ RENDERER ═══ */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 500);
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.lookAt(0, 0, 0);

  /* ═══ LIGHTS ═══ */
  scene.add(new THREE.AmbientLight(0xffffff, 0.72));
  var keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
  keyLight.position.set(-4, 6, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 200;
  keyLight.shadow.camera.left = -80;
  keyLight.shadow.camera.right = 80;
  keyLight.shadow.camera.top = 20;
  keyLight.shadow.camera.bottom = -20;
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0xC8D4E8, 0.5);
  rimLight.position.set(4, 3, -5);
  scene.add(rimLight);
  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xD8DEE9, 0.35));

  /* ═══ ENV MAP ═══ */
  function makeEnvMap() {
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, ENV_TOP); g.addColorStop(0.35, ENV_MID);
    g.addColorStop(0.7, ENV_LOW); g.addColorStop(1, ENV_BOT);
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    var s = ctx.createRadialGradient(c.width*0.7, c.height*0.28, 0, c.width*0.7, c.height*0.28, 120);
    s.addColorStop(0, "rgba(255,255,255,1)"); s.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = s; ctx.fillRect(0, 0, c.width, c.height);
    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    var env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return env;
  }
  scene.environment = makeEnvMap();

  /* ═══ TEXT HELPERS ═══ */
  function wrapText(ctx, text, maxWidth) {
    var words = text.split(" "), lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function paintBase(ctx, W, H, colors) {
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, colors.top);
    grad.addColorStop(0.3, colors.mid1);
    grad.addColorStop(0.65, colors.mid2);
    grad.addColorStop(1, colors.bot);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    var hl = ctx.createRadialGradient(W*0.25, H*0.15, 0, W*0.25, H*0.15, W*0.8);
    hl.addColorStop(0, "rgba(255,255,255,0.30)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl; ctx.fillRect(0, 0, W, H);
  }

  function makeDisciplineTexture(slab) {
    var W = 900, H = 1200;
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    paintBase(ctx, W, H, DISC_COLORS);
    ctx.fillStyle = SLAB_NUMBER;
    ctx.font = "600 40px 'JetBrains Mono', monospace";
    ctx.fillText(slab.number, 70, 130);
    ctx.fillStyle = SLAB_TEXT;
    ctx.font = "600 76px Inter, sans-serif";
    var t = wrapText(ctx, slab.title, W - 140);
    var ty = H * 0.55;
    for (var i = 0; i < t.length; i++) ctx.fillText(t[i], 70, ty + i * 92);
    ctx.fillStyle = SLAB_DESC;
    ctx.font = "400 32px Inter, sans-serif";
    var d = wrapText(ctx, slab.desc, W - 140);
    var dy = ty + t.length * 92 + 40;
    for (var j = 0; j < d.length && j < 3; j++) ctx.fillText(d[j], 70, dy + j * 42);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  function makeServiceTexture(svc) {
    var W = 900, H = 620;
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    paintBase(ctx, W, H, SVC_COLORS);
    ctx.fillStyle = SLAB_NUMBER;
    ctx.font = "600 34px 'JetBrains Mono', monospace";
    ctx.fillText(svc.number, 60, 110);
    ctx.fillStyle = SLAB_TEXT;
    ctx.font = "600 62px Inter, sans-serif";
    var t = wrapText(ctx, svc.title, W - 120);
    var ty = H * 0.5;
    for (var i = 0; i < t.length; i++) ctx.fillText(t[i], 60, ty + i * 76);
    ctx.fillStyle = SLAB_DESC;
    ctx.font = "400 28px Inter, sans-serif";
    var d = wrapText(ctx, svc.desc, W - 120);
    var dy = ty + t.length * 76 + 30;
    for (var j = 0; j < d.length && j < 3; j++) ctx.fillText(d[j], 60, dy + j * 38);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  function makeDetailTexture(svc, disc) {
    var W = 1200, H = 1600;
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    paintBase(ctx, W, H, DETAIL_COLORS);
    ctx.fillStyle = SLAB_NUMBER;
    ctx.font = "600 38px 'JetBrains Mono', monospace";
    ctx.fillText(disc.number + " · " + svc.number, 90, 150);
    ctx.fillStyle = SLAB_TEXT;
    ctx.font = "600 96px Inter, sans-serif";
    var t = wrapText(ctx, svc.title, W - 180);
    var ty = H * 0.30;
    for (var i = 0; i < t.length; i++) ctx.fillText(t[i], 90, ty + i * 116);
    ctx.fillStyle = SLAB_DESC;
    ctx.font = "400 36px Inter, sans-serif";
    var blurb = (svc.long || svc.desc || "");
    var b = wrapText(ctx, blurb, W - 180);
    var by = ty + t.length * 116 + 80;
    for (var j = 0; j < b.length && j < 8; j++) ctx.fillText(b[j], 90, by + j * 52);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  /* ═══ SLAB FACTORY ═══ */
  function makeSlab(w, h, d, texture, edgeColor, worldX, worldY, worldZ, tag) {
    var frontMat = new THREE.MeshStandardMaterial({
      map: texture, metalness: 0.5, roughness: 0.35,
      envMap: scene.environment, envMapIntensity: 0.85,
      emissive: 0x1a0800, emissiveIntensity: 0.1
    });
    var edgeMat = new THREE.MeshStandardMaterial({
      color: edgeColor, metalness: 0.75, roughness: 0.4,
      envMap: scene.environment, envMapIntensity: 0.7
    });
    var geo = new THREE.BoxGeometry(w, h, d);
    var mesh = new THREE.Mesh(geo, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, edgeMat]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(worldX, worldY, worldZ);
    mesh.userData = tag || {};
    scene.add(mesh);
    return mesh;
  }

  /* ═══ BUILD DISCIPLINE RING ═══ */
  var disciplines = [];
  DISCIPLINES.forEach(function (data, i) {
    var tex = makeDisciplineTexture(data);
    var slab = makeSlab(DISC_W, DISC_H, DISC_D, tex, DISC_COLORS.edge,
      DISC_RING_X, 0, 0, { kind: "discipline", index: i, data: data });
    slab.userData.baseAngle = (i / DISCIPLINES.length) * Math.PI * 2;
    disciplines.push(slab);
  });

  /* ═══ BUILD FIVE SERVICE RINGS ═══ */
  /* Each discipline has its own services ring at a distinct world X. */
  var servicesByDisc = [];     /* servicesByDisc[di] = [slabA, slabB] */

  DISCIPLINES.forEach(function (disc, di) {
    var ringX = SVC_RING_X + di * SVC_RING_GAP;
    var pair = [];
    disc.services.forEach(function (svc, si) {
      var tex = makeServiceTexture(svc);
      var angle = (si / disc.services.length) * Math.PI * 2;
      var px = ringX + Math.sin(angle) * (RING_RADIUS * 0.55);
      var pz = Math.cos(angle) * (RING_RADIUS * 0.55);
      var slab = makeSlab(SVC_W, SVC_H, SVC_D, tex, SVC_COLORS.edge,
        px, 0, pz, { kind: "service", discIndex: di, svcIndex: si, data: svc });
      slab.userData.ringX = ringX;
      slab.userData.baseAngle = angle;
      pair.push(slab);
    });
    servicesByDisc.push(pair);
  });

  /* ═══ BUILD DETAIL SLAB (hidden until Level 3) ═══ */
  var detailSlab = new THREE.Mesh(
    new THREE.BoxGeometry(DETAIL_W, DETAIL_H, DETAIL_D),
    new THREE.MeshStandardMaterial({
      color: 0xD4521E, metalness: 0.5, roughness: 0.35,
      envMap: scene.environment, envMapIntensity: 0.85
    })
  );
  detailSlab.position.set(DETAIL_X, 0, 0);
  detailSlab.visible = false;
  scene.add(detailSlab);

  /* ═══ FLOOR ═══ */
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 60),
    new THREE.ShadowMaterial({ opacity: 0.09 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(50, -2.6, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  /* ═══ STATE ═══ */
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  var ringAngle = 0;
  var ringSpeed = 0.16;
  var currentRingSpeed = 0.16;

  var camTargetX = 0;
  var camCurrentX = 0;
  var level = 1;
  var activeDiscIndex = -1;
  var activeSvcIndex = -1;
  var animationLock = false;

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent("ps:ring-" + name, { detail: detail || {} }));
  }

  function setCloseBtnVisible(v) {
    if (!closeBtn) return;
    if (v) closeBtn.classList.add("is-visible");
    else closeBtn.classList.remove("is-visible");
  }

  /* ═══ CAMERA DOLLY ═══
     A soft ease with a small overshoot-then-settle. Feels like
     a camera on a track that decelerates into place. */
  function dollyCameraTo(targetX, onArrive) {
    var startX = camCurrentX;
    var distance = targetX - startX;
    if (Math.abs(distance) < 0.01) { if (onArrive) onArrive(); return; }

    animationLock = true;
    camTargetX = targetX;

    var state = { x: startX };
    gsap.to(state, {
      x: targetX,
      duration: 1.35,
      ease: "power2.inOut",
      onUpdate: function () {
        camCurrentX = state.x;
        camTargetX = state.x; /* keep in sync so the loop uses it */
      },
      onComplete: function () {
        camCurrentX = targetX;
        /* Small settle overshoot: nudge forward a tiny bit and back */
        gsap.fromTo(camCurrentX === targetX ? state : state,
          { x: targetX + 0.18 },
          {
            x: targetX,
            duration: 0.35,
            ease: "power2.out",
            onUpdate: function () { camCurrentX = state.x; },
            onComplete: function () {
              camCurrentX = targetX;
              animationLock = false;
              if (onArrive) onArrive();
            }
          }
        );
      }
    });
  }

  /* ═══ LEVEL 1 → 2: pick a discipline ═══ */
  function goToLevel2(discSlab) {
    if (level !== 1 || animationLock) return;
    var di = discSlab.userData.index;
    activeDiscIndex = di;
    activeSvcIndex = -1;
    level = 2;
    setCloseBtnVisible(true);
    emit("discipline-selected", { index: di, data: DISCIPLINES[di] });

    var targetX = SVC_RING_X + di * SVC_RING_GAP;
    dollyCameraTo(targetX);
  }

  /* ═══ LEVEL 2 → 3: pick a service ═══ */
  function goToLevel3(svcSlab) {
    if (level !== 2 || animationLock) return;
    var di = svcSlab.userData.discIndex;
    var si = svcSlab.userData.svcIndex;
    activeDiscIndex = di;
    activeSvcIndex = si;
    level = 3;

    /* Prepare the detail slab's texture */
    var disc = DISCIPLINES[di];
    var svc = disc.services[si];
    var tex = makeDetailTexture(svc, disc);

    if (detailSlab.material.map) detailSlab.material.map.dispose();
    detailSlab.material.map = tex;
    detailSlab.material.needsUpdate = true;
    detailSlab.visible = true;

    emit("service-selected", { discIndex: di, svcIndex: si, data: svc });

    dollyCameraTo(DETAIL_X);
  }

  /* ═══ BACK ═══ */
  function back() {
    if (animationLock) return;
    if (level === 3) {
      level = 2;
      emit("service-deselected", {});
      var di = activeDiscIndex;
      activeSvcIndex = -1;
      dollyCameraTo(SVC_RING_X + di * SVC_RING_GAP);
      return;
    }
    if (level === 2) {
      level = 1;
      activeDiscIndex = -1;
      activeSvcIndex = -1;
      setCloseBtnVisible(false);
      emit("deselected", {});
      /* Hide detail slab behind the camera */
      dollyCameraTo(0, function () { detailSlab.visible = false; });
      return;
    }
  }

  /* ═══ INPUT ═══ */
  function screenToNDC(x, y) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  canvas.addEventListener("click", function (e) {
    if (animationLock) return;
    screenToNDC(e.clientX, e.clientY);
    raycaster.setFromCamera(mouse, camera);

    if (level === 1) {
      var hits = raycaster.intersectObjects(disciplines, false);
      if (hits.length) goToLevel2(hits[0].object);
      return;
    }
    if (level === 2) {
      var di = activeDiscIndex;
      if (di < 0) return;
      var pool = servicesByDisc[di] || [];
      var h2 = raycaster.intersectObjects(pool, false);
      if (h2.length) goToLevel3(h2[0].object);
      return;
    }
    /* level 3: click does nothing except via close */
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) { e.stopPropagation(); back(); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") back();
  });
  window.PSRing = { back: back };

  /* ═══ ANIMATE ═══ */
  var last = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    var now = performance.now();
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    currentRingSpeed += (ringSpeed - currentRingSpeed) * Math.min(dt * 3, 1);
    ringAngle += currentRingSpeed * dt;

    /* DISCIPLINE RING — rotates always */
    for (var i = 0; i < disciplines.length; i++) {
      var d = disciplines[i];
      var a = d.userData.baseAngle + ringAngle;
      d.position.x = DISC_RING_X + Math.sin(a) * RING_RADIUS;
      d.position.z = Math.cos(a) * RING_RADIUS;
      d.position.y = 0;
      d.rotation.y = a;
      /* Dim if we're past level 1 */
      var discOp = (level === 1) ? 1 : 0.55;
      d.material && d.material.forEach && d.material.forEach(function(m){ m.opacity = discOp; m.transparent = true; });
    }

    /* SERVICE RINGS — each pair rotates slowly in place */
    for (var di = 0; di < servicesByDisc.length; di++) {
      var pair = servicesByDisc[di];
      var ringX = SVC_RING_X + di * SVC_RING_GAP;
      var pairAngle = ringAngle * 0.55;
      for (var si = 0; si < pair.length; si++) {
        var s = pair[si];
        var aa = s.userData.baseAngle + pairAngle;
        s.position.x = ringX + Math.sin(aa) * (RING_RADIUS * 0.55);
        s.position.z = Math.cos(aa) * (RING_RADIUS * 0.55);
        s.position.y = 0;
        s.rotation.y = aa;
      }
    }

    /* CAMERA — dollying horizontally. Look at a point that also
       shifts so the frame stays centred on the current destination. */
    camera.position.x = camCurrentX;
    camera.position.y = CAM_Y + Math.sin(now * 0.0005) * 0.05;
    camera.lookAt(camCurrentX, 0, 0);

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", function () {
    if (!wrap.clientWidth || !wrap.clientHeight) return;
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (loaderEl) loaderEl.classList.add("is-hidden");
    });
  });

  animate();

})();