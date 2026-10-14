/* ═══════════════════════════════════════════════════════════════════
   PRIMESTRATEGY // THE ARENA + STAGE 02: 3D STREET AT SCHOOL JUNCTION
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var canvas = document.getElementById("arena-canvas");
  var wrap = document.getElementById("arenaWrap");
  if (!canvas || !wrap || typeof THREE === "undefined") return;

  var SECTIONS = [
    { id: "hero",        number: "01", eyebrow: "Overview",             title: "The PrimeStrategy Experience",       subtitle: "Unencumbered execution. Independent empirical ground truth deployed with zero corporate bias.", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=85" },
    { id: "about",       number: "02", eyebrow: "The Crossroads",       title: "The Business Transformation Experts", subtitle: "Ashalley Botwe School Junction. Core principles of institutional engagement.", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85" },
    { id: "methodology", number: "03", eyebrow: "Delivery Architecture",title: "A Four-Phase Framework",              subtitle: "Diagnosis to institutionalization.", targetId: "#methodology-section", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85" },
    { id: "disciplines", number: "04", eyebrow: "Advisory Capabilities",title: "Multidisciplinary Precision",         subtitle: "Strategy, research, quantitative analytics.", targetId: "#disciplines-section", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=85" },
    { id: "ring",        number: "05", eyebrow: "Practice Ring",        title: "Five Disciplines in Motion",          subtitle: "An interactive 3D practice hub.", targetId: "#ring-section", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85" },
    { id: "metrics",     number: "06", eyebrow: "Proven Impact",        title: "Institutional Track Record",          subtitle: "Empirical numbers verified across Africa.", targetId: "#metrics-section", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85" },
    { id: "contact",     number: "07", eyebrow: "Executive Advisory",   title: "Engage PrimeStrategy",                subtitle: "Direct access to our strategy directors.", targetId: "#contact-section", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85" }
  ];

  var TOTAL = SECTIONS.length;
  var CARD_W = 4.3, CARD_H = 2.45, CARD_D = 0.08, CARD_Y_ROT = 0.44, FLOOR_Y = -2.1;

  var SLOTS = [
    { pos: [ 1.45, -0.42,  0.6], scale: 1.00, opacity: 1.0, brightness: 1.00 }, // Slot 0
    { pos: [ 0.05,  0.28, -1.6], scale: 0.92, opacity: 1.0, brightness: 0.85 }, // Slot 1
    { pos: [-1.35,  0.98, -3.8], scale: 0.84, opacity: 1.0, brightness: 0.68 }, // Slot 2
    { pos: [-2.70,  1.68, -5.8], scale: 0.76, opacity: 0.0, brightness: 0.45 }, // Slot 3
    { pos: [ 3.80, -1.80,  2.2], scale: 1.05, opacity: 0.0, brightness: 1.00 }  // Slot 4
  ];

  /* ═══════════════════════════════════════════════════════════
     RENDERER & CAMERA
     ═══════════════════════════════════════════════════════════ */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(23, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  var ARENA_CAM_POS = new THREE.Vector3(0.1, 0.45, 12.2);
  var ARENA_CAM_LOOK = new THREE.Vector3(0.0, 0.1, 0);
  camera.position.copy(ARENA_CAM_POS);
  camera.lookAt(ARENA_CAM_LOOK);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  var keyLight = new THREE.DirectionalLight(0xfff6ec, 1.4);
  keyLight.position.set(-5, 9, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.radius = 4;
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0xffede0, 0.45);
  fillLight.position.set(8, 2, 6);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0xff8a3c, 0.85);
  rimLight.position.set(-8, 1, -4);
  scene.add(rimLight);

  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ opacity: 0.12 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = FLOOR_Y;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ═══════════════════════════════════════════════════════════
     ARENA CARDS GROUP
     ═══════════════════════════════════════════════════════════ */
  var arenaGroup = new THREE.Group();
  scene.add(arenaGroup);

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

  function makeCardTexture(section, photoImage) {
    var W = 1120, H = 640;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d");

    var bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#221A15");
    bgGrad.addColorStop(0.5, "#181310");
    bgGrad.addColorStop(1, "#0E0B09");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    if (photoImage && photoImage.complete && photoImage.naturalWidth !== 0) {
      try {
        var ia = photoImage.width / photoImage.height, ca = W / H, dw, dh, dx, dy;
        if (ia > ca) { dh = H; dw = H * ia; dx = (W - dw) / 2; dy = 0; }
        else { dw = W; dh = W / ia; dx = 0; dy = (H - dh) / 2; }
        ctx.drawImage(photoImage, dx, dy, dw, dh);
      } catch (e) {}
    }

    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(20, 16, 14, 0.15)");
    grad.addColorStop(0.40, "rgba(20, 16, 14, 0.40)");
    grad.addColorStop(0.72, "rgba(20, 16, 14, 0.86)");
    grad.addColorStop(1, "rgba(20, 16, 14, 0.98)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    var hl = ctx.createRadialGradient(W * 0.15, H * 0.15, 0, W * 0.15, H * 0.15, W * 0.7);
    hl.addColorStop(0, "rgba(255, 245, 235, 0.22)");
    hl.addColorStop(1, "rgba(255, 245, 235, 0)");
    ctx.fillStyle = hl;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 24px 'Playfair Display', Georgia, serif";
    ctx.fillText("P.", 60, 68);

    ctx.fillStyle = "#E06F28";
    ctx.font = "600 22px 'JetBrains Mono', monospace";
    ctx.fillText(section.number + " · " + section.eyebrow.toUpperCase(), 60, H - 180);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 58px 'Playfair Display', Georgia, serif";
    var tl = wrapText(ctx, section.title, W - 140);
    for (var i = 0; i < tl.length; i++) { ctx.fillText(tl[i], 60, H - 132 + i * 64); }

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "400 20px Inter, sans-serif";
    var sl = wrapText(ctx, section.subtitle, W - 140);
    var sTop = H - 132 + tl.length * 64 + 14;
    for (var j = 0; j < sl.length; j++) { ctx.fillText(sl[j], 60, sTop + j * 28); }

    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  var textures = SECTIONS.map(function (s) { return makeCardTexture(s, null); });
  SECTIONS.forEach(function (s, i) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      textures[i] = makeCardTexture(s, img);
      cards.forEach(function (card) {
        if (card.userData.sectionIndex === i) {
          card.userData.frontMat.map = textures[i];
          card.userData.frontMat.needsUpdate = true;
        }
      });
    };
    img.src = s.image;
  });

  function buildCardBodyGeometry() {
    var shape = new THREE.Shape();
    var w2 = CARD_W / 2, h2 = CARD_H / 2;
    shape.moveTo(-w2, -h2); shape.lineTo(w2, -h2); shape.lineTo(w2, h2); shape.lineTo(-w2, h2); shape.closePath();
    var geo = new THREE.ExtrudeGeometry(shape, { depth: CARD_D, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 2 });
    geo.center();
    return geo;
  }

  var cards = [];

  function buildCard(sectionIndex, initialSlot, idx) {
    var group = new THREE.Group();
    var slot = SLOTS[initialSlot];
    group.position.set(slot.pos[0], slot.pos[1], slot.pos[2]);
    group.scale.setScalar(slot.scale);
    group.rotation.y = CARD_Y_ROT;

    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f1b18, metalness: 0.65, roughness: 0.28, transparent: true, opacity: slot.opacity });
    var body = new THREE.Mesh(buildCardBodyGeometry(), bodyMat);
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);

    var frontMat = new THREE.MeshStandardMaterial({
      map: textures[sectionIndex], metalness: 0.15, roughness: 0.40, transparent: true, opacity: slot.opacity,
      emissive: 0xC85A17, emissiveIntensity: initialSlot === 0 ? 0.18 : 0.0
    });
    var front = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W - 0.015, CARD_H - 0.015), frontMat);
    front.position.z = CARD_D / 2 + 0.008;
    front.receiveShadow = true;
    front.userData.parentGroup = group;
    group.add(front);

    var sCanvas = document.createElement("canvas");
    sCanvas.width = 256; sCanvas.height = 64;
    var sctx = sCanvas.getContext("2d");
    var sGrad = sctx.createRadialGradient(128, 32, 0, 128, 32, 100);
    sGrad.addColorStop(0, "rgba(20, 14, 10, 0.42)");
    sGrad.addColorStop(0.5, "rgba(20, 14, 10, 0.12)");
    sGrad.addColorStop(1, "rgba(20, 14, 10, 0)");
    sctx.fillStyle = sGrad; sctx.fillRect(0, 0, 256, 64);

    var decal = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W * 1.05, 0.65),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sCanvas), transparent: true, opacity: slot.opacity * 0.75, depthWrite: false, blending: THREE.MultiplyBlending })
    );
    decal.rotation.x = -Math.PI / 2; decal.rotation.z = -CARD_Y_ROT; decal.position.y = FLOOR_Y + 0.01;
    arenaGroup.add(decal);

    group.userData = { index: idx, sectionIndex: sectionIndex, currentSlot: initialSlot, bodyMat: bodyMat, frontMat: frontMat, decal: decal };
    arenaGroup.add(group);
    cards.push(group);
  }

  buildCard(0, 0, 0); buildCard(1, 1, 1); buildCard(2, 2, 2); buildCard(3, 3, 3);

  /* Rolling Slate Gear */
  var TOOTH_COUNT = 16, GEAR_OUTER_R = 0.90, GEAR_ROOT_R = 0.68, GEAR_SCALE = 0.36;
  function buildGearShape() {
    var shape = new THREE.Shape();
    var step = (Math.PI * 2) / TOOTH_COUNT, hb = step * 0.25;
    for (var i = 0; i < TOOTH_COUNT; i++) {
      var a = i * step;
      var p0 = [Math.cos(a - hb * 1.3) * GEAR_ROOT_R, Math.sin(a - hb * 1.3) * GEAR_ROOT_R];
      var p1 = [Math.cos(a - hb * 0.7) * GEAR_OUTER_R, Math.sin(a - hb * 0.7) * GEAR_OUTER_R];
      var p2 = [Math.cos(a + hb * 0.7) * GEAR_OUTER_R, Math.sin(a + hb * 0.7) * GEAR_OUTER_R];
      var p3 = [Math.cos(a + hb * 1.3) * GEAR_ROOT_R, Math.sin(a + hb * 1.3) * GEAR_ROOT_R];
      if (i === 0) shape.moveTo(p0[0], p0[1]); else shape.lineTo(p0[0], p0[1]);
      shape.lineTo(p1[0], p1[1]); shape.lineTo(p2[0], p2[1]); shape.lineTo(p3[0], p3[1]);
    }
    shape.closePath();
    var hole = new THREE.Path(); hole.absarc(0, 0, 0.22, 0, Math.PI * 2, true); shape.holes.push(hole);
    for (var s = 0; s < 5; s++) {
      var sa = (s / 5) * Math.PI * 2;
      var cut = new THREE.Path(); cut.absarc(Math.cos(sa) * 0.45, Math.sin(sa) * 0.45, 0.09, 0, Math.PI * 2, true);
      shape.holes.push(cut);
    }
    var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
    geo.center();
    return geo;
  }

  var gearRadiusWorld = GEAR_OUTER_R * GEAR_SCALE;
  var gearBaseX = SLOTS[0].pos[0] - 0.45, gearBaseY = FLOOR_Y + gearRadiusWorld, gearBaseZ = SLOTS[0].pos[2] + 0.42;
  var gearSpinAngle = 0, gearTargetSpin = 0, gearOffsetAnimX = 0;

  var gearMat = new THREE.MeshStandardMaterial({ color: 0x6C7D8E, metalness: 0.85, roughness: 0.28, emissive: 0x22303C, emissiveIntensity: 0.15 });
  var gear = new THREE.Mesh(buildGearShape(), gearMat);
  gear.scale.setScalar(GEAR_SCALE); gear.castShadow = true;
  gear.position.set(gearBaseX, gearBaseY, gearBaseZ); gear.rotation.y = CARD_Y_ROT;
  arenaGroup.add(gear);

  /* ═══════════════════════════════════════════════════════════
     STAGE 02: 3D STREET ENVIRONMENT & HUMAN-SCALE SIGNPOST
     (School Junction · Ashalley Botwe, Accra)
     ═══════════════════════════════════════════════════════════ */
  var junctionGroup = new THREE.Group();
  junctionGroup.visible = false;
  scene.add(junctionGroup);

  /* 1. Asphalt Roadway */
  var asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x242220,
    roughness: 0.88,
    metalness: 0.05
  });
  var roadway = new THREE.Mesh(new THREE.PlaneGeometry(35, 20), asphaltMat);
  roadway.rotation.x = -Math.PI / 2;
  roadway.position.set(3.5, FLOOR_Y, -2);
  roadway.receiveShadow = true;
  junctionGroup.add(roadway);

  /* 2. Painted Road Line Markings */
  function makeRoadStripesTexture() {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 256;
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 1024, 256);
    ctx.fillStyle = "#EAE4D6";
    // 4 Crosswalk / intersection stripes
    for (var i = 0; i < 5; i++) {
      ctx.fillRect(80 + i * 180, 20, 100, 216);
    }
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }
  var roadStripes = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 3),
    new THREE.MeshBasicMaterial({ map: makeRoadStripesTexture(), transparent: true, opacity: 0.85 })
  );
  roadStripes.rotation.x = -Math.PI / 2;
  roadStripes.position.set(3.5, FLOOR_Y + 0.015, -0.8);
  junctionGroup.add(roadStripes);

  /* 3. Concrete Pedestrian Sidewalk / Kerb */
  var curbMat = new THREE.MeshStandardMaterial({
    color: 0xDCD5C8,
    roughness: 0.65,
    metalness: 0.08
  });
  // Sidewalk slab where the post stands
  var sidewalk = new THREE.Mesh(new THREE.BoxGeometry(10, 0.22, 14), curbMat);
  sidewalk.position.set(-4.5, FLOOR_Y + 0.11, -1);
  sidewalk.receiveShadow = true;
  junctionGroup.add(sidewalk);

  // Kerb stone border strip
  var kerbStone = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.24, 14), new THREE.MeshStandardMaterial({ color: 0xB5ADA0, roughness: 0.7 }));
  kerbStone.position.set(0.5, FLOOR_Y + 0.12, -1);
  kerbStone.receiveShadow = true;
  junctionGroup.add(kerbStone);

  /* 4. Human-Scale Signpost (Height: 2.3m, cleanly fitted) */
  var SIGN_X = -1.2; // Anchored comfortably on the pavement
  var SIGN_BASE_Y = FLOOR_Y + 0.22;

  var postMat = new THREE.MeshStandardMaterial({
    color: 0x1E2228,
    metalness: 0.90,
    roughness: 0.25
  });

  // Base Mounting Flange
  var flange = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 24), postMat);
  flange.position.set(SIGN_X, SIGN_BASE_Y + 0.03, 0);
  flange.receiveShadow = true;
  junctionGroup.add(flange);

  // Vertical Tubular Steel Pole
  var poleHeight = 2.4;
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, poleHeight, 32), postMat);
  pole.position.set(SIGN_X, SIGN_BASE_Y + poleHeight / 2, 0);
  pole.castShadow = true;
  junctionGroup.add(pole);

  // Top Finial Cap
  var finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), postMat);
  finial.position.set(SIGN_X, SIGN_BASE_Y + poleHeight + 0.05, 0);
  junctionGroup.add(finial);

  /* 5. Heading-Only Sign Blades */
  var PRINCIPLES = [
    {
      id: "empirical",
      heading: "EMPIRICAL FOUNDATION",
      isLeft: false,
      angle: 0.28,
      yOffset: 2.10,
      desc: "Every strategic intervention is anchored in verifiable, quantitative field intelligence. We eliminate speculative corporate bias through rigorous empirical ground telemetry and data-driven audits."
    },
    {
      id: "execution",
      heading: "EXECUTION PARTNERSHIP",
      isLeft: true,
      angle: -0.42,
      yOffset: 1.55,
      desc: "Strategy without disciplined delivery is merely aspiration. We deploy hands-on senior partners and analytical field teams directly alongside executive management to achieve operational velocity."
    },
    {
      id: "institutional",
      heading: "INSTITUTIONAL ALIGNMENT",
      isLeft: false,
      angle: 0.18,
      yOffset: 1.00,
      desc: "We build governance architectures, automated telemetry dashboards, and proprietary systems designed to endure long after project handover—ensuring self-reinforcing enterprise growth."
    }
  ];

  function makeCleanBladeTexture(headingText, isLeft) {
    var c = document.createElement("canvas");
    c.width = 640; c.height = 130;
    var ctx = c.getContext("2d");

    ctx.fillStyle = "#F6F3EC";
    ctx.fillRect(0, 0, 640, 130);

    // High-contrast border
    ctx.strokeStyle = "#C85A17";
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 628, 118);

    // Chevron Arrow
    ctx.fillStyle = "#C85A17";
    ctx.font = "800 28px Inter, sans-serif";
    if (isLeft) {
      ctx.fillText("←", 24, 76);
      ctx.fillStyle = "#141210";
      ctx.font = "700 25px Inter, sans-serif";
      ctx.fillText(headingText, 70, 75);
    } else {
      ctx.fillStyle = "#141210";
      ctx.font = "700 25px Inter, sans-serif";
      ctx.fillText(headingText, 32, 75);
      ctx.fillStyle = "#C85A17";
      ctx.font = "800 28px Inter, sans-serif";
      ctx.fillText("→", 580, 76);
    }

    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  var blades = [];

  PRINCIPLES.forEach(function (p, idx) {
    var bladeGroup = new THREE.Group();
    var bladeGeo = new THREE.BoxGeometry(2.15, 0.40, 0.04);
    var bladeMat = new THREE.MeshStandardMaterial({
      map: makeCleanBladeTexture(p.heading, p.isLeft),
      metalness: 0.45,
      roughness: 0.28
    });

    var mesh = new THREE.Mesh(bladeGeo, bladeMat);
    mesh.castShadow = true;
    mesh.userData = { principleIndex: idx, isBlade: true };

    // Pivot blade from the post
    mesh.position.x = p.isLeft ? -1.0 : 1.0;
    bladeGroup.add(mesh);

    bladeGroup.position.set(SIGN_X, SIGN_BASE_Y + p.yOffset, 0);
    bladeGroup.rotation.y = p.angle;

    junctionGroup.add(bladeGroup);
    blades.push({ group: bladeGroup, mesh: mesh, data: p, baseAngle: p.angle });
  });

  /* ═══════════════════════════════════════════════════════════
     STATE & TRANSITION CONTROLLER (Returns strictly to Card 02)
     ═══════════════════════════════════════════════════════════ */
  var currentMode = "ARENA";
  var activeIndex = 0, isAnimating = false, activeTweens = [];
  var rememberedSectionIndex = 1; // Card 02 (About Us)

  var returnBtn = document.getElementById("junctionReturn");
  var hudPanel = document.getElementById("junctionHud");
  var hudTitle = document.getElementById("junctionHudTitle");
  var hudDesc = document.getElementById("junctionHudDesc");
  var metaEl = document.getElementById("arenaMeta");

  function easeApple(t) { return 1 - Math.pow(1 - t, 4); }

  function enterJunctionMode() {
    if (isAnimating) return;
    isAnimating = true;
    currentMode = "JUNCTION";
    rememberedSectionIndex = 1; // Locked to Card 02

    var startCam = camera.position.clone();
    var targetCam = new THREE.Vector3(0.1, 0.2, 5.4);
    var startLook = new THREE.Vector3(0.0, 0.1, 0);
    var targetLook = new THREE.Vector3(-0.4, SIGN_BASE_Y + 1.4, 0);

    junctionGroup.visible = true;
    junctionGroup.scale.set(0.65, 0.65, 0.65);

    var start = performance.now();
    var dur = 950;

    activeTweens.push({
      update: function (now) {
        var t = Math.min((now - start) / dur, 1);
        var e = easeApple(t);

        camera.position.lerpVectors(startCam, targetCam, e);
        var curLook = new THREE.Vector3().lerpVectors(startLook, targetLook, e);
        camera.lookAt(curLook);

        arenaGroup.position.y = -e * 4.0;
        arenaGroup.scale.setScalar(1 - e * 0.4);
        junctionGroup.scale.setScalar(0.65 + e * 0.35);

        if (t >= 1) {
          arenaGroup.visible = false;
          isAnimating = false;
          if (returnBtn) returnBtn.classList.add("is-visible");
          inspectPrinciple(0); // Reveal first heading content
          return false;
        }
        return true;
      }
    });
  }

  function exitJunctionMode() {
    if (isAnimating) return;
    isAnimating = true;
    currentMode = "ARENA";

    if (hudPanel) hudPanel.classList.remove("is-visible");
    if (returnBtn) returnBtn.classList.remove("is-visible");

    /* Ensure Arena returns strictly to Card 02 in Slot 0 */
    alignSlotsToCard(rememberedSectionIndex);

    arenaGroup.visible = true;
    var startCam = camera.position.clone();
    var targetCam = ARENA_CAM_POS.clone();
    var startLook = new THREE.Vector3(-0.4, SIGN_BASE_Y + 1.4, 0);
    var targetLook = ARENA_CAM_LOOK.clone();

    var start = performance.now();
    var dur = 900;

    activeTweens.push({
      update: function (now) {
        var t = Math.min((now - start) / dur, 1);
        var e = easeApple(t);

        camera.position.lerpVectors(startCam, targetCam, e);
        var curLook = new THREE.Vector3().lerpVectors(startLook, targetLook, e);
        camera.lookAt(curLook);

        arenaGroup.position.y = -(1 - e) * 4.0;
        arenaGroup.scale.setScalar(0.65 + e * 0.35);
        junctionGroup.scale.setScalar(1 - e * 0.45);

        if (t >= 1) {
          junctionGroup.visible = false;
          isAnimating = false;
          if (metaEl) metaEl.textContent = String(rememberedSectionIndex + 1).padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0");
          return false;
        }
        return true;
      }
    });
  }

  function alignSlotsToCard(secIdx) {
    activeIndex = secIdx;
    cards.forEach(function (card, i) {
      var assignedSlot = i;
      var sec = (secIdx + i) % TOTAL;
      card.userData.currentSlot = assignedSlot;
      card.userData.sectionIndex = sec;
      card.userData.frontMat.map = textures[sec];
      card.userData.frontMat.needsUpdate = true;
      var s = SLOTS[assignedSlot];
      card.position.set(s.pos[0], s.pos[1], s.pos[2]);
      card.scale.setScalar(s.scale);
      card.userData.bodyMat.opacity = s.opacity;
      card.userData.frontMat.opacity = s.opacity;
      var bri = s.brightness * 0.12;
      card.userData.bodyMat.color.setRGB(bri, bri * 0.88, bri * 0.78);
    });
  }

  function inspectPrinciple(index) {
    var p = PRINCIPLES[index];
    if (!p) return;

    if (hudTitle) hudTitle.textContent = p.heading;
    if (hudDesc) hudDesc.textContent = p.desc;
    if (hudPanel) hudPanel.classList.add("is-visible");

    // Smoothly pivot blade towards viewer
    blades.forEach(function (b, idx) {
      var isTarget = idx === index;
      var targetAngle = isTarget ? 0.0 : b.baseAngle;
      gsapToAngle(b.group, targetAngle);
    });
  }

  function gsapToAngle(group, targetY) {
    var startY = group.rotation.y;
    var start = performance.now();
    activeTweens.push({
      update: function (now) {
        var t = Math.min((now - start) / 450, 1);
        group.rotation.y = startY + (targetY - startY) * easeApple(t);
        return t < 1;
      }
    });
  }

  if (returnBtn) returnBtn.addEventListener("click", exitJunctionMode);

  /* ═══════════════════════════════════════════════════════════
     ARENA SCROLLING & GEAR PHYSICS
     ═══════════════════════════════════════════════════════════ */
  function tweenSlot(obj, slotIdx, duration, onComplete) {
    var target = SLOTS[slotIdx];
    var sPos = [obj.position.x, obj.position.y, obj.position.z], sScale = obj.scale.x;
    var sOp = obj.userData.bodyMat.opacity, sBri = obj.userData.bodyMat.color.r, tBri = target.brightness * 0.12;
    var start = performance.now(), dur = duration * 1000;
    activeTweens.push({
      update: function (now) {
        var t = Math.min((now - start) / dur, 1), e = easeApple(t);
        obj.position.x = sPos[0] + (target.pos[0] - sPos[0]) * e;
        obj.position.y = sPos[1] + (target.pos[1] - sPos[1]) * e;
        obj.position.z = sPos[2] + (target.pos[2] - sPos[2]) * e;
        obj.scale.setScalar(sScale + (target.scale - sScale) * e);
        var op = sOp + (target.opacity - sOp) * e;
        obj.userData.bodyMat.opacity = op; obj.userData.frontMat.opacity = op;
        var bri = sBri + (tBri - sBri) * e;
        obj.userData.bodyMat.color.setRGB(bri, bri * 0.88, bri * 0.78);
        if (t >= 1) { if (onComplete) onComplete(); return false; }
        return true;
      }
    });
  }

  function advanceForward() {
    if (isAnimating || currentMode !== "ARENA") return;
    isAnimating = true;
    gearTargetSpin += 2.2; gearOffsetAnimX = -0.22;
    activeIndex = (activeIndex + 1) % TOTAL;

    var front = cards.find(function (c) { return c.userData.currentSlot === 0; });
    var mid = cards.find(function (c) { return c.userData.currentSlot === 1; });
    var back = cards.find(function (c) { return c.userData.currentSlot === 2; });
    var staging = cards.find(function (c) { return c.userData.currentSlot === 3; });

    front.userData.currentSlot = -1; mid.userData.currentSlot = 0; back.userData.currentSlot = 1;
    if (staging) staging.userData.currentSlot = 2;

    tweenSlot(front, 4, 0.48, function () {
      var newSec = (activeIndex + 2) % TOTAL;
      front.userData.sectionIndex = newSec; front.userData.frontMat.map = textures[newSec]; front.userData.frontMat.needsUpdate = true;
      front.position.set(SLOTS[3].pos[0], SLOTS[3].pos[1], SLOTS[3].pos[2]); front.scale.setScalar(SLOTS[3].scale);
      front.userData.currentSlot = 3;
    });
    tweenSlot(mid, 0, 0.55); tweenSlot(back, 1, 0.55);
    if (staging) tweenSlot(staging, 2, 0.55);

    setTimeout(function () {
      if (metaEl) metaEl.textContent = String(activeIndex + 1).padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0");
      isAnimating = false;
    }, 520);
  }

  function retreatBackward() {
    if (isAnimating || currentMode !== "ARENA") return;
    isAnimating = true;
    gearTargetSpin -= 2.2; gearOffsetAnimX = 0.22;
    activeIndex = (activeIndex - 1 + TOTAL) % TOTAL;

    var front = cards.find(function (c) { return c.userData.currentSlot === 0; });
    var mid = cards.find(function (c) { return c.userData.currentSlot === 1; });
    var back = cards.find(function (c) { return c.userData.currentSlot === 2; });
    var staging = cards.find(function (c) { return c.userData.currentSlot === 3; });

    front.userData.currentSlot = 1; mid.userData.currentSlot = 2; back.userData.currentSlot = 3;

    if (staging) {
      var newSec = activeIndex;
      staging.userData.sectionIndex = newSec; staging.userData.frontMat.map = textures[newSec]; staging.userData.frontMat.needsUpdate = true;
      staging.position.set(SLOTS[4].pos[0], SLOTS[4].pos[1], SLOTS[4].pos[2]); staging.scale.setScalar(SLOTS[4].scale);
      staging.userData.currentSlot = 0;
      tweenSlot(staging, 0, 0.55);
    }
    tweenSlot(front, 1, 0.55); tweenSlot(mid, 2, 0.55); tweenSlot(back, 3, 0.55);

    setTimeout(function () {
      if (metaEl) metaEl.textContent = String(activeIndex + 1).padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0");
      isAnimating = false;
    }, 520);
  }

  /* Listeners scoped to #arenaWrap */
  var wheelAccum = 0, wheelDebounce = null;
  wrap.addEventListener("wheel", function (e) {
    if (currentMode !== "ARENA") return;
    e.preventDefault();
    wheelAccum += e.deltaY;
    if (wheelDebounce) clearTimeout(wheelDebounce);
    wheelDebounce = setTimeout(function () {
      if (Math.abs(wheelAccum) > 18 && !isAnimating) {
        if (wheelAccum > 0) advanceForward(); else retreatBackward();
      }
      wheelAccum = 0;
    }, 40);
  }, { passive: false });

  var dragStartY = 0, isDragging = false;
  wrap.addEventListener("mousedown", function (e) { if (currentMode === "ARENA") { dragStartY = e.clientY; isDragging = true; } });
  window.addEventListener("mouseup", function (e) {
    if (!isDragging || currentMode !== "ARENA") return; isDragging = false;
    var diff = dragStartY - e.clientY;
    if (Math.abs(diff) > 40 && !isAnimating) {
      if (diff > 0) advanceForward(); else retreatBackward();
    }
  });

  /* ═══════════════════════════════════════════════════════════
     UNIFIED 3D RAYCASTING
     ═══════════════════════════════════════════════════════════ */
  var raycaster = new THREE.Raycaster();
  var mouseNDC = new THREE.Vector2();

  canvas.addEventListener("click", function (e) {
    if (isAnimating) return;
    var rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);

    if (currentMode === "ARENA") {
      var hitPlanes = [];
      cards.forEach(function (card) {
        card.children.forEach(function (child) {
          if (child.isMesh && child.geometry.type === "PlaneGeometry") hitPlanes.push(child);
        });
      });

      var hits = raycaster.intersectObjects(hitPlanes, false);
      if (hits.length) {
        var clickedCard = hits[0].object.userData.parentGroup;
        if (!clickedCard) return;
        var slot = clickedCard.userData.currentSlot;

        if (slot === 0) {
          // If Card 02 (About Us / Crossroads) -> Enter 3D Junction
          if (clickedCard.userData.sectionIndex === 1) {
            enterJunctionMode();
          } else {
            var target = document.querySelector(SECTIONS[clickedCard.userData.sectionIndex].targetId);
            if (target) target.scrollIntoView({ behavior: "smooth" });
          }
        } else if (slot === 1) {
          advanceForward();
        } else if (slot === 2) {
          advanceForward();
          setTimeout(advanceForward, 280);
        }
      }
    } else if (currentMode === "JUNCTION") {
      var bladeMeshes = blades.map(function (b) { return b.mesh; });
      var hitsBlade = raycaster.intersectObjects(bladeMeshes, false);
      if (hitsBlade.length) {
        var pIdx = hitsBlade[0].object.userData.principleIndex;
        inspectPrinciple(pIdx);
      }
    }
  });

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    activeTweens = activeTweens.filter(function (t) { return t.update(now); });

    if (currentMode === "ARENA") {
      gearSpinAngle += (gearTargetSpin - gearSpinAngle) * 0.14;
      gear.rotation.z = -gearSpinAngle;
      gearOffsetAnimX += (0 - gearOffsetAnimX) * 0.12;
      gear.position.x = gearBaseX + gearOffsetAnimX;
    }

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", function () {
    if (!wrap.clientWidth || !wrap.clientHeight) return;
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
  });

  if (metaEl) metaEl.textContent = "01 / " + String(TOTAL).padStart(2, "0");
  loop();
})();